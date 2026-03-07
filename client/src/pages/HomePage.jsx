import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Wheat, Beef } from 'lucide-react';
import { productApi } from '../lib/api';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/button';
import { designInspiration } from '../data/designNotes';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      const response = await productApi.listActive();
      setProducts(response.data.data.slice(0, 6));
    };

    loadProducts().catch(() => setProducts([]));
  }, []);

  const filtered = products.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--surface) p-6 md:p-10">
        <div className="space-y-4 md:max-w-2xl">
          <p className="inline-flex rounded-full border border-(--outline) bg-(--surface-soft) px-3 py-1 text-xs font-semibold uppercase">
            Rural Marketplace Platform
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Buy and sell crops and livestock with map-powered trust.
          </h1>
          <p className="text-base text-(--text-muted) md:text-lg">
            CropConnect helps farmers and buyers meet faster through location-aware listings,
            direct contact, and a seller history trail.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/marketplace">
              <Button variant="cta" size="lg">
                Explore Marketplace <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button size="lg">Post a Listing</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-(--outline) bg-(--surface) p-4">
          <Compass className="mb-2" />
          <h2 className="text-lg font-bold">Location-aware</h2>
          <p className="text-sm text-(--text-muted)">Set GPS or choose map location manually.</p>
        </article>
        <article className="rounded-2xl border border-(--outline) bg-(--surface) p-4">
          <Wheat className="mb-2" />
          <h2 className="text-lg font-bold">Crop trading</h2>
          <p className="text-sm text-(--text-muted)">Find maize, beans, vegetables, and more.</p>
        </article>
        <article className="rounded-2xl border border-(--outline) bg-(--surface) p-4">
          <Beef className="mb-2" />
          <h2 className="text-lg font-bold">Livestock market</h2>
          <p className="text-sm text-(--text-muted)">Buy goats, cows, poultry, and farm animals.</p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black">Latest Listings</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name"
            className="h-11 w-full rounded-xl border border-(--outline) bg-(--surface) px-3 sm:max-w-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-(--outline) bg-(--surface-soft) p-4">
        <h3 className="mb-2 text-lg font-bold">Design Direction Applied</h3>
        <ul className="space-y-2 text-sm text-(--text-muted)">
          {designInspiration.map((item) => (
            <li key={item.idea}>
              {item.idea} to {item.appliedAs}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
