import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
const translations = {
  en,
  fr,
  es,
}

export function t(key, locale) {
  return translations[locale][key] ?? key
}
