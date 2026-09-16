import { useState, useCallback } from "react";
import { ShieldCheck, AlertCircle, Languages, Home } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ConversionSettings from "@/components/ConversionSettings";
import ResultComparison from "@/components/ResultComparison";
import ImageCompressor from "@/components/ImageCompressor";
import AdSlot from "@/components/AdSlot";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type Quality, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type ToolMode = "convert" | "compress";

function App() {
  const { t, language, toggleLanguage } = useI18n();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState<Quality>(0.9);
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
        setUploadedImage({
          file,
          previewUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
        });
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
      const conversionResult = await convertImage(uploadedImage.file, format, quality);
      setResult(conversionResult);
    } catch {
      if (format === "avif") {
        setError(t.errorAvifNotSupported);
      } else {
        setError(t.errorConversionFailed);
      }
    } finally {
      setIsConverting(false);
    }
  }, [uploadedImage, format, quality, t]);

  const handleModeChange = useCallback((nextMode: ToolMode) => {
    setMode(nextMode);
    setResult(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setResult(null);
    setError(null);
  }, [uploadedImage]);

  return (
    <div className="min-h-screen">
      {/* 헤더 - 그라데이션 배경 */}
      <header className="relative overflow-hidden border-b border-blue-100/50 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 shadow-lg shadow-blue-200/30">
        {/* 장식용 블롭 */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 py-6 sm:py-8">
          {/* 상단 버튼 행 */}
          <div className="mb-3 flex items-center justify-end gap-2">
            {/* 처음으로 버튼 - 이미지가 업로드된 상태에서만 표시 */}
            {uploadedImage && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <Home className="h-4 w-4" />
                {t.homeButton}
              </button>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label={language === "ko" ? t.switchToEnglish : t.switchToKorean}
            >
              <Languages className="h-4 w-4" />
              {language === "ko" ? "EN" : "한"}
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-white drop-shadow-sm sm:text-3xl">
              {t.headerTitle}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-blue-50 sm:text-base">
              {t.headerSubtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:py-5">
        <AdSlot labelKey="adSlot" />

        {/* 개인정보 안내 */}
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100/50 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">
            {t.privacyNotice}
          </p>
        </div>

        {/* 기능 선택 */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-md backdrop-blur-sm">
          <button
            type="button"
            onClick={() => handleModeChange("convert")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              mode === "convert"
                ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            {t.headerTitle}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("compress")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              mode === "compress"
                ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            {t.compressionTab}
          </button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100/50 bg-red-50/80 px-4 py-2.5 backdrop-blur-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 업로드 박스 또는 기능 설정 */}
        {!uploadedImage ? (
          <UploadBox onFileSelect={handleFileSelect} uploadedImage={null} />
        ) : (
          <div className="space-y-4">
            <UploadBox onFileSelect={handleFileSelect} uploadedImage={uploadedImage} />

            <AdSlot labelKey="adSlot" />

            {mode === "convert" ? (
              !result ? (
                <ConversionSettings
                  format={format}
                  quality={quality}
                  onFormatChange={setFormat}
                  onQualityChange={setQuality}
                  onConvert={handleConvert}
                  isConverting={isConverting}
                />
              ) : (
                <ResultComparison
                  originalFile={uploadedImage.file}
                  originalPreviewUrl={uploadedImage.previewUrl}
                  originalWidth={uploadedImage.width}
                  originalHeight={uploadedImage.height}
                  result={result}
                  onDownload={() => {}}
                  onReset={handleReset}
                />
              )
            ) : (
              <ImageCompressor
                uploadedImage={uploadedImage}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        <AdSlot labelKey="adSlot" />

        {/* SEO용 자연스러운 설명 문구 */}
        <section className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm leading-relaxed text-gray-600 shadow-md backdrop-blur-sm sm:p-5 sm:text-base">
          <p>
            {t.seoDescriptionP1}
          </p>
          <p className="mt-3">
            {t.seoDescriptionP2}
          </p>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-blue-100/50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 text-center text-sm font-bold text-gray-600">
          <p>{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
