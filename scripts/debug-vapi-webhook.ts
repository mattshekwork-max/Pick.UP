#!/usr/bin/env tsx
/**
 * Debug Vapi webhook - test SMS sending directly
 */

import { sendCallSummarySMS, logSMS } from "../lib/sms";
import { createClient } from "../lib/supabase/server";

async function test() {
  console.log("🧪 Testing Vapi webhook SMS flow...\n");
  
  const supabase = await createClient();
  
  // Get a test business
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();
  
  if (!business) {
    console.log("❌ No active business found");
    return;
  }
  
  console.log("✅ Found business:", business.business_name);
  console.log("   Ringley phone:", business.ringley_phone_number);
  console.log("   Transfer phone:", business.transfer_phone_number || "NOT SET");
  console.log("   Google calendar:", business.google_calendar_id || "NOT CONNECTED");
  
  if (!business.transfer_phone_number) {
    console.log("\n⚠️  SMS won't be sent - transfer_phone_number is not set!");
    console.log("   Set it with: UPDATE businesses SET transfer_phone_number='+1234567890' WHERE id=", business.id);
    return;
  }
  
  // Test SMS
  console.log("\n📤 Sending test SMS to:", business.transfer_phone_number);
  
  const result = await sendCallSummarySMS(
    business.transfer_phone_number,
    business.business_name,
    {
      callerName: "Test Caller",
      callerPhone: "+15551234567",
      duration: 90,
      summary: "Test call summary - verifying SMS notifications are working correctly.",
      wasTransferred: false,
    }
  );
  
  console.log("\n📊 Result:", result);
  
  if (result.success) {
    console.log("✅ SMS sent! Message ID:", result.messageId);
    
    // Log it
    await logSMS(
      supabase,
      business.id,
      null,
      business.transfer_phone_number,
      "Test SMS",
      "sent",
      result.messageId
    );
    console.log("✅ Logged to database");
  } else {
    console.log("❌ SMS failed:", result.error);
  }
}

test().catch(console.error);
