import { useEffect, useMemo, useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
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
import { greenMarkerIcon } from '../lib/mapMarkerIcon';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const LocationPicker = ({ selected, setSelected }) => {
  useMapEvents({
    click(event) {
      // Debug log
      console.log('Map clicked at:', event.latlng);
      setSelected([event.latlng.lat, event.latlng.lng]);
    },
  });

  // Always render a marker if possible, fallback to Nairobi if undefined
  const markerPos = selected && Array.isArray(selected) && selected.length === 2
    ? selected
    : [-1.286389, 36.817223];

  return <Marker position={markerPos} icon={greenMarkerIcon} />;
};

const DRAFT_STORAGE_KEY = 'cropconnect_create_listing_draft';
const MAX_LISTING_IMAGES = 4;

const CATEGORY_OPTIONS = [
  { label: 'Crop', value: 'crop' },
  { label: 'Livestock', value: 'livestock' },
  { label: 'Grain', value: 'grain' },
  { label: 'Vegetable', value: 'vegetable' },
  { label: 'Fruit', value: 'fruit' },
];

const UNIT_OPTIONS = ['Kgs', 'Pieces', 'Bags', 'Tons', 'Bunches'];

const DEFAULT_FORM_STATE = {
  title: '',
  description: '',
  category: 'crop',
  quantity: '',
  price: '',
  location: '',
  latitude: -1.286389,
  longitude: 36.817223,
  roadAccess: 'open',
  image: null,
  imageUrl: '',
};

// Utility: Convert a File to a Data URL (for image preview)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error('Invalid file type.'));
      return;
    }
    const reader = new window.FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

const toListingImageFromRemote = (url) => ({
  previewUrl: url,
  remoteUrl: url,
  file: null,
  source: 'remote',
});

// Utility to check if there is any content worth saving as a draft
function hasDraftContent(form, productSearch, images) {
  const hasFormContent = Object.entries(form).some(([key, value]) => {
    if (key === 'latitude' || key === 'longitude' || key === 'image' || key === 'imageUrl') return false;
    if (typeof value === 'string') {
      return value.trim() !== '' && value !== (key === 'category' ? 'crop' : '');
    }
    return value !== '' && value != null;
  });
  const hasProductSearch = typeof productSearch === 'string' && productSearch.trim() !== '';
  const hasImages = Array.isArray(images) && images.length > 0;
  return hasFormContent || hasProductSearch || hasImages;
}

