#!/usr/bin/env tsx
/**
 * Test SMS sending directly (no Supabase needed)
 */

// Load env vars
import { config } from "dotenv";
import { resolve } from "path";

const envPath = resolve(__dirname, "..", ".env");
config({ path: envPath });

import { sendCallSummarySMS } from "../lib/sms";

async function test() {
  console.log("🧪 Testing SMS sending...\n");
  
  // Replace with your actual phone number to receive the test
  const TEST_PHONE = process.argv[2] || "+16193496557";
  
  console.log("Sending test SMS to:", TEST_PHONE);
  
  const result = await sendCallSummarySMS(
    TEST_PHONE,
    "Pick.UP Test",
    {
      callerName: "Test Caller",
      callerPhone: "+15551234567",
      duration: 90,
      summary: "This is a test call summary. If you receive this, SMS is working!",
      wasTransferred: false,
    }
  );
  
  console.log("\n📊 Result:", result);
  
  if (result.success) {
    console.log("✅ SMS sent successfully! Message ID:", result.messageId);
  } else {
    console.log("❌ SMS failed:", result.error);
  }
}

test().catch(console.error);
