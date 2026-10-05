import { Languages } from "lucide-react";
import { LANGUAGE_OPTIONS, type Language } from "@/i18n/languages";
import { useI18n } from "@/i18n/I18nContext";

export default function LanguageSelector({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={compact ? "flex items-center gap-1" : "flex flex-wrap items-center justify-end gap-1.5"} role="group" aria-label="Language">
      <Languages className="mr-1 h-4 w-4 opacity-80" aria-hidden="true" />
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code as Language)}
          aria-pressed={language === option.code}
          aria-label={option.nativeName}
          className={compact
            ? `min-h-9 rounded-lg px-2 py-1 text-xs font-bold transition ${language === option.code ? "bg-white text-blue-700" : light ? "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700" : "bg-white/15 text-white hover:bg-white/25"}`
            : `min-h-10 rounded-full px-3 py-1.5 text-xs font-bold transition ${language === option.code ? "bg-white text-blue-700 shadow-sm" : light ? "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700" : "bg-white/15 text-white hover:bg-white/25"}`}
        >
          {option.nativeName}
        </button>
      ))}
    </div>
  );
}
