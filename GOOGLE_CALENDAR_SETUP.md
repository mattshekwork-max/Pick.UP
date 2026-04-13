# Google Calendar Integration Setup

## Overview
Pick.UP integrates with Google Calendar to enable AI appointment booking. Each user connects their own Gmail calendar during setup.

## Required Environment Variables

Add these to your **Vercel Environment Variables** (Production):

```
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

## How to Get Google OAuth Credentials

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it: "Pick.UP"

### Step 2: Enable Calendar API
1. Go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: "Pick.UP Production"

### Step 4: Configure Redirect URIs
Add these **Authorized redirect URIs**:
```
https://pickuphone.com/api/auth/google/callback
https://www.pickuphone.com/api/auth/google/callback
http://localhost:3000/api/auth/google/callback  (for local dev)
```

### Step 5: Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. User Type: **External**
3. App name: **Pick.UP**
4. User support email: Your email
5. Developer contact: Your email
6. Scopes: Add these:
   - `.../auth/calendar`
   - `.../auth/calendar.events`
7. Add your domain: `pickuphone.com`
8. Save and continue

### Step 6: Copy Credentials
After creating the OAuth client, you'll get:
- **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

Copy both and add to Vercel!

## Vercel Setup

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add:
   - `GOOGLE_CLIENT_ID` = paste your Client ID
   - `GOOGLE_CLIENT_SECRET` = paste your Client Secret
4. Click "Save"
5. **Redeploy** your app (Settings → Deployments → Redeploy)

## How It Works for Users

1. User signs up for Pick.UP
2. Goes to Dashboard → Setup
3. Clicks "Connect Google Calendar"
4. Google OAuth popup appears
5. User selects their Gmail account
6. Grants calendar permissions
7. Redirected back to Pick.UP with calendar connected
8. AI can now book appointments directly in their Google Calendar!

## Testing

After deploying:
1. Visit `https://pickuphone.com/api/auth/google`
2. Should redirect to Google OAuth
3. Select a test Gmail account
4. Grant permissions
5. Should redirect back to `/dashboard/setup?calendar=connected`

## Troubleshooting

**Error: redirect_uri_mismatch**
- Make sure your Vercel production URL is in the Authorized redirect URIs
- Check for http vs https

**Error: invalid_client**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct in Vercel
- No extra spaces or quotes

**Error: access_denied**
- User denied permissions
- Or OAuth consent screen not configured properly

## Security Notes

- ✅ Uses OAuth 2.0 with refresh tokens
- ✅ Stores only refresh token (not passwords)
- ✅ Scoped to calendar access only
- ✅ Each user connects their own calendar
- ✅ Tokens stored encrypted in Supabase

## Support

If issues persist, check:
- Google Cloud Console → APIs & Services → Credentials
- Verify Calendar API is enabled
- Check OAuth consent screen is published
- Review Vercel deployment logs
