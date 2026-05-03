"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, MessageSquare, ArrowRight, Check, Clock, Globe, HelpCircle } from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export function LandingPageClient() {
  const steps = [
    {
      number: "1",
      title: 'Connect Your Number',
      description: 'Forward your existing line or get a new one instantly.',
    },
    {
      number: "2",
      title: 'Train It Once',
      description: 'Add your hours, services, and FAQs. Pick.UP learns in minutes.',
    },
    {
      number: "3",
      title: 'It Answers Everything',
      description: 'Calls answered 24/7. Recaps hit your inbox after every conversation.',
    }
  ];

  const features = [
    {
      title: 'Books Appointments Directly',
      description: 'AI checks your calendar and books meetings instantly',
      icon: Calendar
    },
    {
      title: 'Email + SMS Summaries',
      description: 'Get a clean recap after every call — by email now, SMS included',
      icon: MessageSquare
    },
    {
      title: 'Smart Call Transfers',
      description: 'Urgent calls routed to you, instantly',
      icon: Phone
    },
    {
      title: '90+ Languages',
      description: 'Speaks your customers\' language fluently',
      icon: Globe
    },
    {
      title: 'Sub-Second Response',
      description: 'Answers in under a second, every time',
      icon: Clock
    },
    {
      title: 'Handles Your FAQs',
      description: 'Trained on your business, 24/7',
      icon: HelpCircle
    }
  ];

  const pricingFeatures = [
    "AI Call Answering",
    "Appointment Capture",
    "Email & SMS Recaps",
    "Smart Call Transfers",
    "90+ Languages",
  ];

  return (
    <main className="flex flex-col min-h-screen bg-[#faf9f7] overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Pick.UP" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-xl text-gray-900">Pick.UP</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#how-it-works" className="hover:text-gray-900">How It Works</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-4 pt-6 pb-16 md:pt-12 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col items-center text-center space-y-4 md:space-y-6"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#f0fdfa] border border-[#0D9488]/20"
              variants={fadeInUp}
            >
              <span className="w-2 h-2 rounded-full bg-[#F97316] mr-2 animate-pulse" />
              <span className="text-sm font-medium text-[#0D9488]">
                AI Receptionist for Small Business
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-gray-900 max-w-4xl leading-[1.1]"
              variants={fadeInUp}
            >
              Never Miss a Revenue Call Again
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
              variants={fadeInUp}
            >
              Pick.UP answers every business call, books appointments into your calendar, and sends you a clean recap — so you can focus on the work that pays.
            </motion.p>

            <motion.div
              className="flex flex-col items-center gap-4 pt-4"
              variants={fadeInUp}
            >
              <Link href="/signup">
                <Button size="lg" className="px-8 h-12 text-base font-medium cursor-pointer bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Try Pick.UP Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500">14-day free trial. No credit card required.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full px-4 py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-[#0D9488] uppercase tracking-wide mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Live in Three Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect your number, tell Pick.UP about your business, and let it handle the rest.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 lg:gap-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col h-full items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                    <span className="font-heading font-bold text-xl text-[#0D9488]">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-[#0D9488] uppercase tracking-wide mb-3">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Pick.UP Does on Every Call
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real conversations, Real results. Not a phone tree.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-8 rounded-xl border border-gray-200 bg-white hover:border-[#0D9488]/30 hover:shadow-lg transition-all cursor-pointer"
                variants={scaleIn}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-[#0D9488]" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="w-full px-4 py-24 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-[#0D9488] uppercase tracking-wide mb-6">Trusted by service businesses</p>
            <blockquote className="text-2xl md:text-3xl font-heading font-medium text-gray-900 leading-relaxed mb-8 max-w-3xl mx-auto">
              &ldquo;I used to miss 4-5 calls a day between jobs. Pick.UP books them straight into my calendar while I&rsquo;m on a roof. Pays for itself in the first week.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">T</div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Tee Galindo</p>
                <p className="text-sm text-gray-600">Alfredo&rsquo;s Roofing, San Diego</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-[#0D9488] uppercase tracking-wide mb-3">
              Pricing
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free for 14 days. Upgrade when you&apos;re ready.
            </p>
          </motion.div>

          <motion.div
            className="max-w-xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="p-8 rounded-xl border-2 border-[#0D9488] bg-white relative" variants={scaleIn}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0D9488] text-white text-xs font-medium rounded-full">
                Pick.UP Pro
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">Simple Monthly Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$49</div>
                <p className="text-gray-500 text-sm">per month after your 14-day free trial</p>
              </div>
              <ul className="space-y-3 mb-8">
                {pricingFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full h-11 cursor-pointer bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl">
                  Start Free Trial
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-4">Cancel anytime. No setup fees.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 py-24 bg-white">
        <motion.div
          className="container mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Stop Missing Calls That Pay Your Bills
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            14 days free. 5 minutes to set up. No credit card, no contract.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/signup">
              <Button size="lg" className="px-8 h-12 text-base font-medium cursor-pointer bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                Try Pick.UP Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full px-4 py-8 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Pick.UP. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#0D9488] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#0D9488] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}