import { NextResponse } from "next/server";

function cleanEnv(value: string | undefined, fallback = "") {
  if (!value) return fallback;
  return value.trim().replace(/^"|"$/g, "");
}

export async function GET() {
  const clientId = cleanEnv(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
  const appUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL);
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const scope = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
  ].join(' ');
  const authUrl = clientId
    ? `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope,
        access_type: 'offline',
        prompt: 'consent',
        state: 'debug-user-id',
      }).toString()}`
    : 'NOT SET';

  // Mask the secret for security
  const maskedSecret = clientSecret 
    ? `${clientSecret.substring(0, 8)}...${clientSecret.substring(clientSecret.length - 4)}`
    : 'NOT SET';

  return NextResponse.json({
    GOOGLE_CLIENT_ID: clientId || 'NOT SET',
    GOOGLE_CLIENT_SECRET: maskedSecret,
    NEXT_PUBLIC_APP_URL: appUrl || 'NOT SET',
    redirectUri: redirectUri,
    authUrl,
    scope,
    clientIdLength: clientId?.length || 0,
    expectedLength: 'Should be ~70 characters ending in .apps.googleusercontent.com',
    isValidFormat: clientId?.endsWith('.apps.googleusercontent.com') || false,
  });
}
