import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { productApi } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatCurrency, normalizePhoneForWhatsApp } from '../lib/utils';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await productApi.details(id);
      setProduct(response.data.data);
    };

    fetchDetails().catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <p className="py-10 text-center">Product details unavailable.</p>;
  }

  const whatsappNumber = normalizePhoneForWhatsApp(product.sellerId?.phoneNumber);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <img src={product.imageUrl} alt={product.title} className="h-72 w-full rounded-2xl object-cover lg:h-full" />

      <section className="space-y-4 rounded-2xl border border-(--outline) bg-(--surface) p-5">
        <Badge>{product.productType}</Badge>
        <h1 className="text-3xl font-black">{product.title}</h1>
        <p className="text-2xl font-black text-(--primary)">{formatCurrency(product.price)}</p>
        <p>{product.description || 'No description provided.'}</p>
        <p className="text-sm text-(--text-muted)">Quantity: {product.quantity}</p>
        <p className="flex items-center gap-1 text-sm text-(--text-muted)">
          <MapPin size={14} /> {product.location.locationName || 'Location not named'}
        </p>

        <div className="grid h-56 overflow-hidden rounded-2xl border border-(--outline)">
          <MapContainer
            center={[product.location.latitude, product.location.longitude]}
            zoom={9}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[product.location.latitude, product.location.longitude]}>
              <Popup>{product.title}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {whatsappNumber ? (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
              <Button variant="cta" className="w-full">
                <MessageCircle size={14} /> WhatsApp
              </Button>
            </a>
          ) : (
            <Button variant="cta" className="w-full" disabled>
              <MessageCircle size={14} /> No WhatsApp
            </Button>
          )}
          {product.sellerId?.email ? (
            <a href={`mailto:${product.sellerId.email}`}>
              <Button variant="outline" className="w-full">
                <Mail size={14} /> Email
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              <Mail size={14} /> No Email
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};
