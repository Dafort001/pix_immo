import { useContext } from 'react';
import { I18nContext } from './I18nContext';
import type { I18nContextValue } from './types';

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  
  return context;
}
