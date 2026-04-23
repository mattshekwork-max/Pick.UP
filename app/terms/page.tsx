export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Pick.UP ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>Pick.UP provides an AI-powered phone answering service for businesses. The Service includes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>AI phone answering and call handling</li>
              <li>Call recording and transcription</li>
              <li>Call summary delivery via email and SMS</li>
              <li>Business profile management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
            <p>To use the Service, you must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Payment and Billing</h2>
            <p>The Service operates on a subscription basis. You agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pay all fees associated with your chosen plan</li>
              <li>Provide valid payment information</li>
              <li>Accept automatic renewal unless cancelled</li>
              <li>Understand that fees are non-refundable except as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Service for illegal purposes</li>
              <li>Harass, abuse, or harm others through the Service</li>
              <li>Interfere with the Service's operation</li>
              <li>Attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>Pick.UP is provided "as is" without warranties. We are not liable for missed calls, service interruptions, or AI response errors. You assume full responsibility for your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
            <p>We may terminate or suspend your account immediately for any violation of these terms. You may cancel your subscription at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>For questions about these terms, contact support@pickuphone.com.</p>
          </section>

          <p className="text-gray-500 pt-4 border-t border-gray-800">Last updated: April 2026</p>
        </div>
      </div>
    </div>
  );
}
