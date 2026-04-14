import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { LandingPageClient } from "@/components/LandingPageClient";

export const metadata: Metadata = {
  title: 'Pick.UP',
  description: 'Pick.UP is an AI receptionist that picks up your business calls, books appointments, answers common questions, and sends you a summary. Set it up in minutes, not days.',
  openGraph: {
    title: 'Pick.UP',
    description: 'Pick.UP is an AI receptionist that picks up your business calls, books appointments, answers common questions, and sends you a summary. Set it up in minutes, not days.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
    type: 'website',
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
