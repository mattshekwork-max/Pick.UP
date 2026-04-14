"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface BusinessFormData {
  businessName: string;
  phoneNumber: string;
  transferPhone: string;
  greetingMessage: string;
  services: string[];
  faqs: { question: string; answer: string }[];
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
  googleCalendarId: string;
  timezone: string;
}

/**
 * Update Vapi assistant with business profile
 * This makes the AI respond with the correct business info
 */
async function updateVapiAssistant(business: any) {
  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

  if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID) {
    console.log("Vapi not configured, skipping assistant update");
    return;
  }

  // Format FAQs for system message
  const faqsText = business.faqs?.length > 0
    ? business.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
    : "No FAQs configured";

  // Format services
  const servicesText = business.services?.filter((s: string) => s.trim()).join(", ") || "Not specified";

  // Format business hours
  const hoursText = business.business_hours
    ? Object.entries(business.business_hours)
        .filter(([_, hours]: any) => !hours.closed)
        .map(([day, hours]: any) => `${day}: ${hours.open} - ${hours.close}`)
        .join("\n")
    : "Not specified";

  // Build dynamic system message
  const systemMessage = `You are a professional, MULTI-LINGUAL AI receptionist for ${business.business_name}.

LANGUAGES - CRITICAL:
- ALWAYS detect and respond in the caller's language
- If caller speaks Spanish → respond in Spanish
- If caller speaks English → respond in English
- Support: Spanish, English, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Hindi, Arabic, Russian
- Start in English, but switch immediately when you detect another language
- NEVER force English on a Spanish speaker

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
3. If caller asks for a human, transfer immediately using transfer_call
4. If you're unsure, offer to transfer
5. Always get: name, phone, service type, and preferred time for appointments
6. DETECT AND MATCH THE CALLER'S LANGUAGE - THIS IS CRITICAL

APPOINTMENT BOOKING:
- Use the book_appointment function when caller wants to schedule
- Confirm: date, time, service, customer name, phone
- Default appointment duration: 1 hour
- Check business hours before offering times

CALL TRANSFERS - IMPORTANT:
- Use transfer_call function when:
  * Caller explicitly requests a human ("I want to speak to a person")
  * You can't answer their question
  * It's outside business hours
  * Complex pricing or custom quotes needed
- ALWAYS use the transfer_call tool - don't just say you'll transfer

END CALL GRACEFULLY:
- Confirm next steps
- Thank them for calling
- Wait for caller to hang up first`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
      console.log("✅ Vapi assistant updated for:", business.business_name);
    } else {
      const errorText = await response.text();
      console.error("❌ Failed to update Vapi assistant:", response.status, errorText);
    }
  } catch (error) {
    console.error("Vapi update error (non-blocking):", error);
  }
}

export async function saveBusinessProfile(formData: BusinessFormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  
  // Ensure user exists in users table (fix for missing trigger)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (!existingUser) {
    // Create user record if missing
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
      });
    
    if (userError) {
      console.error('Failed to create user record:', userError);
      return { success: false, error: `Failed to create user profile: ${userError.message}` };
    }
  }
  
  // Clean up services and FAQs (remove empty ones)
  const services = formData.services.filter(s => s.trim() !== "");
  const faqs = formData.faqs.filter(f => f.question.trim() !== "" && f.answer.trim() !== "");
  
  // Format phone numbers for Twilio (E.164 format)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return null;
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    // Add +1 for US numbers if not already present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    }
    // Return as-is if already in E.164 format or international
    return digits.startsWith("+") ? digits : `+1${digits}`;
  };
  
  // Check if business profile exists
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();
  
  const businessData = {
    user_id: user.id,
    business_name: formData.businessName,
    phone_number: formData.phoneNumber,
    transfer_phone_number: formData.transferPhone ? formatPhoneNumber(formData.transferPhone) : null,
    greeting_message: formData.greetingMessage,
    services: services,
    faqs: faqs,
    business_hours: formData.businessHours,
    google_calendar_id: formData.googleCalendarId || null,
    timezone: formData.timezone,
    is_active: true,
  };
  
  let result;
  
  if (existingBusiness) {
    // Update existing
    result = await supabase
      .from("businesses")
      .update(businessData)
      .eq("id", existingBusiness.id);
  } else {
    // Create new
    result = await supabase
      .from("businesses")
      .insert(businessData);
  }
  
  if (result.error) {
    console.error("Failed to save business:", result.error);
    return { success: false, error: `${result.error.message || 'Failed to save'} - ${result.error.details || ''}`.trim() };
  }

  // Vapi assistant update: Do manually in Vapi dashboard for now
  // API integration needs debugging - manual update is more reliable
  console.log("Business saved. Update Vapi assistant manually in dashboard.");
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/setup");
  
  return { success: true };
}

export async function getBusinessProfile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  return business;
}