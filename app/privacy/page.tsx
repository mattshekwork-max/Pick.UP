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
            <h2 className="text-xl font-semibold text-white mb-3">4. Google Calendar Data</h2>
            <p>
              If you choose to connect your Google Calendar to Pick.UP, we access your calendar only to support
              appointment scheduling and availability checks that you request as part of the service. This may
              include reading calendar availability and creating, updating, or deleting calendar events on your behalf.
            </p>
            <p className="mt-2">
              Pick.UP uses Google Calendar data solely to provide core product functionality, including booking
              appointments, avoiding scheduling conflicts, and sending related call summaries or confirmations. We do
              not use Google Calendar data for advertising, and we do not sell Google Calendar data to third parties.
            </p>
            <p className="mt-2">
              You may revoke Pick.UP&apos;s access to your Google account at any time through your Google account
              permissions settings. You may also request deletion of associated data by contacting
              support@pickuphone.com.
            </p>
            <p className="mt-2">
              Pick.UP&apos;s use of information received from Google APIs adheres to the Google API Services User Data
              Policy, including the Limited Use requirements, where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Call recordings and transcripts are retained for 30 days unless you request deletion. Account
              information is retained until account deletion. Google Calendar-related data is retained only as long as
              necessary to provide the service or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You can request access, correction, or deletion of your data by contacting support@pickuphone.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For privacy concerns, contact us at support@pickuphone.com.</p>
          </section>

          <p className="text-gray-500 pt-4 border-t border-gray-800">Last updated: May 2026</p>
        </div>
      </div>
    </div>
  );
}
