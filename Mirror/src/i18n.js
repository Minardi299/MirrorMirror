import en from './locales/en.json'
import fr from './locales/fr.json'

const translations = {
  en,
  fr,
}

export function t(key, locale) {
  return translations[locale][key] ?? key
}
