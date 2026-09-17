import { useEffect, useState } from "react";
import { Download, Lock, Unlock, RotateCcw, Maximize2 } from "lucide-react";
import { resizeImage, getResizeOutputFormat, type ResizeResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

interface ImageResizerProps { uploadedImage: UploadedImage; onReset: () => void; }
function formatBytes(bytes: number): string { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }

export default function ImageResizer({ uploadedImage, onReset }: ImageResizerProps) {
  const { language } = useI18n();
  const ko = language === "ko";
  const [width, setWidth] = useState(uploadedImage.width);
  const [height, setHeight] = useState(uploadedImage.height);
  const [locked, setLocked] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ratio = uploadedImage.width / uploadedImage.height;
  const outputFormat = getResizeOutputFormat(uploadedImage.file);

  useEffect(() => { setWidth(uploadedImage.width); setHeight(uploadedImage.height); setResult(null); setError(null); }, [uploadedImage]);
  const handleWidthChange = (value: number) => { const next = Math.min(10000, Math.max(1, Math.round(value))); setWidth(next); if (locked) setHeight(Math.min(10000, Math.max(1, Math.round(next / ratio)))); };
  const handleHeightChange = (value: number) => { const next = Math.min(10000, Math.max(1, Math.round(value))); setHeight(next); if (locked) setWidth(Math.min(10000, Math.max(1, Math.round(next * ratio)))); };
  const handleResize = async () => { if (!width || !height) return; setIsResizing(true); setError(null); try { setResult(await resizeImage(uploadedImage.file, width, height)); } catch { setError(ko ? "이미지 크기를 조정하지 못했습니다. 다른 이미지 파일을 사용해 주세요." : "Could not resize the image. Please try a different image file."); } finally { setIsResizing(false); } };

  const text = ko ? { title:"이미지 크기 조정", description:"가로·세로 크기를 원하는 픽셀로 변경합니다. JPG, PNG, WebP는 원본 형식을 유지합니다.", originalSize:"원본 크기", outputFormat:"저장 형식", width:"가로", height:"세로", unlock:"비율 잠금 해제", lock:"비율 잠금", locked:"비율 유지", unlocked:"자유 조정", note:"JPG, PNG, WebP는 업로드한 확장자로 저장됩니다. HEIC는 브라우저 처리 특성상 JPG로 저장됩니다.", button:"이미지 크기 조정", resizing:"크기 조정 중...", complete:"이미지 크기 조정이 완료되었습니다.", original:"원본", result:"조정 후", download:"크기 조정된 이미지 다운로드", again:"다시 크기 조정하기" } : { title:"Resize Image", description:"Change the image width and height in pixels. JPG, PNG, and WebP keep the original format.", originalSize:"Original size", outputFormat:"Output format", width:"Width", height:"Height", unlock:"Unlock ratio", lock:"Lock ratio", locked:"Keep ratio", unlocked:"Free resize", note:"JPG, PNG, and WebP are saved in the uploaded format. HEIC is saved as JPG because of browser processing limitations.", button:"Resize Image", resizing:"Resizing...", complete:"Image resizing is complete.", original:"Original", result:"Resized", download:"Download Resized Image", again:"Resize Again" };

  return <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
    {!result ? <>
      <div className="mb-4 flex items-center gap-2"><Maximize2 className="h-5 w-5 text-blue-600"/><h2 className="text-lg font-bold text-gray-800">{text.title}</h2></div>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{text.description}</p>
      <div className="mb-4 rounded-xl bg-blue-50/70 p-3 text-sm text-blue-700"><div className="flex justify-between gap-3"><span>{text.originalSize}</span><strong>{uploadedImage.width} × {uploadedImage.height}px</strong></div><div className="mt-1 flex justify-between gap-3"><span>{text.outputFormat}</span><strong>{outputFormat.toUpperCase()}</strong></div></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{text.width}</span><div className="flex items-center gap-2"><input type="number" min="1" max="10000" value={width} onChange={e=>handleWidthChange(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/><span className="text-sm text-gray-500">px</span></div></label>
        <button type="button" onClick={()=>setLocked(v=>!v)} className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100" title={locked?text.unlock:text.lock}>{locked?<Lock className="h-4 w-4"/>:<Unlock className="h-4 w-4"/>}{locked?text.locked:text.unlocked}</button>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{text.height}</span><div className="flex items-center gap-2"><input type="number" min="1" max="10000" value={height} onChange={e=>handleHeightChange(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/><span className="text-sm text-gray-500">px</span></div></label>
      </div>
      <p className="mt-3 text-xs text-gray-500">{text.note}</p>
      <button type="button" onClick={handleResize} disabled={isResizing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Maximize2 className="h-5 w-5"/>{isResizing?text.resizing:text.button}</button>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </> : <div>
      <div className="mb-4 text-center"><p className="text-lg font-bold text-gray-800">{text.complete}</p><p className="mt-1 text-sm text-gray-500">{result.width} × {result.height}px · {formatBytes(result.size)}</p></div>
      <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-500">{text.original}</p><p className="mt-1 font-semibold">{uploadedImage.width} × {uploadedImage.height}px</p><p className="mt-1 text-gray-500">{formatBytes(uploadedImage.size)}</p></div><div className="rounded-xl bg-blue-50 p-3"><p className="text-blue-600">{text.result}</p><p className="mt-1 font-semibold">{result.width} × {result.height}px</p><p className="mt-1 text-blue-600">{formatBytes(result.size)}</p></div></div>
      <a href={result.dataUrl} download={result.filename} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white shadow-sm hover:opacity-90"><Download className="h-5 w-5"/>{text.download}</a>
      <button type="button" onClick={()=>setResult(null)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><RotateCcw className="h-4 w-4"/>{text.again}</button>
      <button type="button" onClick={onReset} className="mt-2 w-full text-sm text-gray-500 underline hover:text-gray-700">{ko?"다른 이미지 선택하기":"Choose another image"}</button>
    </div>}
  </section>;
}
