// Gestion des devises selon le pays

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  symbol: string;
  code: Currency;
  name: string;
}

// Mapping des locales vers les devises
const LOCALE_TO_CURRENCY: Record<string, Currency> = {
  fr: 'EUR',
  en: 'USD',
  es: 'EUR',
  'en-GB': 'GBP',
  'en-CA': 'CAD',
  'en-AU': 'AUD',
};

// Configuration des devises
const CURRENCIES: Record<Currency, CurrencyConfig> = {
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound' },
  CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
};

// Obtenir la devise par défaut selon la locale
export function getDefaultCurrency(locale: string): Currency {
  return LOCALE_TO_CURRENCY[locale] || 'EUR';
}

// Obtenir la configuration d'une devise
export function getCurrencyConfig(currency: Currency): CurrencyConfig {
  return CURRENCIES[currency];
}

// Formater un montant avec la devise
export function formatCurrency(amount: number, currency: Currency = 'EUR'): string {
  const config = getCurrencyConfig(currency);
  return `${config.symbol}${amount.toLocaleString()}`;
}

// Convertir les options de budget selon la devise
export function getBudgetOptionsWithCurrency(
  locale: string,
  currency: Currency = getDefaultCurrency(locale)
): Array<{ label: string; value: string }> {
  const config = getCurrencyConfig(currency);
  const symbol = config.symbol;
  
  // Multiplicateurs de conversion approximatifs (à ajuster selon les besoins)
  const conversionRates: Record<Currency, number> = {
    EUR: 1,
    USD: 1.1,
    GBP: 0.85,
    CAD: 1.5,
    AUD: 1.65,
  };
  
  const rate = conversionRates[currency];
  
  return [
    { label: `Moins de ${symbol}${Math.round(1000 * rate)}`, value: `0-${Math.round(1000 * rate)}` },
    { label: `${symbol}${Math.round(1000 * rate)} - ${symbol}${Math.round(2500 * rate)}`, value: `${Math.round(1000 * rate)}-${Math.round(2500 * rate)}` },
    { label: `${symbol}${Math.round(2500 * rate)} - ${symbol}${Math.round(5000 * rate)}`, value: `${Math.round(2500 * rate)}-${Math.round(5000 * rate)}` },
    { label: `${symbol}${Math.round(5000 * rate)} - ${symbol}${Math.round(10000 * rate)}`, value: `${Math.round(5000 * rate)}-${Math.round(10000 * rate)}` },
    { label: `Plus de ${symbol}${Math.round(10000 * rate)}`, value: `${Math.round(10000 * rate)}+` },
  ];
}

