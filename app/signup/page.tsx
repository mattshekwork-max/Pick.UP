"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const APP_NAME = "Pick.UP";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If session exists immediately, email confirmation is disabled
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Email confirmation is enabled — show check-your-email screen
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf9f7]">
        <Card className="w-full max-w-md border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0D9488]/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#0D9488]" />
            </div>
            <CardTitle className="text-2xl font-heading font-bold text-gray-900">Check your email</CardTitle>
            <CardDescription className="text-gray-600">
              We sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600">
              Already confirmed?{" "}
              <Link href="/login" className="text-[#0D9488] hover:text-[#0d857c] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf9f7]">
      <div className="w-full max-w-md">
        <Card className="border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/logo.png" alt="Pick.UP" className="w-10 h-10 object-contain" />
              <CardTitle className="text-2xl font-heading font-bold text-gray-900">{APP_NAME}</CardTitle>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">Start your 14-day free trial</p>
              <p className="text-sm text-gray-600">No credit card required. Cancel anytime.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl border-gray-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="rounded-xl border-gray-300 focus:border-[#0D9488] focus:ring-[#0D9488]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl h-11 font-medium"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Start Free Trial"}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-[#0D9488] hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#0D9488] hover:underline">Privacy Policy</Link>.
            </p>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0D9488] hover:text-[#0d857c] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Onboarding preview */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">What happens next</p>
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-xs font-bold text-[#0D9488]">1</span>
              Confirm your email
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-xs font-bold text-[#0D9488]">2</span>
              Pick a local number or forward yours
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-xs font-bold text-[#0D9488]">3</span>
              Add hours and services — Pick.UP goes live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}