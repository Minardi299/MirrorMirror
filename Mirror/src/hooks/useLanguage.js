import { useEffect, useState } from "react";

const LANG_CACHE_KEY = "userLanguage";

export function useLanguage() {
  const [language, setLanguage] = useState("en"); // default to English

  useEffect(() => {
    // Check if there's a cached language
    const cachedLang = localStorage.getItem(LANG_CACHE_KEY);
    if (cachedLang) {
      setLanguage(cachedLang);
    } else {
      // No cached language, set default to English
      localStorage.setItem(LANG_CACHE_KEY, "en");
    }
  }, []);

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem(LANG_CACHE_KEY, newLang);
  };

  return [language, updateLanguage];
}
