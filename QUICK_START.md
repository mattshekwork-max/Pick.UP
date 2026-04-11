# Pick.UP - Quick Start Guide

## 🚀 You're 95% Ready to Launch!

---

## ✅ What's Done:

- [x] **Database** - Supabase configured with RLS
- [x] **Authentication** - User signup/login working
- [x] **Google Calendar** - Connected and booking appointments
- [x] **SMS Notifications** - Twilio integration for call summaries
- [x] **Auto-Save** - Business profiles save automatically
- [x] **Dark/Light Theme** - Toggle in navbar
- [x] **Phone Icon Logo** - Branding in navbar
- [x] **Vapi Integration** - Webhook ready to receive calls
- [x] **Dynamic AI Updates** - Assistant updates when profile changes

---

## 📋 Final Setup (5 Minutes):

### **1. Get Your Vapi Assistant ID**

**Go to:** https://dashboard.vapi.ai

1. Click **"Assistants"** in sidebar
2. Find your assistant (e.g., "Pick.UP AI Receptionist")
3. **Copy the Assistant ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### **2. Add to Vercel Environment Variables**

**Go to:** https://vercel.com/mattshekwork-maxs-projects/pick-up-dhc6/settings/environment-variables

**Add this variable:**

| Name | Value |
|------|-------|
| `VAPI_ASSISTANT_ID` | (paste your assistant ID from step 1) |

**Click Save** → **Redeploy**

---

## 🎯 Test the Full Flow:

### **A) Update Your Business Profile**

**Go to:** https://pickuphone.com/dashboard/setup

**Fill in:**
- ✅ Business Name: (e.g., "Test Plumbing Co")
- ✅ Transfer Phone: `(619) 396-7530` (your mobile)
- ✅ Ringley Phone: `(619) 349-6557` (Vapi/Twilio number)
- ✅ Services: (e.g., "Plumbing Repair, Water Heater Installation, Drain Cleaning")
- ✅ Business Hours: (e.g., Mon-Fri 8AM-6PM)
- ✅ FAQs: (2-3 common questions)
  - Q: "Do you offer emergency service?"
  - A: "Yes, we offer 24/7 emergency service for existing customers."
  - Q: "What's your service area?"
  - A: "We serve all of San Diego County."
- ✅ Greeting: "Hello! Thanks for calling Test Plumbing. How can I help you today?"

**Click Save** → This will automatically update your Vapi assistant!

---

### **B) Make a Test Call**

**From your mobile (619-396-7530):**

1. **Call:** `(619) 349-6557`
2. **AI should answer** with your greeting
3. **Say:** "Hi, I'd like to book an appointment for a plumbing repair"
4. **Give fake info:**
   - Name: "John Test"
   - Phone: "(555) 123-4567"
   - Date: Tomorrow's date
   - Time: 2 PM
5. **Hang up**

---

### **C) Verify Everything Worked**

**Check these:**

1. **📱 SMS on your mobile:** Should arrive within seconds
   ```
   📞 Pick.UP: New call for Test Plumbing Co
   
   From: John Test
   Duration: 2 min
   
   Summary: "Customer wants to book plumbing repair..."
   
   ✅ BOOKED: Plumbing Repair on 2026-04-11 2:00 PM
   ```

2. **💻 Dashboard:** https://pickuphone.com/dashboard
   - Call should appear in "Recent Calls"
   - Click to see full transcript

3. **📅 Google Calendar:**
   - Appointment should appear
   - Check the calendar you connected

4. **🤖 Vapi Assistant:**
   - Go to: https://dashboard.vapi.ai
   - Click **"Calls"** → Find your test call
   - Listen to the recording

---

## 🎉 You're Live!

Once the test works, you're **100% ready** to:
- Onboard real businesses
- Charge $50/month via Stripe
- Scale to multiple clients

---

## 📊 Next Steps (Post-Launch):

### **Stripe Integration:**
1. Create $50/month product in Stripe
2. Add upgrade page to dashboard
3. Connect webhook to activate subscriptions

### **Multiple Businesses:**
- Each business gets their own:
  - Phone number (Twilio)
  - Business profile
  - Google Calendar
  - Vapi assistant (or shared with dynamic updates)

### **Email Notifications:**
- Configure Resend for email summaries
- Send weekly call reports
- Onboarding emails for new customers

---

## 🛠️ Troubleshooting:

**AI not answering:**
- Check Vapi assistant is assigned to phone number
- Verify webhook URL is: `https://pickuphone.com/api/vapi/webhook`

**SMS not arriving:**
- Verify `transfer_phone_number` is set in business profile
- Check Twilio credentials in Vercel

**Calendar not booking:**
- Re-connect Google Calendar in dashboard
- Check calendar permissions

**Assistant has wrong info:**
- Update business profile in dashboard
- Save triggers automatic Vapi update
- Wait 30 seconds, then test call

---

## 📞 Support:

**Vapi Docs:** https://docs.vapi.ai
**Twilio Docs:** https://twilio.com/docs
**Supabase Docs:** https://supabase.com/docs

**Built with:** [SaasOpportunities.com](https://saasopportunities.com)

---

**🚀 Ready to launch! Go test it!**
