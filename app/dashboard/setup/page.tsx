"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Phone, Clock, MessageSquare, Calendar, Loader2, CheckCircle } from "lucide-react";
import { saveBusinessProfile, getBusinessProfile } from "./actions";
import { provisionVapiPhoneNumber } from "./vapi-actions";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type DaySchedule = { open: string; close: string; closed: boolean };
type BusinessHours = Record<string, DaySchedule>;

export default function BusinessSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaCode, setAreaCode] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [provisionedPhone, setProvisionedPhone] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    transferPhone: "",
    greetingMessage: "Hello! Thanks for calling. How can I help you today?",
    services: ["", "", ""],
    faqs: [{ question: "", answer: "" }],
    businessHours: DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: "09:00", close: "17:00", closed: false } }), {} as BusinessHours),
    googleCalendarId: "",
    timezone: "America/Los_Angeles",
  });

  // Load existing business data on mount
  useEffect(() => {
    async function loadExistingData() {
      const business = await getBusinessProfile();
      if (business) {
        setFormData({
          businessName: business.business_name || "",
          phoneNumber: business.phone_number || "",
          transferPhone: business.transfer_phone_number || "",
          greetingMessage: business.greeting_message || "Hello! Thanks for calling. How can I help you today?",
          services: business.services?.length > 0 ? business.services : ["", "", ""],
          faqs: business.faqs?.length > 0 ? business.faqs : [{ question: "", answer: "" }],
          businessHours: business.business_hours || DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: "09:00", close: "17:00", closed: false } }), {} as BusinessHours),
          googleCalendarId: business.google_calendar_id || "",
          timezone: business.timezone || "America/Los_Angeles",
        });
        
        // If phone number exists, show it as provisioned
        if (business.ringley_phone_number) {
          setProvisionedPhone(business.ringley_phone_number);
        }
      }
    }
    
    loadExistingData();
  }, []);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data: typeof formData) => {
    // Don't auto-save if business name is empty (required field)
    if (!data.businessName.trim()) return;
    
    setAutoSaving(true);
    
    const result = await saveBusinessProfile(data);
    
    if (result.success) {
      setLastSaved(new Date());
    } else {
      setError(result.error || "Auto-save failed");
    }
    
    setAutoSaving(false);
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout to save after 2 seconds of no changes
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(formData);
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, autoSave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cancel pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setLoading(true);
    setError(null);

    const result = await saveBusinessProfile(formData);
    
    if (result.success) {
      setLastSaved(new Date());
      // Auto-redirect to phone provisioning page
      router.push("/dashboard/setup/phone");
    } else {
      setError(result.error || "Failed to save profile");
    }
    
    setLoading(false);
  };

  const updateService = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({ ...formData, services: newServices });
  };

  const addService = () => {
    setFormData({ ...formData, services: [...formData.services, ""] });
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const addFaq = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] });
  };

  const handleProvisionPhone = async () => {
    if (!areaCode || areaCode.length !== 3) {
      setError("Please enter a valid 3-digit area code");
      return;
    }
    
    setProvisioning(true);
    setError(null);
    
    const result = await provisionVapiPhoneNumber(areaCode);
    
    if (result.success) {
      setProvisionedPhone(result.phoneNumber || null);
      setFormData({ ...formData, phoneNumber: result.phoneNumber || "" });
    } else {
      setError(result.error || "Failed to provision phone number");
    }
    
    setProvisioning(false);
  };

  const updateHours = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    const currentDay = formData.businessHours[day];
    if (!currentDay) return;
    
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: { ...currentDay, [field]: value },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Set Up Your AI Receptionist</h1>
          <p className="text-muted-foreground">Configure how Pick.UP answers calls for your business</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>Basic details about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Acme Plumbing"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferPhone">Your Phone Number (for transfers & SMS summaries)</Label>
                <Input
                  id="transferPhone"
                  value={formData.transferPhone}
                  onChange={(e) => setFormData({ ...formData, transferPhone: e.target.value })}
                  placeholder="(555) 987-6543"
                />
                <p className="text-sm text-muted-foreground">
                  Calls can be transferred to this number. You'll also receive SMS summaries of each call here.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Greeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Greeting
              </CardTitle>
              <CardDescription>How your AI answers the phone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="greetingMessage">Greeting Message</Label>
                <Textarea
                  id="greetingMessage"
                  value={formData.greetingMessage}
                  onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
                  placeholder="Hello! Thanks for calling..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services You Offer</CardTitle>
              <CardDescription>What appointments can the AI book?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder={`Service ${index + 1} (e.g., Emergency Repair)`}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addService}>
                Add Service
              </Button>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>Questions the AI should know how to answer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="Question (e.g., What are your hours?)"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="Answer (e.g., We're open Monday-Friday 9am-5pm)"
                    rows={2}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addFaq}>
                Add FAQ
              </Button>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-28 font-medium">{day}</div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${day}-closed`}
                      checked={formData.businessHours[day]?.closed}
                      onCheckedChange={(checked) => updateHours(day, "closed", checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`} className="text-sm cursor-pointer">Closed</Label>
                  </div>
                  {formData.businessHours[day]?.closed ? (
                    <span className="text-gray-500 italic flex-1">Closed all day</span>
                  ) : (
                    <>
                      <Input
                        type="time"
                        value={formData.businessHours[day]?.open}
                        onChange={(e) => updateHours(day, "open", e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={formData.businessHours[day]?.close}
                        onChange={(e) => updateHours(day, "close", e.target.value)}
                        className="w-24"
                      />
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar Integration
              </CardTitle>
              <CardDescription>Connect Google Calendar to check availability and book appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  ⚠️ Google Verification Pending
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                  Pick.UP is currently undergoing Google OAuth verification. Until complete, you may see a warning screen when connecting your calendar.
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>What to do:</strong> Click "Continue" or "Advanced" → "Go to Pick.UP (unsafe)" to proceed. Your data is secure - this is just a Google warning for unverified apps.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 italic">
                  We're completing verification soon! 🚀
                </p>
              </div>

              {formData.googleCalendarId ? (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Google Calendar Connected</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Calendar: {formData.googleCalendarId}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setFormData({ ...formData, googleCalendarId: "" })}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Connect your Google Calendar so the AI can check your availability and automatically book appointments.
                  </p>
                  <a
                    href="/api/auth/google"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Connect Google Calendar
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? "Saving..." : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Business Profile
              </>
            )}
          </Button>
          
          {lastSaved && (
            <Link href="/dashboard/setup/phone" className="block mt-3">
              <Button type="button" variant="outline" className="w-full h-12 text-lg border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/10">
                <Phone className="w-5 h-5 mr-2" />
                Continue to Get Phone Number
              </Button>
            </Link>
          )}
        </form>
      </div>
    </div>
  );
}
