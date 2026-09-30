import { useState } from "react";
import { ImagePlus, Download, RotateCcw, Info, FilePlus2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useI18n } from "@/i18n/I18nContext";

type Mode = "image-to-pdf" | "pdf-merge" | "pdf-pages" | "pdf-info";

export default function PDFTools() {
  const [mode, setMode] = useState<Mode>("image-to-pdf");
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [pageFile, setPageFile] = useState<File | null>(null);
  const [pageDoc, setPageDoc] = useState<PDFDocument | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [orderSelected, setOrderSelected] = useState<number | null>(null);
  const [info, setInfo] = useState<{ pages: number; size: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { language } = useI18n();
  const ko = language === "ko";

  const reset = () => {
    setImages([]);
    setPdfFile(null);
    setMergeFiles([]);
    setPageFile(null);
    setPageDoc(null);
    setSelectedPages([]);
    setPageOrder([]);
    setOrderSelected(null);
    setInfo(null);
    setMessage("");
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((file) => file.type === "image/jpeg" || file.type === "image/png");
    if (!next.length) {
      setMessage(ko ? "JPG 또는 PNG 이미지를 선택해 주세요." : "Please select JPG or PNG images.");
      return;
    }
    setImages((current) => [...current, ...next]);
    setMessage(ko ? next.length + "개의 이미지를 추가했습니다." : next.length + " image(s) added.");
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

      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(pdfBuffer).set(pdfBytes);
      const url = URL.createObjectURL(new Blob([pdfBuffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-images.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(ko ? images.length + "장의 이미지로 PDF 파일이 생성되었습니다." : "PDF created from " + images.length + " image(s).");
    } catch {
      setMessage(ko ? "PDF 변환 중 문제가 발생했습니다. JPG 또는 PNG 이미지를 사용해 주세요." : "Something went wrong while creating the PDF. Please use JPG or PNG images.");
    } finally {
      setBusy(false);
    }
  };

  const addMergeFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (!next.length) {
      setMessage(ko ? "PDF 파일을 선택해 주세요." : "Please select PDF files.");
      return;
    }
    setMergeFiles((current) => [...current, ...next]);
    setMessage(ko ? next.length + "개의 PDF 파일을 추가했습니다." : next.length + " PDF file(s) added.");
  };

  const mergePdfs = async () => {
    if (mergeFiles.length < 2) return;
    setBusy(true);
    setMessage("");
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of mergeFiles) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const sourcePdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(pdfBuffer).set(pdfBytes);
      const url = URL.createObjectURL(new Blob([pdfBuffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(ko ? mergeFiles.length + "개의 PDF를 하나로 합쳤습니다." : "Merged " + mergeFiles.length + " PDF files into one.");
    } catch {
      setMessage(ko ? "PDF 합치기 중 문제가 발생했습니다. 정상적인 PDF 파일을 사용해 주세요." : "Something went wrong while merging the PDFs. Please use valid PDF files.");
    } finally {
      setBusy(false);
    }
  };

  const loadPagePdf = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      setPageFile(file);
      setPageDoc(doc);
      setSelectedPages([]);
      setPageOrder(Array.from({ length: doc.getPageCount() }, (_, i) => i));
      setOrderSelected(null);
      setMessage(ko ? "PDF를 불러왔습니다. 삭제하거나 페이지 순서를 변경할 수 있습니다." : "PDF loaded. You can delete pages or change their order.");
    } catch {
      setPageFile(null);
      setPageDoc(null);
      setSelectedPages([]);
      setPageOrder([]);
      setOrderSelected(null);
      setMessage(ko ? "PDF 파일을 읽을 수 없습니다." : "The PDF file could not be read.");
    } finally {
      setBusy(false);
    }
  };

  const movePage = (direction: -1 | 1) => {
    if (orderSelected === null) return;
    setPageOrder((current) => {
      const index = current.indexOf(orderSelected);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const reorderPages = async () => {
    if (!pageDoc || !pageFile || pageOrder.length < 2) return;
    if (pageOrder.every((page, index) => page === index)) {
      setMessage(ko ? "페이지 순서가 변경되지 않았습니다." : "The page order has not changed.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const output = await PDFDocument.create();
      const pages = await output.copyPages(pageDoc, pageOrder);
      pages.forEach((page) => output.addPage(page));
      const pdfBytes = await output.save();
      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(pdfBuffer).set(pdfBytes);
      const url = URL.createObjectURL(new Blob([pdfBuffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "reordered-pages.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(ko ? "페이지 순서를 변경한 PDF를 생성했습니다." : "Created a PDF with the reordered pages.");
    } catch {
      setMessage(ko ? "페이지 순서 변경 중 문제가 발생했습니다." : "Something went wrong while reordering pages.");
    } finally {
      setBusy(false);
    }
  };

  const deletePages = async () => {
    if (!pageDoc || !pageFile || !selectedPages.length) return;
    if (selectedPages.length >= pageDoc.getPageCount()) {
      setMessage(ko ? "모든 페이지를 삭제할 수 없습니다. 최소 1페이지는 남겨 주세요." : "You cannot delete all pages. Keep at least one page.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const keep = pageOrder.filter((i) => !selectedPages.includes(i));
      const output = await PDFDocument.create();
      const pages = await output.copyPages(pageDoc, keep);
      pages.forEach((page) => output.addPage(page));
      const pdfBytes = await output.save();
      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(pdfBuffer).set(pdfBytes);
      const url = URL.createObjectURL(new Blob([pdfBuffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "edited-pages.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPageOrder(keep);
      setSelectedPages([]);
      setOrderSelected(null);
      setMessage(ko ? selectedPages.length + "페이지를 삭제한 PDF를 생성했습니다." : "Created a PDF with " + selectedPages.length + " page(s) deleted.");
    } catch {
      setMessage(ko ? "페이지 삭제 중 문제가 발생했습니다." : "Something went wrong while deleting pages.");
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
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPageCount();
      setInfo({ pages, size: (pdfFile.size / 1024 / 1024).toFixed(2) + " MB" });
      setMessage(ko ? "PDF 정보를 확인했습니다. 총 " + pages + "페이지입니다." : "PDF information checked. Total: " + pages + " page(s).");
    } catch {
      setInfo(null);
      setMessage(ko ? "PDF 파일을 읽을 수 없습니다." : "The PDF file could not be read.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setMode("image-to-pdf"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "image-to-pdf" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{ko ? "이미지 → PDF" : "Images → PDF"}</button>
        <button type="button" onClick={() => { setMode("pdf-merge"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "pdf-merge" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{ko ? "PDF 합치기" : "Merge PDFs"}</button>
        <button type="button" onClick={() => { setMode("pdf-pages"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "pdf-pages" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{ko ? "페이지 관리" : "Page Manager"}</button>
        <button type="button" onClick={() => { setMode("pdf-info"); setMessage(""); }} className={"rounded-xl px-4 py-2.5 text-sm font-bold transition " + (mode === "pdf-info" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{ko ? "PDF 정보 확인" : "PDF Info"}</button>
      </div>

      {mode === "image-to-pdf" ? (
        <div className="space-y-4">
          <label htmlFor="pdf-image-input" className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 text-center transition hover:bg-blue-50">
            <ImagePlus className="h-9 w-9 text-blue-500" />
            <span className="mt-3 text-sm font-bold text-slate-700">{ko ? "JPG 또는 PNG 이미지 선택" : "Select JPG or PNG images"}</span>
            <span className="mt-1 text-xs text-slate-500">{ko ? "여러 장을 한 번에 선택하거나 파일을 여러 번 추가할 수 있습니다." : "Select multiple images at once or add files multiple times."}</span>
            <input id="pdf-image-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.currentTarget.value = ""; }} />
          </label>
          {images.length > 0 && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{ko ? "선택된 이미지:" : "Selected images:"} <strong>{images.length}{ko ? "개" : ""}</strong></div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => document.getElementById("pdf-image-input")?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"><ImagePlus className="h-4 w-4" /> {ko ? "이미지 추가" : "Add images"}</button>
            <button type="button" disabled={!images.length || busy} onClick={makePdf} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> {ko ? "PDF 만들기" : "Create PDF"}</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> {ko ? "초기화" : "Reset"}</button>
          </div>
        </div>
      ) : mode === "pdf-merge" ? (
        <div className="space-y-4">
          <label htmlFor="pdf-merge-input" className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 text-center transition hover:bg-blue-50">
            <FilePlus2 className="h-9 w-9 text-blue-500" />
            <span className="mt-3 text-sm font-bold text-slate-700">{ko ? "합칠 PDF 파일 선택" : "Select PDF files to merge"}</span>
            <span className="mt-1 text-xs text-slate-500">{ko ? "여러 개의 PDF를 선택하면 선택한 순서대로 하나의 PDF로 합칩니다." : "Select multiple PDFs and merge them into one file in the selected order."}</span>
            <input id="pdf-merge-input" type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { addMergeFiles(e.target.files); e.currentTarget.value = ""; }} />
          </label>
          {mergeFiles.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">{ko ? "선택된 PDF:" : "Selected PDFs:"} {mergeFiles.length}{ko ? "개" : ""}</p>
              <ol className="mt-2 space-y-1 text-sm text-slate-600">
                {mergeFiles.map((file, index) => <li key={index} className="break-all">{index + 1}. {file.name}</li>)}
              </ol>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => document.getElementById("pdf-merge-input")?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"><FilePlus2 className="h-4 w-4" /> {ko ? "PDF 추가" : "Add PDFs"}</button>
            <button type="button" disabled={mergeFiles.length < 2 || busy} onClick={mergePdfs} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> {ko ? "PDF 합치기" : "Merge PDFs"}</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> {ko ? "초기화" : "Reset"}</button>
          </div>
        </div>
      ) : mode === "pdf-pages" ? (
        <div className="space-y-4">
          <label htmlFor="pdf-page-input" className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 text-center transition hover:bg-blue-50">
            <FilePlus2 className="h-9 w-9 text-blue-500" />
            <span className="mt-3 text-sm font-bold text-slate-700">{ko ? "페이지를 관리할 PDF 선택" : "Select a PDF to manage pages"}</span>
            <input id="pdf-page-input" type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { loadPagePdf(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} />
          </label>
          {pageFile && pageDoc && <div className="rounded-xl bg-slate-50 p-4">
            <p className="break-all text-sm font-bold text-slate-700">{pageFile.name}</p>
            <p className="mt-1 text-xs text-slate-500">{ko ? "삭제할 페이지는 번호를 눌러 선택하고, 순서를 바꿀 페이지는 번호를 눌러 선택한 뒤 위/아래 버튼을 사용하세요." : "Select pages to delete, or select one page and use the up/down buttons to reorder it."}</p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {pageOrder.map((pageIndex, position) => <button key={pageIndex} type="button" onClick={() => { setOrderSelected(pageIndex); setSelectedPages((current) => current.includes(pageIndex) ? current.filter((p) => p !== pageIndex) : [...current, pageIndex]); }} className={"rounded-lg border px-2 py-3 text-sm font-bold " + (orderSelected === pageIndex ? "border-blue-400 bg-blue-50 text-blue-700" : selectedPages.includes(pageIndex) ? "border-red-300 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100")}>{position + 1}<span className="block text-[10px] font-normal opacity-70">P{pageIndex + 1}</span></button>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => movePage(-1)} disabled={orderSelected === null || pageOrder.indexOf(orderSelected) === 0 || busy} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">{ko ? "↑ 위로" : "↑ Move up"}</button>
              <button type="button" onClick={() => movePage(1)} disabled={orderSelected === null || pageOrder.indexOf(orderSelected) === pageOrder.length - 1 || busy} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">{ko ? "↓ 아래로" : "↓ Move down"}</button>
            </div>
            <p className="mt-3 text-xs text-slate-500">{ko ? "삭제 선택:" : "Selected for deletion:"} {selectedPages.length}{ko ? "페이지" : " page(s)"}{orderSelected !== null ? (ko ? " · 순서 변경 선택: " + (pageOrder.indexOf(orderSelected) + 1) + "번째" : " · Reorder selected: " + (pageOrder.indexOf(orderSelected) + 1)) : ""}</p>
          </div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => document.getElementById("pdf-page-input")?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"><FilePlus2 className="h-4 w-4" /> {ko ? "PDF 선택" : "Select PDF"}</button>
            <button type="button" disabled={!pageDoc || pageOrder.length < 2 || busy} onClick={reorderPages} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{ko ? "순서 변경 PDF 만들기" : "Create reordered PDF"}</button>
            <button type="button" disabled={!selectedPages.length || busy} onClick={deletePages} className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">{ko ? "선택 페이지 삭제" : "Delete selected pages"}</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> {ko ? "초기화" : "Reset"}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 text-center transition hover:bg-slate-100">
            <Info className="h-9 w-9 text-slate-400" />
            <span className="mt-3 text-sm font-bold text-slate-700">{ko ? "PDF 파일 선택" : "Select PDF file"}</span>
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0] ?? null; setPdfFile(file); setInfo(null); setMessage(""); }} />
          </label>
          {pdfFile && <p className="break-all text-sm text-slate-600">{ko ? "선택된 파일:" : "Selected file:"} <strong>{pdfFile.name}</strong></p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!pdfFile || busy} onClick={readPdfInfo} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">{ko ? "정보 확인" : "Check info"}</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-4 w-4" /> {ko ? "초기화" : "Reset"}</button>
          </div>
          {info && <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-center"><div><p className="text-xs text-slate-400">{ko ? "페이지" : "Pages"}</p><p className="mt-1 text-lg font-extrabold text-slate-800">{info.pages}</p></div><div><p className="text-xs text-slate-400">{ko ? "파일 크기" : "File size"}</p><p className="mt-1 text-lg font-extrabold text-slate-800">{info.size}</p></div></div>}
        </div>
      )}

      {message && <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-700">{message}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-400">{ko ? "파일은 브라우저에서 처리되며 PDF 변환을 위해 외부 서버로 업로드하지 않습니다." : "Files are processed in your browser and are not uploaded to an external server."}</p>
    </section>
  );
}