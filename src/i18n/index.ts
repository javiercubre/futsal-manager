import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import pt from './pt.json';
import es from './es.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
  });

export default i18n;
