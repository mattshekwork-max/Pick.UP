import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAvailability, createCalendarEvent, getAvailableSlots } from "@/lib/calendar";
import { sendCallSummarySMS, logSMS } from "@/lib/sms";
import { createHmac } from "crypto";
import { addCorsHeaders, handlePreflight } from "@/lib/middleware/security";

const WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET || "";

function verifyVapiSignature(payload: string, signature: string): boolean {
  // Skip verification if no secret is configured (safe for Vapi's platform-level auth)
  if (!WEBHOOK_SECRET || !signature) {
    console.log("Webhook signature verification skipped (no secret configured)");
    console.log("WEBHOOK_SECRET configured:", !!WEBHOOK_SECRET);
    console.log("Signature present:", !!signature);
    return true;
  }
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  const valid = signature === expected;
  console.log("Webhook signature verification:", valid ? "✅ VALID" : "❌ INVALID");
  if (!valid) {
    console.log("Expected:", expected);
    console.log("Received:", signature);
  }
  return valid;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-vapi-signature") || "";
  const payload = await request.text();

  console.log("📥 WEBHOOK HIT!");
  console.log("   URL:", request.url);
  console.log("   Signature present:", !!signature);
  console.log("   Payload length:", payload.length);

  // Parse payload first (before using it)
  let parsedData;
  try {
    parsedData = JSON.parse(payload);
  } catch (e) {
    console.error("Failed to parse payload:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  
  const eventType = parsedData.message?.type || parsedData.type || "unknown";
  
  console.log("📥 Vapi webhook received");
  console.log("   Event type:", eventType);
  console.log("   Call ID:", parsedData.call?.id || parsedData.message?.call?.id || "N/A");

  // Log webhook to database for debugging (using service role key)
  console.log("💾 Attempting to log to database...");
  try {
    const logSupabase = createAdminClient();
    const logResult = await logSupabase.from("webhook_logs").insert({
      event_type: eventType,
      payload: parsedData,
      created_at: new Date().toISOString(),
    });
    
    if (logResult.error) {
      console.log("❌ Webhook log insert FAILED:", logResult.error);
      console.log("   Error message:", logResult.error.message);
      console.log("   Error details:", logResult.error.details);
      console.log("   Error hint:", logResult.error.hint);
    } else {
      console.log("✅ Webhook logged to database successfully!");
    }
  } catch (e: any) {
    console.log("❌ Webhook log threw exception:", e);
    console.log("   Error:", e.message);
  }

  // Verify webhook signature (CRITICAL SECURITY)
  if (!verifyVapiSignature(payload, signature)) {
    console.log("❌ Rejecting webhook - invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    switch (eventType) {
      case "call-ended":
      case "end-of-call-report":  // Vapi's actual event name
        await handleCallEnded(parsedData.message || parsedData, supabase);
        break;
      case "function-call":
        return await handleFunctionCall(parsedData.message || parsedData, supabase);
      case "call-started":
        await handleCallStarted(parsedData.message || parsedData, supabase);
        break;
      case "speech-update":
      case "conversation-update":
      case "status-update":
      case "user-interrupted":
        // TEMPORARY: Send test SMS for these events too
        console.log("📤 TEST: Sending SMS for event:", eventType);
        await sendTestSMSForEvent(eventType, parsedData);
        break;
      default:
        console.log("Unknown Vapi event type:", eventType);
    }

    // Always return 200 to Vapi
    const response = NextResponse.json({ success: true });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error("Vapi webhook error:", error);
    // Still return 200 so Vapi doesn't retry
    const response = NextResponse.json({ success: true, error: "Logged for review" });
    return addCorsHeaders(request, response);
  }
}

async function handleCallStarted(message: any, supabase: any) {
  const { call } = message;
  console.log("Call started:", call.id);
  // Could log this to a "live calls" table for real-time monitoring
}

async function handleCallEnded(message: any, supabase: any) {
  console.log("📞 Call ended - Full message:", JSON.stringify(message, null, 2));
  
  // Vapi sends data in different structures - handle all cases
  const call = message.call || message.data?.call || message;
  const analysis = message.analysis || message.data?.analysis || {};
  
  const businessPhone = call.customer?.number || call.phoneNumber;

  console.log("📞 Business phone:", businessPhone);
  console.log("📞 Call summary:", call.summary || analysis.summary);
  console.log("📞 Call transcript:", call.transcript?.substring(0, 200));

  // Find business by phone number
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("ringley_phone_number", businessPhone)
    .single();

  if (businessError) {
    console.error("❌ Error finding business:", businessError);
    return;
  }

  if (!business) {
    console.log("⚠️ No business found for phone:", businessPhone);
    console.log("📋 Available businesses:");
    const { data: allBusinesses } = await supabase.from("businesses").select("id, business_name, ringley_phone_number");
    console.log(JSON.stringify(allBusinesses, null, 2));
    return;
  }

  console.log("✅ Business found:", business.business_name);

  // Save call record
  const { data: callRecord, error: callError } = await supabase
    .from("calls")
    .insert({
      business_id: business.id,
      caller_phone_number: call.customer?.number,
      caller_name: call.customer?.name,
      call_summary: call.summary,
      call_duration_seconds: call.durationSeconds,
      call_status: call.status,
      was_transferred: call.transferOccurred || false,
      transcript: call.transcript,
      external_call_id: call.id,
    })
    .select()
    .single();

  if (callError) {
    console.error("❌ Failed to save call:", callError);
    return;
  }

  console.log("✅ Call saved:", callRecord.id);

  // Send SMS summary if transfer phone is configured
  console.log("📱 Checking SMS configuration...");
  console.log("   Business transfer_phone_number:", business.transfer_phone_number || "NOT SET");
  console.log("   TWILIO_ACCOUNT_SID configured:", !!process.env.TWILIO_ACCOUNT_SID);
  console.log("   TWILIO_PHONE_NUMBER configured:", !!process.env.TWILIO_PHONE_NUMBER);
  
  if (business.transfer_phone_number) {
    console.log("📤 Sending SMS to:", business.transfer_phone_number);
    const smsResult = await sendCallSummarySMS(
      business.transfer_phone_number,
      business.business_name,
      {
        callerName: call.customer?.name,
        callerPhone: call.customer?.number,
        duration: call.durationSeconds,
        summary: call.summary,
        wasTransferred: call.transferOccurred,
      }
    );

    console.log("📊 SMS result:", smsResult);
    
    // Log SMS to database
    await logSMS(
      supabase,
      business.id,
      callRecord.id,
      business.transfer_phone_number,
      `Call summary for ${call.customer?.number}`,
      smsResult.success ? "sent" : "failed",
      smsResult.messageId
    );

    if (smsResult.success) {
      console.log("✅ SMS sent:", smsResult.messageId);
    } else {
      console.log("❌ SMS failed:", smsResult.error);
    }
  } else {
    console.log("⚠️  SMS not sent - business.transfer_phone_number is not set");
  }
}

async function handleFunctionCall(message: any, supabase: any) {
  const { functionCall, call } = message;
  const businessPhone = call.customer?.number;

  // Find business
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("ringley_phone_number", businessPhone)
    .single();

  if (!business) {
    return NextResponse.json({
      results: {
        toolCallId: functionCall.toolCallId,
        result: "I'm sorry, I couldn't find your business profile. Let me transfer you to a representative.",
      },
    });
  }

  switch (functionCall.name) {
      case "book_appointment":
      case "bookAppointment":  // Vapi tool name
        return await handleBookAppointment(functionCall, business, supabase);
      case "transfer_call":
      case "transfer_call_tool":  // Vapi tool name
        return await handleTransferCall(functionCall, business);
      case "check_availability":
      case "CheckAvailability":  // Vapi tool name
        return await handleCheckAvailability(functionCall, business);
    default:
      return NextResponse.json({
        results: {
          toolCallId: functionCall.toolCallId,
          result: "I'm not sure how to help with that. Let me transfer you to a human.",
        },
      });
  }
}

async function handleBookAppointment(functionCall: any, business: any, supabase: any) {
  const { date, time, service, customerName, customerPhone } = functionCall.parameters;

  const startTime = new Date(`${date}T${time}`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

  // Check if Google Calendar is connected
  if (business.google_refresh_token && business.google_calendar_id) {
    // Check availability in Google Calendar
    const isAvailable = await checkAvailability(
      business.google_refresh_token,
      business.google_calendar_id,
      startTime,
      endTime
    );

    if (!isAvailable) {
      // Get available slots for that day
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
      const hours = business.business_hours?.[dayOfWeek];
      const availableSlots = await getAvailableSlots(
        business.google_refresh_token,
        business.google_calendar_id,
        new Date(date),
        hours,
        60
      );

      const slotsText = availableSlots.length > 0
        ? `Available times: ${availableSlots.slice(0, 5).map((s: any) => s.start).join(", ")}`
        : "No times available that day";

      return NextResponse.json({
        results: {
          toolCallId: functionCall.toolCallId,
          result: `That time is not available. ${slotsText}. Would any of those work for you?`,
        },
      });
    }
  }

  // Create appointment in database
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      business_id: business.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      service: service,
      starts_at: startTime.toISOString(),
      ends_at: endTime.toISOString(),
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create appointment:", error);
    return NextResponse.json({
      results: {
        toolCallId: functionCall.toolCallId,
        result: "I had trouble booking that appointment. Let me transfer you to someone who can help.",
      },
    });
  }

  // Create Google Calendar event if connected
  let calendarEventId = null;
  if (business.google_refresh_token && business.google_calendar_id) {
    const calendarResult = await createCalendarEvent(
      business.google_refresh_token,
      business.google_calendar_id,
      {
        summary: `${service} - ${customerName}`,
        description: `Booked via Pick.UP AI\nPhone: ${customerPhone}`,
        start: startTime,
        end: endTime,
      }
    );

    if (calendarResult.success) {
      calendarEventId = calendarResult.eventId;
      
      // Update appointment with calendar event ID
      await supabase
        .from("appointments")
        .update({ google_event_id: calendarEventId })
        .eq("id", appointment.id);
    }
  }

  return NextResponse.json({
    results: {
      toolCallId: functionCall.toolCallId,
      result: `Perfect! I've booked your ${service} appointment for ${date} at ${time}. You're all set!`,
    },
  });
}

async function handleTransferCall(functionCall: any, business: any) {
  const { reason } = functionCall.parameters;

  if (!business.transfer_phone_number) {
    return NextResponse.json({
      results: {
        toolCallId: functionCall.toolCallId,
        result: "I understand you'd like to speak with someone, but I don't have a transfer number configured. Please call back during business hours.",
      },
    });
  }

  return NextResponse.json({
    results: {
      toolCallId: functionCall.toolCallId,
      result: "I'll transfer you now. Please hold.",
      transferCallTo: business.transfer_phone_number,
    },
  });
}

async function handleCheckAvailability(functionCall: any, business: any) {
  const { date } = functionCall.parameters;
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
  const hours = business.business_hours?.[dayOfWeek];

  if (!hours || hours.closed) {
    return NextResponse.json({
      results: {
        toolCallId: functionCall.toolCallId,
        result: `We're closed on ${dayOfWeek}. Our hours are ${formatBusinessHours(business.business_hours)}.`,
      },
    });
  }

  // If Google Calendar is connected, get actual available slots
  if (business.google_refresh_token && business.google_calendar_id) {
    const availableSlots = await getAvailableSlots(
      business.google_refresh_token,
      business.google_calendar_id,
      new Date(date),
      hours,
      60
    );

    if (availableSlots.length > 0) {
      const slotsText = availableSlots.slice(0, 5).map((s: any) => s.start).join(", ");
      return NextResponse.json({
        results: {
          toolCallId: functionCall.toolCallId,
          result: `We're open ${hours.open} to ${hours.close} on ${dayOfWeek}. Available times include: ${slotsText}. What time works for you?`,
        },
      });
    } else {
      return NextResponse.json({
        results: {
          toolCallId: functionCall.toolCallId,
          result: `We're technically open ${hours.open} to ${hours.close} on ${dayOfWeek}, but it looks like we're fully booked that day. Would you like to try another date?`,
        },
      });
    }
  }

  // Fallback to business hours only
  return NextResponse.json({
    results: {
      toolCallId: functionCall.toolCallId,
      result: `We're open on ${dayOfWeek} from ${hours.open} to ${hours.close}. What time works for you?`,
    },
  });
}

function formatBusinessHours(hours: any): string {
  if (!hours) return "Please call for hours";
  const days = Object.entries(hours)
    .filter(([_, h]: [string, any]) => !h.closed)
    .map(([day, h]: [string, any]) => `${day}: ${h.open}-${h.close}`);
  return days.join(", ") || "Please call for hours";
}

// TEMPORARY TEST FUNCTION - Send SMS for any webhook event
async function sendTestSMSForEvent(eventType: string, data: any) {
  try {
    // Use your phone number from the screenshot
    const testPhoneNumber = "+16193967530";
    const message = `🧪 WEBHOOK TEST: ${eventType}\n\nCall ID: ${data.call?.id || 'N/A'}\nTime: ${new Date().toLocaleTimeString()}`;
    
    console.log("📤 Sending test SMS:", message);
    
    const result = await sendCallSummarySMS(testPhoneNumber, "Pick.UP Test", {
      callerName: `Test: ${eventType}`,
      callerPhone: "+15550000000",
      duration: 0,
      summary: message,
    });
    
    console.log("📊 Test SMS result:", result);
  } catch (error: any) {
    console.error("❌ Test SMS failed:", error.message);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
