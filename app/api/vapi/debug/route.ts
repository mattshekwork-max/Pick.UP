import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("📥 DEBUG WEBHOOK HIT!");
  
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());
  
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Body:", JSON.stringify(body, null, 2));
  
  // Save to a simple file for debugging
  const fs = await import('fs');
  const path = '/tmp/webhook-debug.txt';
  const logEntry = `\n=== ${new Date().toISOString()} ===\nHeaders: ${JSON.stringify(headers)}\nBody: ${JSON.stringify(body)}\n`;
  
  try {
    fs.appendFileSync(path, logEntry);
    console.log("Logged to:", path);
  } catch (e) {
    console.log("Failed to log to file:", e);
  }
  
  return NextResponse.json({ 
    success: true, 
    logged: true,
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  const fs = await import('fs');
  const path = '/tmp/webhook-debug.txt';
  
  try {
    const content = fs.readFileSync(path, 'utf-8');
    return NextResponse.json({ logs: content });
  } catch (e) {
    return NextResponse.json({ logs: "No logs yet" });
  }
}
