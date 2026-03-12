import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Mail } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatCurrency, normalizePhoneForWhatsApp } from '../../lib/utils';

const getAccessibilityBadge = (status) => {
  switch (status) {
    case 'flooded':
      return { emoji: '🔴', text: 'Flooded', color: 'bg-red-100 text-red-700' };
    case 'trucks_only':
      return { emoji: '🟡', text: 'Trucks Only', color: 'bg-yellow-100 text-yellow-700' };
    case 'open':
    default:
      return { emoji: '🟢', text: 'Road Open', color: 'bg-green-100 text-green-700' };
  }
};

export const ProductCard = ({ product }) => {
  const whatsappNumber = normalizePhoneForWhatsApp(product?.sellerId?.phoneNumber);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
  const emailHref = `mailto:${product?.sellerId?.email || ''}`;
  const accessibilityInfo = getAccessibilityBadge(product?.pathAccessibility);

  return (
    <Card className="overflow-hidden p-0">
      <img src={product.imageUrl} alt={product.title} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{product.title}</h3>
          <div className="flex flex-col gap-2">
            <Badge>{product.productType}</Badge>
            <span className={`rounded px-2 py-1 text-xs font-bold whitespace-nowrap ${accessibilityInfo.color}`}>
              {accessibilityInfo.emoji} {accessibilityInfo.text}
            </span>
          </div>
        </div>

        <p className="text-xl font-black text-primary">{formatCurrency(product.price)}</p>

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
