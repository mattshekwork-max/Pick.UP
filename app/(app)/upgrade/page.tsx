
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { StripeSetupRequired } from "@/components/StripeSetupRequired";
import { PolarSetupRequired } from "@/components/PolarSetupRequired";
import { toast } from "sonner";

const PAYMENT_PROVIDER = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "stripe";

export default function UpgradePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const configUrl =
      PAYMENT_PROVIDER === "polar"
        ? "/api/polar/config-check"
        : "/api/stripe/config-check";
    fetch(configUrl)
      .then((res) => res.json())
      .then((data) => setStripeConfigured(data.configured))
      .catch(() => setStripeConfigured(false));
  }, []);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl =
        PAYMENT_PROVIDER === "polar"
          ? "/api/polar/create-checkout"
          : "/api/stripe/create-checkout-session";
      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout. Please try again.");
        setIsLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  // Customize these features for each product
  const features = [
    "Unlimited access to all features",
    "Priority customer support",
    "Advanced analytics and insights",
    "Team collaboration tools",
    "API access for integrations",
    "Custom branding options",
  ];

  if (stripeConfigured === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!stripeConfigured) {
    return PAYMENT_PROVIDER === "polar" ? (
      <PolarSetupRequired />
    ) : (
      <StripeSetupRequired />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Upgrade to Pro</CardTitle>
          <p className="text-muted-foreground mt-2">
            Unlock all premium features
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#0D9488]/10 text-[#0D9488] px-4 py-2 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            Start with 14 days free
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold">$49.99</div>
            <div className="text-muted-foreground mt-1">per month</div>
            <div className="text-sm text-[#0D9488] mt-2 font-medium">
              First 14 days free
            </div>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>{feature}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <strong>14-day free trial.</strong> No charge today. Cancel anytime during trial.
              Then $49.99/month, cancel anytime.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full h-12 text-lg"
          >
            {isLoading ? "Loading..." : "Upgrade Now"}
          </Button>
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="w-full"
            disabled={isLoading}
          >
            Maybe Later
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


