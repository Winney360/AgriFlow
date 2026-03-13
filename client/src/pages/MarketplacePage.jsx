import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  ArrowRight,
  LocateFixed,
  MapPin,
  MessageCircle,
  Search,
  Sprout,
  Star,
  Phone,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { productApi, emergencyRequestApi } from '../lib/api';
import { AlertCircle, Check, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ENGLISH_MAP_ATTRIBUTION, ENGLISH_MAP_TILE_URL } from '../lib/mapTiles';
import { greenMarkerIcon } from '../lib/mapMarkerIcon';
import { normalizePhoneForWhatsApp } from '../lib/utils';

export const MarketplacePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState('');
  // Map is off by default for buyers, on for sellers
  const [mapView, setMapView] = useState(true);
  const [selectedTags, setSelectedTags] = useState(['maize']);
  const [customCropInput, setCustomCropInput] = useState('');

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

  // If user role changes, update mapView accordingly
  useEffect(() => {
    if (user?.role === 'buyer') {
      setMapView(false);
    } else if (user?.role === 'seller') {
      setMapView(true);
    }
  }, [user?.role]);

  const loadProducts = async (params = {}) => {
    const response = await productApi.listActive(params);
    setProducts(response.data.data || []);
  };

  useEffect(() => {
    loadProducts().catch(() => setProducts([]));
    // Load emergency requests for the marketplace
    emergencyRequestApi.list({ status: 'open' })
      .then((res) => setEmergencyRequests(res.data.data || []))
      .catch(() => setEmergencyRequests([]));
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
        const nextFilters = {
          ...filters,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          radiusKm: filters.radiusKm || '30',
        };

        setFilters(nextFilters);

        const mergedSearch = [nextFilters.search, ...selectedTags].filter(Boolean).join(' ');
        const params = Object.fromEntries(
          Object.entries({ ...nextFilters, search: mergedSearch }).filter(([, value]) => value !== ''),
        );

        loadProducts(params).catch(() => setProducts([]));
        setGeoBusy(false);
      },
      () => {
        setGeoError('Could not access GPS. You can still filter by place name.');
        setGeoBusy(false);
      },
      { enableHighAccuracy: true },
    );
  };

  // Merge products and emergency requests for display
  const displayProducts = [
    ...products,
    ...emergencyRequests.map((req) => ({
      ...req,
      isEmergency: true,
      // For map compatibility, ensure location field exists
      location: req.location || {},
      imageUrl: req.imageUrl || '/emergency-default.png', // fallback image
      title: req.title || 'Emergency Request',
      price: req.price || '',
      quantity: req.quantity || '',
      productType: req.productType || '',
      description: req.description || '',
      sellerId: req.buyerId || {}, // emergency requests are posted by buyers
    })),
  ];

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

  const onAddCustomCrop = () => {
    const trimmed = customCropInput.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setCustomCropInput('');
  };

  const categoryTags = [
    { label: 'Crop', value: 'crop', color: 'bg-green-100 text-green-800 border-green-300' },
    { label: 'Livestock', value: 'livestock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { label: 'Grain', value: 'grain', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { label: 'Vegetable', value: 'vegetable', color: 'bg-lime-100 text-lime-800 border-lime-300' },
    { label: 'Fruit', value: 'fruit', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2.5fr] xl:grid-cols-[15rem_1fr_14rem]">
        <aside className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-2 sm:p-3">
          <h1 className="text-[3rem] leading-[0.95] font-black tracking-tight text-[#1f9f6a] xl:hidden">
            Explore the Local Market.
          </h1>

          <div className="mt-3 rounded-xl border border-[#d3e6dd] bg-white p-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-lg font-black text-[#16382c]">Map Search</p>
              <span className="text-[#6b8d80]">x</span>
            </div>
            <div className="relative isolate h-40 sm:h-48 md:h-56 overflow-hidden rounded-xl border border-[#d2e4db]">
              <MapContainer center={center} zoom={10} className="h-full w-full" attributionControl={false}>
                <TileLayer
                  url={ENGLISH_MAP_TILE_URL}
                />
                {mapView
                  ? mapProducts.slice(0, 4).map((product) => (
                      <Marker
                        key={product._id}
                        icon={greenMarkerIcon}
                        position={[product.location.latitude, product.location.longitude]}
                      />
                    ))
                  : null}
              </MapContainer>
            </div>
          </div>

          <div className="mt-3 rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-2 sm:p-3">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]">Filters</p>

            <div className="mt-2">
              <p className="text-sm font-black text-[#1f9f6a]">Crop Type filters</p>
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
              onClick={useMyLocation}
              disabled={geoBusy}
            >
              <LocateFixed size={15} /> {geoBusy ? 'Finding...' : 'Find Near Me'}
            </Button>

            <div className="mt-2 flex items-center justify-end">
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

          <div className="flex flex-col sm:flex-row items-center overflow-hidden rounded-xl border border-[#c2d9ce] bg-white">
            <Search size={18} className="ml-3 text-[#5d7f72]" />
            <input
              className="h-10 sm:h-12 w-full px-3 text-base sm:text-lg font-semibold outline-none"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Maize"
            />
            <Button
              type="button"
              className="mt-2 sm:mt-0 mr-1 h-10 rounded-lg bg-[#1e9f6a] px-3"
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
                      ? tag.color + ' ring-2 ring-offset-1 ring-' + tag.color.split(' ')[1].replace('bg-', '')
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <Sprout size={14} /> {tag.label}
                </button>
              ))}
            </div>
              <div className="mt-1 flex gap-1">
                <input
                  type="text"
                  value={customCropInput}
                  onChange={(e) => setCustomCropInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddCustomCrop(); } }}
                  placeholder="Other crop..."
                  className="h-8 flex-1 rounded-lg border border-[#c8ddd4] bg-[#f9fdfb] px-2 text-xs font-semibold outline-none"
                />
                <button type="button" onClick={onAddCustomCrop} className="h-8 rounded-lg bg-[#1f9f6a] px-2 text-xs font-black text-white">+</button>
              </div>
          </div>

          {mapView ? (
            <div className="relative isolate overflow-hidden rounded-xl border border-[#cddfd7] h-60 sm:h-80 md:h-120">
              <MapContainer center={center} zoom={9} className="h-full w-full" attributionControl={false}>
                <TileLayer url={ENGLISH_MAP_TILE_URL} />
                {mapProducts.map((product) => (
                  <Marker key={product._id} icon={greenMarkerIcon} position={[product.location.latitude, product.location.longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{product.title}</p>
                        <p>Ksh {Number(product.price || 0).toLocaleString()}</p>
                        <p className="text-xs text-[#666]">{product.location?.locationName}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length === 0 ? (
              <div className="col-span-full rounded-xl border border-[#cddfd7] bg-white p-6 text-center text-sm font-semibold text-[#33574a]">
                No active listings available right now. Try adjusting your filters or check back soon.
              </div>
            ) : null}

            {displayProducts.map((product) => {
              if (product.isEmergency) {
                // Emergency request card (profile style, no image)
                const createdAt = new Date(product.createdAt);
                const hoursAgo = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60));
                return (
                  <Card key={product._id} className="overflow-hidden border-2 border-[#d83c31] bg-[#fff7f7] p-0">
                    <div className="absolute top-2 right-2 bg-[#d83c31] text-white text-xs font-bold px-2 py-1 rounded">EMERGENCY</div>
                    <div className="bg-gradient-to-r from-[#1f9f6a] to-[#27b883] p-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-black">{product.title}</h2>
                          <p className="text-sm opacity-90 mt-1">{product.productType}</p>
                        </div>
                        <span className="rounded px-3 py-1 text-xs font-bold whitespace-nowrap bg-red-100 text-red-700">🔴 Open</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle size={16} className="text-[#d83c31]" />
                        <span className="font-bold text-[#1f1f1f]">Need: {product.quantity}</span>
                      </div>
                      {product.description && (
                        <p className="text-sm text-[#666]">{product.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#999]">
                        <Clock size={14} />
                        <span>{hoursAgo === 0 ? 'Just now' : `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`}</span>
                      </div>
                      <div className="rounded-lg border border-[#e0e0e0] p-2 bg-[#f8f8f8]">
                        <p className="text-xs font-bold text-[#2f6152]">Posted by</p>
                        <p className="text-sm font-bold text-[#1f1f1f] mt-1">{product.sellerId?.name}</p>
                        {product.sellerId?.phoneNumber && (
                          <p className="text-xs text-[#666] mt-1">📞 {product.sellerId.phoneNumber}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        className="w-full bg-[#1f9f6a] font-bold"
                        onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                      >
                        View Emergency
                      </Button>
                    </div>
                  </Card>
                );
              }
              // ...existing code for normal product card...
              const whatsappNumber = normalizePhoneForWhatsApp(product?.sellerId?.phoneNumber);
              const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
              const unit = String(product.quantity || 'bag').toLowerCase().includes('kg')
                ? 'kg'
                : 'bag';

              return (
                <article key={product._id} className="overflow-hidden rounded-xl border border-[#cddfd7] bg-white">
                  <div className="flex h-40 w-full items-center justify-center bg-[#f3f8f5] p-0">
                    <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1 p-2.5">
                    <p className="text-3xl leading-none font-black text-[#102f24]">{product.title}</p>
                    <p className="text-2xl leading-none font-black text-[#112e23]">
                      Ksh {Number(product.price || 0).toLocaleString()}/{unit}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-[#476f62]">
                      <MapPin size={13} /> {product.location?.locationName || 'Juja, 12km'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        type="button"
                        className="flex-1 h-10 rounded-lg bg-[#1f9f6a] text-white font-bold"
                        onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                      >
                        View Crop
                      </Button>
                      {whatsappNumber ? (
                        <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex-1">
                          <button
                            type="button"
                            className="h-10 w-full rounded-lg bg-[#1f9f6a] px-3 text-sm font-black text-white flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={16} /> WhatsApp
                          </button>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="h-10 w-full rounded-lg bg-[#d4e3dd] px-3 text-sm font-black text-[#4b6f62]"
                          disabled
                        >
                          Request Quote
                        </button>
                      )}
                      {product?.sellerId?.phoneNumber && (
                        <a href={`tel:${product.sellerId.phoneNumber}`} className="flex-1">
                          <button
                            type="button"
                            className="h-10 w-full rounded-lg bg-[#1f9f6a] px-3 text-sm font-black text-white flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-2.007-2.244l-3.342-.418a2.25 2.25 0 00-2.348 1.31l-.7 1.4a12.042 12.042 0 01-5.372-5.372l1.4-.7a2.25 2.25 0 001.31-2.348l-.418-3.342A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            Call Seller
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )}
          {/* Crop Modal (moved outside map loop) */}
          <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                <Dialog.Title className="text-2xl font-black mb-2">{selectedProduct?.title}</Dialog.Title>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    {selectedProduct?.imageUrls && selectedProduct.imageUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.imageUrls.map((img, idx) => (
                          <img
                            key={img}
                            src={img}
                            alt={`Crop image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <img src={selectedProduct?.imageUrl} alt={selectedProduct?.title} className="w-full h-40 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-lg font-bold">Price: <span className="text-[#1f9f6a]">Ksh {Number(selectedProduct?.price || 0).toLocaleString()}</span></p>
                    <p className="text-md font-semibold">Quantity: {selectedProduct?.quantity}</p>
                    <p className="text-md font-semibold">Type: {selectedProduct?.productType}</p>
                    <p className="text-md font-semibold">Location: {selectedProduct?.location?.locationName}</p>
                    <p className="text-md">{selectedProduct?.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-800">Close</Button>
                      {selectedProduct?.sellerId?.phoneNumber && (
                        <>
                          <a href={`https://wa.me/${normalizePhoneForWhatsApp(selectedProduct.sellerId.phoneNumber)}`} target="_blank" rel="noreferrer">
                            <Button className="bg-[#1f9f6a] text-white">WhatsApp Seller</Button>
                          </a>
                          <a href={`tel:${selectedProduct.sellerId.phoneNumber}`}>
                            <Button className="bg-[#1f9f6a] text-white">Call Seller</Button>
                          </a>
                          <Button
                            className="bg-[#1f9f6a] text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedProduct.sellerId.phoneNumber).then(() => {
                                toast.success('Number copied');
                              });
                            }}
                          >
                            Copy Number
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </section>

        {/* Removed Local Market Tips and Actions cards for buyers */}
      </div>
    </div>
  );
};
