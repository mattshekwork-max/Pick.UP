// lib/sms.ts
// Twilio SMS integration for sending call summaries

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

interface CallSummary {
  callerName?: string;
  callerPhone: string;
  duration: number;
  summary?: string;
  appointmentBooked?: boolean;
  service?: string;
  appointmentTime?: string;
  wasTransferred?: boolean;
}

/**
 * Send SMS call summary to business owner
 */
export async function sendCallSummarySMS(
  to: string,
  businessName: string,
  call: CallSummary
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || (!TWILIO_PHONE_NUMBER && !TWILIO_MESSAGING_SERVICE_SID)) {
    console.error("Twilio credentials not configured");
    return { success: false, error: "SMS not configured" };
  }

  // Format the message
  const durationMinutes = Math.round(call.duration / 60);
  const durationText = durationMinutes < 1 ? "<1 min" : `${durationMinutes} min`;

  let message = `📞 Pick.UP: New call for ${businessName}\n\n`;
  message += `From: ${call.callerName || call.callerPhone}\n`;
  message += `Duration: ${durationText}\n`;

  if (call.appointmentBooked) {
    message += `\n✅ BOOKED: ${call.service}`;
    if (call.appointmentTime) {
      message += ` on ${call.appointmentTime}`;
    }
  }

  if (call.wasTransferred) {
    message += `\n🔄 Call was transferred`;
  }

  if (call.summary) {
    // Truncate summary if too long
    const maxSummaryLength = 100;
    const summary = call.summary.length > maxSummaryLength 
      ? call.summary.substring(0, maxSummaryLength) + "..."
      : call.summary;
    message += `\n\nSummary: "${summary}"`;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          ...(TWILIO_MESSAGING_SERVICE_SID
            ? { MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID }
            : { From: TWILIO_PHONE_NUMBER! }),
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio SMS failed:", errorText);
      return { success: false, error: "Failed to send SMS" };
    }

    const data = await response.json();
    return { success: true, messageId: data.sid };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

/**
 * Send test SMS to verify configuration
 */
export async function sendTestSMS(
  to: string
): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || (!TWILIO_PHONE_NUMBER && !TWILIO_MESSAGING_SERVICE_SID)) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          ...(TWILIO_MESSAGING_SERVICE_SID
            ? { MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID }
            : { From: TWILIO_PHONE_NUMBER! }),
          Body: "📞 Pick.UP test: Your SMS notifications are working! You'll receive call summaries here.",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio test failed:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("Test SMS error:", error);
    return { success: false, error: "Failed to send test" };
  }
}

/**
 * Log SMS to database
 */
export async function logSMS(
  supabase: any,
  businessId: number,
  callId: number | null,
  recipientPhone: string,
  messageBody: string,
  status: string,
  externalMessageId?: string
): Promise<void> {
  try {
    await supabase.from("sms_logs").insert({
      business_id: businessId,
      call_id: callId,
      recipient_phone: recipientPhone,
      message_body: messageBody,
      status: status,
      external_message_id: externalMessageId,
    });
  } catch (error) {
    console.error("Failed to log SMS:", error);
  }
}
