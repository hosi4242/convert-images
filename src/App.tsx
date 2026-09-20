import { useState, useCallback } from "react";
import { ShieldCheck, AlertCircle, Languages, Home } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ConversionSettings from "@/components/ConversionSettings";
import ResultComparison from "@/components/ResultComparison";
import ImageCompressor from "@/components/ImageCompressor";
import ImageResizer from "@/components/ImageResizer";
import QRGenerator from "@/components/QRGenerator";
import AdSlot from "@/components/AdSlot";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONVERSION_QUALITY = 0.9;
type ToolMode = "convert" | "compress" | "resize" | "qr";

function App() {
  const { t, language, toggleLanguage } = useI18n();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ToolMode>("convert");

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    if (!isSupportedImage(file)) {
      setError(t.errorUnsupportedFormat);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.errorFileTooLarge);
      return;
    }
    try {
      const previewUrl = await createPreviewUrl(file);
      const img = new Image();
      img.onload = () => {
        setUploadedImage({ file, previewUrl, width: img.naturalWidth, height: img.naturalHeight, size: file.size });
      };
      img.onerror = () => {
        URL.revokeObjectURL(previewUrl);
        setError(t.errorImageLoadFailed);
      };
      img.src = previewUrl;
    } catch {
      setError(isHeicFile(file) ? t.errorHeicLoadFailed : t.errorImageLoadFailed);
    }
  }, [t]);

  const handleConvert = useCallback(async () => {
    if (!uploadedImage) return;
    setIsConverting(true);
    setError(null);
    try {
      const conversionResult = await convertImage(uploadedImage.file, format, CONVERSION_QUALITY);
      setResult(conversionResult);
    } catch {
      setError(format === "avif" ? t.errorAvifNotSupported : t.errorConversionFailed);
    } finally {
      setIsConverting(false);
    }
  }, [uploadedImage, format, t]);

  const handleModeChange = useCallback((nextMode: ToolMode) => {
    setMode(nextMode);
    setResult(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage.previewUrl);
    setUploadedImage(null);
    setResult(null);
    setError(null);
  }, [uploadedImage]);

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-blue-100/50 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 shadow-lg shadow-blue-200/30">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-3 flex items-center justify-end gap-2">
            {uploadedImage && (
              <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40">
                <Home className="h-4 w-4" />
                {t.homeButton}
              </button>
            )}
            <button type="button" onClick={toggleLanguage} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40" aria-label={language === "ko" ? t.switchToEnglish : t.switchToKorean}>
              <Languages className="h-4 w-4" />
              {language === "ko" ? "EN" : "??"}
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white drop-shadow-sm sm:text-3xl">{t.headerTitle}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-blue-50 sm:text-base">{t.headerSubtitle}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:py-5">
        <AdSlot labelKey="adSlot" />
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100/50 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">{t.privacyNotice}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-md backdrop-blur-sm sm:grid-cols-4">
          <button type="button" onClick={() => handleModeChange("convert")} className={`whitespace-nowrap rounded-xl px-2 py-2.5 text-xs font-bold leading-tight transition-colors sm:text-sm ${mode === "convert" ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`}>{t.conversionTab}</button>
          <button type="button" onClick={() => handleModeChange("compress")} className={`whitespace-nowrap rounded-xl px-2 py-2.5 text-xs font-bold leading-tight transition-colors sm:text-sm ${mode === "compress" ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`}>{t.compressionTab}</button>
          <button type="button" onClick={() => handleModeChange("resize")} className={`whitespace-nowrap rounded-xl px-2 py-2.5 text-xs font-bold leading-tight transition-colors sm:text-sm ${mode === "resize" ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`}>{t.resizeTab}</button>
          <button type="button" onClick={() => handleModeChange("qr")} className={`whitespace-nowrap rounded-xl px-2 py-2.5 text-xs font-bold leading-tight transition-colors sm:text-sm ${mode === "qr" ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`}>{t.qrTab}</button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100/50 bg-red-50/80 px-4 py-2.5 backdrop-blur-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {mode === "qr" ? (
          <QRGenerator />
        ) : !uploadedImage ? (
          <UploadBox onFileSelect={handleFileSelect} uploadedImage={null} />
        ) : (
          <div className="space-y-4">
            <UploadBox onFileSelect={handleFileSelect} uploadedImage={uploadedImage} />
            <AdSlot labelKey="adSlot" />
            {mode === "convert" ? (
              !result ? (
                <ConversionSettings format={format} onFormatChange={setFormat} onConvert={handleConvert} isConverting={isConverting} />
              ) : (
                <ResultComparison originalFile={uploadedImage.file} originalPreviewUrl={uploadedImage.previewUrl} originalWidth={uploadedImage.width} originalHeight={uploadedImage.height} result={result} onDownload={() => {}} onReset={handleReset} />
              )
            ) : mode === "compress" ? (
              <ImageCompressor uploadedImage={uploadedImage} onReset={handleReset} />
            ) : (
              <ImageResizer uploadedImage={uploadedImage} onReset={handleReset} />
            )}
          </div>
        )}

        <AdSlot labelKey="adSlot" />
        <footer className="mt-5 pb-6 text-center text-xs text-gray-500">
          <p>{t.footerText}</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
