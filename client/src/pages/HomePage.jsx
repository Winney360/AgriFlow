import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CircleHelp,
  ListChecks,
  MapPin,
  Search,
  SquareTerminal,
  Star,
  User,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  BadgeCheck,
} from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ListingsMap } from '../components/map/ListingsMap';

const successStories = [
  {
    id: 1,
    title: 'Farmer Grace and Buyer Daniel',
    text: 'AgriFlow helped us agree on pricing quickly, verify the pickup location, and complete payment with confidence.',
  },
  {
    id: 2,
    title: 'Farmer Ruth and Buyer James',
    text: 'I listed my produce in the morning and received serious buyer inquiries the same day from nearby towns.',
  },
  {
    id: 3,
    title: 'Farmer Peter and a School Kitchen',
    text: 'The platform made it easy to supply fresh maize to a local school kitchen through a trusted local pickup arrangement.',
  },
];

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productApi.listActive();
        setProducts(response.data.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadProducts().catch(() => {
      setProducts([]);
      setLoading(false);
    });
  }, []);

  const listingData = useMemo(() => {
    return products.slice(0, 10);
  }, [products]);

  return (
    <div className="bg-[#f7f8f7] text-[#1f1f1f]">
      <section className="min-h-screen border-b border-[#dce3df] bg-[#f7f8f7]">
        <div className="mx-auto w-full max-w-315 px-4 md:px-6">
          <header className="flex flex-wrap items-center gap-3 border-b border-[#e1e5e2] py-3">
            <div className="text-2xl font-black">
              <span className="text-[#1f9f6a]">Agri</span>
              <span className="text-[#1f1f1f]">Flow</span>
            </div>
            <div className="min-w-55 flex-1 md:max-w-md md:pl-8">
              <div className="flex h-10 items-center rounded-md border border-[#d8ddda] bg-white px-3 text-[#79817e]">
                <Search size={15} />
                <span className="ml-2 text-sm">Search produce...</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[#5f6865]">
              <SquareTerminal size={16} />
              <Bell size={16} />
              <CircleHelp size={16} />
              <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4e4d9]">
                  <User size={14} />
                </div>
                <ChevronDown size={14} />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[#d8ddda] lg:grid-cols-2">
            <div className="bg-[#e4ece5] p-6 md:p-12">
              <h1 className="max-w-xl text-4xl font-black leading-[1.08] text-[#131313] md:text-6xl">
                Connect Directly. Trade Locally.
              </h1>
              <p className="mt-4 max-w-xl text-[17px] text-[#3c4440]">
                Connect directly with trusted local farmers and buyers through a simple agricultural marketplace built for nearby trade.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/create-listing"
                  className="rounded-md bg-[#2ca06e] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  List Your Harvest
                </Link>
                <Link
                  to="/marketplace"
                  className="rounded-md border border-[#9db3a7] bg-[#ecf4ee] px-5 py-2.5 text-sm font-semibold text-[#335c4f]"
                >
                  Find Near You
                </Link>
              </div>
            </div>
            <div className="relative bg-white p-3">
              <ListingsMap products={listingData} />
            </div>
          </div>

          <section className="mt-6 rounded-md border border-[#d8ddda] bg-[#f2f5f3] p-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#3d5c50]">New to AgriFlow?</p>
            <h2 className="mt-2 text-3xl font-black text-[#151515]">Get started in under 2 minutes</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4f5854]">
              Create an account to post your harvest, switch between buyer and seller roles, and connect with local farmers instantly.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="rounded-md bg-[#2ca06e] px-5 py-2.5 text-sm font-semibold text-white">
                Sign Up and Get Started
              </Link>
              <Link to="/login" className="rounded-md border border-[#9db3a7] bg-white px-5 py-2.5 text-sm font-semibold text-[#335c4f]">
                Login
              </Link>
            </div>
          </section>

          <section className="mt-6 rounded-md border border-[#d8ddda] bg-[#f2f5f3] p-4 md:p-6">
            <h2 className="mb-4 text-3xl font-black">BROWSE LISTINGS</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
              <aside className="space-y-4 rounded-md border border-[#d8ddda] bg-white p-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4d5652]">Crop Types</label>
                  <div className="rounded-md border border-[#d7ddda] px-3 py-2 text-sm">Grains</div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4d5652]">Vendor</label>
                  <div className="rounded-md border border-[#d7ddda] px-3 py-2 text-sm">Vendor</div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4d5652]">Price Range</label>
                  <div className="flex items-center justify-between rounded-md border border-[#d7ddda] px-3 py-2 text-sm">
                    <span>Ksh 7,000</span>
                    <span>Ksh 50,000</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4d5652]">Location</label>
                  <div className="space-y-2 text-sm">
                    <div className="rounded-md border border-[#d7ddda] px-3 py-2">GPS/Map</div>
                    <div className="rounded-md border border-[#d7ddda] px-3 py-2">Map Hits</div>
                  </div>
                </div>
              </aside>

              {loading ? (
                <div className="rounded-md border border-[#d8ddda] bg-white p-8 text-center text-sm font-semibold text-[#4d5652]">
                  Loading listings...
                </div>
              ) : null}

              {!loading && listingData.length === 0 ? (
                <div className="rounded-md border border-[#d8ddda] bg-white p-8 text-center text-sm font-semibold text-[#4d5652]">
                  No active listings yet. Check back soon or post your first listing.
                </div>
              ) : null}

              {!loading && listingData.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {listingData.map((item) => (
                  <article key={item._id} className="overflow-hidden rounded-md border border-[#d8ddda] bg-white">
                    <img src={item.imageUrl} alt={item.title} className="h-24 w-full object-cover" />
                    <div className="space-y-1 p-2">
                      <h3 className="line-clamp-1 text-[13px] font-bold leading-tight">{item.title}</h3>
                      <p className="text-xs font-semibold text-[#1f1f1f]">{formatCurrency(item.price)}</p>
                      <p className="line-clamp-1 flex items-center gap-1 text-[11px] text-[#68706d]">
                        <MapPin size={10} />
                        {item.location?.locationName || 'Location'}
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-[#20a46b] px-2 py-1 text-[10px] font-semibold text-white"
                      >
                        WhatsApp CTA <MessageCircle size={10} />
                      </button>
                    </div>
                  </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className="min-h-screen bg-[#f3f6f4]">
        <div className="mx-auto w-full max-w-315 px-4 md:px-6">
          <header className="flex flex-wrap items-center gap-3 border-b border-[#e1e5e2] py-3">
            <div className="text-2xl font-black">
              <span className="text-[#1f9f6a]">Agri</span>
              <span className="text-[#1f1f1f]">Flow</span>
            </div>
            <div className="min-w-55 flex-1 md:max-w-md md:pl-8">
              <div className="flex h-10 items-center rounded-md border border-[#d8ddda] bg-white px-3 text-[#79817e]">
                <Search size={15} />
                <span className="ml-2 text-sm">Search produce...</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[#5f6865]">
              <ListChecks size={16} />
              <Bell size={16} />
              <CircleHelp size={16} />
              <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4e4d9]">
                  <User size={14} />
                </div>
                <ChevronDown size={14} />
              </div>
            </div>
          </header>

          <section className="py-10 md:py-14">
            <h2 className="text-center text-5xl font-black text-[#161616]">How It Works</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="rounded-md bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f3ec] text-[#2ca06e]">
                  <BadgeCheck size={34} />
                </div>
                <h3 className="text-2xl font-black">Step 1: List or Find</h3>
                <p className="mt-2 text-sm text-[#4f5854]">
                  List your harvest or browse nearby produce from trusted farmers in your area.
                </p>
              </article>

              <article className="rounded-md bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f3ec] text-[#2ca06e]">
                  <MessageCircle size={34} />
                </div>
                <h3 className="text-2xl font-black">Step 2: Connect via WhatsApp</h3>
                <p className="mt-2 text-sm text-[#4f5854]">
                  Contact sellers directly through WhatsApp to confirm price, quantity, and pickup details.
                </p>
              </article>

              <article className="rounded-md bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f3ec] text-[#2ca06e]">
                  <ArrowRight size={34} />
                </div>
                <h3 className="text-2xl font-black">Step 3: Local Pickup</h3>
                <p className="mt-2 text-sm text-[#4f5854]">
                  Complete the trade through local pickup and build trust with verified location details.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-md border border-[#d8ddda] bg-[#eef3f0] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-4xl font-black text-[#161616]">Featured Success Stories</h2>
              <div className="hidden gap-2 md:flex">
                <button type="button" className="rounded border border-[#ccd4cf] bg-white px-2 py-1">{'<'}</button>
                <button type="button" className="rounded border border-[#ccd4cf] bg-white px-2 py-1">{'>'}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {successStories.map((story) => (
                <article key={story.id} className="rounded-md border border-[#d8ddda] bg-white p-3">
                  <div className="mb-3 flex gap-2">
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                  </div>
                  <h3 className="text-xl font-black">{story.title}</h3>
                  <p className="mt-2 text-sm text-[#535b57]">{story.text}</p>
                  <div className="mt-2 flex items-center gap-1 text-[#6f7855]">
                    <Star size={13} fill="currentColor" />
                    <span className="text-sm">4.0</span>
                    <span className="text-sm">5</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-md border border-[#d8ddda] bg-[#eef3f0] p-5 md:p-6">
            <h2 className="text-4xl font-black text-[#161616]">Trust & Verification Panel</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="rounded-md border border-[#d8ddda] bg-[#f6fbf8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#2ca06e]">
                  <ShieldCheck size={18} />
                  <h3 className="text-2xl font-black text-[#111]">JWT authentication</h3>
                </div>
                <p className="text-sm text-[#4f5854]">
                  JWT authentication helps secure sign-in and supports trusted buyer and seller communication.
                </p>
              </article>

              <article className="rounded-md border border-[#d8ddda] bg-[#f6fbf8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#2ca06e]">
                  <MapPin size={18} />
                  <h3 className="text-2xl font-black text-[#111]">GPS verification</h3>
                </div>
                <p className="text-sm text-[#4f5854]">
                  GPS verification helps buyers confirm pickup areas and supports stronger local trust.
                </p>
              </article>

              <article className="rounded-md border border-[#d8ddda] bg-[#f6fbf8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#2ca06e]">
                  <MessageCircle size={18} />
                  <h3 className="text-2xl font-black text-[#111]">WhatsApp integration</h3>
                </div>
                <p className="text-sm text-[#4f5854]">
                  WhatsApp integration makes it easy to negotiate, confirm orders, and coordinate pickup.
                </p>
              </article>
            </div>
          </section>

          <footer className="mt-8 grid grid-cols-2 gap-5 rounded-t-md bg-[#27333c] px-6 py-8 text-[#d3dde3] md:grid-cols-5">
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
        </div>
      </section>
    </div>
  );
};
