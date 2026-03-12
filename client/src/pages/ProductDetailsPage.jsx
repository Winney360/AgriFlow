import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { productApi } from '../lib/api';
import { formatCurrency, normalizePhoneForWhatsApp } from '../lib/utils';

const fallbackRelated = [
  {
    _id: 'r-1',
    title: 'Maize for Sale',
    price: 4200,
    productType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1601593768799-76ea57f57b61?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'r-2',
    title: 'Other Tomato',
    price: 700,
    productType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b32?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'r-3',
    title: 'Onions',
    price: 4200,
    productType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1585518419759-87f7ee49f9b2?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'r-4',
    title: 'Beans Beans',
    price: 8750,
    productType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'r-5',
    title: 'Bea...',
    price: 4300,
    productType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-ac5bc9c5d4c0?auto=format&fit=crop&w=200&q=80',
  },
];

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await productApi.details(id);
        setProduct(response.data.data);
      } catch {
        setProduct(null);
      }
    };

    const fetchRelated = async () => {
      try {
        const response = await productApi.listActive();
        setRelatedProducts(response.data.data?.slice(0, 5) || fallbackRelated);
      } catch {
        setRelatedProducts(fallbackRelated);
      }
    };

    fetchDetails();
    fetchRelated();
  }, [id]);

  if (!product) {
    return <p className="py-10 text-center">Product details unavailable.</p>;
  }

  const whatsappNumber = normalizePhoneForWhatsApp(product.sellerId?.phoneNumber);
  const images = [product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl];
  const currentImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      {/* Breadcrumb */}
      <div className="border-b border-[#d8ddda] bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-[#20a46b] hover:underline">
            Home
          </Link>
          <span className="text-[#999]">/</span>
          <Link to="/marketplace" className="text-[#20a46b] hover:underline">
            Crop Feed
          </Link>
          <span className="text-[#999]">/</span>
          <span className="font-semibold text-[#333]">{product.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 px-6 py-6">
        {/* Left - Product Image & Gallery */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="relative overflow-hidden rounded-lg border border-[#d8ddda] bg-white">
            <img src={currentImage} alt={product.title} className="h-96 w-full object-cover" />
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                  idx === selectedImageIndex ? 'border-[#20a46b]' : 'border-[#d8ddda]'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Product Details */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-5 space-y-4">
            <div>
              <h1 className="text-4xl font-black text-[#1f1f1f]">{product.title}</h1>
              <p className="mt-2 text-3xl font-black text-[#20a46b]">{formatCurrency(product.price)}</p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-[#d8ddda] bg-[#f9fbfa] p-3">
              <span className="text-sm font-semibold text-[#333]">Verified Quantity: {product.quantity} bags available.</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#20a46b]">
                ✓ JWT Verified Seller
              </span>
            </div>

            {/* Product Properties */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#666] mb-1">Variety:</p>
                <p className="font-semibold text-[#1f1f1f]">Money Maker</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#666] mb-1">Harvest Date:</p>
                <p className="font-semibold text-[#1f1f1f]">11 March 2026</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#666] mb-1">Pickup Window:</p>
                <p className="font-semibold text-[#1f1f1f]">8AM-5PM</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#666] mb-1">Min Order:</p>
                <p className="font-semibold text-[#1f1f1f]">10 bags</p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4">
              <p className="text-[15px] text-[#333] leading-relaxed">
                {product.description || 'Premium grade, organic. Directly from my farm. Fast, direct sale, local pickup. Perfect for small restaurants or wholesalers.'}
              </p>
            </div>

            {/* Pickup Location Map */}
            <div className="pt-4">
              <h2 className="text-2xl font-black text-[#1f1f1f] mb-3">Pickup Location Map</h2>
              <div className="relative rounded-lg border border-[#d8ddda] overflow-hidden h-64">
                <MapContainer
                  center={[product.location.latitude, product.location.longitude]}
                  zoom={12}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[product.location.latitude, product.location.longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{product.title}</p>
                        <p>{product.location.locationName}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="absolute top-3 right-3 rounded bg-white px-3 py-1 text-sm font-semibold shadow-sm">
                  Exact Pickup Location
                </div>
                <div className="absolute bottom-2 left-2 right-2 rounded bg-white/95 px-2 py-1 text-xs text-[#666]">
                  Leaflet
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-[#1f1f1f]">Related Products</h2>
              <div className="flex gap-2">
                <button className="rounded-lg border border-[#d8ddda] bg-white px-2 py-1 text-sm hover:bg-[#f9f9f9]">
                  <ChevronLeft size={16} />
                </button>
                <button className="rounded-lg border border-[#d8ddda] bg-white px-2 py-1 text-sm hover:bg-[#f9f9f9]">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {relatedProducts.map((item) => (
                <Link key={item._id} to={`/products/${item._id}`}>
                  <div className="overflow-hidden rounded-lg border border-[#d8ddda] bg-white hover:shadow-sm transition">
                    <img src={item.imageUrl} alt={item.title} className="h-24 w-full object-cover" />
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-bold text-[#1f1f1f] line-clamp-2">{item.title}</p>
                      <p className="text-xs font-semibold text-[#1f1f1f]">{formatCurrency(item.price)}</p>
                      <button className="inline-flex items-center gap-1 rounded-full bg-[#20a46b] px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-[#1a8657]">
                        WhatsApp CTA <MessageCircle size={9} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Seller Info & Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* About the Seller */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-4">
            <h3 className="text-xl font-black text-[#1f1f1f]">About the Seller</h3>

            {/* Seller Card */}
            <div className="flex items-center gap-3 rounded-lg border border-[#d8ddda] bg-[#f9fbfa] p-3">
              <div className="h-12 w-12 rounded-full bg-[#d7e5da] flex items-center justify-center"></div>
              <div>
                <p className="font-bold text-[#1f1f1f]">{product.sellerId?.name || 'JujaFreshFarm'}</p>
                <p className="text-sm text-[#666]">5.0 Stars, 28 Reviews</p>
              </div>
            </div>

            {/* WhatsApp Button */}
            {whatsappNumber ? (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]">
                  <MessageCircle size={16} />
                  Contact via WhatsApp
                </button>
              </a>
            ) : (
              <button disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ccc] py-3 font-semibold text-white">
                <MessageCircle size={16} />
                No WhatsApp Available
              </button>
            )}

            {/* Location */}
            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#20a46b] mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-[#1f1f1f]">Location: {product.location.locationName}</p>
                  <p className="text-xs text-[#666] mt-1">Verify location and establish trust before payment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request & Message Actions */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-[#20a46b] bg-white py-2 text-sm font-semibold text-[#20a46b] hover:bg-[#f0f9f5]">
                Request Quote
              </button>
              <button className="rounded-lg bg-[#20a46b] py-2 text-sm font-semibold text-white hover:bg-[#1a8657]">
                Send Message
              </button>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#d8ddda] bg-white px-3 py-2">
                <MessageCircle size={16} className="text-[#20a46b]" />
                <span className="text-xs text-[#666]">Message</span>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="I'm interested in..."
                className="w-full rounded-lg border border-[#d8ddda] bg-white p-3 text-sm outline-none focus:border-[#20a46b] resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
