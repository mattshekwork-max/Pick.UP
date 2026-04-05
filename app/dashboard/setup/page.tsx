"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Phone, Clock, MessageSquare, Calendar } from "lucide-react";
import { saveBusinessProfile } from "./actions";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BusinessSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    transferPhone: "",
    greetingMessage: "Hello! Thanks for calling. How can I help you today?",
    services: ["", "", ""],
    faqs: [{ question: "", answer: "" }],
    businessHours: DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: "09:00", close: "17:00", closed: false } }), {}),
    googleCalendarId: "",
    timezone: "America/Los_Angeles",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await saveBusinessProfile(formData);
    
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Failed to save profile");
      setLoading(false);
    }
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

  const updateHours = (day: string, field: "open" | "close" | "closed", value: string | boolean) => {
    const currentDay = formData.businessHours[day as keyof typeof formData.businessHours];
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
                <Label htmlFor="phoneNumber">Your Business Phone</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
                <p className="text-sm text-muted-foreground">Calls to this number will be forwarded to Pick.UP</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferPhone">Transfer Number (Optional)</Label>
                <Input
                  id="transferPhone"
                  value={formData.transferPhone}
                  onChange={(e) => setFormData({ ...formData, transferPhone: e.target.value })}
                  placeholder="(555) 987-6543"
                />
                <p className="text-sm text-muted-foreground">Where to transfer urgent calls</p>
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
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`${day}-closed`}
                      checked={formData.businessHours[day as keyof typeof formData.businessHours]?.closed}
                      onCheckedChange={(checked) => updateHours(day, "closed", checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`} className="text-sm">Closed</Label>
                  </div>
                  {!formData.businessHours[day as keyof typeof formData.businessHours]?.closed && (
                    <>
                      <Input
                        type="time"
                        value={formData.businessHours[day as keyof typeof formData.businessHours]?.open}
                        onChange={(e) => updateHours(day, "open", e.target.value)}
                        className="w-24"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={formData.businessHours[day as keyof typeof formData.businessHours]?.close}
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
              <CardDescription>Connect Google Calendar for booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleCalendarId">Google Calendar ID</Label>
                <Input
                  id="googleCalendarId"
                  value={formData.googleCalendarId}
                  onChange={(e) => setFormData({ ...formData, googleCalendarId: e.target.value })}
                  placeholder="your.email@gmail.com"
                />
                <p className="text-sm text-muted-foreground">The AI will book appointments here</p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? "Saving..." : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
