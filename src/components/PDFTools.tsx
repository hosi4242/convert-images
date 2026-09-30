import { useState } from "react";
import { FileText, ImagePlus, Download, RotateCcw, Info } from "lucide-react";
import { PDFDocument } from "pdf-lib";

type Mode = "image-to-pdf" | "pdf-info";

export default function PDFTools() {
  const [mode, setMode] = useState<Mode>("image-to-pdf");
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [info, setInfo] = useState<{ pages: number; size: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const reset = () => {
    setImages([]);
    setPdfFile(null);
    setInfo(null);
    setMessage("");
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((file) => file.type.startsWith("image/"));
    setImages(next);
    setMessage(next.length ? `${next.length}개의 이미지를 선택했습니다.` : "이미지 파일을 선택해 주세요.");
  };

  const makePdf = async () => {
    if (!images.length) return;
    setBusy(true);
    setMessage("");
    try {
      const pdf = await PDFDocument.create();
      for (const file of images) {
        const bytes = await file.arrayBuffer();
        const image = file.type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
        const maxWidth = 595;
        const maxHeight = 842;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = image.width * scale;
        const height = image.height * scale;
        const page = pdf.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }
      const blob = new Blob([await pdf.save()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-images.pdf";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("PDF 파일이 생성되었습니다.");
    } catch {
      setMessage("PDF 변환 중 문제가 발생했습니다. JPG 또는 PNG 이미지를 사용해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const readPdfInfo = async () => {
    if (!pdfFile) return;
    setBusy(true);
    setMessage("");
    try {
      const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
      setInfo({ pages: pdf.getPageCount(), size: `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` });
    } catch {
      setInfo(null);
      setMessage("PDF 파일을 읽을 수 없습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setMode("image-to-pdf"); setMessage(""); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${mode === "image-to-pdf" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            이미지 → PDF
          </button>
          <button type="button" onClick={() => { setMode("pdf-info"); setMessage(""); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${mode === "pdf-info" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            PDF 정보 확인
          </button>
        </div>
      </div>

      {mode === "image-to-pdf" ? (
        <div className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 text-center transition hover:bg-blue-50">
            <ImagePlus className="h-9 w-9 text-blue-500" />
            <span className="mt-3 text-sm font-bold text-slate-700">JPG 또는 PNG 이미지 선택</span>
            <span className="mt-1 text-xs text-slate-500">여러 장을 선택하면 하나의 PDF로 묶습니다.</span>
            <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
          </label>
          {images.length > 0 && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              선택된 이미지: <strong>{images.length}개</strong>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!images.length || busy} onClick={makePdf} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Download className="h-4 w-4" /> PDF 만들기
            </button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200">
              <RotateCcw className="h-4 w-4" /> 초기화
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 text-center transition hover:bg-slate-100">
            <Info className="h-9 w-9 text-slate-400" />
            <span className="mt-3 text-sm font-bold text-slate-700">PDF 파일 선택</span>
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0] ?? null; setPdfFile(file); setInfo(null); }} />
          </label>
          {pdfFile && <p className="text-sm text-slate-600">선택된 파일: <strong>{pdfFile.name}</strong></p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!pdfFile || busy} onClick={readPdfInfo} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">정보 확인</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> 초기화</button>
          </div>
          {info && <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-center"><div><p className="text-xs text-slate-400">페이지</p><p className="mt-1 text-lg font-extrabold text-slate-800">{info.pages}</p></div><div><p className="text-xs text-slate-400">파일 크기</p><p className="mt-1 text-lg font-extrabold text-slate-800">{info.size}</p></div></div>}
        </div>
      )}

      {message && <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-700">{message}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-400">파일은 브라우저에서 처리되며 PDF 변환을 위해 외부 서버로 업로드하지 않습니다.</p>
    </section>
  );
}
