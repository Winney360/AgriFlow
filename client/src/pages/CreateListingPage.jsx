import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import {
  AlertCircle,
  Camera,
  Check,
  List,
  MapPin,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi } from '../lib/api';
import { ENGLISH_MAP_ATTRIBUTION, ENGLISH_MAP_TILE_URL } from '../lib/mapTiles';
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
  const [productSearch, setProductSearch] = useState('');
  const [unitLabel, setUnitLabel] = useState('Kgs');


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
    pathAccessibility: 'open',
  });

  const [locationMode, setLocationMode] = useState('map');
  const marker = useMemo(() => [form.latitude, form.longitude], [form.latitude, form.longitude]);

  const productSuggestions = [
    'Hybrid Maize (White)',
    'Local Yellow Maize',
    'Popcorn Maize',
    'Sweet Corn',
    'Irish Potatoes',
    'Sweet Potatoes',
    'Tomatoes',
    'Kale (Sukuma Wiki)',
    'Cabbage',
    'Onions',
    'Capsicum',
    'Spinach',
    'Beans',
    'Green Grams',
    'Sorghum',
    'Cassava',
    'Milk Cow',
    'Chicken (Broilers)',
  ];

  const imagePreview = form.image
    ? URL.createObjectURL(form.image)
    : form.imageUrl || null;

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
        pathAccessibility: item.pathAccessibility || 'open',
      }));
      setProductSearch(item.title || '');
      setUnitLabel(String(item.quantity || '').toLowerCase().includes('bag') ? 'Bags' : 'Kgs');
    };

    loadEditProduct().catch(() => null);
  }, [editId]);

  useEffect(() => {
    if (!form.title && productSearch) {
      setForm((prev) => ({ ...prev, title: productSearch }));
    }
  }, [productSearch, form.title]);

  const requestCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      toast.error('GPS is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success('GPS location captured.');
      },
      () => {
        setError('Could not access your GPS location. Try map selection instead.');
        toast.error('Location permission denied or unavailable.');
      },
      { enableHighAccuracy: true },
    );
  };

  const useCurrentLocation = () => {
    toast('Allow GPS access for this listing?', {
      description: 'Tap Allow now to continue and approve location permission in your browser.',
      action: {
        label: 'Allow now',
        onClick: () => requestCurrentLocation(),
      },
      cancel: {
        label: 'Not now',
      },
      duration: 7000,
    });
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
      if (unitLabel) {
        payload.append('unitLabel', unitLabel);
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

  const totalValue = Number(form.quantity || 0) * Number(form.price || 0);
  const headlineValue = form.title || productSearch || 'Untitled listing';
  const quantityError = form.quantity && Number(form.quantity) <= 0 ? 'Quantity is too low.' : '';

  const selectSuggestion = (value) => {
    setProductSearch(value);
    setForm((prev) => ({ ...prev, title: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <form
          id="create-listing-form"
          onSubmit={onSubmit}
          className="rounded-2xl border border-[#cfe3da] bg-[#f7fcfa] p-4 shadow-[0_8px_22px_-16px_rgba(2,38,27,0.8)]"
        >
          <h1 className="text-5xl leading-none font-black tracking-tight text-[#1f9f6a]">
            {editId ? 'Edit Listing.' : 'Create Listing.'}
          </h1>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[11rem_1fr]">
            <aside className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
              <p className="text-lg font-black text-[#1f9f6a]">Steps</p>
              <div className="mt-2 space-y-2 text-sm font-bold text-[#315f50]">
                {['Details', 'Quantity & Price', 'Visuals & Description', 'Location', 'Review & Post'].map(
                  (step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e4f1ec] text-[#187a55]">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ),
                )}
              </div>
            </aside>

            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_1fr]">
                <div className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
                  <p className="text-lg font-black text-[#1f9f6a]">Product Selection</p>
                  <label className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3">
                    <Search size={16} className="text-[#638a7b]" />
                    <input
                      className="h-full w-full bg-transparent text-sm font-semibold outline-none"
                      placeholder="Search crop"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                    />
                  </label>

                  <div className="mt-2 rounded-xl border border-[#dbe8e2] bg-[#fbfefd] p-2">
                    {productSuggestions
                      .filter((item) =>
                        productSearch.trim()
                          ? item.toLowerCase().includes(productSearch.toLowerCase().trim())
                          : true,
                      )
                      .slice(0, 3)
                      .map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectSuggestion(item)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-[#255040] hover:bg-[#eef7f3]"
                        >
                          <span className="h-3 w-3 rounded-sm bg-[#3bb77e]" />
                          {item}
                        </button>
                      ))}
                  </div>

                  <Button
                    type="button"
                    className="mt-3 h-10 w-full rounded-lg bg-[#1f9f6a] text-sm font-black"
                    onClick={() => selectSuggestion(productSearch || 'Custom Crop')}
                  >
                    <Plus size={15} /> Add Custom Crop
                  </Button>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {imagePreview ? (
                      <div className="flex h-24 w-full items-center justify-center rounded-xl border border-[#dbe8e2] bg-white p-1">
                        <img
                          src={imagePreview}
                          alt="Crop preview"
                          className="h-full w-full rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[#c8ddd4] bg-[#f6fbf9] text-xs font-semibold text-[#52786a]">
                        No image yet
                      </div>
                    )}
                    <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#c8ddd4] bg-[#f6fbf9] text-[#52786a]">
                      <Upload size={16} />
                      <span className="text-xs font-bold">Add preview</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setForm({ ...form, image: event.target.files?.[0] || null })
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder="Headline"
                      value={headlineValue}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      required
                      className="h-10"
                    />
                    <Input
                      placeholder="Total Quantity"
                      value={form.quantity}
                      onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                      className="h-10"
                      required
                    />
                    <select
                      className="h-10 rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30]"
                      value={unitLabel}
                      onChange={(event) => setUnitLabel(event.target.value)}
                    >
                      <option value="Kgs">Kgs</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Bags">Bags</option>
                      <option value="Tons">Tons</option>
                      <option value="Bunches">Bunches</option>
                    </select>

                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
                  <p className="text-4xl leading-none font-black text-[#1f9f6a]">Define Your Harvest & Price.</p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-2xl font-black text-[#143629]">Quantity</p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Input
                          placeholder="Total Quantity"
                          value={form.quantity}
                          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                          className="h-10"
                          required
                        />
                        <select
                          className="h-10 rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30]"
                          value={unitLabel}
                          onChange={(event) => setUnitLabel(event.target.value)}
                        >
                          <option value="Kgs">Kgs</option>
                          <option value="Pieces">Pieces</option>
                          <option value="Bags">Bags</option>
                          <option value="Tons">Tons</option>
                          <option value="Bunches">Bunches</option>
                        </select>
                      </div>
                      {quantityError ? (
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#ba2a2a]">
                          <AlertCircle size={13} /> {quantityError}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-2xl font-black text-[#143629]">Price</p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Input
                          type="number"
                          placeholder="Price per Unit"
                          value={form.price}
                          onChange={(event) => setForm({ ...form, price: event.target.value })}
                          className="h-10"
                          required
                        />
                        <Input value={totalValue ? `Ksh ${totalValue.toLocaleString()}` : 'Ksh 0'} readOnly className="h-10" />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#2f6152]">Road Accessibility Status</p>
                      <select
                        value={form.pathAccessibility}
                        onChange={(event) =>
                          setForm({ ...form, pathAccessibility: event.target.value })
                        }
                        className="mt-1 h-10 w-full rounded-xl border border-[#c9ddd4] bg-white px-3 text-sm font-semibold text-[#193f30]"
                      >
                        <option value="open">🟢 Road is Open</option>
                        <option value="flooded">🔴 Road is Flooded</option>
                        <option value="trucks_only">🟡 Trucks Only</option>
                      </select>
                      <p className="mt-1 text-xs text-[#4a6e60]">Help buyers know if they can reach your farm during emergencies</p>
                    </div>

                    <div className="rounded-xl border border-[#d8e7e1] bg-[#f8fcfb] p-3">
                      <p className="text-xl leading-tight font-black text-[#203f33]">
                        Price & Unit data will be linked for local trust and visible JWT validation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-[#efc7c7] bg-[#fff2f2] px-3 py-2 text-sm font-semibold text-[#b11e1e]">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#dbe9e3] pt-4">
            <Button type="button" variant="outline" className="h-10 rounded-lg border-[#8cc8ae] text-[#1e6f4f]">
              Next Step: Visuals & Description
            </Button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]">Visuals</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {imagePreview ? (
                <div className="col-span-2 flex h-28 w-full items-center justify-center rounded-xl border border-[#c8ddd4] bg-white p-1">
                  <img src={imagePreview} alt="Crop visual" className="h-full w-full rounded-lg object-contain" />
                </div>
              ) : (
                <div className="col-span-2 flex h-28 items-center justify-center rounded-xl border border-dashed border-[#c8ddd4] bg-[#f9fdfb] text-xs font-semibold text-[#5a7f72]">
                  No image uploaded
                </div>
              )}
              {[1, 2].map((slot) => (
                <label
                  key={slot}
                  className="flex h-28 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#c8ddd4] bg-[#f9fdfb] text-[#5a7f72]"
                >
                  <Camera size={19} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })}
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm font-bold text-[#315d4f]">
              Reminder: Photos of the actual crop required for verification.
            </p>

            <p className="mt-4 text-4xl leading-none font-black text-[#1f9f6a]">Description</p>
            <textarea
              placeholder="Describe your produce, trust signals, and pickup plan."
              className="mt-3 min-h-26 w-full rounded-xl border border-[#c9ddd4] bg-white p-3 text-sm font-semibold text-[#1d4536] outline-none"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]">Location</p>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[0.9fr_1.2fr]">
              <div className="rounded-xl border border-[#d6e8df] bg-[#ecf6f1] p-3">
                <p className="text-4xl leading-none font-black text-[#123225]">Set Pickup Location.</p>
                <p className="mt-2 text-lg leading-tight font-bold text-[#2d5a4b]">
                  GPS location acquired. Manual address and map pin supported.
                </p>
                <Input
                  className="mt-3 h-10 bg-white"
                  placeholder="Location name"
                  value={form.locationName}
                  onChange={(event) => setForm({ ...form, locationName: event.target.value })}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={locationMode === 'gps' ? 'primary' : 'outline'}
                    className="rounded-lg"
                    onClick={() => {
                      setLocationMode('gps');
                      useCurrentLocation();
                    }}
                  >
                    <MapPin size={14} /> Use GPS
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={locationMode === 'map' ? 'primary' : 'outline'}
                    className="rounded-lg"
                    onClick={() => setLocationMode('map')}
                  >
                    <List size={14} /> Pick on Map
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#c7ddd3]">
                <div className="flex items-center justify-between border-b border-[#d8e8e2] bg-white px-3 py-2">
                  <p className="font-black text-[#214538]">Set Pickup Location</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf3e8] px-2 py-1 text-xs font-black text-[#15714d]">
                    <Check size={13} /> GPS Location acquired
                  </span>
                </div>
                <div className="h-60">
                  <MapContainer center={marker} zoom={8} className="h-full w-full" attributionControl={false}>
                    <TileLayer
                      url={ENGLISH_MAP_TILE_URL}
                    />
                    <LocationPicker
                      selected={marker}
                      setSelected={(next) =>
                        setForm((prev) => ({ ...prev, latitude: next[0], longitude: next[1] }))
                      }
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[#d8e8e2] pt-4">
            <Button type="button" variant="outline" className="h-10 rounded-lg border-[#bed8cd] text-[#2f5c4d]">
              Previous (disabled)
            </Button>
            <Button type="button" variant="outline" className="h-10 rounded-lg border-[#bed8cd] text-[#2f5c4d]">
              Save Draft
            </Button>
            <Button type="button" variant="outline" className="h-10 rounded-lg border-[#8cc8ae] text-[#1e6f4f]">
              Next Step: Visuals & Description
            </Button>
            <Button
              type="submit"
              form="create-listing-form"
              className="h-10 rounded-lg bg-[#1f9f6a] px-5 font-black"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editId ? 'Confirm and Update Listing' : 'Confirm and POST Listing'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
