import React from "react";

const faqs = [
  {
    question: "What is AgriFlow?",
    answer:
      "AgriFlow is a platform that connects farmers and buyers, making it easy to buy and sell agricultural products online."
  },
  {
    question: "How do I post a listing?",
    answer:
      "To post a listing, sign up or log in as a seller, then click on 'Post Listing' in the navigation menu and fill in your product details."
  },
  {
    question: "How do I contact a seller or buyer?",
    answer:
      "You can contact a seller or buyer directly via the phone number or WhatsApp link provided on each product or emergency request card."
  },
  {
    question: "What is an emergency request?",
    answer:
      "Emergency requests allow buyers to post urgent needs for agricultural products, which are highlighted in the marketplace for quick response."
  },
  {
    question: "Is there a fee to use AgriFlow?",
    answer:
      "Currently, AgriFlow is free to use for both buyers and sellers."
  },
  {
    question: "How do I reset my password?",
    answer:
      "Go to the login page and click on 'Forgot Password' to receive a password reset link via email."
  },
  {
    question: "How do I switch between buyer and seller roles?",
    answer:
      "You can switch roles from your profile page using the 'Switch to Seller/Buyer' button."
  },
  {
    question: "How do I report a problem or get support?",
    answer:
      "Click 'Contact Us' in the footer to email us at agriflow@gmail.com."
  }
];

const FAQPage = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-4xl font-black mb-6 text-[#1f9f6a]">Frequently Asked Questions</h1>
    <div className="space-y-6">
      {faqs.map((faq, idx) => (
        <div key={idx} className="rounded-lg border border-[#cde5da] bg-[#f8fbfa] p-4">
          <h2 className="text-xl font-bold text-[#16382c] mb-2">{faq.question}</h2>
          <p className="text-[#23483a] text-base">{faq.answer}</p>
        </div>
      ))}
    </div>
  </div>
);

export default FAQPage;
