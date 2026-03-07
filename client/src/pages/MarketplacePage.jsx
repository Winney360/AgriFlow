import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { ListingsMap } from '../components/map/ListingsMap';
import { ProductCard } from '../components/products/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { productApi } from '../lib/api';

export const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState('');
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

  const onApplyFilters = () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ''),
    );
    loadProducts(params).catch(() => setProducts([]));
  };

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

  const clearNearbyFilter = () => {
    setFilters((prev) => ({ ...prev, lat: '', lng: '', radiusKm: '' }));
    setGeoError('');
  };

  const mapProducts = useMemo(
    () => products.filter((item) => item.location?.latitude && item.location?.longitude),
    [products],
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-black">Marketplace</h1>
        <p className="text-sm text-(--text-muted)">
          Search and filter by product name, price, location, and type.
        </p>
      </header>

      <section className="rounded-2xl border border-(--outline) bg-(--surface) p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search product"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
          <select
            className="h-11 rounded-xl border border-(--outline) bg-(--surface) px-3"
            value={filters.productType}
            onChange={(event) => setFilters({ ...filters, productType: event.target.value })}
          >
            <option value="">All types</option>
            <option value="crop">Crop</option>
            <option value="livestock">Livestock</option>
          </select>
          <Input
            placeholder="Location"
            value={filters.locationName}
            onChange={(event) => setFilters({ ...filters, locationName: event.target.value })}
          />
          <Input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
          />
          <Input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            type="number"
            min="1"
            placeholder="Radius (km)"
            value={filters.radiusKm}
            onChange={(event) => setFilters({ ...filters, radiusKm: event.target.value })}
          />
          <Button type="button" variant="outline" onClick={useMyLocation} disabled={geoBusy}>
            {geoBusy ? 'Finding location...' : 'Use my GPS for nearby'}
          </Button>
          <Button type="button" variant="ghost" onClick={clearNearbyFilter}>
            Clear nearby filter
          </Button>
        </div>

        {filters.lat && filters.lng ? (
          <p className="mt-2 text-xs text-(--text-muted)">
            Nearby filter active around your GPS point.
          </p>
        ) : null}

        {geoError ? <p className="mt-2 text-xs text-red-600">{geoError}</p> : null}

        <Button className="mt-3" onClick={onApplyFilters}>
          <Filter size={16} /> Apply filters
        </Button>
      </section>

      <ListingsMap products={mapProducts} />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
    </div>
  );
};
