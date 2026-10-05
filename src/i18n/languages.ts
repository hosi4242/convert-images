export const LANGUAGE_STORAGE_KEY = "image-converter-lang";

export const LANGUAGE_OPTIONS = [
  { code: "ko", nativeName: "한국어", englishName: "Korean", implemented: true },
  { code: "en", nativeName: "English", englishName: "English", implemented: true },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", implemented: true },
  { code: "zh-CN", nativeName: "简体中文", englishName: "Simplified Chinese", implemented: true },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];
export type ImplementedLanguage = Language;

export function isLanguage(value: string | null): value is Language {
  return LANGUAGE_OPTIONS.some((language) => language.code === value);
}

export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "ko";

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean).map((value) => value.toLowerCase());

  for (const language of browserLanguages) {
    if (language.startsWith("ko")) return "ko";
    if (language.startsWith("ja")) return "ja";
    if (language.startsWith("zh")) return "zh-CN";
    if (language.startsWith("en")) return "en";
  }

  return "en";
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(saved) ? saved : null;
}
