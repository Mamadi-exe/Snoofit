import { create } from 'zustand';
import { Language, translations, TranslationKey } from '@/i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: () => boolean;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: (localStorage.getItem('language') as Language) || 'en',
  
  setLanguage: (lang: Language) => {
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ language: lang });
  },
  
  t: (key: TranslationKey) => {
    const lang = get().language;
    return translations[lang][key] || translations.en[key] || key;
  },
  
  isRTL: () => get().language === 'ar',
}));

// Initialize on first load
const initLang = (localStorage.getItem('language') as Language) || 'en';
document.documentElement.dir = initLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initLang;
