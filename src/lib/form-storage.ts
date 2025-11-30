// Sauvegarde automatique du formulaire en localStorage

const STORAGE_KEY = 'webstarter_form_draft';

export interface FormDraft {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  project_type?: string;
  description?: string;
  colors?: string;
  budget?: string;
  deadline?: string;
  inspirations?: string;
  selectedColors?: string[];
  budgetRange?: string;
  currentStep?: number;
}

// Sauvegarder le brouillon
export function saveFormDraft(data: FormDraft): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du brouillon:', error);
  }
}

// Charger le brouillon
export function loadFormDraft(): FormDraft | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const draft = JSON.parse(stored);
    
    // Vérifier si le brouillon n'est pas trop ancien (7 jours max)
    if (draft.savedAt) {
      const savedDate = new Date(draft.savedAt);
      const daysSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        clearFormDraft();
        return null;
      }
    }
    
    // Retirer savedAt du draft
    const { savedAt, ...draftData } = draft;
    return draftData;
  } catch (error) {
    console.error('Erreur lors du chargement du brouillon:', error);
    return null;
  }
}

// Effacer le brouillon
export function clearFormDraft(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du brouillon:', error);
  }
}

// Vérifier si un brouillon existe
export function hasFormDraft(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

