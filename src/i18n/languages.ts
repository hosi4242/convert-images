export const LANGUAGE_STORAGE_KEY = "image-converter-lang";

export const LANGUAGE_OPTIONS = [
  { code: "ko", nativeName: "한국어", englishName: "Korean", implemented: true },
  { code: "en", nativeName: "English", englishName: "English", implemented: true },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", implemented: false },
  { code: "zh-CN", nativeName: "简体中文", englishName: "Simplified Chinese", implemented: false },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];
export type ImplementedLanguage = Extract<Language, "ko" | "en">;

export function isLanguage(value: string | null): value is Language {
  return LANGUAGE_OPTIONS.some((language) => language.code === value);
}

export function detectBrowserLanguage(): ImplementedLanguage {
  if (typeof window === "undefined") return "ko";

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean).map((value) => value.toLowerCase());

  for (const language of browserLanguages) {
    if (language.startsWith("ko")) return "ko";
    if (language.startsWith("en")) return "en";

    // Japanese and Simplified Chinese are planned languages.
    // Until their translations are enabled, use English rather than Korean.
    if (language.startsWith("ja") || language.startsWith("zh")) return "en";
  }

  // English is the neutral fallback for visitors from other locales.
  return "en";
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(saved) ? saved : null;
}
