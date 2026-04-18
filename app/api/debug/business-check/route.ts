import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  // Get business profile
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) {
    return NextResponse.json({ 
      error: "Business not found",
      details: error.message 
    }, { status: 404 });
  }
  
  // Check SMS configuration
  const smsConfig = {
    has_transfer_phone: !!business.transfer_phone_number,
    transfer_phone_number: business.transfer_phone_number || "NOT SET",
    business_name: business.business_name,
    ringley_phone_number: business.ringley_phone_number,
    google_calendar_connected: !!(business.google_refresh_token && business.google_calendar_id),
  };
  
  // Get all businesses for debugging
  const { data: allBusinesses } = await supabase
    .from("businesses")
    .select("id, business_name, user_id, transfer_phone_number, ringley_phone_number");
  
  return NextResponse.json({
    user_id: user.id,
    user_email: user.email,
    business,
    smsConfig,
    allBusinesses,
  });
}
