import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  // Get recent webhook logs (if table exists)
  try {
    const { data: logs, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (error) {
      return NextResponse.json({
        error: "Webhook logs table doesn't exist yet",
        details: error.message,
        suggestion: "Run migration 006-webhook-logs.sql in Supabase",
      });
    }
    
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to fetch logs",
      details: error.message,
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    
    const { error } = await supabase.from("webhook_logs").insert({
      event_type: body.eventType || "unknown",
      payload: body,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      return NextResponse.json({
        error: "Failed to log webhook",
        details: error.message,
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
