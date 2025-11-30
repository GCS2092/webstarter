// Système d'internationalisation simple et efficace

export type Locale = 'fr' | 'en' | 'es';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'es'];

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

// Traductions
const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Header
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.request': 'Je veux un site web',
    'nav.admin': 'Admin',
    
    // Form - General
    'form.title': 'Demande de site web',
    'form.subtitle': 'Remplissez ce formulaire et nous vous répondrons sous 48h ⚡',
    'form.step1': 'Essentiel',
    'form.step2': 'Détails (optionnel)',
    'form.continue': 'Continuer →',
    'form.back': '← Retour',
    'form.skip': 'Passer cette étape',
    'form.submit': 'Envoyer la demande 🚀',
    'form.submitting': 'Envoi en cours...',
    'form.optional': 'Optionnel',
    'form.required': 'requis',
    
    // Form - Step 1
    'form.step1.title': 'Informations essentielles',
    'form.name.label': 'Nom complet',
    'form.name.placeholder': 'Votre nom complet',
    'form.email.label': 'Email',
    'form.email.placeholder': 'votre@email.com',
    'form.phone.label': 'Téléphone',
    'form.phone.placeholder': '+33 6 12 34 56 78',
    'form.type.label': 'Type de site',
    'form.type.select': 'Sélectionnez un type',
    'form.type.portfolio': 'Portfolio / Site vitrine',
    'form.type.ecommerce': 'E-commerce',
    'form.type.blog': 'Blog',
    'form.type.corporate': 'Site corporate',
    'form.type.landing': 'Landing page',
    'form.type.other': 'Autre',
    'form.description.label': 'Description du projet',
    'form.description.placeholder': 'Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, public cible...',
    'form.description.counter': 'caractères - minimum 10',
    'form.description.missing': 'Il manque {count} caractère(s) pour valider ce champ.',
    
    // Form - Step 2
    'form.step2.title': 'Détails optionnels',
    'form.step2.info': '💡 Optionnel : Ces informations nous aident à mieux comprendre votre projet, mais vous pouvez les ignorer et envoyer directement votre demande.',
    'form.colors.label': 'Couleurs préférées (optionnel)',
    'form.colors.hint': 'Sélectionnez jusqu\'à 3 couleurs',
    'form.budget.label': 'Budget estimé (optionnel)',
    'form.budget.less1000': 'Moins de 1000€',
    'form.budget.1000-2500': '1000€ - 2500€',
    'form.budget.2500-5000': '2500€ - 5000€',
    'form.budget.5000-10000': '5000€ - 10000€',
    'form.budget.more10000': 'Plus de 10000€',
    'form.deadline.label': 'Délai souhaité (optionnel)',
    'form.inspirations.label': 'Inspirations / Exemples (optionnel)',
    'form.inspirations.placeholder': 'Partagez des liens de sites qui vous inspirent...',
    'form.files.label': 'Fichiers (optionnel)',
    'form.files.click': 'Cliquez pour sélectionner des fichiers',
    'form.files.hint': 'Images, PDF, Word (max 50MB par fichier)',
    
    // Validation errors
    'error.name.min': 'Le nom doit contenir au moins 2 caractères',
    'error.email.invalid': 'Email invalide',
    'error.phone.invalid': 'Numéro de téléphone invalide',
    'error.type.required': 'Veuillez indiquer le type de site',
    'error.description.min': 'La description doit contenir au moins 10 caractères',
    'error.general.title': '⚠️ Veuillez corriger les erreurs suivantes :',
    
    // Success
    'success.title': 'Demande envoyée avec succès !',
    'success.message': 'Merci pour votre demande. Notre équipe vous répondra sous 48h.',
    'success.back': 'Retour à l\'accueil',
    
    // Colors
    'color.blue': 'Bleu',
    'color.red': 'Rouge',
    'color.green': 'Vert',
    'color.purple': 'Violet',
    'color.black': 'Noir',
    'color.white': 'Blanc',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.request': 'I want a website',
    'nav.admin': 'Admin',
    
    // Form - General
    'form.title': 'Website Request',
    'form.subtitle': 'Fill out this form and we will respond within 48h ⚡',
    'form.step1': 'Essential',
    'form.step2': 'Details (optional)',
    'form.continue': 'Continue →',
    'form.back': '← Back',
    'form.skip': 'Skip this step',
    'form.submit': 'Send request 🚀',
    'form.submitting': 'Sending...',
    'form.optional': 'Optional',
    'form.required': 'required',
    
    // Form - Step 1
    'form.step1.title': 'Essential information',
    'form.name.label': 'Full name',
    'form.name.placeholder': 'Your full name',
    'form.email.label': 'Email',
    'form.email.placeholder': 'your@email.com',
    'form.phone.label': 'Phone',
    'form.phone.placeholder': '+1 234 567 8900',
    'form.type.label': 'Website type',
    'form.type.select': 'Select a type',
    'form.type.portfolio': 'Portfolio / Showcase',
    'form.type.ecommerce': 'E-commerce',
    'form.type.blog': 'Blog',
    'form.type.corporate': 'Corporate website',
    'form.type.landing': 'Landing page',
    'form.type.other': 'Other',
    'form.description.label': 'Project description',
    'form.description.placeholder': 'Describe your project in detail: objectives, desired features, target audience...',
    'form.description.counter': 'characters - minimum 10',
    'form.description.missing': '{count} character(s) missing to validate this field.',
    
    // Form - Step 2
    'form.step2.title': 'Optional details',
    'form.step2.info': '💡 Optional: This information helps us better understand your project, but you can ignore it and send your request directly.',
    'form.colors.label': 'Preferred colors (optional)',
    'form.colors.hint': 'Select up to 3 colors',
    'form.budget.label': 'Estimated budget (optional)',
    'form.budget.less1000': 'Less than $1000',
    'form.budget.1000-2500': '$1000 - $2500',
    'form.budget.2500-5000': '$2500 - $5000',
    'form.budget.5000-10000': '$5000 - $10000',
    'form.budget.more10000': 'More than $10000',
    'form.deadline.label': 'Desired deadline (optional)',
    'form.inspirations.label': 'Inspirations / Examples (optional)',
    'form.inspirations.placeholder': 'Share links to sites that inspire you...',
    'form.files.label': 'Files (optional)',
    'form.files.click': 'Click to select files',
    'form.files.hint': 'Images, PDF, Word (max 50MB per file)',
    
    // Validation errors
    'error.name.min': 'Name must contain at least 2 characters',
    'error.email.invalid': 'Invalid email',
    'error.phone.invalid': 'Invalid phone number',
    'error.type.required': 'Please indicate the website type',
    'error.description.min': 'Description must contain at least 10 characters',
    'error.general.title': '⚠️ Please correct the following errors:',
    
    // Success
    'success.title': 'Request sent successfully!',
    'success.message': 'Thank you for your request. Our team will respond within 48h.',
    'success.back': 'Back to home',
    
    // Colors
    'color.blue': 'Blue',
    'color.red': 'Red',
    'color.green': 'Green',
    'color.purple': 'Purple',
    'color.black': 'Black',
    'color.white': 'White',
  },
  es: {
    // Header
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.request': 'Quiero un sitio web',
    'nav.admin': 'Admin',
    
    // Form - General
    'form.title': 'Solicitud de sitio web',
    'form.subtitle': 'Complete este formulario y le responderemos en 48h ⚡',
    'form.step1': 'Esencial',
    'form.step2': 'Detalles (opcional)',
    'form.continue': 'Continuar →',
    'form.back': '← Atrás',
    'form.skip': 'Omitir este paso',
    'form.submit': 'Enviar solicitud 🚀',
    'form.submitting': 'Enviando...',
    'form.optional': 'Opcional',
    'form.required': 'requerido',
    
    // Form - Step 1
    'form.step1.title': 'Información esencial',
    'form.name.label': 'Nombre completo',
    'form.name.placeholder': 'Su nombre completo',
    'form.email.label': 'Email',
    'form.email.placeholder': 'su@email.com',
    'form.phone.label': 'Teléfono',
    'form.phone.placeholder': '+34 612 34 56 78',
    'form.type.label': 'Tipo de sitio',
    'form.type.select': 'Seleccione un tipo',
    'form.type.portfolio': 'Portfolio / Sitio vitrina',
    'form.type.ecommerce': 'E-commerce',
    'form.type.blog': 'Blog',
    'form.type.corporate': 'Sitio corporativo',
    'form.type.landing': 'Landing page',
    'form.type.other': 'Otro',
    'form.description.label': 'Descripción del proyecto',
    'form.description.placeholder': 'Describa su proyecto en detalle: objetivos, funcionalidades deseadas, público objetivo...',
    'form.description.counter': 'caracteres - mínimo 10',
    'form.description.missing': 'Faltan {count} carácter(es) para validar este campo.',
    
    // Form - Step 2
    'form.step2.title': 'Detalles opcionales',
    'form.step2.info': '💡 Opcional: Esta información nos ayuda a comprender mejor su proyecto, pero puede ignorarla y enviar su solicitud directamente.',
    'form.colors.label': 'Colores preferidos (opcional)',
    'form.colors.hint': 'Seleccione hasta 3 colores',
    'form.budget.label': 'Presupuesto estimado (opcional)',
    'form.budget.less1000': 'Menos de 1000€',
    'form.budget.1000-2500': '1000€ - 2500€',
    'form.budget.2500-5000': '2500€ - 5000€',
    'form.budget.5000-10000': '5000€ - 10000€',
    'form.budget.more10000': 'Más de 10000€',
    'form.deadline.label': 'Plazo deseado (opcional)',
    'form.inspirations.label': 'Inspiraciones / Ejemplos (opcional)',
    'form.inspirations.placeholder': 'Comparta enlaces de sitios que le inspiran...',
    'form.files.label': 'Archivos (opcional)',
    'form.files.click': 'Haga clic para seleccionar archivos',
    'form.files.hint': 'Imágenes, PDF, Word (máx 50MB por archivo)',
    
    // Validation errors
    'error.name.min': 'El nombre debe contener al menos 2 caracteres',
    'error.email.invalid': 'Email inválido',
    'error.phone.invalid': 'Número de teléfono inválido',
    'error.type.required': 'Por favor indique el tipo de sitio',
    'error.description.min': 'La descripción debe contener al menos 10 caracteres',
    'error.general.title': '⚠️ Por favor corrija los siguientes errores:',
    
    // Success
    'success.title': '¡Solicitud enviada con éxito!',
    'success.message': 'Gracias por su solicitud. Nuestro equipo le responderá en 48h.',
    'success.back': 'Volver al inicio',
    
    // Colors
    'color.blue': 'Azul',
    'color.red': 'Rojo',
    'color.green': 'Verde',
    'color.purple': 'Violeta',
    'color.black': 'Negro',
    'color.white': 'Blanco',
  },
};

// Fonction pour obtenir une traduction
export function t(key: string, locale: Locale = 'fr', params?: Record<string, string | number>): string {
  const translation = translations[locale]?.[key] || translations.fr[key] || key;
  
  if (params) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return translation;
}

// Fonction pour obtenir la locale depuis le navigateur ou localStorage
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  
  const stored = localStorage.getItem('locale') as Locale;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }
  
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang;
  }
  
  return 'fr';
}

// Fonction pour sauvegarder la locale
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}

