import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { reverseGeocode } from '../lib/reverseGeocode';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { AlertCircle, ChevronRight, MapPin, Plus } from 'lucide-react';
import { emergencyRequestApi } from '../lib/api';
import { ENGLISH_MAP_ATTRIBUTION, ENGLISH_MAP_TILE_URL } from '../lib/mapTiles';
import { greenMarkerIcon } from '../lib/mapMarkerIcon';
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

  return <Marker position={selected} icon={greenMarkerIcon} />;
};

export const EmergencyRequestPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    productType: 'crops',
    quantity: '',
    latitude: -1.286389,
    longitude: 36.817223,
    locationName: '',
    radius: 50,
  });

  const marker = useMemo(() => [form.latitude, form.longitude], [form.latitude, form.longitude]);

  const useCurrentLocation = async () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    toast.custom((toastItem) => (
      <div className="w-full max-w-sm rounded-lg border border-[#20a46b] bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-[#1f1f1f]">Allow GPS access to use your current location?</p>
        <p className="mt-1 text-xs text-[#5a6b64]">
          Tap Allow to continue and approve location permission in your browser.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(toastItem);
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  let locationName = '';
                  try {
                    locationName = await reverseGeocode(lat, lng);
                  } catch (e) {
                    locationName = '';
                  }
                  setForm((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    locationName,
                  }));
                  toast.success('Location detected!');
                },
                () => {
                  setError('Could not access your GPS location. Try map selection instead.');
                },
                { enableHighAccuracy: true },
              );
            }}
            className="h-10 rounded-md bg-[#20a46b] px-3 text-sm font-semibold text-white"
          >
            Allow
          </button>
          <button
            type="button"
            onClick={() => toast.dismiss(toastItem)}
            className="h-10 rounded-md border border-[#d0d6d2] bg-white px-3 text-sm font-semibold text-[#334a41]"
          >
            Not now
          </button>
        </div>
      </div>
    ));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title || !form.productType || !form.quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!Number.isFinite(Number(form.latitude)) || !Number.isFinite(Number(form.longitude))) {
      setError('Please provide a valid location using GPS or map selection.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        productType: form.productType,
        quantity: form.quantity,
        latitude: form.latitude,
        longitude: form.longitude,
        locationName: form.locationName,
        radius: form.radius,
      };

      await emergencyRequestApi.create(payload);
      navigate('/marketplace');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create emergency request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#1f9f6a]">
        <span>Community</span>
        <ChevronRight size={14} />
        <span className="text-[#123327]">Emergency Request</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[#cfe3da] bg-[#f7fcfa] p-4 shadow-[0_8px_22px_-16px_rgba(2,38,27,0.8)]"
        >
          <h1 className="text-5xl leading-none font-black tracking-tight text-[#1f9f6a]">
            Post Emergency Request.
          </h1>

          <div className="rounded-lg border border-[#8ed7b5] bg-[#ecfaf3] p-3 mt-4 flex gap-2">
            <AlertCircle size={20} className="text-[#1f9f6a] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#d83c31]">Critical Need Alert</p>
              <p className="text-sm text-[#3f5f52] mt-1">
                This notifies all nearby farmers with high priority. Use only for genuine emergencies.
              </p>
            </div>
          </div>

          <section className="space-y-4 mt-4">
            <div className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
              <p className="text-2xl font-black text-[#1f9f6a]">What do you need?</p>

              <div className="mt-3 space-y-3">
                <Input
                  placeholder="Title (e.g., 'Need 500kg Maize for School Feeding')"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                  className="h-10"
                />

<div className="relative">
                <Input
                  placeholder="Product type (e.g., Maize, Rice, Potatoes)"
                  value={form.productType}
                  onChange={(event) => setForm({ ...form, productType: event.target.value })}
                  required
                  className="h-10 border-l-4 border-l-[#1f9f6a]"
                />
              </div>

                <Input
                  placeholder="Quantity needed (e.g., 500 kg)"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  required
                  className="h-10"
                />

                <textarea
                  placeholder="Additional details (urgency, use case, pickup arrangement, etc.)"
                  className="w-full rounded-xl border border-[#c9ddd4] bg-white p-3 text-sm font-semibold text-[#1d4536] outline-none min-h-24"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
              <p className="text-2xl font-black text-[#1f9f6a]">Search Radius</p>
              <p className="text-sm text-[#4a6e60] mt-1">Farmers within this distance will be notified</p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="number"
                  placeholder="Search radius (km)"
                  value={form.radius}
                  onChange={(event) => setForm({ ...form, radius: event.target.value })}
                  className="h-10"
                />
                <select
                  value={form.radius}
                  onChange={(event) => setForm({ ...form, radius: event.target.value })}
                  className="h-10 rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30]"
                >
                  <option value="25">25 km radius</option>
                  <option value="50">50 km radius</option>
                  <option value="100">100 km radius</option>
                  <option value="150">150 km radius</option>
                </select>
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-[#efc7c7] bg-[#fff2f2] px-3 py-2 text-sm font-semibold text-[#b11e1e]">
                {error}
              </p>
            ) : null}

          {/* Action buttons moved here to ensure submit works */}
          <div className="flex flex-wrap gap-2 border-t border-[#dbe9e3] pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-[#bed8cd] text-[#2f5c4d]"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg bg-[#d83c31] px-5 font-black text-white"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : '🚨 Post Emergency Request'}
            </Button>
          </div>
        </section>
      </form>


        <section className="space-y-4">
          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]">Location</p>
            <p className="mt-2 text-sm text-[#4a6e60]">Click on the map to set your location</p>

            <MapContainer
              center={marker}
              zoom={7}
              scrollWheelZoom={false}
              className="mt-3 h-64 rounded-xl border border-[#c9ddd4] overflow-hidden"
              attributionControl={false}
              style={{ zIndex: 0, position: 'relative' }}
            >
              <TileLayer url={ENGLISH_MAP_TILE_URL} />
              <LocationPicker selected={marker} setSelected={(coords) => setForm({ ...form, latitude: coords[0], longitude: coords[1] })} />
            </MapContainer>

            <button
              type="button"
              onClick={useCurrentLocation}
              className="mt-3 h-10 w-full rounded-lg border border-[#1f9f6a] bg-[#f0faf7] px-4 font-bold text-[#1f9f6a] hover:bg-[#e0f5f0]"
            >
              📍 Use My Current Location
            </button>

            <div className="mt-4 rounded-lg border border-[#d8e7e1] bg-[#f8fcfb] p-3">
              <p className="font-bold text-[#203f33]">Current Location</p>
              <p className="text-xs text-[#4a6e60] mt-1">
                {form.locationName
                  ? form.locationName
                  : `Lat: ${form.latitude.toFixed(4)} | Lng: ${form.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#a8d5bd] bg-[#e8f8f1] p-4">
            <p className="text-lg leading-none font-black text-[#0f3d2f]">How It Works</p>
            <div className="mt-3 space-y-2 text-sm text-[#0f3d2f]">
              <div className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Post your emergency need with location and radius</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Nearby farmers receive high-priority notifications</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Farmers claim your request with available quantity</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Arrange pickup and fulfill the supply chain need</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
