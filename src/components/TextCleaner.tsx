import { useMemo, useState } from "react";
import { ClipboardCheck, Eraser } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function TextCleaner() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [text, setText] = useState("");
  const [removeBlank, setRemoveBlank] = useState(false);
  const [removeDuplicate, setRemoveDuplicate] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(false);

  const cleaned = useMemo(() => {
    let lines = text.replace(/\r\n?/g, "\n").split("\n");
    if (trimLines) lines = lines.map(line => line.trim());
    if (collapseSpaces) lines = lines.map(line => line.replace(/[ \t]+/g, " "));
    if (removeBlank) lines = lines.filter(line => line !== "");
    if (removeDuplicate) {
      const seen = new Set<string>();
      lines = lines.filter(line => { if (seen.has(line)) return false; seen.add(line); return true; });
    }
    return lines.join("\n");
  }, [text, removeBlank, removeDuplicate, trimLines, collapseSpaces]);

  const copy = async () => { if (!cleaned) return; try { await navigator.clipboard.writeText(cleaned); } catch {} };

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2"><Eraser className="h-5 w-5 text-blue-600"/><div><h2 className="text-lg font-bold text-slate-800">{ko ? "텍스트 정리 도구" : "Text Cleaner"}</h2><p className="text-xs text-slate-500">{ko ? "복사한 글의 공백과 줄바꿈을 빠르게 정리하세요." : "Clean spaces and line breaks in pasted text."}</p></div></div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder={ko ? "정리할 텍스트를 붙여넣으세요." : "Paste text to clean."}/>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[[trimLines,setTrimLines,ko?"각 줄 앞뒤 공백 제거":"Trim each line"],[collapseSpaces,setCollapseSpaces,ko?"연속 공백 하나로 정리":"Collapse spaces"],[removeBlank,setRemoveBlank,ko?"빈 줄 제거":"Remove blank lines"],[removeDuplicate,setRemoveDuplicate,ko?"중복 줄 제거":"Remove duplicate lines"]].map(([checked,setter,label]) => <label key={String(label)} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700"><input type="checkbox" checked={Boolean(checked)} onChange={e=>(setter as (v:boolean)=>void)(e.target.checked)}/>{label as string}</label>)}
      </div>
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="mb-2 text-xs font-semibold text-blue-700">{ko ? "정리 결과" : "Cleaned result"}</p><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{cleaned || (ko ? "정리 결과가 여기에 표시됩니다." : "The cleaned text will appear here.")}</pre></div>
      <div className="mt-3 flex gap-2"><button type="button" onClick={copy} disabled={!cleaned} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"><ClipboardCheck className="h-4 w-4"/>{ko ? "결과 복사" : "Copy result"}</button><button type="button" onClick={()=>setText("")} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">{ko ? "초기화" : "Reset"}</button></div>
    </section>
  );
}
