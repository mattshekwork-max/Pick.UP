#!/usr/bin/env tsx
/**
 * Test SMS sending for Vapi webhook
 */

import { sendCallSummarySMS } from "../lib/sms";

async function test() {
  console.log("🧪 Testing SMS sending...\n");
  
  // Test with owner mobile number (receives SMS)
  const result = await sendCallSummarySMS(
    "+16193967530", // Owner mobile - should receive SMS
    "Test Business",
    {
      callerName: "John Doe",
      callerPhone: "+15551234567",
      duration: 120,
      summary: "This is a test call summary to verify SMS is working.",
      wasTransferred: false,
    }
  );
  
  console.log("Result:", result);
  
  if (result.success) {
    console.log("✅ SMS sent successfully!");
  } else {
    console.log("❌ SMS failed:", result.error);
  }
}

test().catch(console.error);
