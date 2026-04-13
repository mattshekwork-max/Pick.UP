import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get business profile
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get recent calls
  const { data: recentCalls } = await supabase
    .from('calls')
    .select('*')
    .eq('business_id', business?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get upcoming appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', business?.id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(5);

  const hasBusinessProfile = !!business;
  const hasPhoneNumber = !!business?.phone_number;
  const hasGreeting = !!business?.greeting_message;

  const setupSteps = [
    { name: "Create business profile", complete: hasBusinessProfile },
    { name: "Add your phone number", complete: hasPhoneNumber },
    { name: "Set AI greeting", complete: hasGreeting },
    { name: "Add call forwarding number (optional)", complete: false },
  ];

  const completedSteps = setupSteps.filter(s => s.complete).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pick.UP" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back{userData?.first_name ? `, ${userData.first_name}` : ''}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your AI receptionist is ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/setup">
                <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary">
                  Configure AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Calls Today</CardTitle>
              <Phone className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{recentCalls?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">AI handled conversations</p>
            </CardContent>
          </Card>
          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Upcoming bookings</p>
            </CardContent>
          </Card>
          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Setup Progress</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedSteps}/4</div>
              <p className="text-xs text-muted-foreground mt-1">Steps completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Checklist */}
        <Card className="bg-card border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Setup Checklist</CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete these steps to activate your AI receptionist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    step.complete 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {step.complete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <span className={step.complete ? 'text-muted-foreground line-through' : 'text-foreground'}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/setup" className="block mt-6">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
