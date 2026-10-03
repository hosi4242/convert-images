import { useState } from "react";
import { Ruler } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ImageDpiCalculator() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dpi, setDpi] = useState("300");

  const w = Number(width), h = Number(height), d = Number(dpi);
  const valid = w > 0 && h > 0 && d > 0;
  const widthIn = valid ? w / d : 0;
  const heightIn = valid ? h / d : 0;

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2"><Ruler className="h-5 w-5 text-blue-600"/><div><h2 className="text-lg font-bold text-slate-800">{ko ? "이미지 DPI·인쇄 크기 계산기" : "Image DPI & Print Size Calculator"}</h2><p className="text-xs text-slate-500">{ko ? "픽셀과 DPI를 이용해 예상 인쇄 크기를 계산합니다." : "Calculate the approximate print size from pixels and DPI."}</p></div></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">{ko ? "가로 픽셀" : "Width pixels"}<input type="number" min="1" value={width} onChange={e=>setWidth(e.target.value)} placeholder="예: 3000" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label>
        <label className="text-sm font-semibold text-slate-700">{ko ? "세로 픽셀" : "Height pixels"}<input type="number" min="1" value={height} onChange={e=>setHeight(e.target.value)} placeholder="예: 2000" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label>
        <label className="text-sm font-semibold text-slate-700">DPI<input type="number" min="1" value={dpi} onChange={e=>setDpi(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label>
      </div>
      {valid && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-600">{ko ? "예상 인쇄 크기" : "Estimated print size"}</p><p className="mt-1 text-xl font-bold text-slate-800">{widthIn.toFixed(2)} × {heightIn.toFixed(2)} {ko ? "인치" : "in"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{ko ? "센티미터" : "Centimeters"}</p><p className="mt-1 text-xl font-bold text-slate-800">{(widthIn*2.54).toFixed(1)} × {(heightIn*2.54).toFixed(1)} cm</p></div></div>}
      <p className="mt-3 text-xs leading-5 text-slate-500">{ko ? "계산값은 픽셀 ÷ DPI 기준의 이론적인 인쇄 크기입니다. 실제 출력 크기는 프린터와 인쇄 설정에 따라 달라질 수 있습니다." : "This is the theoretical print size based on pixels divided by DPI. Actual output may vary by printer and print settings."}</p>
    </section>
  );
}
