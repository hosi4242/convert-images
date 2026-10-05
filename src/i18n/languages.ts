export const LANGUAGE_STORAGE_KEY = "image-converter-lang";

export const LANGUAGE_OPTIONS = [
  { code: "ko", nativeName: "한국어", englishName: "Korean", implemented: true },
  { code: "en", nativeName: "English", englishName: "English", implemented: true },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];
export type ImplementedLanguage = Language;

export function isLanguage(value: string | null): value is Language {
  return LANGUAGE_OPTIONS.some((language) => language.code === value);
}

export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean).map((value) => value.toLowerCase());

  return browserLanguages.some((language) => language.startsWith("ko")) ? "ko" : "en";
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(saved) ? saved : null;
}
