"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_SERVER_URL = process.env.VAPI_SERVER_URL || "https://www.pickuphone.com/api/vapi/sms-webhook";

interface ProvisionPhoneResult {
  success: boolean;
  phoneNumber?: string;
  phoneNumberId?: string;
  assistantId?: string;
  error?: string;
}

export async function provisionVapiPhoneNumber(areaCode: string): Promise<ProvisionPhoneResult> {
  if (!VAPI_API_KEY) {
    return { success: false, error: "VAPI_API_KEY not configured" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if user already has a provisioned phone number
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("ringley_phone_number, vapi_phone_number_id")
    .eq("user_id", user.id)
    .single();

  if (existingBusiness?.ringley_phone_number) {
    return { 
      success: false, 
      error: "You already have a Pick.UP number. Contact support@pickuphone.com if you need additional numbers." 
    };
  }

  try {
    // Step 1: Provision phone number from Vapi
    const phoneRes = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "vapi",
        numberDesiredAreaCode: areaCode,
        name: `Pick.UP Number ${areaCode}`,
        server: {
          url: VAPI_SERVER_URL,
        },
      }),
    });

    if (!phoneRes.ok) {
      const errorText = await phoneRes.text();
      console.error("Vapi phone provision error:", errorText);
      return { success: false, error: `Failed to provision phone: ${errorText}` };
    }

    const phoneData = await phoneRes.json();
    const phoneNumber = phoneData.number;
    const phoneNumberId = phoneData.id;

    // Step 2: Get business data to create assistant
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return { success: false, error: "Business profile not found" };
    }

    // Step 3: Create new Pick.UP assistant with business info
    const assistantRes = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${business.business_name} Receptionist`,
        model: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.7,
          systemPrompt: buildSystemPrompt(business),
          functions: buildFunctions(business),
        },
        voice: {
          provider: "vapi",
          voiceId: "Layla", // Female voice, supports multiple languages
        },
        firstMessage: business.greeting_message || `Thank you for calling ${business.business_name}! How can I help you today?`,
        voicemailMessage: `You've reached ${business.business_name}. Please leave a message and we'll get back to you.`,
        recordingEnabled: true,
        server: {
          url: VAPI_SERVER_URL,
        },
      }),
    });

    if (!assistantRes.ok) {
      const errorText = await assistantRes.text();
      console.error("Vapi assistant creation error:", errorText);
      return { success: false, error: `Failed to create assistant: ${errorText}` };
    }

    const assistantData = await assistantRes.json();
    const assistantId = assistantData.id;

    // Step 4: Link phone number to assistant
    const linkRes = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId,
        server: {
          url: VAPI_SERVER_URL,
        },
      }),
    });

    if (!linkRes.ok) {
      const errorText = await linkRes.text();
      console.error("Vapi link error:", errorText);
      // Continue anyway - we can link manually later
    }

    // Step 5: Save to database (UPDATE if exists, INSERT if not)
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        ringley_phone_number: phoneNumber,
        vapi_assistant_id: assistantId,
        vapi_phone_number_id: phoneNumberId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // If UPDATE failed because no record exists, try INSERT
    if (updateError) {
      const { error: insertError } = await supabase
        .from("businesses")
        .insert({
          user_id: user.id,
          ringley_phone_number: phoneNumber,
          vapi_assistant_id: assistantId,
          vapi_phone_number_id: phoneNumberId,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
        return { success: false, error: `Failed to save phone number: ${insertError.message}` };
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/setup");

    return {
      success: true,
      phoneNumber,
      phoneNumberId,
      assistantId,
    };

  } catch (error) {
    console.error("Provision error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

function buildSystemPrompt(business: any): string {
  const services = business.services?.join(", ") || "various services";
  const hours = formatHours(business.business_hours);
  const faqs = business.faqs?.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n") || "";

  return `You are the AI receptionist for ${business.business_name}. Your job is to answer calls professionally, answer questions, and book appointments.

BUSINESS INFORMATION:
- Business Name: ${business.business_name}
- Services: ${services}

BUSINESS HOURS:
${hours}

FREQUENTLY ASKED QUESTIONS:
${faqs || "No FAQs provided."}

YOUR CAPABILITIES:
1. Answer questions about the business using the FAQs above
2. Book appointments using the book_appointment function
3. Check availability using check_availability function
4. Transfer calls to humans using transfer_call function

GUIDELINES:
- Be warm, professional, and helpful
- Always confirm appointment details before booking
- If you don't know something, offer to transfer to a human
- Keep responses concise (2-3 sentences max)
- Ask for the caller's name early in the conversation
- Confirm the phone number if booking an appointment
- If the requested time is outside business hours, politely suggest alternatives

TRANSFER TO HUMAN WHEN:
- The caller is angry or frustrated
- The issue is complex or sensitive
- The caller explicitly asks for a human
- You cannot answer their question after checking the FAQs`;
}

function formatHours(hours: any): string {
  if (!hours) return "Hours not specified";
  return Object.entries(hours)
    .map(([day, h]: [string, any]) => {
      if (h.closed) return `${day}: Closed`;
      return `${day}: ${h.open} - ${h.close}`;
    })
    .join("\n");
}

function buildFunctions(business: any) {
  const functions = [];

  // Always add transfer function if transfer number exists
  if (business.transfer_phone_number) {
    functions.push({
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
    });
  }

  // Add booking functions
  functions.push({
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
          enum: business.services?.filter((s: string) => s) || ["Service"],
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
  });

  functions.push({
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
  });

  return functions;
}

export async function updateVapiAssistant(businessId: number): Promise<{ success: boolean; error?: string }> {
  if (!VAPI_API_KEY) {
    return { success: false, error: "VAPI_API_KEY not configured" };
  }

  const supabase = await createClient();
  
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!business?.vapi_assistant_id) {
    return { success: false, error: "No assistant found for this business" };
  }

  try {
    const res = await fetch(`https://api.vapi.ai/assistant/${business.vapi_assistant_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        server: {
          url: VAPI_SERVER_URL,
        },
        model: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.7,
          systemPrompt: buildSystemPrompt(business),
          functions: buildFunctions(business),
        },
        firstMessage: business.greeting_message,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Vapi update error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, error: "Failed to update assistant" };
  }
}
