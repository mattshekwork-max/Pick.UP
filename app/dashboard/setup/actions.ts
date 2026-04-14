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

LANGUAGES:
- Detect the caller's language automatically
- Respond in the SAME language the caller speaks
- Support: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Hindi, and more
- If unsure, default to English but be ready to switch

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
6. DETECT AND MATCH THE CALLER'S LANGUAGE

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
  
  // Clean up services and FAQs (remove empty ones)
  const services = formData.services.filter(s => s.trim() !== "");
  const faqs = formData.faqs.filter(f => f.question.trim() !== "" && f.answer.trim() !== "");
  
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
    transfer_phone_number: formData.transferPhone || null,
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