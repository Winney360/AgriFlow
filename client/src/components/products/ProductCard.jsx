import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Mail } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatCurrency, normalizePhoneForWhatsApp } from '../../lib/utils';

export const ProductCard = ({ product }) => {
  const whatsappNumber = normalizePhoneForWhatsApp(product?.sellerId?.phoneNumber);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
  const emailHref = `mailto:${product?.sellerId?.email || ''}`;

  return (
    <Card className="overflow-hidden p-0">
      <img src={product.imageUrl} alt={product.title} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{product.title}</h3>
          <Badge>{product.productType}</Badge>
        </div>

        <p className="text-xl font-black text-(--primary)">{formatCurrency(product.price)}</p>

        <p className="flex items-center gap-1 text-sm text-(--text-muted)">
          <MapPin size={14} />
          {product.location?.locationName || 'Location not named'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {whatsappNumber ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <Button variant="cta" size="sm" className="w-full">
                <MessageCircle size={14} /> WhatsApp
              </Button>
            </a>
          ) : (
            <Button variant="cta" size="sm" disabled className="w-full">
              <MessageCircle size={14} /> No WhatsApp
            </Button>
          )}
          {product?.sellerId?.email ? (
            <a href={emailHref}>
              <Button variant="outline" size="sm" className="w-full">
                <Mail size={14} /> Email
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled className="w-full">
              <Mail size={14} /> No Email
            </Button>
          )}
        </div>

        <Link to={`/products/${product._id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </div>
    </Card>
  );
};
