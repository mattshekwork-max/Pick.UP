import { NextResponse } from "next/server";

export async function GET() {
  // Check all env vars
  const config = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "SET" : undefined,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    VAPI_WEBHOOK_SECRET: process.env.VAPI_WEBHOOK_SECRET ? "SET" : undefined,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  // Test Twilio connection
  let twilioTest = "Not tested";
  if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(
              `${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: "+16193496558", // Test number (not same as From)
            From: config.TWILIO_PHONE_NUMBER!,
            Body: "Test from Pick.UP",
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        twilioTest = `✅ Success! Message ID: ${data.sid}`;
      } else {
        const errorText = await response.text();
        twilioTest = `❌ Failed: ${errorText}`;
      }
    } catch (error: any) {
      twilioTest = `❌ Error: ${error.message}`;
    }
  }

  return NextResponse.json({
    config,
    twilioTest,
    allSet: !!(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN && config.TWILIO_PHONE_NUMBER),
  });
}
