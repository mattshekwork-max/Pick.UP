"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle, Loader2, ArrowLeft, Copy } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (provisionedPhone) {
      await navigator.clipboard.writeText(provisionedPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="text-3xl font-bold text-[#0D9488]">{provisionedPhone}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is your Pick.UP number. Give this to customers or forward your existing number to it.
                </p>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>⏱️ Note:</strong> It takes about 1 minute for your number to fully register and become active. Please wait before testing.
                  </p>
                </div>
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

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Want to Forward Your Existing Number?
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                  Forward calls from your current business line to your new Pick.UP number so you never miss a call:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Quick Setup (Most Carriers):</h4>
                    <ol className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                      <li className="flex items-start gap-2">
                        <span className="font-bold bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">1</span>
                        <span>Pick up your current phone (the one you want to forward)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">2</span>
                        <span>Dial: <code className="bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded">*72</code> (most US carriers)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">3</span>
                        <span>When you hear a tone or dial tone, enter your Pick.UP number: <strong className="text-[#0D9488]">{provisionedPhone}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">4</span>
                        <span>Wait for confirmation (usually 2 beeps or a voice message)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">5</span>
                        <span>Test it! Call your old number from another phone - it should ring on Pick.UP</span>
                      </li>
                    </ol>
                  </div>

                  <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Carrier-Specific Codes:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-800 dark:text-purple-200">
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded">
                        <strong>Verizon:</strong> *72 to enable, *73 to cancel
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded">
                        <strong>AT&T:</strong> *72 to enable, *730 to cancel
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded">
                        <strong>T-Mobile:</strong> *72 to enable, *73 to cancel
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded">
                        <strong>Sprint:</strong> *72 to enable, *73 to cancel
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">📞 Landline Users</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      If you have a landline, the process is similar but may vary by provider:
                    </p>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>Lift the receiver and dial <code className="bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">*72</code></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>Wait for tone, then enter your Pick.UP number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>Hang up after confirmation</span>
                      </li>
                    </ul>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-3 italic">
                      <strong>Tip:</strong> Some landline providers allow you to change the ring count before forwarding kicks in. Try dialing <code className="bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">*47</code> followed by a code (e.g., dial 30 for 5 rings). Check with your provider for exact codes.
                    </p>
                  </div>

                  <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Alternative: Carrier App/Website</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      Most carriers also let you set up call forwarding through their app or website:
                    </p>
                    <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                      <li>• <strong>Verizon:</strong> My Verizon app → Settings → Call Forwarding</li>
                      <li>• <strong>AT&T:</strong> myAT&T app → Manage device → Call forwarding</li>
                      <li>• <strong>T-Mobile:</strong> T-Mobile app → Settings → Call forwarding</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>💡 Tip:</strong> Call forwarding may incur charges from your carrier. Check your plan details. To disable forwarding, dial <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded">*73</code> from your forwarded phone.
                  </p>
                </div>
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
