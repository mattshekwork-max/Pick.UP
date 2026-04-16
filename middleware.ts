import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Run Supabase session update
    const supabaseResponse = await updateSession(request);

    // Add security headers to Supabase response
    // Content Security Policy
    supabaseResponse.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://*.vapi.ai https://api.twilio.com https://*.googleapis.com",
        "frame-ancestors 'none'",
      ].join('; ')
    );

    // Prevent clickjacking
    supabaseResponse.headers.set('X-Frame-Options', 'DENY');
    
    // XSS Protection
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Referrer Policy
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    supabaseResponse.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return basic response if middleware fails
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
