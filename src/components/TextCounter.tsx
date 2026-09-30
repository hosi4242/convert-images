import { useMemo, useState } from "react";
import { Clipboard, RotateCcw, Type } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function TextCounter() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, "").length;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const bytes = new TextEncoder().encode(text).length;
    return { charsWithSpaces, charsWithoutSpaces, lines, words, bytes };
  }, [text]);

  const copyText = async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* Clipboard permission may be unavailable. */ }
  };

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-start gap-2">
        <Type className="mt-0.5 h-5 w-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">{ko ? "글자 수·바이트 계산기" : "Character & Byte Counter"}</h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-500">
            {ko ? "텍스트를 입력하면 글자 수, 공백 제외 글자 수, 줄 수, 단어 수와 바이트를 바로 확인할 수 있습니다." : "Enter text to instantly check characters, characters without spaces, lines, words, and bytes."}
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          [ko ? "글자 수" : "Characters", stats.charsWithSpaces],
          [ko ? "공백 제외" : "No spaces", stats.charsWithoutSpaces],
          [ko ? "줄 수" : "Lines", stats.lines],
          [ko ? "단어 수" : "Words", stats.words],
          [ko ? "바이트" : "Bytes", stats.bytes],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-blue-50 px-3 py-2.5 text-center">
            <div className="text-[11px] font-semibold text-blue-600">{label}</div>
            <div className="mt-0.5 text-lg font-extrabold text-slate-800">{Number(value).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        placeholder={ko ? "여기에 텍스트를 입력하거나 붙여넣으세요." : "Type or paste your text here."}
        aria-label={ko ? "텍스트 입력" : "Text input"}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={copyText} disabled={!text} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
          <Clipboard className="h-4 w-4" />{ko ? "텍스트 복사" : "Copy text"}
        </button>
        <button type="button" onClick={() => setText("")} disabled={!text} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
          <RotateCcw className="h-4 w-4" />{ko ? "초기화" : "Reset"}
        </button>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        {ko ? "입력한 텍스트는 브라우저에서 계산되며 서버로 전송되지 않습니다." : "Your text is counted in the browser and is not sent to a server."}
      </p>
    </section>
  );
}