const CURRENCY_OPTIONS = [
  { code: 'KES', label: 'Kenyan Shilling', locale: 'en-KE', symbol: 'Ksh' },
  { code: 'USD', label: 'US Dollar', locale: 'en-US', symbol: '$' },
  { code: 'EUR', label: 'Euro', locale: 'en-IE', symbol: '€' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN', symbol: '₹' },
];

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [unit, setUnit] = useState('Kgs');
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };
  const [draftImages, setDraftImages] = useState([]);
  const [listingImages, setListingImages] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM_STATE);
  const [locationMode, setLocationMode] = useState('map');
  
  // Always provide a valid marker array
  const marker = useMemo(() => {
    if (
      typeof form.latitude === 'number' &&
      typeof form.longitude === 'number' &&
      !isNaN(form.latitude) &&
      !isNaN(form.longitude)
    ) {
      return [form.latitude, form.longitude];
    }
    return [-1.286389, 36.817223];
  }, [form.latitude, form.longitude]);

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

  const primaryImagePreview = listingImages[0]?.previewUrl || null;

  useEffect(() => {
    const loadEditProduct = async () => {
      if (!editId) return;
      
      try {
        const response = await productApi.details(editId);
        const item = response.data.data;
        
        const existingImages = (Array.isArray(item.imageUrls) && item.imageUrls.length
          ? item.imageUrls
          : item.imageUrl
            ? [item.imageUrl]
            : []
        )
          .slice(0, MAX_LISTING_IMAGES)
          .map((url) => toListingImageFromRemote(url));
        
        setListingImages(existingImages);
        setDraftImages(existingImages.map(img => ({ source: 'remote', remoteUrl: img.remoteUrl })));
        
        setForm({
          title: item.title || '',
          description: item.description || '',
          category: item.category || item.productType || 'crop',
          quantity: item.quantity?.toString() || '',
          price: item.price?.toString() || '',
          location: item.location || item.locationName || '',
          latitude: item.latitude || -1.286389,
          longitude: item.longitude || 36.817223,
          roadAccess: item.roadAccess || item.pathAccessibility || 'open',
          image: null,
          imageUrl: existingImages[0]?.remoteUrl || '',
        });
        
        setProductSearch(item.title || '');
        if (item.unit) setUnit(item.unit);
      } catch (error) {
        toast.error('Failed to load product for editing');
      }
    };
    
    loadEditProduct();
    
    // Restore draft logic
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft && !editId) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.form) {
          setForm(prev => ({ ...prev, ...draft.form }));
        }
        if (draft.productSearch) {
          setProductSearch(draft.productSearch);
        }
        if (draft.unit) {
          setUnit(draft.unit);
        }
        if (draft.draftImages && draft.draftImages.length > 0) {
          const restoredImages = draft.draftImages.map(img => {
            if (img.source === 'remote') {
              return toListingImageFromRemote(img.remoteUrl);
            } else if (img.source === 'local' && img.dataUrl) {
              return {
                previewUrl: img.dataUrl,
                remoteUrl: '',
                file: null,
                source: 'local',
              };
            }
            return null;
          }).filter(Boolean);
          setListingImages(restoredImages);
          setDraftImages(draft.draftImages);
        }
        toast.info('Draft restored');
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  }, [editId]);

  // Sync productSearch with form.title
  useEffect(() => {
    if (form.title && form.title !== productSearch) {
      setProductSearch(form.title);
    }
  }, [form.title]);

  // Sync form.title with productSearch
  useEffect(() => {
    if (productSearch && productSearch !== form.title) {
      setForm(prev => ({ ...prev, title: productSearch }));
    }
  }, [productSearch]);

  useEffect(() => {
    if (editId) return;
    if (!hasDraftContent(form, productSearch, draftImages)) return;

    const draftPayload = {
      form: {
        ...form,
        image: null,
      },
      draftImages,
      productSearch,
      unit,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
    } catch {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            ...draftPayload,
            draftImages: [],
          }),
        );
        toast.info('Draft saved, but some images were too large to keep offline.');
      } catch {
        // Ignore storage failures in background autosave.
      }
    }
  }, [draftImages, editId, form, productSearch, unit]);

  const syncDraftImages = (nextListingImages) => {
    setDraftImages(
      nextListingImages.map((item) =>
        item.source === 'remote'
          ? {
              source: 'remote',
              remoteUrl: item.remoteUrl,
            }
          : {
              source: 'local',
              dataUrl: item.previewUrl,
              fileName: item.file?.name || 'listing-image.jpg',
              mimeType: item.file?.type || 'image/jpeg',
              lastModified: item.file?.lastModified || Date.now(),
            },
      ),
    );
  };

  const removeImageAt = (index) => {
    const nextListingImages = listingImages.filter((_, itemIndex) => itemIndex !== index);
    setListingImages(nextListingImages);
    syncDraftImages(nextListingImages);
    setForm((prev) => ({
      ...prev,
      imageUrl: nextListingImages[0]?.remoteUrl || '',
    }));
  };

  const MAX_IMAGE_SIZE_MB = 5;
  
  const handleImageSelectionAt = async (index, file) => {
    if (!file) return;

    console.log('Selected file:', file);

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image is too large. Please select an image under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    if (index >= MAX_LISTING_IMAGES) {
      toast.error(`Maximum ${MAX_LISTING_IMAGES} images allowed`);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const imageEntry = {
        previewUrl: dataUrl,
        remoteUrl: '',
        file: file,
        source: 'local',
      };

      const nextListingImages = [...listingImages];

      if (nextListingImages[index]) {
        nextListingImages[index] = imageEntry;
      } else {
        // If index is beyond current length, push to array
        while (nextListingImages.length <= index) {
          nextListingImages.push(null);
        }
        nextListingImages[index] = imageEntry;
      }

      // Filter out null values and keep only valid images
      const trimmedImages = nextListingImages.filter(img => img !== null).slice(0, MAX_LISTING_IMAGES);
      
      console.log('Images after selection:', trimmedImages);
      
      setListingImages(trimmedImages);
      syncDraftImages(trimmedImages);
      setForm((prev) => ({ ...prev, imageUrl: trimmedImages[0]?.remoteUrl || '' }));
      
      toast.success('Image added successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Selected image preview could not be saved. Try a smaller image.');
    }
  };

  const addImageFromPicker = async (file) => {
    if (!file) return;

    console.log('Adding image from picker:', file);

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image is too large. Please select an image under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    if (listingImages.length >= MAX_LISTING_IMAGES) {
      toast.info('You can upload up to 4 photos per crop.');
      return;
    }

    await handleImageSelectionAt(listingImages.length, file);
  };

  const onSaveDraft = () => {
    if (!hasDraftContent(form, productSearch, draftImages)) {
      toast.info('Add listing details before saving a draft.');
      return;
    }

    try {
      const draftPayload = {
        form: {
          ...form,
          image: null,
        },
        draftImages,
        productSearch,
        unit,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      toast.success('Draft saved. You can continue later.');
    } catch {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            form: {
              ...form,
              image: null,
            },
            draftImages: [],
            productSearch,
            unit,
            savedAt: new Date().toISOString(),
          }),
        );
        toast.info('Draft saved, but some images were too large to keep offline.');
      } catch {
        toast.error('Could not save draft on this device.');
      }
    }
  };

  const requestCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      toast.error('GPS is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Update form with coordinates
        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        
        toast.success('GPS location captured.');

        // Try to get actual address from coordinates (reverse geocoding)
        try {
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'AgriFlow-App'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Format a nice location name
            let locationName = '';
            
            if (data.address) {
              const parts = [];
              if (data.address.road) parts.push(data.address.road);
              if (data.address.suburb) parts.push(data.address.suburb);
              if (data.address.town || data.address.city || data.address.village) {
                parts.push(data.address.town || data.address.city || data.address.village);
              }
              if (data.address.county) parts.push(data.address.county);
              if (data.address.country) parts.push(data.address.country);
              
              locationName = parts.join(', ');
            }
            
            if (!locationName) {
              locationName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
            
            // Update the location field with the address
            setForm((prev) => ({
              ...prev,
              location: locationName,
            }));
            
            toast.success('Location address found!');
          } else {
            throw new Error('Reverse geocoding failed');
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Fallback to coordinates
          setForm((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
          toast.info('Using coordinates as location name');
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setError('Could not access your GPS location. Try map selection instead.');
        toast.error('Location permission denied or unavailable.');
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const useCurrentLocation = () => {
    toast.custom(
      (toastItem) => (
        <div className="w-full max-w-sm rounded-lg border border-[#20a46b] bg-white p-4 shadow-sm">
          <p className="text-sm font-black text-[#1f1f1f]">Allow GPS access for this listing?</p>
          <p className="mt-1 text-xs text-[#5a6b64]">
            Tap Allow now to continue and approve location permission in your browser.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(toastItem)}
              className="h-10 rounded-md border border-[#d0d6d2] bg-white px-3 text-sm font-semibold text-[#334a41]"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(toastItem);
                requestCurrentLocation();
              }}
              className="h-10 rounded-md bg-[#20a46b] px-3 text-sm font-semibold text-white"
            >
              Allow now
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Enhanced validation with better checks
    console.log('Form state before validation:', form);

    const requiredFields = {
      title: 'Title',
      category: 'Product Type',
      quantity: 'Quantity',
      price: 'Price',
      location: 'Location',
    };

    const missingFields = [];

    Object.entries(requiredFields).forEach(([key, label]) => {
      const value = form[key];
      
      if (value === undefined || value === null) {
        missingFields.push(label);
        console.warn(`Field ${key} is undefined or null`);
      } else if (typeof value === 'string' && value.trim() === '') {
        missingFields.push(label);
        console.warn(`Field ${key} is empty string`);
      } else if (typeof value === 'number' && (isNaN(value) || value <= 0)) {
        if (key === 'quantity' || key === 'price') {
          missingFields.push(label);
          console.warn(`Field ${key} has invalid number:`, value);
        }
      }
    });

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      console.error('Missing fields:', missingFields);
      console.error('Current form state:', form);
      return;
    }

    // Validate numbers
    const quantityNum = Number(form.quantity);
    const priceNum = Number(form.price);
    const latNum = Number(form.latitude);
    const lngNum = Number(form.longitude);

    if (!Number.isFinite(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) || 
        latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setError('Please provide a valid location using GPS or map selection.');
      return;
    }

    // Check if there are any images
    if (listingImages.length === 0) {
      setError('Please add at least 1 listing photo before publishing.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();

      // Append form fields with correct API field names
      payload.append('title', form.title);
      payload.append('description', form.description || '');
      payload.append('productType', form.category);
      payload.append('quantity', Number(form.quantity));
      payload.append('price', Number(form.price));
      payload.append('locationName', form.location);
      payload.append('latitude', Number(form.latitude));
      payload.append('longitude', Number(form.longitude));
      payload.append('pathAccessibility', form.roadAccess);
      payload.append('unitLabel', unit);

      // Handle images - FIXED
      const uploadedFiles = listingImages
        .filter((item) => item.source === 'local' && item.file)
        .map((item) => item.file);
      
      console.log('Uploaded files:', uploadedFiles);

      // Append new images
      if (uploadedFiles.length > 0) {
        uploadedFiles.slice(0, MAX_LISTING_IMAGES).forEach((file, index) => {
          payload.append('images', file);
          console.log(`Appending image ${index + 1}:`, file.name, 'Size:', file.size);
        });
      } else {
        console.warn('No local files to upload');
      }

      // Handle existing remote images
      const retainedRemoteUrls = listingImages
        .filter((item) => item.source === 'remote' && item.remoteUrl)
        .map((item) => item.remoteUrl);

      if (retainedRemoteUrls.length > 0) {
        payload.append('imageUrls', JSON.stringify(retainedRemoteUrls));
        console.log('Appending existing URLs:', retainedRemoteUrls);
      }

      // Log the complete payload for debugging
      console.log('=== Form Data being sent ===');
      let hasImages = false;
      for (let [key, value] of payload.entries()) {
        if (key === 'images' && value instanceof File) {
          hasImages = true;
          console.log(key, `File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, value);
        }
      }

      if (!hasImages && retainedRemoteUrls.length === 0) {
        throw new Error('No images found in payload');
      }

      // Make the API call
      let response;
      if (editId) {
        response = await productApi.update(editId, payload);
      } else {
        response = await productApi.create(payload);
      }

      console.log('API Response:', response);

      // Success - remove draft and redirect
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftImages([]);
      toast.success('Listing saved successfully!');
      navigate('/dashboard');

    } catch (apiError) {
      console.error('=== API Error Details ===');
      console.error('Error object:', apiError);
      console.error('Response status:', apiError.response?.status);
      console.error('Response data:', apiError.response?.data);
      console.error('Response headers:', apiError.response?.headers);
      
      // Show specific error message from server
      const serverMessage = apiError.response?.data?.message || 
                           apiError.response?.data?.error || 
                           apiError.message ||
                           'Failed to save listing. Please check all fields and try again.';
      setError(serverMessage);
      
      if (apiError.response?.data?.errors) {
        console.error('Validation errors:', apiError.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = Number(form.quantity || 0) * Number(form.price || 0);
  const headlineValue = form.title || productSearch || '';
  const quantityError = form.quantity && Number(form.quantity) <= 0 ? 'Quantity must be positive.' : '';

  const selectSuggestion = (value) => {
    console.log('Selecting suggestion:', value);
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
                    {primaryImagePreview ? (
                      <div className="relative flex h-32 w-full items-center justify-center rounded-xl border border-[#dbe8e2] bg-[#f4faf7] p-1.5">
                        {listingImages.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => removeImageAt(0)}
                            className="absolute right-1 top-1 z-10 text-xs font-black leading-none text-red-600 hover:text-red-700"
                            aria-label="Remove selected image"
                          >
                            X
                          </button>
                        ) : null}
                        <img
                          src={primaryImagePreview}
                          alt="Crop preview"
                          className="h-full w-full rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#c8ddd4] bg-[#f6fbf9] text-xs font-semibold text-[#52786a]">
                        No image yet
                      </div>
                    )}
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#c8ddd4] bg-[#f6fbf9] text-[#52786a]">
                      <Upload size={16} />
                      <span className="text-xs font-bold">Add preview</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            addImageFromPicker(file);
                          }
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder="Headline"
                      value={form.title || productSearch || ''}
                      onChange={(event) => {
                        const newTitle = event.target.value;
                        console.log('Title changed to:', newTitle);
                        setForm((prev) => ({ ...prev, title: newTitle }));
                        setProductSearch(newTitle);
                      }}
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
                    
                    {/* Unit Dropdown - Only One! */}
                    <div className="w-full">
                      <Listbox value={unit} onChange={setUnit}>
                        <div className="relative">
                          <Listbox.Button className="h-10 w-full rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30] text-left flex items-center justify-between">
                            {unit}
                            <span className="ml-2">▼</span>
                          </Listbox.Button>
                          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {UNIT_OPTIONS.map((option, idx, arr) => (
                                <Listbox.Option
                                  key={option}
                                  className={({ active }) => {
                                    let base = 'cursor-pointer select-none px-4 py-2 text-sm font-semibold';
                                    let rounded = '';
                                    if (idx === 0) rounded += ' rounded-t-xl';
                                    if (idx === arr.length - 1) rounded += ' rounded-b-xl';
                                    let color = active ? 'bg-[#20a46b] text-white' : 'text-[#193f30]';
                                    return `${base}${rounded} ${color}`;
                                  }}
                                  value={option}
                                >
                                  {option}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-3">
                  <p className="text-4xl leading-none font-black text-[#1f9f6a]">Define Your Harvest & Price.</p>

                  {/* Category Dropdown */}
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-[#2f6152] mb-1">Category</label>
                    <Listbox value={form.category} onChange={val => setForm({ ...form, category: val })}>
                      <div className="relative">
                        <Listbox.Button className="h-10 w-full rounded-xl border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30] text-left flex items-center justify-between">
                          {CATEGORY_OPTIONS.find(opt => opt.value === form.category)?.label || 'Select Category'}
                          <span className="ml-2">▼</span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {CATEGORY_OPTIONS.map((option, idx, arr) => (
                              <Listbox.Option
                                key={option.value}
                                className={({ active }) => {
                                  let base = 'cursor-pointer select-none px-4 py-2 text-sm font-semibold';
                                  let rounded = '';
                                  if (idx === 0) rounded += ' rounded-t-xl';
                                  if (idx === arr.length - 1) rounded += ' rounded-b-xl';
                                  let color = active ? 'bg-[#20a46b] text-white' : 'text-[#193f30]';
                                  return `${base}${rounded} ${color}`;
                                }}
                                value={option.value}
                              >
                                {option.label}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-black text-[#143629]">Quantity</p>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <Input
                          placeholder="Total Quantity"
                          value={form.quantity}
                          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                          className="h-10"
                          required
                        />
                      </div>
                      {quantityError ? (
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#ba2a2a]">
                          <AlertCircle size={13} /> {quantityError}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-2xl font-black text-[#143629]">Price (per {unit})</p>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <Input
                          type="number"
                          placeholder="Price per Unit"
                          value={form.price}
                          onChange={(event) => setForm({ ...form, price: event.target.value })}
                          className="h-10"
                          required
                        />
                        <Input 
                          value={totalValue ? `${formatCurrency(totalValue)}` : formatCurrency(0)} 
                          readOnly 
                          className="h-10 bg-gray-50" 
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#2f6152]">Road Accessibility Status</p>
                      <select
                        value={form.roadAccess}
                        onChange={(event) =>
                          setForm({ ...form, roadAccess: event.target.value })
                        }
                        className="mt-1 h-10 w-full rounded-xl border border-[#c9ddd4] bg-white px-3 text-sm font-semibold text-[#193f30]"
                      >
                        <option value="open">🟢 Road is Open</option>
                        <option value="flooded">🔴 Road is Flooded</option>
                        <option value="trucks_only">🟡 Trucks Only</option>
                      </select>
                      <p className="mt-1 text-xs text-[#4a6e60]">Help buyers know if they can reach your farm during emergencies</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-[#efc7c7] bg-[#fff2f2] px-3 py-2 text-sm font-semibold text-[#b11e1e]">
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#dbe9e3] pt-4">
            <Button type="button" variant="outline" className="h-10 rounded-lg border-[#8cc8ae] text-[#1e6f4f]">
              Next Step: Visuals & Description
            </Button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4">
            <p className="text-4xl leading-none font-black text-[#1f9f6a]">Visuals</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: MAX_LISTING_IMAGES }, (_, slotIndex) => {
                const slotImage = listingImages[slotIndex] || null;

                if (slotImage) {
                  return (
                    <div
                      key={`image-slot-${slotIndex}`}
                      className="relative flex h-32 w-full items-center justify-center rounded-xl border border-[#c8ddd4] bg-[#f4faf7] p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => removeImageAt(slotIndex)}
                        className="absolute right-1 top-1 z-10 text-xs font-black leading-none text-red-600 hover:text-red-700"
                        aria-label={`Remove image ${slotIndex + 1}`}
                      >
                        X
                      </button>
                      <img
                        src={slotImage.previewUrl}
                        alt={`Crop visual ${slotIndex + 1}`}
                        className="h-full w-full rounded-lg object-contain"
                      />
                    </div>
                  );
                }

                return (
                  <label
                    key={`image-slot-${slotIndex}`}
                    className="flex h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#c8ddd4] bg-[#f9fdfb] text-[#5a7f72]"
                  >
                    <Camera size={19} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleImageSelectionAt(slotIndex, file);
                        }
                        event.target.value = '';
                      }}
                    />
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-sm font-bold text-[#315d4f]">
              You can upload up to {MAX_LISTING_IMAGES} photos. Minimum required is 1.
            </p>

            <p className="mt-4 text-4xl leading-none font-black text-[#1f9f6a]">Description</p>
            <textarea
              placeholder="Describe your produce, trust signals, and pickup plan."
              className="mt-3 min-h-26 w-full rounded-xl border border-[#c9ddd4] bg-white p-3 text-sm font-semibold text-[#1d4536] outline-none"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
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
                  placeholder="Location name (e.g., Nairobi, Karen)"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  required
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

              {/* Fixed Map Container with proper z-index */}
              <div className="overflow-hidden rounded-xl border border-[#c7ddd3] relative" style={{ zIndex: 1 }}>
                <div className="flex items-center justify-between border-b border-[#d8e8e2] bg-white px-3 py-2 relative" style={{ zIndex: 2 }}>
                  <p className="font-black text-[#214538]">Set Pickup Location</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf3e8] px-2 py-1 text-xs font-black text-[#15714d]">
                    <Check size={13} /> Location Set
                  </span>
                </div>
                <div className="h-60 w-full relative" style={{ zIndex: 1 }}>
                  <MapContainer 
                    center={marker} 
                    zoom={8} 
                    className="h-full w-full" 
                    attributionControl={false}
                    style={{ 
                      zIndex: 1,
                      position: 'relative'
                    }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url={ENGLISH_MAP_TILE_URL}
                    />
                    <LocationPicker
                      selected={marker}
                      setSelected={(next) => {
                        // Debug log
                        console.log('Setting marker and form lat/lng:', next);
                        setForm((prev) => ({
                          ...prev,
                          latitude: next[0],
                          longitude: next[1],
                        }));
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[#d8e8e2] pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-[#bed8cd] text-[#2f5c4d]"
              onClick={onSaveDraft}
              disabled={submitting}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              form="create-listing-form"
              className="h-10 rounded-lg bg-[#1f9f6a] px-5 font-black"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editId ? 'Update Listing' : 'Post Listing'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};