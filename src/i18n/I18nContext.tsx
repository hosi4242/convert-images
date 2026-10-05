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
    if (language === "ko") {
      document.title = "ToolMingle | 이미지 · QR · 계산 · 텍스트 · PDF · 타이머";
      document.documentElement.setAttribute("data-page-description", "이미지 변환·압축·크기 조정·편집·일괄 변환, QR 코드 생성, 계산기, 글자 수·바이트 계산, PDF 도구와 온라인 타이머를 무료로 이용할 수 있습니다.");
    } else {
      document.title = "ToolMingle | Image · QR · Calculator · Text · PDF · Timer";
      document.documentElement.setAttribute("data-page-description", "Free browser-based image, QR code, calculator, text, PDF, and timer tools with no installation or sign-up.");
    }
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
