import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { ShieldCheck, AlertCircle, Languages, Home, Image as ImageIcon, QrCode, Calculator, Type, FileText, ArrowRight, Sparkles, Zap, Lock } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ConversionSettings from "@/components/ConversionSettings";
import ResultComparison from "@/components/ResultComparison";
const ImageCompressor = lazy(() => import("@/components/ImageCompressor"));
const ImageResizer = lazy(() => import("@/components/ImageResizer"));
const QRGenerator = lazy(() => import("@/components/QRGenerator"));
const CompoundCalculator = lazy(() => import("@/components/CompoundCalculator"));
const TextCounter = lazy(() => import("@/components/TextCounter"));
const ImageEditor = lazy(() => import("@/components/ImageEditor"));
const BatchConverter = lazy(() => import("@/components/BatchConverter"));
const ImageSizeCompare = lazy(() => import("@/components/ImageSizeCompare"));
const ImageDpiCalculator = lazy(() => import("@/components/ImageDpiCalculator"));
const TextCleaner = lazy(() => import("@/components/TextCleaner"));
const PDFTools = lazy(() => import("@/components/PDFTools"));
import AdSlot from "@/components/AdSlot";
import InfoPages from "@/components/InfoPages";
import InfoPageNav, { type InfoPageKey } from "@/components/InfoPageNav";
import SEOInfoPage, { getSEOPage } from "@/components/SEOInfoPage";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONVERSION_QUALITY = 0.9;
const VISITOR_COUNTER_URL = "https://countapi.mileshilliard.com/api/v1/hit/hosi4242-convert-images-visits";

type Category = "image" | "qr" | "calculator" | "text" | "pdf";
type ImageMode = "convert" | "compress" | "resize" | "edit" | "batch" | "compare" | "dpi";
type TextMode = "counter" | "cleaner";

