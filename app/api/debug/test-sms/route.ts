import { NextResponse } from "next/server";
import { sendCallSummarySMS } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, businessName } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing 'to' phone number" }, { status: 400 });
    }

    console.log("🧪 Manual SMS test triggered");
    console.log("   To:", to);
    console.log("   Business:", businessName || "Test Business");

    const result = await sendCallSummarySMS(
      to,
      businessName || "Test Business",
      {
        callerName: "Test Caller",
        callerPhone: "+15551234567",
        duration: 120,
        summary: "This is a test call summary to verify SMS is working correctly.",
        wasTransferred: false,
      }
    );

    console.log("📊 SMS result:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "SMS sent!",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: "SMS failed",
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Test SMS error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with { to: '+1234567890', businessName: 'Test' }",
  });
}
