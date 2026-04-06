// lib/vapi.ts
// Helper functions for Vapi AI assistant configuration

export interface BusinessConfig {
  business_name: string;
  greeting_message: string;
  services: string[];
  faqs: { question: string; answer: string }[];
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
  transfer_phone_number?: string;
}

export function buildVapiAssistantConfig(business: BusinessConfig) {
  return {
    name: `${business.business_name} Receptionist`,
    model: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      systemPrompt: buildSystemPrompt(business),
      functions: [
        {
          name: "book_appointment",
          description: "Book an appointment for the caller",
          parameters: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "The date for the appointment in YYYY-MM-DD format",
              },
              time: {
                type: "string",
                description: "The time for the appointment in HH:MM format (24-hour)",
              },
              service: {
                type: "string",
                description: "The service being booked",
                enum: business.services,
              },
              customerName: {
                type: "string",
                description: "The caller's name",
              },
              customerPhone: {
                type: "string",
                description: "The caller's phone number",
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
                description: "Why the call is being transferred",
              },
            },
            required: ["reason"],
          },
        },
        {
          name: "check_availability",
          description: "Check availability for a specific date",
          parameters: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "The date to check in YYYY-MM-DD format",
              },
            },
            required: ["date"],
          },
        },
      ],
    },
    voice: {
      provider: "11labs",
      voiceId: "rachel", // Professional, friendly voice
      stability: 0.5,
      similarityBoost: 0.75,
    },
    firstMessage: business.greeting_message,
    voicemailMessage: `You've reached ${business.business_name}. We're unable to take your call right now. Please leave a message and we'll get back to you as soon as possible.`,
    endCallFunctionEnabled: true,
    transferCallEnabled: !!business.transfer_phone_number,
    recordingEnabled: true,
  };
}

function buildSystemPrompt(business: BusinessConfig): string {
  const faqSection = business.faqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  const hoursSection = formatHoursForPrompt(business.business_hours);

  return `You are the AI receptionist for ${business.business_name}. Your job is to answer calls professionally, answer questions, and book appointments.

BUSINESS INFORMATION:
- Business Name: ${business.business_name}
- Services: ${business.services.join(", ")}

BUSINESS HOURS:
${hoursSection}

FREQUENTLY ASKED QUESTIONS:
${faqSection || "No FAQs provided."}

YOUR CAPABILITIES:
1. Answer questions about the business using the FAQs above
2. Book appointments using the book_appointment function
3. Check availability using check_availability function
4. Transfer calls to humans using transfer_call function (use this if the caller is upset, has a complex issue, or explicitly asks for a human)

GUIDELINES:
- Be warm, professional, and helpful
- Always confirm appointment details before booking
- If you don't know something, offer to transfer to a human
- Keep responses concise (2-3 sentences max)
- Ask for the caller's name early in the conversation
- Confirm the phone number if booking an appointment
- If the requested time is outside business hours, politely suggest alternatives within business hours

TRANSFER TO HUMAN WHEN:
- The caller is angry or frustrated
- The issue is complex or sensitive
- The caller explicitly asks for a human
- You cannot answer their question after checking the FAQs`;
}

function formatHoursForPrompt(hours: Record<string, { open: string; close: string; closed: boolean }>): string {
  return Object.entries(hours)
    .map(([day, h]) => {
      if (h.closed) return `${day}: Closed`;
      return `${day}: ${h.open} - ${h.close}`;
    })
    .join("\n");
}

// Helper to create/update assistant via Vapi API
export async function createVapiAssistant(business: BusinessConfig, apiKey: string) {
  const config = buildVapiAssistantConfig(business);

  const response = await fetch("https://api.vapi.ai/assistant", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${error}`);
  }

  return response.json();
}

// Helper to update existing assistant
export async function updateVapiAssistant(assistantId: string, business: BusinessConfig, apiKey: string) {
  const config = buildVapiAssistantConfig(business);

  const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${error}`);
  }

  return response.json();
}

// Helper to provision a phone number
export async function provisionPhoneNumber(areaCode: string, apiKey: string) {
  const response = await fetch("https://api.vapi.ai/phone-number", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      areaCode,
      // This will be linked to an assistant after creation
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${error}`);
  }

  return response.json();
}

// Link phone number to assistant
export async function linkPhoneToAssistant(phoneNumberId: string, assistantId: string, apiKey: string) {
  const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${error}`);
  }

  return response.json();
}
