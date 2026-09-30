import { useState, useCallback, useEffect } from "react";
import { ShieldCheck, AlertCircle, Languages, Home, Image as ImageIcon, QrCode, Calculator, Type, FileText, ArrowRight, Sparkles, Zap, Lock } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ConversionSettings from "@/components/ConversionSettings";
import ResultComparison from "@/components/ResultComparison";
import ImageCompressor from "@/components/ImageCompressor";
import ImageResizer from "@/components/ImageResizer";
import QRGenerator from "@/components/QRGenerator";
import CompoundCalculator from "@/components/CompoundCalculator";
import TextCounter from "@/components/TextCounter";
import ImageEditor from "@/components/ImageEditor";
import BatchConverter from "@/components/BatchConverter";
import PDFTools from "@/components/PDFTools";
import AdSlot from "@/components/AdSlot";
import InfoPages from "@/components/InfoPages";
import InfoPageNav, { type InfoPageKey } from "@/components/InfoPageNav";
import { convertImage, isSupportedImage, createPreviewUrl, isHeicFile, type ImageFormat, type ConversionResult } from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";
import { useI18n } from "@/i18n/I18nContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONVERSION_QUALITY = 0.9;
const VISITOR_COUNTER_URL = "https://countapi.mileshilliard.com/api/v1/hit/hosi4242-convert-images-visits";

