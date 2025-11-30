"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, getLocale, setLocale as saveLocale } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return getLocale();
    }
    return 'fr';
  });

  useEffect(() => {
    // Charger la locale au montage
    const savedLocale = getLocale();
    setLocaleState(savedLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
    // Recharger la page pour appliquer les changements
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

