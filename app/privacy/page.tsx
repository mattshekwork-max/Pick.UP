export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>Pick.UP collects information you provide directly, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name and email address (via Google OAuth or manual signup)</li>
              <li>Business information (business name, phone number, hours)</li>
              <li>Call data (call duration, recordings, transcripts)</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide AI phone answering services</li>
              <li>Send call summaries and notifications</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our AI assistant performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Encrypted data transmission (TLS/SSL)</li>
              <li>Secure database storage with Row-Level Security</li>
              <li>Regular security audits</li>
              <li>Limited access to sensitive data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <p>Call recordings and transcripts are retained for 30 days unless you request deletion. Account information is retained until account deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>You can request access, correction, or deletion of your data by contacting support@pickuphone.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact</h2>
            <p>For privacy concerns, contact us at support@pickuphone.com.</p>
          </section>

          <p className="text-gray-500 pt-4 border-t border-gray-800">Last updated: April 2026</p>
        </div>
      </div>
    </div>
  );
}
