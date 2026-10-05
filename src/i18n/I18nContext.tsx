import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getTranslation, type Translation } from "./translations";
import {
  detectBrowserLanguage,
  getStoredLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "./languages";

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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const setSiteLanguage = useCallback((next: Language) => {
    setLanguage(next);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  // Keep the existing two-language toggle working while the language selector is expanded later.
  const toggleLanguage = useCallback(() => {
    setSiteLanguage(language === "ko" ? "en" : "ko");
  }, [language, setSiteLanguage]);

  const t = getTranslation(language);

  useEffect(() => {
    document.documentElement.lang = language;

    if (language === "ko") {
      document.title = "ToolMingle | 이미지 · QR · 계산 · 텍스트 · PDF · 타이머";
      document.documentElement.setAttribute(
        "data-page-description",
        "이미지 변환·압축·크기 조정·편집·일괄 변환, QR 코드 생성, 계산기, 글자 수·바이트 계산, PDF 도구와 온라인 타이머를 무료로 이용할 수 있습니다.",
      );
    } else {
      document.title = "ToolMingle | Image · QR · Calculator · Text · PDF · Timer";
      document.documentElement.setAttribute(
        "data-page-description",
        "Free browser-based image, QR code, calculator, text, PDF, and timer tools with no installation or sign-up.",
      );
    }
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, t, toggleLanguage, setLanguage: setSiteLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
