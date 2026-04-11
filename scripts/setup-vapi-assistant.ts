#!/usr/bin/env tsx
/**
 * Setup Vapi Assistant for Pick.UP
 * 
 * This script creates a Vapi assistant configured to:
 * - Read business profile from database
 * - Use custom greeting
 * - Handle FAQs
 * - Book appointments to Google Calendar
 * - Transfer calls when needed
 */

import { createClient } from "@supabase/supabase-js";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VAPI_API_KEY) {
  console.error("❌ VAPI_API_KEY not set in environment");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Supabase credentials not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Vapi Assistant Configuration
const assistantConfig = {
  name: "Pick.UP AI Receptionist",
  firstMessage: "Hello! Thanks for calling {{business_name}}. How can I help you today?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer", // Professional, warm female voice
  },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a professional AI receptionist for {{business_name}}.

YOUR ROLE:
- Answer calls warmly and professionally
- Handle common questions using the business's FAQ
- Book appointments into their Google Calendar
- Transfer calls when requested or when you can't help

BUSINESS INFORMATION:
- Business Name: {{business_name}}
- Services: {{services}}
- Business Hours: {{business_hours}}
- Greeting: {{greeting_message}}
- Transfer Number: {{transfer_phone_number}}

FAQ RESPONSES:
{{faqs}}

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
  * It's outside business hours (if configured)
  * Complex pricing or custom quotes needed

END CALL GRACEFULLY:
- Confirm next steps
- Thank them for calling
- Wait for caller to hang up first`,
      },
    ],
  },
  functions: [
    {
      name: "book_appointment",
      description: "Book an appointment in the business's calendar",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Appointment date (YYYY-MM-DD)",
          },
          time: {
            type: "string",
            description: "Appointment time (HH:MM in 24h format)",
          },
          service: {
            type: "string",
            description: "Service being booked",
          },
          customerName: {
            type: "string",
            description: "Customer's full name",
          },
          customerPhone: {
            type: "string",
            description: "Customer's phone number",
          },
        },
        required: ["date", "time", "service", "customerName", "customerPhone"],
      },
    },
    {
      name: "transfer_call",
      description: "Transfer the call to a human representative",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Reason for transfer",
          },
        },
        required: ["reason"],
      },
    },
    {
      name: "check_availability",
      description: "Check if a time slot is available in the calendar",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Date to check (YYYY-MM-DD)",
          },
          time: {
            type: "string",
            description: "Time to check (HH:MM)",
          },
        },
        required: ["date", "time"],
      },
    },
  ],
  webhook: {
    url: "{{webhook_url}}/api/vapi/webhook",
    secret: process.env.VAPI_WEBHOOK_SECRET,
  },
};

async function main() {
  console.log("🚀 Setting up Vapi Assistant for Pick.UP...\n");

  try {
    // Get first business to use as template
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error || !business) {
      console.log("⚠️  No active business found. Creating assistant with default config...");
    } else {
      console.log(`✅ Found business: ${business.business_name}`);
      
      // Customize assistant with business data
      assistantConfig.firstMessage = business.greeting_message || assistantConfig.firstMessage;
      
      // Update system message with business info
      assistantConfig.model.messages[0].content = assistantConfig.model.messages[0].content
        .replace("{{business_name}}", business.business_name)
        .replace("{{services}}", business.services?.join(", ") || "Not specified")
        .replace("{{business_hours}}", JSON.stringify(business.business_hours) || "Not specified")
        .replace("{{greeting_message}}", business.greeting_message || "Hello!")
        .replace("{{transfer_phone_number}}", business.transfer_phone_number || "Not configured")
        .replace("{{faqs}}", business.faqs?.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n") || "No FAQs configured");
    }

    // Set webhook URL
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pickuphone.com";
    assistantConfig.webhook.url = assistantConfig.webhook.url.replace("{{webhook_url}}", webhookUrl);

    // Create assistant in Vapi
    console.log("\n📞 Creating assistant in Vapi...");
    
    const response = await fetch("https://api.vapi.ai/v1/assistant", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
    }

    const assistant = await response.json();
    
    console.log("\n✅ Assistant created successfully!");
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Webhook: ${assistantConfig.webhook.url}`);
    console.log("\n📋 Next Steps:");
    console.log("   1. Go to Vapi Dashboard: https://dashboard.vapi.ai");
    console.log("   2. Navigate to Assistants → Pick.UP AI Receptionist");
    console.log("   3. Configure a phone number or use your existing one");
    console.log("   4. Set the webhook URL to:", assistantConfig.webhook.url);
    console.log("   5. Test with a call!");
    console.log("\n🎉 Your AI receptionist is ready!");

  } catch (error: any) {
    console.error("\n❌ Error setting up assistant:", error.message);
    process.exit(1);
  }
}

main();
