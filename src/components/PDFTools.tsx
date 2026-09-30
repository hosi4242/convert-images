import { useState } from "react";
import { ImagePlus, Download, RotateCcw, Info } from "lucide-react";

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
    const next = Array.from(files).filter((file) => file.type === "image/jpeg" || file.type === "image/png");
    if (!next.length) {
      setMessage("JPG 또는 PNG 이미지 파일을 선택해 주세요.");
      return;
    }
    setImages((current) => [...current, ...next]);
    setMessage(next.length + "개의 이미지를 추가했습니다.");
  };

  const makePdf = async () => {
    if (!images.length) return;
    setBusy(true);
    setMessage("");
    try {
      const encoder = new TextEncoder();
      const objects: Array<{ id: number; body: Uint8Array }> = [];
      let nextId = 3;
      const pageIds: number[] = [];

      for (const file of images) {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();
        try {
          image.src = imageUrl;
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("image"));
          });

          const canvas = document.createElement("canvas");
          const scale = Math.min(595 / image.naturalWidth, 842 / image.naturalHeight, 1);
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("canvas");
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const jpegBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
          if (!jpegBlob) throw new Error("jpeg");
          const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());

          const imageId = nextId++;
          const contentId = nextId++;
          const pageId = nextId++;

          const imageHeader = encoder.encode(
            "<< /Type /XObject /Subtype /Image /Width " + canvas.width + " /Height " + canvas.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpeg.length + " >>\nstream\n"
          );
          const imageBody = new Uint8Array(imageHeader.length + jpeg.length);
          imageBody.set(imageHeader);
          imageBody.set(jpeg, imageHeader.length);
          objects.push({ id: imageId, body: imageBody });

          const content = "q\n" + canvas.width + " 0 0 " + canvas.height + " 0 0 cm\n/Im" + imageId + " Do\nQ";
          const contentBytes = encoder.encode(content);
          objects.push({
            id: contentId,
            body: encoder.encode("<< /Length " + contentBytes.length + " >>\nstream\n" + content + "\nendstream"),
          });

          objects.push({
            id: pageId,
            body: encoder.encode(
              "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + canvas.width + " " + canvas.height + "] /Resources << /XObject << /Im" + imageId + " " + imageId + " 0 R >> >> /Contents " + contentId + " 0 R >>"
            ),
          });
          pageIds.push(pageId);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      }

      const kids = pageIds.map((id) => id + " 0 R").join(" ");
      objects.unshift(
        { id: 2, body: encoder.encode("<< /Type /Pages /Kids [" + kids + "] /Count " + pageIds.length + " >>") },
        { id: 1, body: encoder.encode("<< /Type /Catalog /Pages 2 0 R >>") },
      );
      objects.sort((a, b) => a.id - b.id);

      const header = encoder.encode("%PDF-1.4\n");
      const parts: Uint8Array[] = [header];
      const offsets: number[] = [];
      let position = header.length;

      for (const obj of objects) {
        offsets[obj.id] = position;
        const prefix = encoder.encode(obj.id + " 0 obj\n");
        const suffix = encoder.encode("\nendobj\n");
        parts.push(prefix, obj.body, suffix);
        position += prefix.length + obj.body.length + suffix.length;
      }

      const xrefStart = position;
      const size = nextId;
      let xref = "xref\n0 " + size + "\n0000000000 65535 f \n";
      for (let id = 1; id < size; id++) {
        xref += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
      }
      xref += "trailer\n<< /Size " + size + " /Root 1 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF";
      parts.push(encoder.encode(xref));

      const total = parts.reduce((sum, part) => sum + part.length, 0);
      const pdfBytes = new Uint8Array(total);
      let at = 0;
      for (const part of parts) {
        pdfBytes.set(part, at);
        at += part.length;
      }

      const url = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-images.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(images.length + "장의 이미지로 PDF 파일이 생성되었습니다.");
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
      const bytes = new Uint8Array(await pdfFile.arrayBuffer());
      const header = new TextDecoder().decode(bytes.slice(0, 8));
      if (!header.startsWith("%PDF-")) throw new Error("not-pdf");
      const text = new TextDecoder("latin1").decode(bytes);
      const matches = text.match(/\/Type\s*\/Page(?:\s|>|<)/g);
      const pages = matches?.length ?? 0;
      setInfo({ pages, size: (pdfFile.size / 1024 / 1024).toFixed(2) + " MB" });
      setMessage(pages > 0 ? "PDF 기본 정보를 확인했습니다. 총 " + pages + "페이지입니다." : "PDF 파일은 확인했지만 페이지 수를 읽지 못했습니다.");
    } catch {
      setInfo(null);
      setMessage("PDF 파일을 읽을 수 없습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setMode("image-to-pdf"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "image-to-pdf" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>이미지 → PDF</button>
        <button type="button" onClick={() => { setMode("pdf-info"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "pdf-info" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>PDF 정보 확인</button>
      </div>

      {mode === "image-to-pdf" ? (
        <div className="space-y-4">
          <label htmlFor="pdf-image-input" className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 text-center transition hover:bg-blue-50">
            <ImagePlus className="h-9 w-9 text-blue-500" />
            <span className="mt-3 text-sm font-bold text-slate-700">JPG 또는 PNG 이미지 선택</span>
            <span className="mt-1 text-xs text-slate-500">여러 장을 한 번에 선택하거나 파일을 여러 번 추가할 수 있습니다.</span>
            <input id="pdf-image-input" type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.currentTarget.value = ""; }} />
          </label>
          {images.length > 0 && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">선택된 이미지: <strong>{images.length}개</strong></div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => document.getElementById("pdf-image-input")?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"><ImagePlus className="h-4 w-4" /> 이미지 추가</button>
            <button type="button" disabled={!images.length || busy} onClick={makePdf} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> PDF 만들기</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> 초기화</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 text-center transition hover:bg-slate-100">
            <Info className="h-9 w-9 text-slate-400" />
            <span className="mt-3 text-sm font-bold text-slate-700">PDF 파일 선택</span>
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0] ?? null; setPdfFile(file); setInfo(null); setMessage(""); }} />
          </label>
          {pdfFile && <p className="break-all text-sm text-slate-600">선택된 파일: <strong>{pdfFile.name}</strong></p>}
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