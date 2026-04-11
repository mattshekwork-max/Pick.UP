# Vapi Assistant Configuration for Pick.UP

## Quick Setup

### Option 1: Use Vapi Dashboard (Recommended)

1. **Go to:** https://dashboard.vapi.ai
2. **Navigate to:** Assistants → Create New Assistant
3. **Copy/paste the configuration below**

### Option 2: Use API (Advanced)

Run the script with proper environment variables:
```bash
cd /Users/macai/.openclaw/workspace/voxadora
export VAPI_API_KEY=aec2338f-524b-48d8-a858-f5691d5ba101
export NEXT_PUBLIC_SUPABASE_URL=https://ixozcwbmzerupstgoqox.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3pjd2JtemVydXBzdGdvcW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc0MDI2MCwiZXhwIjoyMDkwMzE2MjYwfQ.nKO6F7MVcfMVLUfObuuUo0kL6TdJo1YPfJ3t6mCMtLI
export NEXT_PUBLIC_APP_URL=https://pickuphone.com
export VAPI_WEBHOOK_SECRET=04c1e880b4a6a1dd30ac97cd93da8593fa880f6ce9b60c14978bdf9d707ff2be
npx tsx scripts/setup-vapi-assistant.ts
```

---

## Assistant Configuration (Copy/Paste to Vapi Dashboard)

### Basic Settings

**Name:** `Pick.UP AI Receptionist`

**First Message:**
```
Hello! Thanks for calling. How can I help you today?
```

### Voice Settings

**Transcriber:**
- Provider: `Deepgram`
- Model: `nova-2`
- Language: `en`

**Voice:**
- Provider: `PlayHT`
- Voice ID: `jennifer` (professional, warm female voice)

### AI Model

**Provider:** `OpenAI`
**Model:** `gpt-4o-mini`

**System Message:**
```
You are a professional AI receptionist for a small business.

YOUR ROLE:
- Answer calls warmly and professionally
- Handle common questions using the business's FAQ
- Book appointments into their Google Calendar
- Transfer calls when requested or when you can't help

BUSINESS INFORMATION:
The business profile will be provided in the conversation context. Use it to:
- Address callers with the business name
- Answer questions about services offered
- Provide business hours
- Respond to FAQs

GUIDELINES:
1. Be concise and friendly
2. Confirm details before booking appointments
3. If caller asks for a human, transfer immediately
4. If you're unsure, offer to transfer
5. Always get: name, phone, service type, and preferred time for appointments

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
- Wait for caller to hang up first
```

### Functions (Tools)

**Function 1: book_appointment**
```json
{
  "name": "book_appointment",
  "description": "Book an appointment in the business's calendar",
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Appointment date (YYYY-MM-DD)"
      },
      "time": {
        "type": "string",
        "description": "Appointment time (HH:MM in 24h format)"
      },
      "service": {
        "type": "string",
        "description": "Service being booked"
      },
      "customerName": {
        "type": "string",
        "description": "Customer's full name"
      },
      "customerPhone": {
        "type": "string",
        "description": "Customer's phone number"
      }
    },
    "required": ["date", "time", "service", "customerName", "customerPhone"]
  }
}
```

**Function 2: transfer_call**
```json
{
  "name": "transfer_call",
  "description": "Transfer the call to a human representative",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "Reason for transfer"
      }
    },
    "required": ["reason"]
  }
}
```

**Function 3: check_availability**
```json
{
  "name": "check_availability",
  "description": "Check if a time slot is available in the calendar",
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Date to check (YYYY-MM-DD)"
      },
      "time": {
        "type": "string",
        "description": "Time to check (HH:MM)"
      }
    },
    "required": ["date", "time"]
  }
}
```

### Webhook Configuration

**Webhook URL:** `https://pickuphone.com/api/vapi/webhook`

**Webhook Secret:** `04c1e880b4a6a1dd30ac97cd93da8593fa880f6ce9b60c14978bdf9d707ff2be`

**Events to enable:**
- ✅ Call Started
- ✅ Call Ended
- ✅ Function Call

---

## After Creating the Assistant

### 1. Configure Phone Number

**In Vapi Dashboard:**
1. Go to: **Phone Numbers** → **Buy New Number** (or use existing)
2. Select the assistant you just created: `Pick.UP AI Receptionist`
3. Configure the number

### 2. Update Business Profile

**In Pick.UP Dashboard:**
1. Go to: `/dashboard/setup`
2. Fill in:
   - Business Name
   - Services Offered
   - Business Hours
   - FAQ (common questions & answers)
   - Greeting Message
   - Transfer Phone Number (your mobile)
   - Ringley Phone Number (the Vapi number)

### 3. Test the Flow

**Make a test call:**
1. Call your Vapi phone number
2. AI should answer with your greeting
3. Ask a question about your services
4. Try to book an appointment
5. Check if it appears in Google Calendar
6. Check if SMS summary arrives on your phone

---

## Dynamic Business Profiles (Advanced)

To make the assistant **dynamically read from each business profile**:

### Option A: Update Assistant Per Business
When a business updates their profile, call Vapi API to update the assistant's system message with new info.

### Option B: Use Vapi's Context Feature
Pass business profile as context in the webhook when call starts. (Requires webhook modification)

### Option C: Use Vapi's Variables
Store business info in Vapi variables and reference them in the system message with `{{variable_name}}`.

**Recommended:** Start with **Option A** - update assistant when business profile changes.

---

## Testing Checklist

- [ ] Assistant answers calls
- [ ] Greeting uses business name
- [ ] Can answer FAQ questions
- [ ] Can book appointments
- [ ] Appointments appear in Google Calendar
- [ ] SMS summary sent after call
- [ ] Call transfers work when needed
- [ ] Call transcripts saved to database

---

## Troubleshooting

**Assistant not answering:**
- Check phone number is assigned to assistant
- Verify webhook URL is correct
- Check Vapi API key is valid

**Appointments not booking:**
- Verify Google Calendar is connected
- Check webhook is receiving function calls
- Review Supabase logs for errors

**SMS not sending:**
- Verify Twilio credentials in Vercel
- Check transfer_phone_number is set
- Review Twilio logs in dashboard

---

**Need help?** Check Vapi docs: https://docs.vapi.ai
