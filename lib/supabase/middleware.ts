import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON;

  // Check if env vars are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseAnonKey) {
    console.warn('Supabase env vars not available in middleware');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is required for Server Components to read
  // an up-to-date session cookie.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // Silently fail - user might not be logged in
    console.log('Session refresh failed (might not be logged in):', error);
  }

  return supabaseResponse;
}
