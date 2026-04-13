#!/usr/bin/env tsx
/**
 * Check Vapi phone numbers and configuration
 */

async function checkVapi() {
  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  
  if (!VAPI_API_KEY) {
    console.log("❌ VAPI_API_KEY not set");
    return;
  }

  console.log("📞 Checking Vapi configuration...\n");

  // Get all phone numbers
  const phoneResponse = await fetch("https://api.vapi.ai/phone-number", {
    headers: {
      "Authorization": `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!phoneResponse.ok) {
    console.log("❌ Failed to fetch phone numbers:", await phoneResponse.text());
    return;
  }

  const phones = await phoneResponse.json();
  console.log("📱 Vapi Phone Numbers:");
  console.log(JSON.stringify(phones, null, 2));
  console.log("");

  // Get all assistants
  const assistantResponse = await fetch("https://api.vapi.ai/assistant", {
    headers: {
      "Authorization": `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!assistantResponse.ok) {
    console.log("❌ Failed to fetch assistants");
    return;
  }

  const assistants = await assistantResponse.json();
  console.log("🤖 Vapi Assistants:");
  for (const assistant of assistants) {
    console.log(`   - ${assistant.name} (ID: ${assistant.id})`);
    if (assistant.phoneNumbers) {
      console.log(`     Phone numbers: ${JSON.stringify(assistant.phoneNumbers)}`);
    }
  }
}

checkVapi().catch(console.error);
