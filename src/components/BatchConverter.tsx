import { useState } from "react";
import { Download, Files, LoaderCircle } from "lucide-react";
import { convertImage, type ImageFormat, type ConversionResult, isSupportedImage } from "@/utils/imageConverter";
import { useI18n } from "@/i18n/I18nContext";

type Item = { file: File; result?: ConversionResult; error?: string };

export default function BatchConverter() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState<0.5 | 0.7 | 0.8 | 0.9 | 1>(0.9);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  const selectFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list).filter(isSupportedImage).slice(0, 30));
    setItems([]);
  };

  const run = async () => {
    if (!files.length) return;
    setBusy(true); setItems([]);
    const next: Item[] = [];
    for (const file of files) {
      try { next.push({ file, result: await convertImage(file, format, quality) }); }
      catch { next.push({ file, error: ko ? "변환 실패" : "Conversion failed" }); }
      setItems([...next]);
    }
    setBusy(false);
  };

  const download = (item: Item) => {
    if (!item.result) return;
    const url = URL.createObjectURL(item.result.blob);
    const ext = format === "jpeg" ? "jpg" : format;
    const a = document.createElement("a");
    a.href = url; a.download = `${item.file.name.replace(/\.[^/.]+$/, "")}-converted.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  };

  return <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
    <div className="mb-4 flex items-center gap-2"><Files className="h-5 w-5 text-blue-600"/><h2 className="text-lg font-bold text-gray-800">{ko?"일괄 이미지 변환":"Batch Image Converter"}</h2></div>
    <p className="mb-4 text-sm leading-relaxed text-gray-600">{ko?"여러 이미지를 한 번에 변환합니다. 최대 30개까지 선택할 수 있으며 모든 처리는 브라우저에서 진행됩니다.":"Convert multiple images at once. Up to 30 files are supported and all processing stays in your browser."}</p>
    <label className="flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 text-center">
      <span className="text-sm font-semibold text-blue-700">{files.length ? `${files.length}${ko?"개 파일 선택됨":" files selected"}` : (ko?"여러 이미지 선택하기":"Select multiple images")}</span>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif" onChange={e=>selectFiles(e.target.files)} className="hidden"/>
    </label>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-gray-700">{ko?"변환 형식":"Output format"}<select value={format} onChange={e=>setFormat(e.target.value as ImageFormat)} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option><option value="avif">AVIF</option></select></label>
      <label className="text-sm font-semibold text-gray-700">{ko?"품질":"Quality"}<select value={quality} onChange={e=>setQuality(Number(e.target.value) as 0.5|0.7|0.8|0.9|1)} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="1">100%</option><option value="0.9">90%</option><option value="0.8">80%</option><option value="0.7">70%</option><option value="0.5">50%</option></select></label>
    </div>
    <button type="button" onClick={run} disabled={!files.length || busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?<LoaderCircle className="h-5 w-5 animate-spin"/>:<Files className="h-5 w-5"/>}{busy?(ko?"변환 중...":"Converting..."):(ko?"일괄 변환 시작":"Convert All")}</button>
    {items.length > 0 && <div className="mt-4 space-y-2">{items.map(item=><div key={item.file.name} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3"><span className="min-w-0 truncate text-sm">{item.file.name}</span>{item.result?<button type="button" onClick={()=>download(item)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Download className="h-4 w-4"/>{ko?"다운로드":"Download"}</button>:<span className="text-xs text-red-600">{item.error}</span>}</div>)}</div>}
  </section>;
}
