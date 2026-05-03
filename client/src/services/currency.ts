/**
 * Currency Service
 * Handles currency conversion, exchange rates, and formatting
 */

import { Currency, ExchangeRates } from '@/types';

export const CURRENCIES: Currency[] = [
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
];

let rates: ExchangeRates = {
  BDT: 1,
  USD: 0.0091,
  EUR: 0.0084,
  GBP: 0.0072,
  AED: 0.0334,
  SAR: 0.0341,
  QAR: 0.0331,
  KWD: 0.0028,
  BHD: 0.0034,
  OMR: 0.0035,
  MYR: 0.0428,
  SGD: 0.0122,
  INR: 0.7594,
  PKR: 2.535,
  CAD: 0.0124,
  AUD: 0.0141,
  JPY: 1.373,
  CNY: 0.066,
  TRY: 0.298,
  IDR: 148.9,
  THB: 0.318,
  KRW: 12.67,
};

let customOverrides: Record<string, number> = {};
let ratesTimestamp: Date | null = null;

export async function fetchExchangeRates(): Promise<void> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/BDT');
    const data = await res.json();

    if (data && data.rates) {
      CURRENCIES.forEach((c) => {
        if (data.rates[c.code]) {
          rates[c.code] = data.rates[c.code];
        }
      });
      rates.BDT = 1;
      ratesTimestamp = new Date();
      loadStoredOverrides();
    }
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err);
  }
}

export function getRates(): ExchangeRates {
  return rates;
}

export function getRatesTimestamp(): Date | null {
  return ratesTimestamp;
}

export function loadStoredOverrides(): void {
  const stored = localStorage.getItem('ps_overrides');
  customOverrides = stored ? JSON.parse(stored) : {};
}

export function saveOverrides(): void {
  localStorage.setItem('ps_overrides', JSON.stringify(customOverrides));
}

export function setCustomRate(from: string, to: string, rate: number): void {
  customOverrides[`${from}_${to}`] = rate;
  saveOverrides();
}

export function getCustomRate(from: string, to: string): number | null {
  const key = `${from}_${to}`;
  const reverse = `${to}_${from}`;

  if (customOverrides[key]) return customOverrides[key];
  if (customOverrides[reverse]) return 1 / customOverrides[reverse];

  return null;
}

export function convert(amount: number, from: string, to: string): number {
  if (!amount || isNaN(amount)) return 0;

  const customRate = getCustomRate(from, to);
  if (customRate) return parseFloat(String(amount)) * customRate;

  return (parseFloat(String(amount)) / rates[from]) * rates[to];
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    SAR: 'SAR ',
    QAR: 'QAR ',
    KWD: 'KWD ',
    BHD: 'BHD ',
    OMR: 'OMR ',
    MYR: 'RM ',
    SGD: 'S$',
    INR: '₹',
    PKR: '₨',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    TRY: '₺',
    IDR: 'Rp ',
    THB: '฿',
    KRW: '₩',
  };

  const symbol = symbols[currency] || currency;
  const formatted = parseFloat(String(amount)).toFixed(2);

  return `${symbol}${formatted}`;
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}
