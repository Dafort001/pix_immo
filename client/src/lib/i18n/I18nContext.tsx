import { createContext, useState, useEffect, ReactNode } from 'react';
import type { Language, I18nContextValue, TranslationData } from './types';
import deTranslations from './translations/de.json';
import enTranslations from './translations/en.json';

const LANGUAGE_STORAGE_KEY = 'piximmo_language';
const DEFAULT_LANGUAGE: Language = 'de';

const translationsMap: Record<Language, TranslationData> = {
  de: deTranslations,
  en: enTranslations
};

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (stored === 'de' || stored === 'en') ? stored : DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState<TranslationData>(translationsMap[language]);

  useEffect(() => {
    setTranslations(translationsMap[language]);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    if (!params) {
      return value;
    }
    
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() ?? match;
    });
  };

  const contextValue: I18nContextValue = {
    language,
    setLanguage,
    t,
    translations
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}
