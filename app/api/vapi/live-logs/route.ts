import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  
  // Get last 50 webhook logs
  const { data: logs, error } = await supabase
    .from("webhook_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      logs: [] 
    });
  }
  
  return NextResponse.json({ 
    success: true, 
    count: logs?.length || 0,
    logs 
  });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  
  try {
    const body = await request.json();
    
    const { error } = await supabase.from("webhook_logs").insert({
      event_type: body.eventType || "unknown",
      payload: body,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
