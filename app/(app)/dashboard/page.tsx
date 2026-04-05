import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, MessageSquare, Settings, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

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
    { name: "Connect Vapi (optional)", complete: false },
  ];

  const completedSteps = setupSteps.filter(s => s.complete).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{userData?.first_name ? `, ${userData.first_name}` : ''}!
              </h1>
              <p className="text-gray-600">
                {business?.business_name || 'Your AI receptionist is ready'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/dashboard/setup">
                <Button size="sm">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentCalls?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                AI handled conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Setup Progress</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSteps}/{setupSteps.length}</div>
              <p className="text-xs text-muted-foreground">
                Steps completed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup Checklist</CardTitle>
                <CardDescription>
                  Complete these steps to activate your AI receptionist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {step.complete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={step.complete ? "text-gray-900" : "text-gray-500"}>
                        {step.name}
                      </span>
                      {step.complete && (
                        <Badge variant="secondary" className="ml-auto">Complete</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {completedSteps < setupSteps.length && (
                  <Link href="/dashboard/setup">
                    <Button className="w-full mt-6">
                      Continue Setup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>
                  Latest conversations handled by your AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentCalls && recentCalls.length > 0 ? (
                  <div className="space-y-4">
                    {recentCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{call.caller_name || 'Unknown Caller'}</p>
                            <p className="text-sm text-gray-500">{call.caller_phone_number}</p>
                          </div>
                        </div>
                        <Badge variant={call.call_status === 'completed' ? 'default' : 'secondary'}>
                          {call.call_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No calls yet</p>
                    <p className="text-sm">Your AI is ready to answer!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Status */}
            <Card>
              <CardHeader>
                <CardTitle>Business Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Name</p>
                  <p className="text-lg">{business?.business_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-lg">{business?.phone_number || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">AI Status</p>
                  <Badge variant={hasBusinessProfile ? 'default' : 'secondary'}>
                    {hasBusinessProfile ? 'Active' : 'Setup Required'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/setup">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure AI
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Update Phone
                  </Button>
                </Link>
                <Link href="/upgrade">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appt) => (
                      <div key={appt.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{appt.customer_name}</p>
                        <p className="text-sm text-gray-500">{appt.service}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(appt.starts_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
