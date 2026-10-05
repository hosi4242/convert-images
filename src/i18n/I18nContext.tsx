import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getTranslation, type Translation } from "./translations";
import { detectBrowserLanguage, getStoredLanguage, LANGUAGE_STORAGE_KEY, type Language } from "./languages";

interface I18nContextValue {
  language: Language;
  t: Translation;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Use an explicit saved choice first. For first-time visitors, detect the browser locale.
function getInitialLanguage(): Language {
  return getStoredLanguage() ?? detectBrowserLanguage();
}
