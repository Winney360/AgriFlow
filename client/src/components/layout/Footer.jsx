const Footer = () => (
  <footer className="mt-8 grid grid-cols-1 gap-5 rounded-t-md bg-[#27333c] px-4 py-6 text-[#d3dde3] sm:grid-cols-2 md:grid-cols-5">
    <div className="col-span-2 md:col-span-1">
      <div className="text-xl font-black">
        <span className="text-[#1f9f6a]">Agri</span>
        <span className="text-white">Flow</span>
      </div>
    </div>
    <div>
      <h4 className="font-bold text-white">About Us</h4>
      <p className="mt-1 text-sm">Contact</p>
      <p className="text-sm">Support</p>
    </div>
    <div>
      <h4 className="font-bold text-white">Links</h4>
      <p className="mt-1 text-sm">Contact</p>
    </div>
    <div>
      <h4 className="font-bold text-white">Social</h4>
      <p className="mt-1 text-sm">Facebook</p>
      <p className="text-sm">Twitter</p>
    </div>
    <div className="self-end text-sm text-[#aab7bf]">Copyright AgriFlow.com</div>
  </footer>
);

export default Footer;
