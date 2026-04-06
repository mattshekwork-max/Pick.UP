import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const userId = searchParams.get("state");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/setup?calendar=error&reason=${encodeURIComponent(error)}`
    );
  }

  if (!code || !userId) {
    return NextResponse.redirect(
      `${APP_URL}/dashboard/setup?calendar=error&reason=missing_params`
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/setup?calendar=error&reason=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Get user's email from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // Save to database
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_calendar_id: userInfo.email,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/setup?calendar=error&reason=database_error`
      );
    }

    return NextResponse.redirect(
      `${APP_URL}/dashboard/setup?calendar=connected&email=${encodeURIComponent(
        userInfo.email
      )}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/setup?calendar=error&reason=unknown`
    );
  }
}
