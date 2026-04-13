import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCallSummarySMS, logSMS } from "@/lib/sms";

/**
 * Test endpoint to simulate Vapi webhook and test SMS
 * Call with: GET /api/debug/test-sms?phone=+16193967530
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testPhone = searchParams.get("phone") || "+16193967530";
  
  console.log("🧪 Testing SMS flow...");
  console.log("   Test phone:", testPhone);
  console.log("   TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING");
  console.log("   TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER || "MISSING");
  
  const supabase = await createClient();
  
  // Get a test business
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();
  
  if (!business) {
    return NextResponse.json({ error: "No active business found" }, { status: 404 });
  }
  
  console.log("   Business:", business.business_name);
  console.log("   Transfer phone:", business.transfer_phone_number);
  
  // Test SMS
  const smsResult = await sendCallSummarySMS(
    testPhone,
    business.business_name,
    {
      callerName: "Test Caller",
      callerPhone: "+15551234567",
      duration: 120,
      summary: "This is a TEST message from Pick.UP. If you receive this, SMS is working!",
      wasTransferred: false,
    }
  );
  
  // Log to database
  await logSMS(
    supabase,
    business.id,
    null,
    testPhone,
    "Test SMS from debug endpoint",
    smsResult.success ? "sent" : "failed",
    smsResult.messageId
  );
  
  return NextResponse.json({
    business: {
      name: business.business_name,
      transfer_phone: business.transfer_phone_number,
    },
    smsResult,
    env: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING",
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "MISSING",
    }
  });
}
