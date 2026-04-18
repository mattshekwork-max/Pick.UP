import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const fs = await import('fs');
  const path = '/tmp/webhook-test.txt';
  
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  
  const logEntry = `
=== WEBHOOK HIT ${new Date().toISOString()} ===
URL: ${request.url}
Method: ${request.method}
Headers: ${JSON.stringify(headers, null, 2)}
Body: ${body.substring(0, 500)}
========================================
`;
  
  try {
    fs.appendFileSync(path, logEntry);
    console.log("✅ Logged to file:", path);
  } catch (e: any) {
    console.log("❌ File log failed:", e.message);
  }
  
  return NextResponse.json({ 
    success: true, 
    logged: true,
    timestamp: new Date().toISOString(),
    message: "Webhook received and logged to file"
  });
}

export async function GET() {
  const fs = await import('fs');
  const path = '/tmp/webhook-test.txt';
  
  try {
    const content = fs.readFileSync(path, 'utf-8');
    return NextResponse.json({ 
      success: true,
      logs: content.substring(0, 10000) // First 10k chars
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false,
      logs: "No logs yet - webhook hasn't been called"
    });
  }
}
