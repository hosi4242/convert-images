import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getTranslation, type Language, type Translation } from "./translations";

interface I18nContextValue {
  language: Language;
  t: Translation;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// localStorage에서 저장된 언어 설정을 불러오거나 브라우저 언어를 감지
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ko";

  const saved = localStorage.getItem("image-converter-lang");
  if (saved === "ko" || saved === "en") return saved;

  // 브라우저 언어가 영어인 경우 영어로 시작
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("en")) return "en";

  return "ko";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "ko" ? "en" : "ko";
      localStorage.setItem("image-converter-lang", next);
      // html lang 속성도 함께 업데이트
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const t = getTranslation(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ko" ? "올인원 이미지 · QR · 계산 도구" : "All-in-One Image · QR · Calculator";
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, t, toggleLanguage }}>
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
