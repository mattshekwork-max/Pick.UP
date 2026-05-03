import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { LandingPageClient } from "@/components/LandingPageClient";

function cleanEnv(value: string | undefined, fallback = "") {
  if (!value) return fallback;
  return value.trim().replace(/^"|"$/g, "");
}

export const metadata: Metadata = {
  title: 'Pick.UP',
  description: 'Pick.UP is an AI receptionist that answers your business calls, books appointments, handles common questions, and sends a follow-up recap after every call.',
  metadataBase: new URL(cleanEnv(process.env.NEXT_PUBLIC_APP_URL, 'https://pickuphone.com')),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pick.UP',
    description: 'Pick.UP is an AI receptionist that answers your business calls, books appointments, handles common questions, and sends a follow-up recap after every call.',
    url: cleanEnv(process.env.NEXT_PUBLIC_APP_URL, 'https://pickuphone.com'),
    type: 'website',
    images: [
      {
        url: '/logo.png',
        alt: 'Pick.UP logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pick.UP',
    description: 'AI receptionist for small businesses that answers calls, books appointments, and sends follow-up recaps.',
    images: ['/logo.png'],
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
// Force redeploy Tue Apr 14 13:40:57 PDT 2026
