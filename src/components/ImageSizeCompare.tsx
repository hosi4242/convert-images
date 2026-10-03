import { useState } from "react";
import { FileDiff, Upload, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageSizeCompare() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [first, setFirst] = useState<File | null>(null);
  const [second, setSecond] = useState<File | null>(null);

  const reduction = first && second && first.size > 0
    ? ((first.size - second.size) / first.size) * 100
    : null;

  const pick = (setter: (file: File | null) => void, files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) setter(file);
  };

  const box = (file: File | null, setter: (file: File | null) => void, label: string, id: string) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-bold text-slate-700">{label}</div>
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
            <p className="mt-1 text-xs text-slate-500">{formatSize(file.size)} · {file.type || "image"}</p>
          </div>
          <button type="button" onClick={() => setter(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={ko ? "파일 삭제" : "Remove file"}><X className="h-4 w-4"/></button>
        </div>
      ) : (
        <label htmlFor={id} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-3 py-6 text-sm font-semibold text-blue-700 hover:bg-blue-50">
          <Upload className="h-4 w-4"/> {ko ? "이미지 선택" : "Choose image"}
          <input id={id} type="file" accept="image/*" className="hidden" onChange={e => pick(setter, e.target.files)} />
        </label>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2"><FileDiff className="h-5 w-5 text-blue-600"/><div><h2 className="text-lg font-bold text-slate-800">{ko ? "이미지 용량 비교" : "Image Size Comparison"}</h2><p className="text-xs text-slate-500">{ko ? "두 이미지의 파일 용량을 비교하고 절감률을 확인하세요." : "Compare two image file sizes and see the reduction rate."}</p></div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {box(first, setFirst, ko ? "이미지 1 · 원본" : "Image 1 · Original", "compare-image-1")}
        {box(second, setSecond, ko ? "이미지 2 · 비교 대상" : "Image 2 · Comparison", "compare-image-2")}
      </div>
      {first && second && (
        <div className="mt-4 rounded-xl bg-blue-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div><p className="text-xs text-slate-500">{ko ? "이미지 1" : "Image 1"}</p><p className="mt-1 text-lg font-bold text-slate-800">{formatSize(first.size)}</p></div>
            <div><p className="text-xs text-slate-500">{ko ? "이미지 2" : "Image 2"}</p><p className="mt-1 text-lg font-bold text-slate-800">{formatSize(second.size)}</p></div>
            <div><p className="text-xs text-slate-500">{ko ? "차이" : "Difference"}</p><p className="mt-1 text-lg font-bold text-blue-700">{formatSize(Math.abs(first.size-second.size))}</p></div>
          </div>
          <p className="mt-3 text-sm font-semibold text-blue-700">
            {reduction !== null
              ? reduction >= 0
                ? (ko ? "이미지 2가 이미지 1보다 " + reduction.toFixed(1) + "% 작습니다." : "Image 2 is " + reduction.toFixed(1) + "% smaller than Image 1.")
                : (ko ? "이미지 2가 이미지 1보다 " + Math.abs(reduction).toFixed(1) + "% 큽니다." : "Image 2 is " + Math.abs(reduction).toFixed(1) + "% larger than Image 1.")
              : ""}
          </p>
        </div>
      )}
    </section>
  );
}
