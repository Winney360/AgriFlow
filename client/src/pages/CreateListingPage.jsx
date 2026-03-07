import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { productApi } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const LocationPicker = ({ selected, setSelected }) => {
  useMapEvents({
    click(event) {
      setSelected([event.latlng.lat, event.latlng.lng]);
    },
  });

  if (!selected) {
    return null;
  }

  return <Marker position={selected} />;
};

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    productType: 'crop',
    quantity: '',
    price: '',
    locationName: '',
    latitude: -1.286389,
    longitude: 36.817223,
    image: null,
    imageUrl: '',
  });

  const [locationMode, setLocationMode] = useState('map');
  const marker = useMemo(() => [form.latitude, form.longitude], [form.latitude, form.longitude]);

  useEffect(() => {
    const loadEditProduct = async () => {
      if (!editId) {
        return;
      }
      const response = await productApi.details(editId);
      const item = response.data.data;
      setForm((prev) => ({
        ...prev,
        title: item.title,
        description: item.description,
        productType: item.productType,
        quantity: item.quantity,
        price: item.price,
        locationName: item.location.locationName,
        latitude: item.location.latitude,
        longitude: item.location.longitude,
        imageUrl: item.imageUrl,
      }));
    };

    loadEditProduct().catch(() => null);
  }, [editId]);

  const useCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {
        setError('Could not access your GPS location. Try map selection instead.');
      },
      { enableHighAccuracy: true },
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!editId && !form.image && !form.imageUrl.trim()) {
      setError('Please add a listing photo before publishing.');
      return;
    }

    if (!Number.isFinite(Number(form.latitude)) || !Number.isFinite(Number(form.longitude))) {
      setError('Please provide a valid location using GPS or map selection.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'image') {
          payload.append(key, value);
        }
      });
      if (form.image) {
        payload.append('image', form.image);
      }

      if (editId) {
        await productApi.update(editId, payload);
      } else {
        await productApi.create(payload);
      }

      navigate('/dashboard');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to save listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">{editId ? 'Edit Listing' : 'Create Listing'}</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-(--outline) bg-(--surface) p-4">
        <Input
          placeholder="Product name"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="min-h-24 w-full rounded-xl border border-(--outline) bg-(--surface) p-3"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            className="h-11 rounded-xl border border-(--outline) bg-(--surface) px-3"
            value={form.productType}
            onChange={(event) => setForm({ ...form, productType: event.target.value })}
          >
            <option value="crop">Crop</option>
            <option value="livestock">Livestock</option>
          </select>
          <Input
            placeholder="Quantity / Count"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
        </div>

        <Input
          placeholder="Location description (optional)"
          value={form.locationName}
          onChange={(event) => setForm({ ...form, locationName: event.target.value })}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={locationMode === 'gps' ? 'cta' : 'outline'}
            onClick={() => {
              setLocationMode('gps');
              useCurrentLocation();
            }}
          >
            Use Current GPS
          </Button>
          <Button
            type="button"
            variant={locationMode === 'map' ? 'cta' : 'outline'}
            onClick={() => setLocationMode('map')}
          >
            Choose On Map
          </Button>
        </div>

        <div className="h-72 overflow-hidden rounded-xl border border-(--outline)">
          <MapContainer center={marker} zoom={8} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker
              selected={marker}
              setSelected={(next) =>
                setForm((prev) => ({ ...prev, latitude: next[0], longitude: next[1] }))
              }
            />
          </MapContainer>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })}
          />
          <Input
            placeholder="Or existing image URL"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button className="w-full" disabled={submitting}>
          {submitting ? 'Saving...' : editId ? 'Update Listing' : 'Publish Listing'}
        </Button>
      </form>
    </div>
  );
};
