import { Link } from 'react-router-dom';
import { MessageCircle, CheckCircle2, MapPin } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f0f5f2] flex items-center justify-center px-4 py-6">
      {/* Breadcrumb */}
      <div className="absolute top-0 left-0 right-0 border-b border-[#d8ddda] bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-[#20a46b] hover:underline">
            Home
          </Link>
          <span className="text-[#999]">{`>`}</span>
          <span className="font-semibold text-[#333]">Error</span>
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl border border-[#d8ddda] bg-white shadow-md p-8 space-y-6 mt-12">
        {/* 404 Illustration & Number */}
        <div className="flex flex-col items-center space-y-4">
          {/* Illustration */}
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Carrot/Leafy vegetables illustration */}
              <g>
                {/* Leaf */}
                <path
                  d="M 50 20 Q 55 30 50 45 Q 45 30 50 20"
                  fill="#20a46b"
                  opacity="0.8"
                />
                {/* Vegetable crossed out */}
                <circle cx="50" cy="55" r="12" fill="#e8e8e8" />
                <line x1="40" y1="45" x2="60" y2="65" stroke="#999" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* 404 Number */}
          <p className="text-9xl font-black text-[#1f1f1f] leading-none">404</p>

          {/* Heading */}
          <h1 className="text-3xl font-black text-center text-[#1f1f1f]">Whoops! We Couldn't Find That Harvest.</h1>

          {/* Description */}
          <p className="text-center text-[#666] text-sm leading-relaxed">
            It seems the link you followed is lost or the crop listing has been removed. No need to worry.
          </p>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg border border-[#d0e0d6] bg-[#f0f9f5] px-4 py-3">
          <p className="text-sm font-semibold text-[#333]">Verify links from external sources for security.</p>
        </div>

        {/* WhatsApp Verification Button */}
        <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#20a46b] bg-white py-3 font-semibold text-[#20a46b] hover:bg-[#f0f9f5] transition">
          <MessageCircle size={18} />
          Confirm URL with WhatsApp
        </button>

        {/* JWT Verified Badge */}
        <div className="flex items-center gap-2 justify-center text-sm text-[#20a46b]">
          <CheckCircle2 size={16} />
          <span className="font-semibold">JWT verified.</span>
        </div>

        {/* Back to Dashboard Button */}
        <Link to="/dashboard">
          <button className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657] transition">
            Back to Safe Fields (Dashboard)
          </button>
        </Link>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#e0e5e1]">
          <Link to="/marketplace" className="text-sm font-semibold text-[#333] hover:text-[#20a46b]">
            Go to Crop Feed
          </Link>
          <span className="text-[#999]">•</span>
          <a href="mailto:support@cropconnect.com" className="text-sm font-semibold text-[#333] hover:text-[#20a46b]">
            Contact Support
          </a>
          <span className="text-[#999]">•</span>
          <Link to="/dashboard" className="text-sm font-semibold text-[#333] hover:text-[#20a46b]">
            View Active Listings
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#d8ddda] bg-white">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-6 max-w-6xl mx-auto">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-sm font-black text-[#20a46b]">CropConnect</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#333] mb-2">About Us</p>
            <p className="text-xs text-[#666]">Contact</p>
            <p className="text-xs text-[#666]">Support</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#333] mb-2">Links</p>
            <p className="text-xs text-[#666]">Contact</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#333] mb-2">Social</p>
            <div className="flex gap-2">
              <p className="text-xs text-[#666]">F</p>
              <p className="text-xs text-[#666]">T</p>
              <p className="text-xs text-[#666]">I</p>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-[#999] py-3 border-t border-[#e0e5e1]">
          <p>CopyrightCropConnect.com</p>
        </div>
      </div>
    </div>
  );
};
