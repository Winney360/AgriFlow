
const Footer = () => (
  <footer className="mt-8 w-full bg-[#27333c] px-4 py-8 text-[#d3dde3]">
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-2xl font-black">
          <img src="/favicon.png" alt="AgriFlow Logo" className="h-12 w-12" />
          <span>
            <span className="text-[#1f9f6a]">Agri</span><span className="text-white">Flow</span>
          </span>
        </div>
        <p className="text-sm text-[#b6c6d1]">Connecting farmers and buyers.</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left">
        <div>
          <h4 className="font-bold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/marketplace" className="hover:underline">Marketplace</a></li>
            <li><a href="/post-listing" className="hover:underline">Post Listing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-2">Support</h4>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => window.open('mailto:agriflow@gmail.com')}
                className="hover:underline text-left w-full bg-transparent border-0 p-0 m-0 cursor-pointer text-inherit"
                type="button"
              >
                Contact Us
              </button>
            </li>
            <li><a href="/faq" className="hover:underline">FAQs</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:underline">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-[#aab7bf]">© 2026 AgriFlow. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;
