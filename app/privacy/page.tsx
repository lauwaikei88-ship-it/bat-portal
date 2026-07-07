export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: July 4, 2026</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>Welcome to Post 2 Post. This Privacy Policy explains how we collect, use, and share information about you when you use our website and services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, connect social media profiles, and schedule posts. This includes your name, email, and OAuth tokens provided by third-party platforms like Meta (Facebook and Instagram).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services. Specifically, we use your social media tokens to publish content on your behalf at the times you schedule.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Sharing of Information</h2>
          <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., transmitting data to Meta APIs to publish your posts) or as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
          <p>We retain your information for as long as your account is active or as needed to provide you services. You can disconnect your social accounts at any time, which will remove our access to those platforms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@post2post.com.</p>
        </section>
      </div>
    </div>
  );
}
