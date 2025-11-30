import { parsePhoneNumber, isValidPhoneNumber, getCountries, CountryCode } from 'libphonenumber-js';

// Mapping des locales vers les codes pays par défaut
const LOCALE_TO_COUNTRY: Record<string, CountryCode> = {
  fr: 'FR',
  en: 'US',
  es: 'ES',
};

// Obtenir le code pays par défaut selon la locale
export function getDefaultCountryCode(locale: string): CountryCode {
  return LOCALE_TO_COUNTRY[locale] || 'FR';
}

// Valider un numéro de téléphone
export function validatePhoneNumber(phone: string, countryCode?: CountryCode): {
  isValid: boolean;
  formatted?: string;
  error?: string;
} {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optionnel, donc valide si vide
  }

  try {
    // Essayer de parser avec le code pays fourni ou détecter automatiquement
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    
    if (phoneNumber && isValidPhoneNumber(phoneNumber.number, countryCode)) {
      return {
        isValid: true,
        formatted: phoneNumber.formatInternational(),
      };
    }
    
    return {
      isValid: false,
      error: 'Numéro de téléphone invalide',
    };
  } catch (error) {
    // Si le parsing échoue, essayer sans code pays (détection automatique)
    try {
      const phoneNumber = parsePhoneNumber(phone);
      if (phoneNumber && isValidPhoneNumber(phoneNumber.number)) {
        return {
          isValid: true,
          formatted: phoneNumber.formatInternational(),
        };
      }
    } catch {
      // Ignorer l'erreur de détection automatique
    }
    
    return {
      isValid: false,
      error: 'Numéro de téléphone invalide',
    };
  }
}

// Formater un numéro de téléphone selon le pays
export function formatPhoneNumber(phone: string, countryCode?: CountryCode): string {
  if (!phone) return '';
  
  try {
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    return phoneNumber.formatInternational();
  } catch {
    return phone; // Retourner tel quel si le formatage échoue
  }
}

// Obtenir les exemples de format par pays
export function getPhonePlaceholder(countryCode: CountryCode): string {
  const examples: Partial<Record<CountryCode, string>> = {
    FR: '+33 6 12 34 56 78',
    US: '+1 234 567 8900',
    ES: '+34 612 34 56 78',
    GB: '+44 20 7946 0958',
    DE: '+49 30 12345678',
    IT: '+39 06 1234 5678',
    BE: '+32 2 123 45 67',
    CH: '+41 21 123 45 67',
    CA: '+1 234 567 8900',
    AU: '+61 2 1234 5678',
  };
  
  return examples[countryCode] || '+33 6 12 34 56 78';
}

