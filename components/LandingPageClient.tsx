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
      description: 'Forward your business line to Pick.UP or get a new number instantly.',
    },
    {
      number: "2",
      title: 'Set Your Preferences',
      description: 'Fill in your hours, services, FAQs, and where to route specific calls.',
    },
    {
      number: "3",
      title: 'Pick.UP Takes Over',
      description: 'Every call is answered, handled, and summarized via SMS so nothing slips through.',
    }
  ];

  const features = [
    {
      title: 'Books Appointments Directly',
      description: 'AI checks your calendar and books meetings instantly',
      icon: Calendar
    },
    {
      title: 'SMS Call Summaries',
      description: 'Get a text after every call with key details',
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

  return (
    <main className="flex flex-col min-h-screen bg-[#faf9f7] overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-gray-900">Pick.UP</span>
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
              Your Phone Answered, Every Time
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
              variants={fadeInUp}
            >
              Pick.UP is an AI receptionist that picks up your business calls, books appointments, answers common questions, and sends you a summary. Set it up in minutes, not days.
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
              <p className="text-sm text-gray-500">No credit card required</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full px-4 py-24 bg-gray-50">
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
      <section className="w-full px-4 py-24">
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
              Real conversations, real results. Not a phone tree.
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

      {/* Pricing Section */}
      <section id="pricing" className="w-full px-4 py-24 bg-gray-50">
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
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="p-8 rounded-xl border border-gray-200 bg-white" variants={scaleIn}>
              <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <p className="text-gray-500 mb-6">Forever free</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Core features
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Community support
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full h-11 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            <motion.div className="p-8 rounded-xl border-2 border-[#0D9488] bg-white relative" variants={scaleIn}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0D9488] text-white text-xs font-medium rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$79</div>
              <p className="text-gray-500 mb-6">per month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Everything in Free
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Unlimited access
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Priority support
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Advanced features
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full h-11 cursor-pointer bg-[#0D9488] hover:bg-[#0d857c] text-white rounded-xl">
                  Upgrade to Pro
                </Button>
              </Link>
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
            className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Free to start. Takes about five minutes to set up. No hardware, no contracts.
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
    </main>
  );
}
