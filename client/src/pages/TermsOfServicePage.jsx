import React from "react";

const TermsOfServicePage = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-4xl font-black mb-6 text-[#1f9f6a]">Terms of Service</h1>
    <p className="mb-4 text-[#23483a]">Last updated: March 13, 2026</p>
    <div className="space-y-4 text-[#23483a] text-base">
      <p>
        Welcome to <strong>AgriFlow</strong>. By using our platform, you agree to these Terms of Service. Please read them carefully.
      </p>
      <h2 className="text-xl font-bold mt-6">1. Use of the Platform</h2>
      <ul className="list-disc ml-6">
        <li>You must be at least 16 years old to use AgriFlow.</li>
        <li>Provide accurate and complete information when registering or posting listings.</li>
        <li>Do not use the platform for illegal, fraudulent, or harmful activities.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">2. Listings and Transactions</h2>
      <ul className="list-disc ml-6">
        <li>All listings must be for genuine agricultural products or services.</li>
        <li>AgriFlow is not responsible for the quality, safety, or legality of products listed.</li>
        <li>Transactions and communications are solely between buyers and sellers.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">3. User Conduct</h2>
      <ul className="list-disc ml-6">
        <li>Do not post false, misleading, or inappropriate content.</li>
        <li>Respect other users and do not harass, threaten, or abuse anyone.</li>
        <li>Do not attempt to access accounts or data that do not belong to you.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">4. Account Security</h2>
      <ul className="list-disc ml-6">
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>Notify us immediately if you suspect unauthorized use of your account.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">5. Limitation of Liability</h2>
      <ul className="list-disc ml-6">
        <li>AgriFlow is provided "as is" without warranties of any kind.</li>
        <li>We are not liable for any damages resulting from your use of the platform.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">6. Changes to Terms</h2>
      <p>We may update these Terms of Service at any time. Continued use of AgriFlow means you accept the updated terms.</p>
      <h2 className="text-xl font-bold mt-6">7. Contact</h2>
      <p>For questions about these Terms, contact us at <a href="mailto:agriflow@gmail.com" className="text-[#1f9f6a] underline">agriflow@gmail.com</a>.</p>
    </div>
  </div>
);

export default TermsOfServicePage;
