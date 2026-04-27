import { NextRequest, NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle Telegram webhook
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;
      const text = message.text || "";
      const from = message.from;
      const username = from.username || from.first_name || "Unknown";
      
      // Only respond to @DevlopDev_bot messages from your chat
      if (chatId.toString() !== process.env.TELEGRAM_ADMIN_CHAT_ID) {
        return NextResponse.json({ ok: true });
      }
      
      // Forward to Discord
      if (DISCORD_WEBHOOK_URL) {
        await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `📱 **Telegram DM from ${username}**\n${text}`,
            username: "DevlopDev Bot Bridge"
          })
        });
      }
      
      // Also send a confirmation back to Telegram
      if (TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Message forwarded to Dev! I'll respond when I'm online."
          })
        });
      }
      
      return NextResponse.json({ ok: true });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}