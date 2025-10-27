import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
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
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return (stored === 'de' || stored === 'en') ? stored : DEFAULT_LANGUAGE;
      }
    } catch {
      // localStorage unavailable (Safari Private Mode, SSR)
    }
    return DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState<TranslationData>(translationsMap[language]);

  useEffect(() => {
    setTranslations(translationsMap[language]);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch {
      // localStorage unavailable - continue without persistence
    }
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

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
