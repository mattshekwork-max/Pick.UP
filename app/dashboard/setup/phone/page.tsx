"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { provisionVapiPhoneNumber } from "../vapi-actions";
import { getBusinessProfile } from "../actions";
import Link from "next/link";

export default function PhoneProvisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaCode, setAreaCode] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [provisionedPhone, setProvisionedPhone] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");

  // Load existing business data
  useEffect(() => {
    async function loadBusiness() {
      const business = await getBusinessProfile();
      if (!business) {
        // No business profile - redirect to setup
        router.push("/dashboard/setup");
        return;
      }
      setBusinessName(business.business_name || "");
      if (business.ringley_phone_number) {
        setProvisionedPhone(business.ringley_phone_number);
      }
    }
    loadBusiness();
  }, [router]);

  const handleProvisionPhone = async () => {
    if (areaCode.length !== 3) {
      setError("Please enter a valid 3-digit area code");
      return;
    }

    setProvisioning(true);
    setError(null);

    const result = await provisionVapiPhoneNumber(areaCode);

    if (result.success) {
      setProvisionedPhone(result.phoneNumber || null);
      setAreaCode("");
      // Refresh to show the provisioned number
      router.refresh();
    } else {
      setError(result.error || "Failed to provision phone number");
    }

    setProvisioning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/setup">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pick.UP" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Get Your Phone Number
                </h1>
                {businessName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For: {businessName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {provisionedPhone ? (
          /* Phone Already Provisioned */
          <Card className="border-[#0D9488]/20 bg-[#0D9488]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0D9488]">
                <CheckCircle className="w-6 h-6" />
                Your Pick.UP Phone Number
              </CardTitle>
              <CardDescription>
                Your dedicated AI receptionist number is ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-[#0D9488]/20">
                <p className="text-3xl font-bold text-[#0D9488] mb-2">{provisionedPhone}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is your Pick.UP number. Give this to customers or forward your existing number to it.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D9488] mt-0.5" />
                    <span>Test your number by calling it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D9488] mt-0.5" />
                    <span>Configure your AI greeting and services in the setup page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D9488] mt-0.5" />
                    <span>Connect Google Calendar for appointment booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D9488] mt-0.5" />
                    <span>Add a transfer number to receive SMS call summaries</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/dashboard/setup" className="flex-1">
                  <Button className="w-full bg-[#0D9488] hover:bg-[#0d857c] text-white">
                    Continue Setup
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Need more numbers? Contact <a href="mailto:support@pickuphone.com" className="text-[#0D9488] hover:underline">support@pickuphone.com</a>
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Provision New Phone */
          <Card className="border-[#0D9488]/20 bg-[#0D9488]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0D9488]">
                <Phone className="w-6 h-6" />
                Get Your Dedicated Phone Number
              </CardTitle>
              <CardDescription>
                Choose your preferred area code and we'll provision a number for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="areaCode"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="e.g., 555"
                    maxLength={3}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    onClick={handleProvisionPhone}
                    disabled={provisioning || areaCode.length !== 3}
                    className="bg-[#0D9488] hover:bg-[#0d857c] text-white"
                  >
                    {provisioning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Provisioning...
                      </>
                    ) : (
                      "Get Number"
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your preferred area code (e.g., 555 for San Francisco area)
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  What You Get:
                </h3>
                <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Dedicated phone number for your business</li>
                  <li>• AI receptionist that answers 24/7</li>
                  <li>• Call summaries via SMS</li>
                  <li>• Appointment booking</li>
                  <li>• Call forwarding options</li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/dashboard/setup">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Business Setup
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Each business gets one auto-provisioned number. Need more? Contact <a href="mailto:support@pickuphone.com" className="text-[#0D9488] hover:underline">support@pickuphone.com</a>
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
