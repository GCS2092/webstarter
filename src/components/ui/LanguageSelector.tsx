"use client";
import { useLocale } from "@/contexts/LocaleContext";
import { SUPPORTED_LOCALES, LOCALE_NAMES, Locale } from "@/lib/i18n";

export default function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition"
      aria-label="Select language"
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_NAMES[loc]}
        </option>
      ))}
    </select>
  );
}

