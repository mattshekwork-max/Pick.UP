import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Mask the secret for security
  const maskedSecret = clientSecret 
    ? `${clientSecret.substring(0, 8)}...${clientSecret.substring(clientSecret.length - 4)}`
    : 'NOT SET';

  return NextResponse.json({
    GOOGLE_CLIENT_ID: clientId || 'NOT SET',
    GOOGLE_CLIENT_SECRET: maskedSecret,
    NEXT_PUBLIC_APP_URL: appUrl || 'NOT SET',
    redirectUri: redirectUri,
    clientIdLength: clientId?.length || 0,
    expectedLength: 'Should be ~70 characters ending in .apps.googleusercontent.com',
    isValidFormat: clientId?.endsWith('.apps.googleusercontent.com') || false,
  });
}
