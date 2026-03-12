import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const parseNumericValue = (value) => {
  const parsed = Number.parseFloat(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getListingEstimatedTotal = (price, quantity) =>
  parseNumericValue(price) * parseNumericValue(quantity);

export const normalizePhoneForWhatsApp = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : '';
};
