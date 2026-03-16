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
  X,
  Filter,
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

const CURRENCY_OPTIONS = [
  { code: 'KES', label: 'Kenyan Shilling', locale: 'en-KE', symbol: 'Ksh' },
  { code: 'USD', label: 'US Dollar', locale: 'en-US', symbol: '$' },
  { code: 'EUR', label: 'Euro', locale: 'en-IE', symbol: '€' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN', symbol: '₹' },
];

export const MarketplacePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [mapView, setMapView] = useState(true);
  const [selectedTags, setSelectedTags] = useState(['maize']);
  const [customCropInput, setCustomCropInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

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

  const displayProducts = [
    ...emergencyRequests.map((req) => ({
      ...req,
      isEmergency: true,
      location: req.location || {},
      imageUrl: req.imageUrl || '/emergency-default.png',
      title: req.title || 'Emergency Request',
      price: req.price || '',
      quantity: req.quantity || '',
      productType: req.productType || '',
      description: req.description || '',
      sellerId: req.buyerId || {},
    })),
    ...products,
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
    if (tag === 'all') {
      setSelectedTags(['all']);
    } else {
      setSelectedTags((prev) => {
        const next = prev.includes(tag)
          ? prev.filter((item) => item !== tag)
          : [...prev.filter((t) => t !== 'all'), tag];
        return next.length === 0 ? ['all'] : next;
      });
    }
  };

  const onApplyFilters = () => {
    let tagsToUse = selectedTags;
    if (selectedTags.includes('all')) {
      tagsToUse = [];
    }
    const mergedSearch = [filters.search, ...tagsToUse].filter(Boolean).join(' ');
    const params = Object.fromEntries(
      Object.entries({ ...filters, search: mergedSearch }).filter(([, value]) => value !== ''),
    );
    loadProducts(params).catch(() => setProducts([]));
    setShowMobileFilters(false);
  };

  const onAddCustomCrop = () => {
    const trimmed = customCropInput.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setCustomCropInput('');
  };

  const categoryTags = [
    { label: 'All', value: 'all', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { label: 'Crop', value: 'crop', color: 'bg-green-100 text-green-800 border-green-300' },
    { label: 'Livestock', value: 'livestock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { label: 'Grain', value: 'grain', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { label: 'Vegetable', value: 'vegetable', color: 'bg-lime-100 text-lime-800 border-lime-300' },
    { label: 'Fruit', value: 'fruit', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  ];

  // Mobile Filters Drawer - Only shown on mobile
  const MobileFiltersDrawer = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-y-0 left-0 w-full max-w-sm bg-white transform transition-transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full overflow-y-auto p-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-[#1f9f6a]">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2">
              <X size={24} />
            </button>
          </div>

          {/* Currency Selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#1f9f6a] mb-1">Currency</label>
            <select
              className="w-full rounded-lg border border-[#c8ddd4] bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
              value={currency.code}
              onChange={e => {
                const next = CURRENCY_OPTIONS.find(opt => opt.code === e.target.value);
                if (next) setCurrency(next);
              }}
            >
              {CURRENCY_OPTIONS.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.label} ({opt.symbol})</option>
              ))}
            </select>
          </div>

          {/* Map Preview Card */}
          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4 mb-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#16382c]">Map Search</h2>
              <span className="text-sm text-[#6b8d80]">Preview</span>
            </div>
            <div className="relative h-48 overflow-hidden rounded-xl border border-[#d2e4db]">
              <MapContainer center={center} zoom={10} className="h-full w-full z-0" attributionControl={false} style={{zIndex: 0, position: 'relative'}}>
                <TileLayer url={ENGLISH_MAP_TILE_URL} />
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

          {/* Crop Type Filters */}
          <div className="mb-4">
            <p className="text-sm font-black text-[#1f9f6a] mb-2">Crop Type</p>
            <div className="space-y-2">
              {['maize', 'tomatoes', 'potatoes'].map((tag) => (
                <label key={tag} className="flex items-center gap-2 text-sm font-semibold text-[#2c5548]">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => onCategoryTag(tag)}
                    className="rounded border-[#1f9f6a] text-[#1f9f6a] focus:ring-[#1f9f6a]"
                  />
                  <span className="capitalize">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity Range */}
          <div className="mb-4">
            <p className="text-sm font-black text-[#1f9f6a] mb-2">Quantity (Kg/Tons)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
              />
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <p className="text-sm font-black text-[#1f9f6a] mb-2">Price (Ksh)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
              />
              <input
                className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
              />
            </div>
          </div>

          {/* Radius */}
          <div className="mb-4">
            <p className="text-sm font-black text-[#1f9f6a] mb-2">Search Radius (km)</p>
            <input
              className="h-10 w-full rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
              placeholder="Radius in km"
              value={filters.radiusKm}
              onChange={(event) => setFilters({ ...filters, radiusKm: event.target.value })}
            />
          </div>

          {/* Location Button */}
          <Button
            type="button"
            className="w-full h-10 mb-4 rounded-lg bg-[#1f9f6a] hover:bg-[#168055] text-white font-semibold flex items-center justify-center gap-2"
            onClick={useMyLocation}
            disabled={geoBusy}
          >
            <LocateFixed size={16} />
            {geoBusy ? 'Finding...' : 'Find Near Me'}
          </Button>

          {/* Map Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black text-[#255143]">Map View</span>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mapView ? 'bg-[#1f9f6a]' : 'bg-[#9abcae]'
              }`}
              onClick={() => setMapView((prev) => !prev)}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  mapView ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {geoError && (
            <p className="mt-3 text-xs font-semibold text-red-600">{geoError}</p>
          )}

          <Button
            type="button"
            className="w-full h-10 rounded-lg bg-[#1f9f6a] hover:bg-[#168055] text-white font-semibold"
            onClick={onApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileFiltersDrawer />
      
      <div className="flex-1 flex flex-col w-full">
        <div className="flex flex-col lg:flex-row flex-1 w-full">
          
          {/* Mobile Header - Only visible on mobile */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h1 className="text-2xl font-black text-[#1f9f6a]">
              Explore the Local Market
            </h1>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f9f6a] text-white rounded-lg"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Left Sidebar - Filters */}
          <aside
            className="lg:w-[320px] xl:w-87.5 lg:overflow-y-auto xl:overflow-y-auto lg:sticky xl:sticky lg:top-0 xl:top-0 hidden lg:block"
            style={{ flexShrink: 0, maxHeight: '100vh', borderRight: '1px solid #e5e7eb' }}
          >
            <div className="p-4">
              {/* Mobile Header */}
              <h1 className="text-4xl leading-tight font-black tracking-tight text-[#1f9f6a] lg:hidden">
                Explore the Local Market.
              </h1>

              {/* Currency Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#1f9f6a] mb-1">Currency</label>
                <select
                  className="w-full rounded-lg border border-[#c8ddd4] bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                  value={currency.code}
                  onChange={e => {
                    const next = CURRENCY_OPTIONS.find(opt => opt.code === e.target.value);
                    if (next) setCurrency(next);
                  }}
                >
                  {CURRENCY_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label} ({opt.symbol})</option>
                  ))}
                </select>
              </div>

              {/* Map Preview Card */}
              <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-black text-[#16382c]">Map Search</h2>
                  <span className="text-sm text-[#6b8d80]">Preview</span>
                </div>
                <div className="relative h-48 overflow-hidden rounded-xl border border-[#d2e4db] lg:h-56">
                  <MapContainer center={center} zoom={10} className="h-full w-full z-0" attributionControl={false} style={{zIndex: 0, position: 'relative'}}>
                    <TileLayer url={ENGLISH_MAP_TILE_URL} />
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

              {/* Filters Card */}
              <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
                <h2 className="text-3xl font-black text-[#1f9f6a] mb-4">Filters</h2>

                {/* Crop Type Filters */}
                <div className="mb-4">
                  <p className="text-sm font-black text-[#1f9f6a] mb-2">Crop Type</p>
                  <div className="space-y-2">
                    {['maize', 'tomatoes', 'potatoes'].map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-sm font-semibold text-[#2c5548]">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => onCategoryTag(tag)}
                          className="rounded border-[#1f9f6a] text-[#1f9f6a] focus:ring-[#1f9f6a]"
                        />
                        <span className="capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity Range */}
                <div className="mb-4">
                  <p className="text-sm font-black text-[#1f9f6a] mb-2">Quantity (Kg/Tons)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                    />
                    <input
                      className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <p className="text-sm font-black text-[#1f9f6a] mb-2">Price (Ksh)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                    />
                    <input
                      className="h-10 rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                    />
                  </div>
                </div>

                {/* Radius */}
                <div className="mb-4">
                  <p className="text-sm font-black text-[#1f9f6a] mb-2">Search Radius (km)</p>
                  <input
                    className="h-10 w-full rounded-xl border border-[#c8ddd4] bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                    placeholder="Radius in km"
                    value={filters.radiusKm}
                    onChange={(event) => setFilters({ ...filters, radiusKm: event.target.value })}
                  />
                </div>

                {/* Location Button */}
                <Button
                  type="button"
                  className="w-full h-10 mb-4 rounded-lg bg-[#1f9f6a] hover:bg-[#168055] text-white font-semibold flex items-center justify-center gap-2"
                  onClick={useMyLocation}
                  disabled={geoBusy}
                >
                  <LocateFixed size={16} />
                  {geoBusy ? 'Finding...' : 'Find Near Me'}
                </Button>

                {/* Map Toggle */}
                <div className="flex items-center justify-between" style={{zIndex: 0, position: 'relative'}}>
                  <span className="text-sm font-black text-[#255143]">Map View</span>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      mapView ? 'bg-[#1f9f6a]' : 'bg-[#9abcae]'
                    }`} 
                    style={{zIndex: 0, position: 'relative'}} 
                    onClick={() => setMapView((prev) => !prev)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        mapView ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {geoError && (
                  <p className="mt-3 text-xs font-semibold text-red-600">{geoError}</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-h-0 lg:overflow-y-auto xl:overflow-y-auto">
            <div className="p-4 lg:p-0 lg:pr-4 lg:pt-4 pb-8 lg:pb-4">
              {/* Desktop Header */}
              <h1 className="hidden text-5xl xl:text-6xl leading-tight font-black tracking-tight text-[#102d22] lg:block">
                Explore the Local Market.
                <br />
                Find Your Ideal Harvest.
              </h1>

              {/* Search Bar */}
              <div className="flex items-center overflow-hidden rounded-xl border border-[#c2d9ce] bg-white">
                <div className="flex items-center flex-1 px-4">
                  <Search size={20} className="text-[#5d7f72]" />
                  <input
                    className="h-12 w-full px-3 text-base font-semibold outline-none bg-transparent"
                    value={filters.search}
                    onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                    placeholder="Search for crops, livestock, or products..."
                  />
                </div>
                <Button
                  type="button"
                  className="h-12 px-6 rounded-lg bg-[#1f9f6a] hover:bg-[#168055] text-white font-semibold flex items-center gap-2"
                  onClick={onApplyFilters}
                >
                  Search
                  <ArrowRight size={18} />
                </Button>
              </div>

              {/* Category Tags */}
              <div>
                <p className="text-sm font-black text-[#244f41] mb-3">QUICK CATEGORY TAGS</p>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => {
                        onCategoryTag(tag.value);
                        setTimeout(onApplyFilters, 0);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all ${
                        selectedTags.includes(tag.value)
                          ? tag.color + ' ring-2 ring-offset-2 ring-[#1f9f6a]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#1f9f6a] hover:text-[#1f9f6a]'
                      }`}
                    >
                      <Sprout size={16} />
                      {tag.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Crop Input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customCropInput}
                    onChange={(e) => setCustomCropInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddCustomCrop(); } }}
                    placeholder="Add custom crop..."
                    className="flex-1 h-10 rounded-lg border border-[#c8ddd4] bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1f9f6a]"
                  />
                  <button 
                    type="button" 
                    onClick={onAddCustomCrop} 
                    className="h-10 px-4 rounded-lg bg-[#1f9f6a] hover:bg-[#168055] text-sm font-black text-white transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Map View */}
              {mapView ? (
                <div className="relative overflow-hidden rounded-xl border border-[#cddfd7] h-[300px] lg:h-[400px] xl:h-[500px]" style={{zIndex: 0, position: 'relative'}}>
                  <MapContainer center={center} zoom={9} className="h-full w-full z-0" attributionControl={false} style={{zIndex: 0}}>
                    <TileLayer url={ENGLISH_MAP_TILE_URL} />
                    {mapProducts.map((product) => {
                      let unit = 'bag';
                      if (product.unit && typeof product.unit === 'string') {
                        unit = product.unit;
                      } else if (product.quantity && typeof product.quantity === 'string') {
                        const q = product.quantity.toLowerCase();
                        if (q.includes('kg')) unit = 'kg';
                        else if (q.includes('ton')) unit = 'ton';
                        else if (q.includes('piece')) unit = 'piece';
                        else if (q.includes('bunch')) unit = 'bunch';
                        else if (q.includes('bag')) unit = 'bag';
                      }
                      return (
                        <Marker 
                          key={product._id} 
                          icon={greenMarkerIcon} 
                          position={[product.location.latitude, product.location.longitude]}
                        >
                          <Popup className="z-0" style={{zIndex: 0}}>
                            <div className="p-2 min-w-50">
                              <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                              <p className="text-[#1f9f6a] font-semibold">{formatCurrency(product.price)}/{unit}</p>
                              <p className="text-sm text-gray-600 mt-1">{product.location?.locationName}</p>
                              {product.isEmergency && (
                                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                  EMERGENCY
                                </span>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayProducts.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-[#cddfd7] bg-white p-8 text-center">
                      <p className="text-lg font-semibold text-[#33574a]">
                        No active listings available right now.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Try adjusting your filters or check back soon.
                      </p>
                    </div>
                  ) : (
                    displayProducts.map((product) => {
                      if (product.isEmergency) {
                        const createdAt = new Date(product.createdAt);
                        const hoursAgo = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60));
                        return (
                          <Card key={product._id} className="relative overflow-hidden border-2 border-[#d83c31] bg-[#fff7f7] hover:shadow-lg transition-shadow flex flex-col xl:min-h-96 xl:max-w-105 xl:mx-auto">
                            <div className="absolute top-3 right-3 bg-[#d83c31] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                              EMERGENCY
                            </div>
                            <div className="bg-linear-to-r from-[#1f9f6a] to-[#27b883] p-5 text-white">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-black">{product.title}</h3>
                                  <p className="text-sm opacity-90 mt-1">{product.productType}</p>
                                </div>
                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                  🔴 Open
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 p-5 space-y-4 flex flex-col">
                              <div className="flex items-center gap-2 text-sm">
                                <AlertCircle size={18} className="text-[#d83c31]" />
                                <span className="font-bold">Need: {product.quantity}</span>
                              </div>
                              {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock size={14} />
                                <span>{hoursAgo === 0 ? 'Just now' : `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`}</span>
                              </div>
                              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                <p className="text-xs font-bold text-[#2f6152]">Posted by</p>
                                <p className="text-sm font-bold mt-1">{product.sellerId?.name || 'Anonymous'}</p>
                                {product.sellerId?.phoneNumber && (
                                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                    <Phone size={12} />
                                    {product.sellerId.phoneNumber}
                                  </p>
                                )}
                              </div>
                              <div className="mt-auto">
                                <Button
                                  type="button"
                                  className="w-full bg-[#d83c31] hover:bg-[#b91c1c] font-bold py-3 text-white"
                                  onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                                >
                                  View Emergency Request
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      }

                      const whatsappNumber = normalizePhoneForWhatsApp(product?.sellerId?.phoneNumber);
                      const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
                      const unit = (product.unit && typeof product.unit === 'string') ? product.unit.trim() : '';

                      return (
                        <article key={product._id} className="overflow-hidden rounded-xl border border-[#cddfd7] bg-white hover:shadow-lg transition-shadow flex flex-col xl:min-h-96">
                          <div className="h-48 xl:h-56 bg-[#f3f8f5]">
                            <img 
                              src={product.imageUrl || '/placeholder-crop.jpg'} 
                              alt={product.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col flex-1 p-4 xl:p-6 gap-2">
                            <div className="flex items-center min-h-10">
                               <h3 className="text-lg font-black text-[#102f24] truncate w-full">{product.title}</h3>
                            </div>
                            <div className="flex items-center min-h-9">
                              <p className="text-xl font-black text-[#1f9f6a]">
                                {formatCurrency(product.price)}
                                {unit ? `/${unit}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center min-h-8">
                              <MapPin size={14} className="mr-1" />
                              <span className="text-sm font-semibold text-[#476f62] truncate">{product.location?.locationName || 'Location not specified'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 min-h-9">
                              <Button
                                type="button"
                                className="bg-[#1f9f6a] hover:bg-[#168055] text-white font-bold py-2"
                                onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                              >
                                View Details
                              </Button>
                              {whatsappNumber ? (
                                <a href={whatsappHref} target="_blank" rel="noreferrer" className="block">
                                  <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2 flex items-center justify-center gap-2">
                                    <MessageCircle size={16} />
                                    WhatsApp
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  className="w-full bg-gray-200 text-gray-600 font-bold py-2 cursor-not-allowed"
                                  disabled
                                >
                                  No Contact
                                </Button>
                              )}
                            </div>
                            <div className="mt-auto">
                              {product?.sellerId?.phoneNumber && (
                                <a href={`tel:${product.sellerId.phoneNumber}`} className="block">
                                  <Button className="w-full bg-[#1f9f6a] hover:bg-[#168055] text-white font-bold py-2 flex items-center justify-center gap-2">
                                    <Phone size={16} />
                                    Call Seller
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Product Modal */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
              <div className="p-6">
                <Dialog.Title className="text-2xl font-black mb-4">
                  {selectedProduct?.title}
                </Dialog.Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-3xl font-black text-[#1f9f6a]">
                        Ksh {Number(selectedProduct?.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-semibold">{selectedProduct?.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-semibold capitalize">{selectedProduct?.productType}</p>
                      </div>
                    </div>

                    {selectedProduct?.location && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold flex items-center gap-1">
                          <MapPin size={16} className="text-[#1f9f6a]" />
                          {selectedProduct.location.locationName || 'Not specified'}
                        </p>
                      </div>
                    )}

                    {selectedProduct?.description && (
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm">{selectedProduct.description}</p>
                      </div>
                    )}

                    {selectedProduct?.isEmergency && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-red-600 font-bold">⚠️ Emergency Request</p>
                      </div>
                    )}

                    {selectedProduct?.sellerId?.phoneNumber && (
                      <div className="flex flex-wrap gap-3 pt-4">
                        <a href={`https://wa.me/${normalizePhoneForWhatsApp(selectedProduct.sellerId.phoneNumber)}`} target="_blank" rel="noreferrer" className="flex-1">
                          <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold">
                            <MessageCircle size={18} className="mr-2" />
                            WhatsApp
                          </Button>
                        </a>
                        <a href={`tel:${selectedProduct.sellerId.phoneNumber}`} className="flex-1">
                          <Button className="w-full bg-[#1f9f6a] hover:bg-[#168055] text-white font-bold">
                            <Phone size={18} className="mr-2" />
                            Call
                          </Button>
                        </a>
                        <Button
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedProduct.sellerId.phoneNumber);
                            toast.success('Number copied to clipboard');
                          }}
                        >
                          Copy Number
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setShowModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                    Close
                  </Button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};