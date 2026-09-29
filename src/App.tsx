import { useState, useCallback } from "react";
import { ShieldCheck, AlertCircle, Languages, Home, Image as ImageIcon, QrCode, Calculator } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ConversionSettings from "@/components/ConversionSettings";
import ResultComparison from "@/components/ResultComparison";
import ImageCompressor from "@/components/ImageCompressor";
import ImageResizer from "@/components/ImageResizer";
import QRGenerator from "@/components/QRGenerator";
import CompoundCalculator from "@/components/CompoundCalculator";
import ImageEditor from "@/components/ImageEditor";
import BatchConverter from "@/components/BatchConverter";
import AdSlot from "@/components/AdSlot";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONVERSION_QUALITY = 0.9;
type Category = "image" | "qr" | "calculator";
type ImageMode = "convert" | "compress" | "resize" | "edit" | "batch";

function App() {
  const { t, language, toggleLanguage } = useI18n();
  const ko = language === "ko";
  const [category, setCategory] = useState<Category>("image");
  const [imageMode, setImageMode] = useState<ImageMode>("convert");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    if (!isSupportedImage(file)) { setError(t.errorUnsupportedFormat); return; }
    if (file.size > MAX_FILE_SIZE) { setError(t.errorFileTooLarge); return; }
    try {
      const previewUrl = await createPreviewUrl(file);
      const img = new Image();
      img.onload = () => setUploadedImage({ file, previewUrl, width: img.naturalWidth, height: img.naturalHeight, size: file.size });
      img.onerror = () => { URL.revokeObjectURL(previewUrl); setError(t.errorImageLoadFailed); };
      img.src = previewUrl;
    } catch {
      setError(isHeicFile(file) ? t.errorHeicLoadFailed : t.errorImageLoadFailed);
    }
  }, [t]);

  const handleConvert = useCallback(async () => {
    if (!uploadedImage) return;
    setIsConverting(true); setError(null);
    try { setResult(await convertImage(uploadedImage.file, format, CONVERSION_QUALITY)); }
    catch { setError(format === "avif" ? t.errorAvifNotSupported : t.errorConversionFailed); }
    finally { setIsConverting(false); }
  }, [uploadedImage, format, t]);

  const resetImage = useCallback(() => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage.previewUrl);
    setUploadedImage(null); setResult(null); setError(null);
  }, [uploadedImage]);

  const selectCategory = (next: Category) => {
    setCategory(next); setError(null);
    if (next !== "image") resetImage();
  };

  const categoryButton = (active: boolean) =>
    `flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-bold transition-all sm:text-sm ${active ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100" : "text-gray-500 hover:bg-white/80 hover:text-gray-700"}`;

  const subButton = (active: boolean) =>
    `rounded-xl px-3 py-2.5 text-xs font-bold transition-colors sm:text-sm ${active ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`;

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-blue-100/50 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 shadow-lg shadow-blue-200/30">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-3 flex items-center justify-end gap-2">
            {uploadedImage && <button type="button" onClick={resetImage} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"><Home className="h-4 w-4" />{t.homeButton}</button>}
            <button type="button" onClick={toggleLanguage} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"><Languages className="h-4 w-4" />{language === "ko" ? "EN" : "한"}</button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white drop-shadow-sm sm:text-3xl">{ko ? "올인원 이미지 · QR · 계산 도구" : "All-in-One Image · QR · Calculator"}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-blue-50 sm:text-base">{ko ? "설치 없이 브라우저에서 바로 사용하는 무료 온라인 도구" : "Free browser-based tools with no installation required"}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:py-5">
        <AdSlot labelKey="adSlot" />
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100/50 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">{ko ? "이미지 처리는 브라우저에서 이루어지며 이미지 파일을 외부 서버로 전송하지 않습니다." : "Image processing happens in your browser and files are not uploaded to an external server."}</p>
        </div>

        <nav className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-md backdrop-blur-sm">
          <button type="button" onClick={() => selectCategory("image")} className={categoryButton(category === "image")}><ImageIcon className="h-5 w-5" />{ko ? "이미지 도구" : "Image Tools"}</button>
          <button type="button" onClick={() => selectCategory("qr")} className={categoryButton(category === "qr")}><QrCode className="h-5 w-5" />{ko ? "QR 코드" : "QR Code"}</button>
          <button type="button" onClick={() => selectCategory("calculator")} className={categoryButton(category === "calculator")}><Calculator className="h-5 w-5" />{ko ? "복합 계산기" : "Calculator"}</button>
        </nav>

        {category === "image" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-md backdrop-blur-sm">
              <button type="button" onClick={() => { setImageMode("convert"); setResult(null); }} className={subButton(imageMode === "convert")}>{t.conversionTab}</button>
              <button type="button" onClick={() => { setImageMode("compress"); setResult(null); }} className={subButton(imageMode === "compress")}>{t.compressionTab}</button>
              <button type="button" onClick={() => { setImageMode("resize"); setResult(null); }} className={subButton(imageMode === "resize")}>{t.resizeTab}</button>
              <button type="button" onClick={() => { setImageMode("edit"); setResult(null); }} className={subButton(imageMode === "edit")}>{ko ? "편집" : "Edit"}</button>
              <button type="button" onClick={() => { setImageMode("batch"); setResult(null); }} className={subButton(imageMode === "batch")}>{ko ? "일괄 변환" : "Batch"}</button>
            </div>
          </>
        )}

        {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100/50 bg-red-50/80 px-4 py-2.5"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" /><p className="text-sm text-red-700">{error}</p></div>}

        {category === "qr" ? <QRGenerator /> :
         category === "calculator" ? <CompoundCalculator /> :
         !uploadedImage ? <UploadBox onFileSelect={handleFileSelect} uploadedImage={null} /> :
         <div className="space-y-4">
           <UploadBox onFileSelect={handleFileSelect} uploadedImage={uploadedImage} />
           <AdSlot labelKey="adSlot" />
           {imageMode === "convert" ? (!result
             ? <ConversionSettings format={format} onFormatChange={setFormat} onConvert={handleConvert} isConverting={isConverting} />
             : <ResultComparison originalFile={uploadedImage.file} originalPreviewUrl={uploadedImage.previewUrl} originalWidth={uploadedImage.width} originalHeight={uploadedImage.height} result={result} onDownload={() => {}} onReset={resetImage} />)
             : imageMode === "compress" ? <ImageCompressor uploadedImage={uploadedImage} onReset={resetImage} /> : <ImageResizer uploadedImage={uploadedImage} onReset={resetImage} />}
         </div>}

        <AdSlot labelKey="adSlot" />
        <footer className="mt-5 pb-6 text-center text-xs text-gray-500"><p>{ko ? "올인원 이미지 · QR · 계산 도구 · 브라우저에서 안전하게 처리됩니다." : "All-in-One Image · QR · Calculator · Safely processed in your browser."}</p></footer>
      </main>
    </div>
  );
}

export default App;
