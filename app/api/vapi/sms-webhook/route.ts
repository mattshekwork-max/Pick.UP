import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCallSummarySMS, logSMS, isSMSEnabled } from "@/lib/sms";
import { sendCallSummaryEmail } from "@/lib/email";

type VapiPayload = Record<string, any>;

const FALLBACK_RECAP_NUMBER = process.env.RECAP_SMS_TO || process.env.OWNER_PHONE_NUMBER;

export async function POST(request: Request) {
  let payload: VapiPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const message = payload.message || payload;
  const eventType = message.type || payload.type || "unknown";

  console.log("[vapi/sms-webhook] received", {
    eventType,
    callId: getCallId(message),
  });

  if (!["end-of-call-report", "call-ended"].includes(eventType)) {
    return NextResponse.json({ success: true, ignored: eventType });
  }

  try {
    const result = await processEndOfCall(message);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[vapi/sms-webhook] failed", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function processEndOfCall(message: VapiPayload) {
  const supabase = createAdminClient();
  const call = message.call || message.data?.call || {};
  const analysis = message.analysis || call.analysis || message.data?.analysis || {};

  const callId = getCallId(message);
  const customerPhone = normalizePhone(
    call.customer?.number ||
      call.customerNumber ||
      message.customer?.number ||
      message.customerNumber
  );
  const vapiPhone = normalizePhone(
    call.phoneNumber?.number ||
      call.phoneNumber?.phoneNumber ||
      message.phoneNumber?.number ||
      message.phoneNumber ||
      call.phoneNumberNumber
  );
  const phoneNumberId = call.phoneNumberId || call.phoneNumber?.id || message.phoneNumberId;
  const assistantId = call.assistantId || call.assistant?.id || message.assistantId;
  const duration = getDurationSeconds(message, call);
  const summary = getSummary(message, call, analysis);
  const transcript = getTranscript(message, call);
  const status = call.status || message.status || message.endedReason || "completed";

  const business = await findBusiness(supabase, {
    vapiPhone,
    phoneNumberId,
    assistantId,
  });

  if (!business) {
    console.error("[vapi/sms-webhook] no business match", {
      vapiPhone,
      phoneNumberId,
      assistantId,
      customerPhone,
      callId,
    });
    return {
      callId,
      smsSent: false,
      reason: "No matching business",
      matched: { vapiPhone, phoneNumberId, assistantId },
    };
  }

  const callRecord = await upsertCallRecord(supabase, business, {
    callId,
    customerPhone,
    customerName: call.customer?.name || message.customer?.name,
    duration,
    summary,
    status,
    transcript,
    wasTransferred: Boolean(call.transferOccurred || message.transferOccurred),
  });

  const { data: ownerUser, error: ownerEmailError } = await supabase
    .from("users")
    .select("email")
    .eq("id", business.user_id)
    .single();

  if (ownerEmailError) {
    console.error("[vapi/sms-webhook] owner email lookup failed", ownerEmailError);
  }

  const ownerEmail = ownerUser?.email;

  const recipient = normalizePhone(business.transfer_phone_number) || FALLBACK_RECAP_NUMBER;

  let smsResult: { success: boolean; messageId?: string; error?: string } = { success: false };
  let smsSkipped: string | undefined = isSMSEnabled()
    ? undefined
    : "SMS recaps disabled";

  if (!recipient) {
    smsSkipped = "No transfer phone or RECAP_SMS_TO configured";
  }

  if (callRecord?.id) {
    const { data: existingSms } = await supabase
      .from("sms_logs")
      .select("id, external_message_id")
      .eq("call_id", callRecord.id)
      .eq("status", "sent")
      .maybeSingle();

    if (existingSms) {
      smsResult = { success: true, messageId: existingSms.external_message_id };
      smsSkipped = "SMS already sent";
    }
  }

  if (!smsSkipped && recipient) {
    smsResult = await sendCallSummarySMS(recipient, business.business_name, {
      callerName: call.customer?.name || customerPhone,
      callerPhone: customerPhone || "Unknown",
      duration,
      summary,
      wasTransferred: Boolean(call.transferOccurred || message.transferOccurred),
    });

    if (callRecord?.id) {
      await logSMS(
        supabase,
        business.id,
        callRecord.id,
        recipient,
        summary,
        smsResult.success ? "sent" : "failed",
        smsResult.messageId
      );
    }
  }

  // Send email notification (FREE, no registration required)
  let emailSent = false;
  let emailError: string | undefined;
  
  if (ownerEmail) {
    try {
      const emailResult = await sendCallSummaryEmail(
        ownerEmail,
        business.business_name,
        {
          callerName: call.customer?.name || customerPhone,
          callerPhone: customerPhone || "Unknown",
          duration,
          summary,
          wasTransferred: Boolean(call.transferOccurred || message.transferOccurred),
          transcript,
        }
      );
      emailSent = emailResult.success;
      emailError = emailResult.error;
      console.log("[vapi/sms-webhook] email", { sent: emailSent, to: ownerEmail });
    } catch (e: any) {
      emailError = e.message;
      console.error("[vapi/sms-webhook] email failed", e);
    }
  }

  return {
    callId,
    businessId: business.id,
    callRecordId: callRecord?.id,
    smsSent: smsResult.success,
    smsId: smsResult.messageId,
    smsError: smsResult.error,
    smsSkipped,
    smsTo: recipient,
    emailSent,
    emailError,
    emailTo: ownerEmail || undefined,
  };
}

async function findBusiness(
  supabase: any,
  identifiers: { vapiPhone?: string; phoneNumberId?: string; assistantId?: string }
) {
  const filters: string[] = [];

  if (identifiers.vapiPhone) {
    filters.push(`ringley_phone_number.eq.${identifiers.vapiPhone}`);
  }
  if (identifiers.phoneNumberId) {
    filters.push(`vapi_phone_number_id.eq.${identifiers.phoneNumberId}`);
  }
  if (identifiers.assistantId) {
    filters.push(`vapi_assistant_id.eq.${identifiers.assistantId}`);
  }

  if (filters.length > 0) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .or(filters.join(","))
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!error && data) return data;
    if (error) {
      console.error("[vapi/sms-webhook] business lookup failed", error);
    }
  }

  if (identifiers.vapiPhone) {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("ringley_phone_number", identifiers.vapiPhone)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

async function upsertCallRecord(supabase: any, business: any, callData: any) {
  if (callData.callId && callData.callId !== "unknown") {
    const { data: existing } = await supabase
      .from("calls")
      .select("*")
      .eq("external_call_id", callData.callId)
      .maybeSingle();

    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from("calls")
    .insert({
      business_id: business.id,
      caller_phone_number: callData.customerPhone,
      caller_name: callData.customerName,
      call_summary: callData.summary,
      call_duration_seconds: callData.duration,
      call_status: callData.status,
      was_transferred: callData.wasTransferred,
      transcript: callData.transcript,
      external_call_id: callData.callId,
    })
    .select()
    .single();

  if (error) {
    console.error("[vapi/sms-webhook] failed to save call", error);
    throw new Error(`Failed to save call: ${error.message}`);
  }

  return data;
}

function getCallId(message: VapiPayload) {
  return message.call?.id || message.data?.call?.id || message.id || "unknown";
}

function getSummary(message: VapiPayload, call: VapiPayload, analysis: VapiPayload) {
  return (
    analysis.summary ||
    message.summary ||
    call.summary ||
    "Call completed. Open Vapi for full transcript."
  );
}

function getTranscript(message: VapiPayload, call: VapiPayload) {
  if (message.transcript) return message.transcript;
  if (call.transcript) return call.transcript;

  const messages = message.messages || call.messages;
  if (Array.isArray(messages)) {
    return messages
      .map((entry) => {
        const role = entry.role || entry.type || "message";
        const text = entry.message || entry.content || entry.text;
        return text ? `${role}: ${text}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }

  return null;
}

function getDurationSeconds(message: VapiPayload, call: VapiPayload) {
  if (typeof call.durationSeconds === "number") return Math.round(call.durationSeconds);
  if (typeof message.durationSeconds === "number") return Math.round(message.durationSeconds);

  const startedAt = call.startedAt || message.startedAt;
  const endedAt = call.endedAt || message.endedAt;
  if (startedAt && endedAt) {
    const seconds = (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000;
    return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  }

  return 0;
}

function normalizePhone(phone?: string | null) {
  if (!phone) return undefined;
  const trimmed = String(phone).trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed;
}
