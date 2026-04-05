"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Check, Star, Layers, ArrowRight } from "lucide-react";

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
      icon: Check
    },
    {
      number: "2",
      title: 'Set Your Preferences',
      description: 'Fill in your hours, services, FAQs, and where to route specific calls.',
      icon: Star
    },
    {
      number: "3",
      title: 'Pick.UP Takes Over',
      description: 'Every call is answered, handled, and summarized via SMS so nothing slips through.',
      icon: Layers
    }
  ];

  const features = [
    {
      title: 'Books Appointments Directly',
      description: '',
      icon: Zap
    },
    {
      title: 'SMS Call Summaries',
      description: '',
      icon: Zap
    },
    {
      title: 'Smart Call Transfers',
      description: '',
      icon: Zap
    },
    {
      title: '90+ Languages',
      description: '',
      icon: Zap
    },
    {
      title: 'Sub-Second Response',
      description: '',
      icon: Zap
    },
    {
      title: 'Handles Your FAQs',
      description: '',
      icon: Zap
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-white overflow-hidden">
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
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200"
              variants={fadeInUp}
            >
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">
                Build faster, launch sooner
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 max-w-4xl leading-[1.1]"
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
                <Button size="lg" className="px-8 h-12 text-base font-medium cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-lg">
                  Try Pick.UP Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
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
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">
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
                  <motion.div
                    className="mb-6 flex flex-col items-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <step.icon className="w-16 h-16 text-blue-600 mb-6" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">
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
                className="group p-8 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                variants={scaleIn}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-10 h-10 text-gray-900 mb-5" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
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

            <motion.div className="p-8 rounded-xl border-2 border-blue-600 bg-white relative" variants={scaleIn}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
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
                <Button className="w-full h-11 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
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
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
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
              <Button size="lg" className="px-8 h-12 text-base font-medium cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-lg">
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
