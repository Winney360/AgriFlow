import React from "react";

const PrivacyPolicyPage = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-4xl font-black mb-6 text-[#1f9f6a]">Privacy Policy</h1>
    <p className="mb-4 text-[#23483a]">Last updated: March 13, 2026</p>
    <div className="space-y-4 text-[#23483a] text-base">
      <p>
        <strong>AgriFlow</strong> is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform to connect farmers and buyers.
      </p>
      <h2 className="text-xl font-bold mt-6">Information We Collect</h2>
      <ul className="list-disc ml-6">
        <li>Personal information such as name, email, phone number, and location when you register or post a listing.</li>
        <li>Product and listing details you provide.</li>
        <li>Usage data such as device information, browser type, and access times.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">How We Use Your Information</h2>
      <ul className="list-disc ml-6">
        <li>To provide and improve our services.</li>
        <li>To connect buyers and sellers and facilitate communication.</li>
        <li>To send notifications and updates related to your account or listings.</li>
        <li>To respond to your inquiries and provide support.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">Information Sharing</h2>
      <ul className="list-disc ml-6">
        <li>We do not sell your personal information to third parties.</li>
        <li>Contact details are shared only as needed to facilitate transactions between buyers and sellers.</li>
        <li>We may share information to comply with legal obligations or protect our rights.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">Data Security</h2>
      <p>We use reasonable measures to protect your information, but no system is 100% secure. Please keep your login credentials safe.</p>
      <h2 className="text-xl font-bold mt-6">Your Choices</h2>
      <ul className="list-disc ml-6">
        <li>You can update your profile information at any time.</li>
        <li>You may request deletion of your account by contacting us at <a href="mailto:agriflow@gmail.com" className="text-[#1f9f6a] underline">agriflow@gmail.com</a>.</li>
      </ul>
      <h2 className="text-xl font-bold mt-6">Children's Privacy</h2>
      <p>AgriFlow is not intended for children under 16. We do not knowingly collect information from children under 16.</p>
      <h2 className="text-xl font-bold mt-6">Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
      <h2 className="text-xl font-bold mt-6">Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, contact us at <a href="mailto:agriflow@gmail.com" className="text-[#1f9f6a] underline">agriflow@gmail.com</a>.</p>
    </div>
  </div>
);

export default PrivacyPolicyPage;