function App() {
  const seoPage = getSEOPage(window.location.pathname);
  if (seoPage) return <SEOInfoPage page={seoPage} />;

  const { t, language, toggleLanguage } = useI18n();
  const ko = language === "ko";
  const [category, setCategory] = useState<Category>("image");
  const [imageMode, setImageMode] = useState<ImageMode>("convert");
  const [textMode, setTextMode] = useState<TextMode>("counter");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [infoPage, setInfoPage] = useState<InfoPageKey | null>(null);
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("toolmingle-recent-tools") || "[]");
      return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string").slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  const rememberTool = (id: string) => {
    setRecentTools((prev) => {
      const next = [id, ...prev.filter((item) => item !== id)].slice(0, 6);
      localStorage.setItem("toolmingle-recent-tools", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    fetch(VISITOR_COUNTER_URL)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && (typeof data?.value === "number" || typeof data?.value === "string")) {
          const count = Number(data.value);
          if (Number.isFinite(count)) setVisitorCount(count);
        }
      })
      .catch(() => {
        // Visitor counter is optional; the site remains fully usable if it is unavailable.
      });

    return () => { cancelled = true; };
  }, []);

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
    setCategory(next);
    setInfoPage(null);
    setError(null);
    if (next !== "image") resetImage();
  };

  const categoryButton = (active: boolean) =>
    `group flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-bold leading-tight transition-all sm:min-h-24 sm:px-2.5 sm:py-3 sm:text-sm ${active ? "bg-white text-blue-700 shadow-lg ring-1 ring-blue-100" : "text-gray-500 hover:-translate-y-0.5 hover:bg-white/90 hover:text-gray-700"}`;

  const subButton = (active: boolean) =>
    `group flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center text-xs font-bold leading-tight transition-all sm:px-3 sm:text-sm ${active ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`;

  const featurePill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
      {icon}{text}
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-blue-100/50 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 shadow-lg shadow-blue-200/30">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-5 sm:py-7">
          <div className="flex items-center justify-end gap-2">
            {uploadedImage && (
              <button type="button" onClick={resetImage} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30">
                <Home className="h-4 w-4" />{t.homeButton}
              </button>
            )}
            <button type="button" onClick={toggleLanguage} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30">
              <Languages className="h-4 w-4" />{language === "ko" ? "EN" : "한"}
            </button>
          </div>
          <div className="mx-auto max-w-3xl py-6 text-center sm:py-8">
            <div className="mb-2 text-2xl font-black tracking-tight text-white drop-shadow-sm sm:text-3xl">
              ToolMingle
            </div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {ko ? "무료 · 간편 · 브라우저에서 바로 사용" : "Free · Simple · Browser-based"}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
              {ko ? "필요한 도구를 한곳에서" : "All the tools you need, in one place"}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              {ko ? "이미지부터 PDF, QR 코드, 생활 계산까지. 설치와 회원가입 없이 브라우저에서 간편하게 이용하세요." : "Images, QR codes, and everyday calculations — all in your browser, with no installation or sign-up."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {featurePill(<Zap className="h-3.5 w-3.5 text-amber-500" />, ko ? "빠른 처리" : "Fast")}
              {featurePill(<Lock className="h-3.5 w-3.5 text-blue-600" />, ko ? "브라우저 처리" : "Browser processing")}
              {featurePill(<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />, ko ? "외부 전송 없음" : "No external upload")}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-7">
        <AdSlot labelKey="adSlot" />

        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{ko ? "TOOLS" : "TOOLS"}</p>
              <h2 className="mt-0.5 text-lg font-extrabold text-slate-800 sm:text-xl">{ko ? "무엇을 사용하시겠어요?" : "What would you like to use?"}</h2>
            </div>
            <span className="hidden text-xs text-slate-400 sm:block">{ko ? "원하는 도구를 선택하세요" : "Choose a tool to get started"}</span>
          </div>

          <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-white/70 bg-white/65 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:grid-cols-5 sm:gap-2.5 sm:p-2.5">
            <button type="button" onClick={() => selectCategory("image")} className={categoryButton(category === "image")}>
              <ImageIcon className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "image" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{ko ? "이미지 도구" : "Image Tools"}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "image" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "변환 · 압축 · 편집" : "Convert · Compress · Edit"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("qr"); rememberTool("qr"); }} className={categoryButton(category === "qr")}>
              <QrCode className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "qr" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{ko ? "QR 코드" : "QR Code"}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "qr" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "URL · 텍스트 · Wi-Fi" : "URL · Text · Wi-Fi"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("calculator"); rememberTool("calculator"); }} className={categoryButton(category === "calculator")}>
              <Calculator className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "calculator" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{ko ? "복합 계산기" : "Calculator"}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "calculator" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "비율 · 할인 · 부가세" : "Percent · Discount · VAT"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("text"); rememberTool("text"); }} className={categoryButton(category === "text")}>
              <Type className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "text" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{ko ? "텍스트 도구" : "Text Tools"}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "text" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "글자 수 · 바이트" : "Characters · Bytes"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("pdf"); rememberTool("pdf"); }} className={`${categoryButton(category === "pdf")} col-span-2 sm:col-span-1`}>
              <FileText className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "pdf" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{ko ? "PDF 변환" : "PDF Tools"}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "pdf" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "PDF · 이미지" : "PDF · Images"}</span>
            </button>
          </nav>
        </section>

        {recentTools.length > 0 && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-700">{ko ? "최근 사용한 도구" : "Recently used"}</h2>
              <button type="button" onClick={() => { setRecentTools([]); localStorage.removeItem("toolmingle-recent-tools"); }} className="text-xs font-medium text-slate-400 hover:text-blue-600">
                {ko ? "기록 지우기" : "Clear"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {recentTools.map((id) => {
                const recentMap: Record<string, { ko: string; en: string; category: Category; imageMode?: ImageMode; textMode?: TextMode }> = {
                  image: { ko: "이미지 변환", en: "Image conversion", category: "image", imageMode: "convert" },
                  compress: { ko: "이미지 압축", en: "Image compression", category: "image", imageMode: "compress" },
                  resize: { ko: "이미지 크기 조절", en: "Image resizing", category: "image", imageMode: "resize" },
                  edit: { ko: "이미지 편집", en: "Image editing", category: "image", imageMode: "edit" },
                  batch: { ko: "이미지 일괄 변환", en: "Batch conversion", category: "image", imageMode: "batch" },
                  compare: { ko: "이미지 용량 비교", en: "Image size comparison", category: "image", imageMode: "compare" },
                  dpi: { ko: "DPI 계산", en: "DPI calculator", category: "image", imageMode: "dpi" },
                  qr: { ko: "QR 코드", en: "QR code", category: "qr" },
                  calculator: { ko: "복합 계산기", en: "Calculator", category: "calculator" },
                  text: { ko: "글자 수·바이트", en: "Character counter", category: "text", textMode: "counter" },
                  cleaner: { ko: "텍스트 정리", en: "Text cleaner", category: "text", textMode: "cleaner" },
                  pdf: { ko: "PDF 도구", en: "PDF tools", category: "pdf" }
                };
                const item = recentMap[id];
                if (!item) return null;
                return (
                  <button key={id} type="button" onClick={() => {
                    setCategory(item.category);
                    if (item.imageMode) setImageMode(item.imageMode);
                    if (item.textMode) setTextMode(item.textMode);
                    setInfoPage(null);
                    setError(null);
                  }} className="min-h-11 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-left text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    {ko ? item.ko : item.en}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {infoPage ? <InfoPages page={infoPage} onBack={() => setInfoPage(null)} /> : <>{category === "image" && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-700">{ko ? "이미지 도구" : "Image tools"}</h3>
              <span className="text-xs text-slate-400">{ko ? "7가지 기능" : "7 tools"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <button type="button" onClick={() => { setImageMode("convert"); setResult(null); rememberTool("image"); }} className={subButton(imageMode === "convert")}><span className="whitespace-nowrap">{t.conversionTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "convert" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("compress"); setResult(null); rememberTool("compress"); }} className={subButton(imageMode === "compress")}><span className="whitespace-nowrap">{t.compressionTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "compress" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("resize"); setResult(null); rememberTool("resize"); }} className={subButton(imageMode === "resize")}><span className="whitespace-nowrap">{t.resizeTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "resize" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("edit"); setResult(null); rememberTool("edit"); }} className={subButton(imageMode === "edit")}><span className="whitespace-nowrap">{ko ? "편집" : "Edit"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "edit" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("batch"); setResult(null); rememberTool("batch"); }} className={subButton(imageMode === "batch")}><span className="whitespace-nowrap">{ko ? "일괄 변환" : "Batch"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "batch" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("compare"); setResult(null); rememberTool("compare"); }} className={subButton(imageMode === "compare")}><span className="whitespace-nowrap">{ko ? "용량 비교" : "Size compare"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "compare" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("dpi"); setResult(null); rememberTool("dpi"); }} className={subButton(imageMode === "dpi")}><span className="whitespace-nowrap">{ko ? "DPI 계산" : "DPI"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "dpi" ? "opacity-100" : "opacity-0"}`} /></button>
            </div>
          </section>
        )}

        {category === "image" && <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100/70 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm leading-5 text-blue-700">{ko ? "이미지 파일은 브라우저에서 처리되며 외부 서버로 업로드하지 않습니다." : "Image files are processed in your browser and are not uploaded to an external server."}</p>
        </div>}

        {category === "text" && (
          <section className="mb-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-700">{ko ? "텍스트 도구" : "Text tools"}</h3>
              <span className="text-xs text-slate-400">{ko ? "2가지 기능" : "2 tools"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setTextMode("counter"); rememberTool("text"); }} className={subButton(textMode === "counter")}>{ko ? "글자 수·바이트" : "Character counter"}</button>
              <button type="button" onClick={() => { setTextMode("cleaner"); rememberTool("cleaner"); }} className={subButton(textMode === "cleaner")}>{ko ? "텍스트 정리" : "Text cleaner"}</button>
            </div>
          </section>
        )}

        {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100/50 bg-red-50/80 px-4 py-2.5"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" /><p className="text-sm text-red-700">{error}</p></div>}

        <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{ko ? "도구를 불러오는 중..." : "Loading tool..."}</div>}>
          {category === "qr" ? <QRGenerator /> :
         category === "calculator" ? <CompoundCalculator /> :
         category === "text" ? (textMode === "cleaner" ? <TextCleaner /> : <TextCounter />) :
         category === "pdf" ? <PDFTools /> :
         imageMode === "batch" ? <BatchConverter /> :
         imageMode === "compare" ? <ImageSizeCompare /> :
         imageMode === "dpi" ? <ImageDpiCalculator /> :
         !uploadedImage ? <UploadBox onFileSelect={handleFileSelect} uploadedImage={null} /> :
         <div className="space-y-4">
           <UploadBox onFileSelect={handleFileSelect} uploadedImage={uploadedImage} />
           <AdSlot labelKey="adSlot" />
           {imageMode === "convert" ? (!result
             ? <ConversionSettings format={format} onFormatChange={setFormat} onConvert={handleConvert} isConverting={isConverting} />
             : <ResultComparison originalFile={uploadedImage.file} originalPreviewUrl={uploadedImage.previewUrl} originalWidth={uploadedImage.width} originalHeight={uploadedImage.height} result={result} onDownload={() => {}} onReset={resetImage} />)
             : imageMode === "compress" ? <ImageCompressor uploadedImage={uploadedImage} onReset={resetImage} />
             : imageMode === "resize" ? <ImageResizer uploadedImage={uploadedImage} onReset={resetImage} />
             : <ImageEditor uploadedImage={uploadedImage} onReset={resetImage} />}
         </div>}

        {!infoPage && (
          <section className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{ko ? "서비스 안내" : "ABOUT THE TOOLS"}</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-800 sm:text-xl">{ko ? "필요한 작업에 맞는 도구를 간편하게 선택하세요" : "Choose the right tool for your task"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{ko ? "자주 사용하는 이미지 작업부터 PDF, QR 코드, 생활 계산, 텍스트 확인까지 별도 프로그램 설치 없이 브라우저에서 이용할 수 있습니다." : "Use common image tools, QR generation, everyday calculations, and text utilities directly in your browser without installing software."}</p>
            </div>
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-bold text-slate-800">{ko ? "도구별 빠른 안내" : "Quick guide by tool"}</h3>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                <p><strong>{ko ? "이미지 변환:" : "Image conversion:"}</strong> {ko ? "JPG, PNG, WebP, AVIF, HEIC 등 이미지 형식을 바꿀 때 사용하세요." : "Change image formats such as JPG, PNG, WebP, AVIF, and HEIC."}</p>
                <p><strong>{ko ? "이미지 압축:" : "Image compression:"}</strong> {ko ? "이미지 크기를 유지하면서 파일 용량을 줄일 때 사용하세요." : "Reduce image file size while keeping image dimensions."}</p>
                <p><strong>{ko ? "이미지 크기 조정:" : "Image resizing:"}</strong> {ko ? "가로·세로 크기를 원하는 크기로 변경할 때 사용하세요." : "Change image width and height to your preferred dimensions."}</p>
                <p><strong>{ko ? "이미지 용량 비교:" : "Image size comparison:"}</strong> {ko ? "두 이미지의 파일 용량과 절감률을 비교할 수 있습니다." : "Compare the file sizes and reduction rate of two images."}</p>
                <p><strong>{ko ? "DPI·인쇄 크기:" : "DPI & print size:"}</strong> {ko ? "픽셀과 DPI를 이용해 예상 인쇄 크기를 계산할 수 있습니다." : "Calculate an estimated print size from pixels and DPI."}</p>
                <p><strong>{ko ? "QR 코드:" : "QR code:"}</strong> {ko ? "URL이나 텍스트를 공유하기 위한 QR 코드를 생성할 수 있습니다." : "Create a QR code for a URL or text."}</p>
                <p><strong>{ko ? "글자 수·바이트:" : "Character & byte counter:"}</strong> {ko ? "글자 수와 UTF-8 바이트 수를 빠르게 확인할 수 있습니다." : "Check character counts and UTF-8 byte size quickly."}</p>
                <p><strong>{ko ? "PDF 도구:" : "PDF tools:"}</strong> {ko ? "여러 이미지를 PDF로 묶거나 PDF의 기본 정보를 확인할 수 있습니다." : "Combine images into a PDF or check basic PDF information."}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "이미지 도구" : "Image tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "JPG·PNG·WebP 등 이미지 형식을 변환하고, 파일 용량을 줄이거나 크기를 조정할 수 있습니다. 간단한 편집과 여러 이미지의 일괄 변환, 용량 비교와 DPI 계산도 지원합니다." : "Convert common image formats, reduce file size, resize images, make simple edits, process multiple images in one batch, compare file sizes, and calculate print size from DPI."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "QR 코드" : "QR code"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "웹사이트 주소나 텍스트 등 필요한 정보를 QR 코드로 만들 수 있습니다. 간단한 공유용 QR 코드를 빠르게 생성할 수 있습니다." : "Create QR codes from website addresses, text, and other supported information for quick sharing."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "복합 계산기" : "Calculator"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "비율, 퍼센트, 할인, 부가세, 날짜, 단위, 증감률, 마진, 대출 이자, 할부, 시간 등 일상에서 자주 필요한 계산을 한곳에서 확인할 수 있습니다." : "Calculate percentages, discounts, VAT, dates, units, changes, margins, loan payments, installments, time, and other everyday values in one place."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "PDF 도구" : "PDF tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "여러 JPG·PNG 이미지를 하나의 PDF로 묶고, PDF를 합치거나 페이지를 삭제·재정렬·분할하고 기본 파일 정보를 확인할 수 있습니다." : "Combine images into PDF, merge PDFs, delete or reorder pages, split page ranges, and check basic PDF information."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "텍스트 도구" : "Text tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "입력한 글의 글자 수와 바이트를 확인하고, 복사한 텍스트의 공백·줄바꿈·중복 줄을 정리할 수 있습니다." : "Check character and byte counts, and clean spaces, line breaks, and duplicate lines in pasted text."}</p></div>
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <p className="text-xs leading-5 text-blue-700">{ko ? "파일 기반 이미지 작업은 브라우저에서 처리되며, 사이트는 변환을 위해 사용자의 이미지 파일을 외부 서버에 업로드하지 않습니다." : "Image file operations are processed in the browser, and the site does not upload your image files to an external server for conversion."}</p>
            </div>
          </section>
        )}

        <AdSlot labelKey="adSlot" />
        </>}
        <footer className="mt-6 border-t border-slate-200/60 pt-5 pb-6 text-center text-xs leading-5 text-gray-500">
          <p>{ko ? "ToolMingle · 이미지 · QR · 계산 · 텍스트 · PDF" : "ToolMingle · Image · QR · Calculator · Text · PDF"}</p>
          <p className="mt-1">{ko ? "설치 없이 브라우저에서 간편하게 이용하세요." : "Simple browser-based tools with no installation required."}</p>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">{ko ? "현재 제공 도구: 이미지 변환·압축·크기 조정·편집·일괄 변환, QR 코드, 계산기, 글자 수·바이트 계산, PDF 도구" : "Tools: image conversion, compression, resizing, editing, batch conversion, QR codes, calculators, and text counting."}</p>
          <nav className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5" aria-label={ko ? "도구 안내" : "Tool guides"}>
            {[
              ["/image-converter", ko ? "이미지 변환" : "Image conversion"],
              ["/image-compressor", ko ? "이미지 압축" : "Image compression"],
              ["/image-resizer", ko ? "이미지 크기 조절" : "Image resizing"],
              ["/qr-code", ko ? "QR코드" : "QR code"],
              ["/calculator", ko ? "계산기" : "Calculator"],
              ["/text-tools", ko ? "텍스트 도구" : "Text tools"],
              ["/pdf-tools", ko ? "PDF 도구" : "PDF tools"]
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-[11px] font-medium text-slate-400 hover:text-blue-600">{label}</a>
            ))}
          </nav>
          <InfoPageNav active={infoPage} onChange={setInfoPage} />
          {visitorCount !== null && (
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              {ko ? "누적 방문자" : "Total visitors"} <span className="font-bold text-slate-500">{visitorCount.toLocaleString()}</span>
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}

export default App;
