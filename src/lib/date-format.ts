// Formatage de dates selon la locale

export type Locale = 'fr' | 'en' | 'es';

// Options de formatage selon la locale
const DATE_FORMAT_OPTIONS: Record<Locale, Intl.DateTimeFormatOptions> = {
  fr: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  en: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  es: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
};

// Formater une date selon la locale
export function formatDate(date: Date | string, locale: Locale = 'fr'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const formatter = new Intl.DateTimeFormat(
    locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US',
    DATE_FORMAT_OPTIONS[locale]
  );
  
  return formatter.format(dateObj);
}

// Obtenir le format de date attendu pour un input date
export function getDateFormatHint(locale: Locale): string {
  const hints: Record<Locale, string> = {
    fr: 'JJ/MM/AAAA',
    en: 'MM/DD/YYYY',
    es: 'DD/MM/AAAA',
  };
  
  return hints[locale];
}

// Convertir une date au format ISO pour l'input date HTML
export function toISODateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
}

// Valider une date
export function validateDate(dateString: string, minDate?: Date): {
  isValid: boolean;
  error?: string;
} {
  if (!dateString) {
    return { isValid: true }; // Optionnel
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Date invalide',
    };
  }
  
  if (minDate && date < minDate) {
    return {
      isValid: false,
      error: 'La date doit être dans le futur',
    };
  }
  
  return { isValid: true };
}

