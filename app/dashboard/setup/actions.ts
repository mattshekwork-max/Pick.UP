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
    return { success: false, error: "Failed to save business profile" };
  }
  
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