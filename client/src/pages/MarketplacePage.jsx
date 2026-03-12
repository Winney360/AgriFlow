import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import {
  ArrowRight,
  Check,
  ChevronRight,
  LocateFixed,
  MapPin,
  MessageCircle,
  Search,
  Sprout,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { productApi } from '../lib/api';
import { ENGLISH_MAP_ATTRIBUTION, ENGLISH_MAP_TILE_URL } from '../lib/mapTiles';
import { normalizePhoneForWhatsApp } from '../lib/utils';

export const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [mapView, setMapView] = useState(true);
  const [selectedTags, setSelectedTags] = useState(['maize']);
  const [filters, setFilters] = useState({
    search: '',
    productType: '',
    locationName: '',
    minPrice: '',
    maxPrice: '',
    lat: '',
    lng: '',
    radiusKm: '',
  });

  const loadProducts = async (params = {}) => {
    const response = await productApi.listActive(params);
    setProducts(response.data.data || []);
  };

  useEffect(() => {
    loadProducts().catch(() => setProducts([]));
  }, []);

  const useMyLocation = () => {
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          radiusKm: prev.radiusKm || '30',
        }));
        setGeoBusy(false);
      },
      () => {
        setGeoError('Could not access GPS. You can still filter by place name.');
        setGeoBusy(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const displayProducts = products;

  const mapProducts = useMemo(
    () =>
      displayProducts.filter((item) => item.location?.latitude && item.location?.longitude),
    [displayProducts],
  );

  const center = useMemo(() => {
    if (!mapProducts.length) {
      return [-1.286389, 36.817223];
    }
    return [mapProducts[0].location.latitude, mapProducts[0].location.longitude];
  }, [mapProducts]);

  const onCategoryTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const onApplyFilters = () => {
    const mergedSearch = [filters.search, ...selectedTags].filter(Boolean).join(' ');
    const params = Object.fromEntries(
      Object.entries({ ...filters, search: mergedSearch }).filter(([, value]) => value !== ''),
    );
    loadProducts(params).catch(() => setProducts([]));
  };

  const categoryTags = [
    { label: '[Crops]', value: 'maize' },
    { label: '[Livestock]', value: 'livestock' },
    { label: '[Grains]', value: 'grains' },
    { label: '[Vegetables]', value: 'vegetables' },
    { label: '[Fruits]', value: 'fruits' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#2d5b4d]">
        <span>[Crop Feed</span>
        <ChevronRight size={14} />
        <span>Map Search</span>
        <ChevronRight size={14} />
        <span>Post Listing</span>
        <ChevronRight size={14} />
        <span>Messages</span>
        <ChevronRight size={14} />
        <span className="text-[#123126]">Profile</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[15rem_1fr_14rem]">
        <aside className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
          <h1 className="text-[3rem] leading-[0.95] font-black tracking-tight text-[#1f9f6a] xl:hidden">
            Explore the Local Market.
          </h1>

          <div className="mt-3 rounded-xl border border-[#d3e6dd] bg-white p-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-lg font-black text-[#16382c]">Map Search</p>
              <span className="text-[#6b8d80]">x</span>
            </div>
            <div className="h-42 overflow-hidden rounded-xl border border-[#d2e4db]">
              <MapContainer center={center} zoom={10} className="h-full w-full">
                <TileLayer
                  attribution={ENGLISH_MAP_ATTRIBUTION}
                  url={ENGLISH_MAP_TILE_URL}
                />
                {mapView
                  ? mapProducts.slice(0, 4).map((product) => (
                      <Marker
                        key={product._id}
                        position={[product.location.latitude, product.location.longitude]}
                      />
                    ))
                  : null}
              </MapContainer>
            </div>
          </div>

          <div className="mt-3 rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]\">Filters</p>

            <div className="mt-2">
              <p className="text-sm font-black text-[#1f9f6a]\">Crop Type filters</p>
              <div className="mt-1 space-y-1 text-sm font-semibold text-[#2c5548]">
                {['maize', 'tomatoes', 'potatoes'].map((tag) => (
                  <label key={tag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => onCategoryTag(tag)}
                    />
                    <span className="capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-[#f9fdfb] px-3 text-sm font-semibold"
                placeholder="Kg"
                value={filters.minPrice}
                onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
              />
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-[#f9fdfb] px-3 text-sm font-semibold"
                placeholder="Kg/Tons"
                value={filters.maxPrice}
                onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
              />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-[#f9fdfb] px-3 text-sm font-semibold"
                placeholder="Ksh"
                value={filters.minPrice}
                onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
              />
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-[#f9fdfb] px-3 text-sm font-semibold"
                placeholder="km"
                value={filters.radiusKm}
                onChange={(event) => setFilters({ ...filters, radiusKm: event.target.value })}
              />
            </div>

            <Button
              type="button"
              className="mt-3 h-10 w-full rounded-lg bg-[#1f9f6a]"
              onClick={() => {
                useMyLocation();
                onApplyFilters();
              }}
              disabled={geoBusy}
            >
              <LocateFixed size={15} /> {geoBusy ? 'Finding...' : 'Find Near Me'}
            </Button>

            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-black text-[#255143]">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={() => setVerifiedOnly((prev) => !prev)}
                />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm font-black text-[#255143]">
                <span>Map View</span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    mapView ? 'bg-[#1ea26c]' : 'bg-[#9abcae]'
                  }`}
                  onClick={() => setMapView((prev) => !prev)}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      mapView ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>

            {geoError ? <p className="mt-2 text-xs font-semibold text-red-600">{geoError}</p> : null}
          </div>
        </aside>

        <section className="space-y-3">
          <h1 className="hidden text-[4.2rem] leading-[0.9] font-black tracking-tight text-[#102d22] xl:block">
            Explore the Local Market.
            <br />
            Find Your Ideal Harvest.
          </h1>

          <div className="flex items-center overflow-hidden rounded-xl border border-[#c2d9ce] bg-white">
            <Search size={18} className="ml-3 text-[#5d7f72]" />
            <input
              className="h-12 w-full px-3 text-lg font-semibold outline-none"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Maize"
            />
            <Button
              type="button"
              className="mr-1 h-10 rounded-lg bg-[#1e9f6a] px-3"
              onClick={onApplyFilters}
            >
              <ArrowRight size={16} />
            </Button>
          </div>

          <div>
            <p className="text-sm font-black text-[#244f41]">QUICK CATEGORY TAGS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => onCategoryTag(tag.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black transition ${
                    selectedTags.includes(tag.value)
                      ? 'border-[#8ac7ae] bg-[#e8f6ef] text-[#145e43]'
                      : 'border-[#d6e7df] bg-white text-[#2d5b4d]'
                  }`}
                >
                  <Sprout size={14} /> {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length === 0 ? (
              <div className="col-span-full rounded-xl border border-[#cddfd7] bg-white p-6 text-center text-sm font-semibold text-[#33574a]">
                No active listings available right now. Try adjusting your filters or check back soon.
              </div>
            ) : null}

            {displayProducts.map((product) => {
              const whatsappNumber = normalizePhoneForWhatsApp(product?.sellerId?.phoneNumber);
              const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
              const unit = String(product.quantity || 'bag').toLowerCase().includes('kg')
                ? 'kg'
                : 'bag';
              const showProduct =
                !verifiedOnly || Boolean(product?.sellerId?.phoneNumber || product?.sellerId?.email);

              if (!showProduct) {
                return null;
              }

              return (
                <article key={product._id} className="overflow-hidden rounded-xl border border-[#cddfd7] bg-white">
                  <img src={product.imageUrl} alt={product.title} className="h-32 w-full object-cover" />
                  <div className="space-y-1 p-2.5">
                    <p className="text-3xl leading-none font-black text-[#102f24]">{product.title}</p>
                    <p className="text-2xl leading-none font-black text-[#112e23]">
                      Ksh {Number(product.price || 0).toLocaleString()}/{unit}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-[#476f62]">
                      <MapPin size={13} /> {product.location?.locationName || 'Juja, 12km'}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-[#476f62]">
                      <Star size={13} fill="currentColor" className="text-[#2aa76f]" /> 5.0 Stars, 28
                      Reviews
                    </p>

                    {whatsappNumber ? (
                      <a href={whatsappHref} target="_blank" rel="noreferrer" className="block">
                        <button
                          type="button"
                          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1f9f6a] px-3 text-sm font-black text-white"
                        >
                          Contact via WhatsApp <MessageCircle size={15} />
                        </button>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="mt-2 h-10 w-full rounded-lg bg-[#d4e3dd] px-3 text-sm font-black text-[#4b6f62]"
                        disabled
                      >
                        Request Quote
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]\">Local Trust & Verification</p>
            <p className="mt-2 text-lg leading-tight font-bold text-[#1f9f6a]\">
              Verify Local Trust. Verify on WhatsApp before payment.
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#def3e8] px-3 py-2 text-sm font-black text-[#1f9f6a]\">
              <Check size={14} /> JWT Verified
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3\">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]\">Request & Post Callout</p>
            <Button type="button" className="mt-3 h-10 w-full rounded-lg bg-[#1f9f6a]">
              Post Listing
            </Button>
            <Button type="button" variant="outline" className="mt-2 h-10 w-full rounded-lg border-[#8fc7af] text-[#1f704f]">
              Create Request
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};
