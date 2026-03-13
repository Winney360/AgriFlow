import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Star,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ListingsMap } from '../components/map/ListingsMap';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import step1Image from '../assets/homepage/step1.png';
import step2Image from '../assets/homepage/step2.png';
import step3Image from '../assets/homepage/step3.png';

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
  const { isAuthenticated } = useAuth();
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

  const listingInsights = useMemo(() => {
    const cropTypes = Array.from(
      new Set(
        listingData
          .map((item) => item.productType)
          .filter(Boolean),
      ),
    ).slice(0, 4);

    const vendors = Array.from(
      new Set(
        listingData
          .map((item) => item.sellerId?.name)
          .filter(Boolean),
      ),
    ).slice(0, 4);

    const locations = Array.from(
      new Set(
        listingData
          .map((item) => item.location?.locationName)
          .filter(Boolean),
      ),
    ).slice(0, 4);

    const prices = listingData
      .map((item) => Number(item.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    return {
      cropTypes,
      vendors,
      locations,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  }, [listingData]);

  return (
    <div className="bg-[#f7f8f7] text-[#1f1f1f]">
      <section className="min-h-screen border-b border-[#dce3df] bg-[#f7f8f7]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-2 md:px-6">
          {!isAuthenticated && (
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
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="rounded-md border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#335c4f]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-md bg-[#2ca06e] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
            </header>
          )}

          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[#d8ddda] md:grid-cols-2">
            <div className="bg-[#e4ece5] p-4 sm:p-6 md:p-12">
              <h1 className="max-w-xl text-3xl font-black leading-[1.08] text-[#131313] sm:text-4xl md:text-6xl">
                Connect Directly. Trade Locally.
              </h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg text-[#3c4440]">
                Connect directly with trusted local farmers and buyers through a simple agricultural marketplace built for nearby trade.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
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
            <div className="relative bg-white p-2 sm:p-3 min-h-50 md:min-h-87.5">
              <ListingsMap products={listingData} />
            </div>
          </div>

          <section className="mt-6 rounded-md border border-[#d8ddda] bg-[#f2f5f3] p-4 sm:p-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#3d5c50]">New to AgriFlow?</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#151515]">Get started in under 2 minutes</h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-[#4f5854]">
              Create an account to post your harvest, switch between buyer and seller roles, and connect with local farmers instantly.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              <Link to="/signup" className="rounded-md bg-[#2ca06e] px-5 py-2.5 text-sm font-semibold text-white">
                Sign Up and Get Started
              </Link>
              <Link to="/login" className="rounded-md border border-[#9db3a7] bg-white px-5 py-2.5 text-sm font-semibold text-[#335c4f]">
                Login
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section className="min-h-screen bg-[#f3f6f4]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-2 md:px-6">
          <section className="py-8 sm:py-10 md:py-14">
            <div className="px-2 py-6 sm:px-4 sm:py-8 md:px-8 md:py-10">
              <h2 className="text-center text-2xl sm:text-4xl font-black text-[#161616] md:text-5xl">How It Works</h2>

              <div className="mt-8 grid grid-cols-1 items-start gap-5 sm:grid-cols-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <article className="text-center">
                  <img
                    src={step1Image}
                    alt="Step 1 List or Find"
                    className="mx-auto h-20 w-auto object-contain mix-blend-multiply sm:h-28 md:h-32"
                  />
                  <h3 className="mt-3 text-lg sm:text-2xl font-black text-[#151515]">Step 1: List or Find</h3>
                  <p className="mx-auto mt-2 max-w-57.5 text-xs sm:text-sm leading-tight text-[#3e4642]">
                    List or find produce in your area and view live market activity.
                  </p>
                </article>

                <div className="hidden w-28 items-center self-center text-[#1f9f6a] md:flex" aria-hidden="true">
                  <span className="h-0.5 w-20 bg-[#1f9f6a]" />
                  <ArrowRight size={22} strokeWidth={2.8} />
                </div>

                <article className="text-center">
                  <img
                    src={step2Image}
                    alt="Step 2 Connect via WhatsApp"
                    className="mx-auto h-20 w-auto object-contain mix-blend-multiply sm:h-28 md:h-32"
                  />
                  <h3 className="mt-3 text-lg sm:text-2xl font-black text-[#151515]">Step 2: Connect via WhatsApp</h3>
                  <p className="mx-auto mt-2 max-w-62.5 text-xs sm:text-sm leading-tight text-[#3e4642]">
                    Connect sellers and buyers directly on WhatsApp to agree on quantity and price.
                  </p>
                </article>

                <div className="hidden w-28 items-center self-center text-[#1f9f6a] md:flex" aria-hidden="true">
                  <span className="h-0.5 w-20 bg-[#1f9f6a]" />
                  <ArrowRight size={22} strokeWidth={2.8} />
                </div>

                <article className="text-center">
                  <img
                    src={step3Image}
                    alt="Step 3 Local Pickup"
                    className="mx-auto h-20 w-auto object-contain mix-blend-multiply sm:h-28 md:h-32"
                  />
                  <h3 className="mt-3 text-lg sm:text-2xl font-black text-[#151515]">Step 3: Local Pickup</h3>
                  <p className="mx-auto mt-2 max-w-57.5 text-xs sm:text-sm leading-tight text-[#3e4642]">
                    Finalize the order and complete the trade with convenient local pickup.
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-[#d8ddda] bg-[#eef3f0] p-4 sm:p-5 md:p-6">
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-4xl font-black text-[#161616]">Featured Success Stories</h2>
              <div className="hidden gap-2 md:flex">
                <button type="button" className="rounded border border-[#ccd4cf] bg-white px-2 py-1">{'<'}</button>
                <button type="button" className="rounded border border-[#ccd4cf] bg-white px-2 py-1">{'>'}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {successStories.map((story) => (
                <article key={story.id} className="rounded-md border border-[#d8ddda] bg-white p-3">
                  <div className="mb-3 flex gap-2">
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                    <div className="h-14 w-14 rounded-md bg-[#d7e5da]" />
                  </div>
                  <h3 className="text-xl font-black">{story.title}</h3>
                  <p className="mt-2 text-sm text-[#535b57]">{story.text}</p>
                  <div className="mt-2 flex items-center gap-1 text-[#1f9f6a]">
                    <Star size={13} fill="currentColor" />
                    <span className="text-sm">4.0</span>
                    <span className="text-sm">5</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

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
        </div>
      </section>
    </div>
  );
};
