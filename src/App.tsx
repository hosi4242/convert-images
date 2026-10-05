import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AlertCircle, Home, Image as ImageIcon, QrCode, Calculator, Type, FileText, Clock3, Sparkles, ShieldCheck } from "lucide-react";
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
import TimerPage from "@/components/TimerPage";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";
import LanguageSelector from "@/components/LanguageSelector";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONVERSION_QUALITY = 0.9;

type Category = "image" | "qr" | "calculator" | "text" | "pdf" | "time";
type ImageMode = "convert" | "compress" | "resize" | "edit" | "batch" | "compare" | "dpi";
type TextMode = "counter" | "cleaner";

function App() {
  if (window.location.pathname.replace(/\/$/,"") === "/timer") return <TimerPage />;
  const seoPage = getSEOPage(window.location.pathname);
  if (seoPage) return <SEOInfoPage page={seoPage} />;

  const { t, language } = useI18n();
  const ko = language === "ko";
  const copy = (k: string, e: string, _j?: string, _z?: string) => ko ? k : e;
  const [category, setCategory] = useState<Category>("image");
  const [imageMode, setImageMode] = useState<ImageMode>("convert");
  const [textMode, setTextMode] = useState<TextMode>("counter");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
            <LanguageSelector compact />
          </div>
          <div className="mx-auto max-w-3xl py-6 text-center sm:py-8">
            <div className="mb-2 text-2xl font-black tracking-tight text-white drop-shadow-sm sm:text-3xl">
              ToolMingle
            </div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {copy("무료 · 간편 · 브라우저에서 바로 사용","Free · Simple · Browser-based","無料 · 簡単 · ブラウザですぐ使える","免费 · 简单 · 浏览器直接使用")}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
              {copy("필요한 도구를 한곳에서","All the tools you need, in one place","必要なツールをひとつに","所需工具一站式使用")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              {copy("이미지부터 PDF, QR 코드, 생활 계산, 온라인 타이머까지. 설치와 회원가입 없이 브라우저에서 간편하게 이용하세요.","Images, PDFs, QR codes, everyday calculations, and online timers — all in your browser, with no installation or sign-up.","画像、PDF、QRコード、計算、オンラインタイマーまで。インストールや登録なしでブラウザから利用できます。","图片、PDF、二维码、日常计算和在线计时器，无需安装或注册即可在浏览器中使用。")}
            </p>
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-7">
        <AdSlot labelKey="adSlot" />

        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div><h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">{copy("주요 도구","Main tools","主なツール","主要工具")}</h2></div>
          </div>

          <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-white/70 bg-white/65 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:grid-cols-3 sm:gap-2.5 sm:p-2.5">
            <button type="button" onClick={() => selectCategory("image")} className={categoryButton(category === "image")}>
              <ImageIcon className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "image" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("이미지 도구","Image Tools","画像ツール","图片工具")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "image" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "변환 · 압축 · 편집" : "Convert · Compress · Edit"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("qr"); rememberTool("qr"); }} className={categoryButton(category === "qr")}>
              <QrCode className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "qr" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("QR 코드","QR Code","QRコード","二维码")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "qr" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "URL · 텍스트 · Wi-Fi" : "URL · Text · Wi-Fi"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("calculator"); rememberTool("calculator"); }} className={categoryButton(category === "calculator")}>
              <Calculator className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "calculator" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("복합 계산기","Calculator","計算ツール","计算器")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "calculator" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "비율 · 할인 · 부가세" : "Percent · Discount · VAT"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("text"); rememberTool("text"); }} className={categoryButton(category === "text")}>
              <Type className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "text" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("텍스트 도구","Text Tools","テキストツール","文本工具")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "text" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "글자 수 · 바이트" : "Characters · Bytes"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("time"); rememberTool("timer"); }} className={categoryButton(category === "time")}>
              <Clock3 className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "time" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("온라인 타이머","Online Timer","オンラインタイマー","在线计时器")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "time" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "1~60분 · 직접 설정 · 전체화면" : "1–60 min · Custom · Fullscreen"}</span>
            </button>
            <button type="button" onClick={() => { selectCategory("pdf"); rememberTool("pdf"); }} className={categoryButton(category === "pdf")}>
              <FileText className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "pdf" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{copy("PDF 변환","PDF Tools","PDFツール","PDF工具")}</span>
              <span className={`whitespace-nowrap text-[10px] font-medium ${category === "pdf" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "PDF · 이미지" : "PDF · Images"}</span>
            </button>
          </nav>
        </section>

        {recentTools.length > 0 && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-700">{copy("최근 사용한 도구","Recently used","最近使用したツール","最近使用的工具")}</h2>
              <button type="button" onClick={() => { setRecentTools([]); localStorage.removeItem("toolmingle-recent-tools"); }} className="text-xs font-medium text-slate-400 hover:text-blue-600">
                {copy("기록 지우기","Clear","履歴を消去","清除记录")}
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
                  pdf: { ko: "PDF 도구", en: "PDF tools", category: "pdf" },
                  timer: { ko: "온라인 타이머", en: "Online timer", category: "time" }
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
                  }} className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-center text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
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
              <button type="button" onClick={() => { setImageMode("convert"); setResult(null); rememberTool("image"); }} className={subButton(imageMode === "convert")}><span className="whitespace-nowrap">{t.conversionTab}</span></button>
              <button type="button" onClick={() => { setImageMode("compress"); setResult(null); rememberTool("compress"); }} className={subButton(imageMode === "compress")}><span className="whitespace-nowrap">{t.compressionTab}</span></button>
              <button type="button" onClick={() => { setImageMode("resize"); setResult(null); rememberTool("resize"); }} className={subButton(imageMode === "resize")}><span className="whitespace-nowrap">{t.resizeTab}</span></button>
              <button type="button" onClick={() => { setImageMode("edit"); setResult(null); rememberTool("edit"); }} className={subButton(imageMode === "edit")}><span className="whitespace-nowrap">{ko ? "편집" : "Edit"}</span></button>
              <button type="button" onClick={() => { setImageMode("batch"); setResult(null); rememberTool("batch"); }} className={subButton(imageMode === "batch")}><span className="whitespace-nowrap">{ko ? "일괄 변환" : "Batch"}</span></button>
              <button type="button" onClick={() => { setImageMode("compare"); setResult(null); rememberTool("compare"); }} className={subButton(imageMode === "compare")}><span className="whitespace-nowrap">{ko ? "용량 비교" : "Size compare"}</span></button>
              <button type="button" onClick={() => { setImageMode("dpi"); setResult(null); rememberTool("dpi"); }} className={subButton(imageMode === "dpi")}><span className="whitespace-nowrap">{ko ? "DPI 계산" : "DPI"}</span></button>
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
          {category === "time" ? <TimerPage /> :
          category === "qr" ? <QRGenerator /> :
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
        </Suspense>

        {!infoPage && (
          <section className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{ko ? "서비스 안내" : "ABOUT THE TOOLS"}</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-800 sm:text-xl">{ko ? "필요한 작업에 맞는 도구를 간편하게 선택하세요" : "Choose the right tool for your task"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{ko ? "자주 사용하는 이미지 작업부터 PDF, QR 코드, 생활 계산, 텍스트 확인, 온라인 타이머까지 별도 프로그램 설치 없이 브라우저에서 이용할 수 있습니다." : "Use common image tools, PDF, QR generation, everyday calculations, text utilities, and an online timer directly in your browser without installing software."}</p>
            </div>
            <div className="mb-5">
              <h3 className="mb-3 font-bold text-slate-800">{ko ? "도구별 안내" : "Tool guide"}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{ko ? "이미지 도구" : "Image tools"}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "JPG, PNG, WebP, AVIF, HEIC·HEIF 등의 이미지 형식을 변환하고, WebP 압축, 가로·세로 픽셀 크기 조정, 회전·좌우 및 상하 반전·영역 자르기, 최대 30개 이미지 일괄 변환, 두 이미지의 파일 용량 비교, 픽셀과 DPI를 이용한 예상 인쇄 크기 계산을 제공합니다." : "Convert JPG, PNG, WebP, AVIF, and HEIC/HEIF images; compress images to WebP; resize width and height in pixels; rotate, flip, and crop images; batch-convert up to 30 images; compare the file sizes of two images; and estimate print size from pixels and DPI."}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{ko ? "QR 코드" : "QR code"}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "URL, 일반 텍스트, 이메일 주소, 전화번호, Wi-Fi 정보를 QR 코드로 생성하고 PNG 이미지로 다운로드할 수 있습니다. Wi-Fi는 WPA/WPA2, WEP, 오픈 네트워크 형식을 지원합니다." : "Create QR codes for URLs, text, email addresses, phone numbers, and Wi-Fi information, then download them as PNG images. Wi-Fi supports WPA/WPA2, WEP, and open networks."}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{copy("복합 계산기","Calculator","計算ツール","计算器")}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "기본 사칙연산과 나머지·거듭제곱, 퍼센트 계산, 할인 가격, 부가세, 날짜 차이, 단위 변환, 비율, 증감률, 마진·이익·마크업, 대출 원리금균등상환, 할부 계산, 시간 차이 계산을 한곳에서 이용할 수 있습니다. 길이·무게·면적·부피·온도·데이터 단위 변환도 지원합니다." : "Use basic arithmetic including remainder and powers, percentage calculations, discounts, VAT, date differences, unit conversion, ratios, percentage change, profit/margin/markup, amortizing loan payments, installment payments, and time differences. Unit conversion covers length, weight, area, volume, temperature, and data."}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{ko ? "텍스트 도구" : "Text tools"}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "글자 수와 UTF-8 바이트 수를 확인하고, 텍스트의 각 줄 앞뒤 공백 제거, 연속 공백 정리, 빈 줄 제거, 중복 줄 제거를 선택하여 정리할 수 있습니다. 정리 결과는 바로 복사할 수 있습니다." : "Check character counts and UTF-8 byte size, then clean pasted text by trimming each line, collapsing repeated spaces, removing blank lines, or removing duplicate lines. The cleaned result can be copied directly."}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{ko ? "온라인 타이머" : "Online timer"}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "1·5·10·15·25·30·60분의 빠른 설정과 직접 설정을 지원하며, 시간·분·초를 입력해 원하는 길이로 설정할 수 있습니다. 시작, 일시정지, 계속, 초기화, 종료 알림음 켜기·끄기, 전체 화면을 지원합니다." : "Choose 1, 5, 10, 15, 25, 30, or 60 minutes, or set a custom duration using hours, minutes, and seconds. Start, pause, resume, and reset the countdown, toggle the end sound, and use fullscreen mode."}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold text-slate-800">{ko ? "PDF 도구" : "PDF tools"}</h4><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "JPG·PNG 이미지를 하나의 PDF로 만들고, 여러 PDF를 하나로 합치며, PDF 페이지를 선택해 삭제하거나 순서를 재정렬하고, 원하는 시작·끝 페이지 범위를 분할할 수 있습니다. PDF의 페이지 수와 파일 크기 같은 기본 정보도 확인할 수 있습니다." : "Create a PDF from JPG or PNG images, merge multiple PDFs, delete selected pages, reorder pages, split a selected page range, and check basic PDF information such as page count and file size."}</p></div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <p className="text-xs leading-5 text-blue-700">{ko ? "파일 기반 이미지 작업은 브라우저에서 처리되며, 사이트는 변환을 위해 사용자의 이미지 파일을 외부 서버에 업로드하지 않습니다." : "Image file operations are processed in the browser, and the site does not upload your image files to an external server for conversion."}</p>
            </div>
          </section>
        )}

        <AdSlot labelKey="adSlot" />
        </>}
        <footer className="mt-6 border-t border-slate-200/60 pt-5 pb-6 text-center text-xs leading-5 text-gray-500">
          <p>{ko ? "ToolMingle · 이미지 · QR · 계산 · 텍스트 · 타이머 · PDF" : "ToolMingle · Image · QR · Calculator · Timer · Text · PDF"}</p>
          <p className="mt-1">{ko ? "설치 없이 브라우저에서 간편하게 이용하세요." : "Simple browser-based tools with no installation required."}</p>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">{ko ? "무료 온라인 이미지·QR·계산·텍스트·PDF·타이머 도구를 제공합니다." : "Free online tools for images, QR codes, calculations, text, PDFs, and timers."}</p>
          <nav className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5" aria-label={ko ? "도구 안내" : "Tool guides"}>
            {[
              ["/image-converter", ko ? "이미지 변환" : "Image conversion"],
              ["/image-compressor", ko ? "이미지 압축" : "Image compression"],
              ["/image-resizer", ko ? "이미지 크기 조절" : "Image resizing"],
              ["/qr-code", ko ? "QR코드" : "QR code"],
              ["/calculator", ko ? "계산기" : "Calculator"],
              ["/timer", ko ? "온라인 타이머" : "Online timer"],
              ["/text-tools", ko ? "텍스트 도구" : "Text tools"],
              ["/pdf-tools", ko ? "PDF 도구" : "PDF tools"]
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-[11px] font-medium text-slate-400 hover:text-blue-600">{label}</a>
            ))}
          </nav>
          <InfoPageNav active={infoPage} onChange={setInfoPage} />
        </footer>
      </main>
    </div>
  );
}

export default App;
