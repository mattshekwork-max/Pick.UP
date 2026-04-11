#!/usr/bin/env tsx
/**
 * Force Update Vapi Assistant
 * Pulls latest business profile from database and updates Vapi
 */

import { createClient } from "@supabase/supabase-js";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID) {
  console.error("❌ VAPI_API_KEY or VAPI_ASSISTANT_ID not set");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Supabase credentials not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("🔄 Force updating Vapi assistant...\n");

  // Get latest business profile
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (error || !business) {
    console.error("❌ No business found:", error?.message);
    process.exit(1);
  }

  console.log(`✅ Found business: ${business.business_name}`);

  // Format FAQs
  const faqsText = business.faqs?.length > 0
    ? business.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
    : "No FAQs configured";

  // Format services
  const servicesText = business.services?.filter((s: string) => s.trim()).join(", ") || "Not specified";

  // Format business hours
  const hoursText = business.business_hours
    ? Object.entries(business.business_hours)
        .filter(([_, hours]: any) => !(hours as any).closed)
        .map(([day, hours]: any) => `${day}: ${hours.open} - ${hours.close}`)
        .join("\n")
    : "Not specified";

  // Build system message
  const systemMessage = `You are a professional AI receptionist for ${business.business_name}.

YOUR ROLE:
- Answer calls warmly and professionally
- Handle common questions using the business's FAQ
- Book appointments into their Google Calendar
- Transfer calls when requested or when you can't help

BUSINESS INFORMATION:
- Business Name: ${business.business_name}
- Services: ${servicesText}
- Business Hours: ${hoursText}
- Greeting: ${business.greeting_message || "Hello! Thanks for calling."}
- Transfer Number: ${business.transfer_phone_number || "Not configured"}

FAQ RESPONSES:
${faqsText}

GUIDELINES:
1. Be concise and friendly
2. Confirm details before booking appointments
3. If caller asks for a human, transfer immediately
4. If you're unsure, offer to transfer
5. Always get: name, phone, service type, and preferred time for appointments

APPOINTMENT BOOKING:
- Use the book_appointment function when caller wants to schedule
- Confirm: date, time, service, customer name, phone
- Default appointment duration: 1 hour
- Check business hours before offering times

CALL TRANSFERS:
- Use transfer_call function when:
  * Caller explicitly requests a human
  * You can't answer their question
  * It's outside business hours
  * Complex pricing or custom quotes needed

END CALL GRACEFULLY:
- Confirm next steps
- Thank them for calling
- Wait for caller to hang up first`;

  console.log("\n📞 Updating Vapi assistant...");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://api.vapi.ai/v1/assistant/${VAPI_ASSISTANT_ID}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstMessage: business.greeting_message || "Hello! Thanks for calling. How can I help you today?",
        model: {
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
          ],
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log("\n✅ Vapi assistant updated successfully!");
      console.log(`   Assistant ID: ${VAPI_ASSISTANT_ID}`);
      console.log(`   Business: ${business.business_name}`);
      console.log(`   Greeting: "${business.greeting_message}"`);
      console.log("\n🎉 Ready to test! Call your number now.");
    } else {
      const errorText = await response.text();
      console.error("\n❌ Failed to update Vapi assistant:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