type Category = "image" | "qr" | "calculator" | "text" | "pdf";
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
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [infoPage, setInfoPage] = useState<InfoPageKey | null>(null);

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
    `group flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition-all sm:min-h-24 sm:px-3 sm:py-3 sm:text-sm ${active ? "bg-white text-blue-700 shadow-lg ring-1 ring-blue-100" : "text-gray-500 hover:-translate-y-0.5 hover:bg-white/90 hover:text-gray-700"}`;

  const subButton = (active: boolean) =>
    `group flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${active ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white/70 text-gray-600 hover:bg-white"}`;

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
              <span>{ko ? "이미지 도구" : "Image Tools"}</span>
              <span className={`text-[10px] font-medium ${category === "image" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "변환 · 압축 · 편집" : "Convert · Compress · Edit"}</span>
            </button>
            <button type="button" onClick={() => selectCategory("qr")} className={categoryButton(category === "qr")}>
              <QrCode className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "qr" ? "text-blue-600" : "text-slate-400"}`} />
              <span>{ko ? "QR 코드" : "QR Code"}</span>
              <span className={`text-[10px] font-medium ${category === "qr" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "URL · 텍스트 · Wi-Fi" : "URL · Text · Wi-Fi"}</span>
            </button>
            <button type="button" onClick={() => selectCategory("calculator")} className={categoryButton(category === "calculator")}>
              <Calculator className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "calculator" ? "text-blue-600" : "text-slate-400"}`} />
              <span>{ko ? "복합 계산기" : "Calculator"}</span>
              <span className={`text-[10px] font-medium ${category === "calculator" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "비율 · 할인 · 부가세" : "Percent · Discount · VAT"}</span>
            </button>
            <button type="button" onClick={() => selectCategory("text")} className={categoryButton(category === "text")}>
              <Type className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "text" ? "text-blue-600" : "text-slate-400"}`} />
              <span>{ko ? "텍스트 도구" : "Text Tools"}</span>
              <span className={`text-[10px] font-medium ${category === "text" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "글자 수 · 바이트" : "Characters · Bytes"}</span>
            </button>
            <button type="button" onClick={() => selectCategory("pdf")} className={`${categoryButton(category === "pdf")} col-span-2 sm:col-span-1`}>
              <FileText className={`h-6 w-6 transition-transform group-hover:scale-105 ${category === "pdf" ? "text-blue-600" : "text-slate-400"}`} />
              <span>{ko ? "PDF 변환" : "PDF Tools"}</span>
              <span className={`text-[10px] font-medium ${category === "pdf" ? "text-blue-500" : "text-slate-400"}`}>{ko ? "PDF · 이미지" : "PDF · Images"}</span>
            </button>
          </nav>
        </section>

        {infoPage ? <InfoPages page={infoPage} onBack={() => setInfoPage(null)} /> : <>{category === "image" && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-700">{ko ? "이미지 도구" : "Image tools"}</h3>
              <span className="text-xs text-slate-400">{ko ? "5가지 기능" : "5 tools"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <button type="button" onClick={() => { setImageMode("convert"); setResult(null); }} className={subButton(imageMode === "convert")}><span>{t.conversionTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "convert" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("compress"); setResult(null); }} className={subButton(imageMode === "compress")}><span>{t.compressionTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "compress" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("resize"); setResult(null); }} className={subButton(imageMode === "resize")}><span>{t.resizeTab}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "resize" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("edit"); setResult(null); }} className={subButton(imageMode === "edit")}><span>{ko ? "편집" : "Edit"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "edit" ? "opacity-100" : "opacity-0"}`} /></button>
              <button type="button" onClick={() => { setImageMode("batch"); setResult(null); }} className={subButton(imageMode === "batch")}><span>{ko ? "일괄 변환" : "Batch"}</span><ArrowRight className={`h-3.5 w-3.5 ${imageMode === "batch" ? "opacity-100" : "opacity-0"}`} /></button>
            </div>
          </section>
        )}

        {category === "image" && <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100/70 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm leading-5 text-blue-700">{ko ? "이미지 파일은 브라우저에서 처리되며 외부 서버로 업로드하지 않습니다." : "Image files are processed in your browser and are not uploaded to an external server."}</p>
        </div>}

        {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100/50 bg-red-50/80 px-4 py-2.5"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" /><p className="text-sm text-red-700">{error}</p></div>}

        {category === "qr" ? <QRGenerator /> :
         category === "calculator" ? <CompoundCalculator /> :
         category === "text" ? <TextCounter /> :
         category === "pdf" ? <PDFTools /> :
         imageMode === "batch" ? <BatchConverter /> :
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "이미지 도구" : "Image tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "JPG·PNG·WebP 등 이미지 형식을 변환하고, 파일 용량을 줄이거나 크기를 조정할 수 있습니다. 간단한 편집과 여러 이미지의 일괄 변환도 지원합니다." : "Convert common image formats, reduce file size, resize images, make simple edits, and process multiple images in one batch."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "QR 코드" : "QR code"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "웹사이트 주소나 텍스트 등 필요한 정보를 QR 코드로 만들 수 있습니다. 간단한 공유용 QR 코드를 빠르게 생성할 수 있습니다." : "Create QR codes from website addresses, text, and other supported information for quick sharing."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "복합 계산기" : "Calculator"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "비율, 퍼센트, 할인, 부가세, 날짜, 단위, 증감률, 마진 등 일상에서 자주 필요한 계산을 한곳에서 확인할 수 있습니다." : "Calculate percentages, discounts, VAT, dates, units, changes, margins, and other everyday values in one place."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "PDF 도구" : "PDF tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "여러 JPG·PNG 이미지를 하나의 PDF로 묶고, PDF 파일의 페이지 수와 기본 파일 정보를 브라우저에서 확인할 수 있습니다." : "Combine JPG and PNG images into one PDF and check basic PDF file information directly in your browser."}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-slate-800">{ko ? "텍스트 도구" : "Text tools"}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{ko ? "입력한 글의 글자 수, 공백 제외 글자 수, 줄 수, 단어 수와 UTF-8 바이트 수를 바로 확인할 수 있습니다." : "Check character count, characters without spaces, line count, word count, and UTF-8 byte size instantly."}</p></div>
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <p className="text-xs leading-5 text-blue-700">{ko ? "파일 기반 이미지 작업은 브라우저에서 처리되며, 사이트는 변환을 위해 사용자의 이미지 파일을 외부 서버에 업로드하지 않습니다." : "Image file operations are processed in the browser, and the site does not upload your image files to an external server for conversion."}</p>
            </div>
          </section>
        )}

        <AdSlot labelKey="adSlot" />
        </>}
        <footer className="mt-6 border-t border-slate-200/60 pt-5 pb-6 text-center text-xs leading-5 text-gray-500">
          <p>{ko ? "올인원 이미지 · QR · 계산 도구" : "All-in-One Image · QR · Calculator"}</p>
          <p className="mt-1">{ko ? "설치 없이 브라우저에서 간편하게 이용하세요." : "Simple browser-based tools with no installation required."}</p>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">{ko ? "현재 제공 도구: 이미지 변환·압축·크기 조정·편집·일괄 변환, QR 코드, 계산기, 글자 수·바이트 계산, PDF 도구" : "Tools: image conversion, compression, resizing, editing, batch conversion, QR codes, calculators, and text counting."}</p>
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
