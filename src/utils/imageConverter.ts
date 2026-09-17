// AVIF 인코딩을 위한 WASM 라이브러리
import { encode as encodeAvif } from "@jsquash/avif";

export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface ConversionResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
}

export type Quality = 0.5 | 0.7 | 0.8 | 0.9 | 1;

const HEIC_EXTENSIONS = [".heic", ".heif"];
const HEIC_MIME_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    HEIC_MIME_TYPES.includes(file.type.toLowerCase()) ||
    HEIC_EXTENSIONS.some((ext) => name.endsWith(ext))
  );
}

async function decodeHeic(
  file: File,
  type: "image/jpeg" | "image/png",
  quality: Quality
): Promise<Blob> {
  const { heicTo } = await import("heic-to");
  const result = await heicTo({ blob: file, type, quality });
  if (!(result instanceof Blob)) throw new Error("HEIC_DECODE_FAILED");
  return result;
}

export async function createPreviewUrl(file: File): Promise<string> {
  if (!isHeicFile(file)) return URL.createObjectURL(file);
  const previewBlob = await decodeHeic(file, "image/jpeg", 0.9);
  return URL.createObjectURL(previewBlob);
}

async function getReadableImageFile(
  file: File,
  format: ImageFormat,
  quality: Quality
): Promise<File | Blob> {
  if (!isHeicFile(file)) return file;
  if (format === "jpeg") return decodeHeic(file, "image/jpeg", quality);
  return decodeHeic(file, "image/png", 1);
}

async function convertToAvif(
  canvas: HTMLCanvasElement,
  quality: Quality
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const avifQuality = Math.round(quality * 100);
  const avifBuffer = await encodeAvif(imageData, { quality: avifQuality });
  return new Blob([avifBuffer], { type: "image/avif" });
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };
    img.src = url;
  });
}

// Canvas API는 고정된 Quality 타입이 아니라 0~1 사이의 일반 숫자를 받으므로
// 크기 조정처럼 0.92 같은 품질값도 사용할 수 있도록 number로 지정합니다.
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`;
    const qualityArg = format === "png" ? undefined : quality;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("CANVAS_TO_BLOB_FAILED"));
      },
      mimeType,
      qualityArg
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("BLOB_TO_DATAURL_FAILED"));
    reader.readAsDataURL(blob);
  });
}

export async function convertImage(
  file: File,
  format: ImageFormat,
  quality: Quality
): Promise<ConversionResult> {
  const readableFile = await getReadableImageFile(file, format, quality);
  const img = await loadImage(readableFile);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");

  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  let blob: Blob;
  if (format === "avif") {
    blob = await convertToAvif(canvas, quality);
  } else if (isHeicFile(file) && format === "jpeg") {
    blob = readableFile as Blob;
  } else if (isHeicFile(file) && format === "png") {
    blob = readableFile as Blob;
  } else {
    blob = await canvasToBlob(canvas, format, quality);
  }

  const dataUrl = await blobToDataUrl(blob);
  return { blob, width: canvas.width, height: canvas.height, size: blob.size, dataUrl };
}

export async function compressImage(
  file: File,
  quality: Quality
): Promise<ConversionResult> {
  const readableFile = isHeicFile(file)
    ? await decodeHeic(file, "image/png", 1)
    : file;
  const img = await loadImage(readableFile);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, "webp", quality);
  const dataUrl = await blobToDataUrl(blob);
  return { blob, width: canvas.width, height: canvas.height, size: blob.size, dataUrl };
}

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
  filename: string;
}

export function getResizeOutputFormat(file: File): "jpeg" | "png" | "webp" {
  if (isHeicFile(file)) return "jpeg";
  const extension = getFileExtension(file.name);
  if (extension === "png") return "png";
  if (extension === "webp") return "webp";
  return "jpeg";
}

export async function resizeImage(
  file: File,
  width: number,
  height: number
): Promise<ResizeResult> {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("INVALID_RESIZE_DIMENSIONS");
  }
  if (width > 10000 || height > 10000) {
    throw new Error("RESIZE_DIMENSIONS_TOO_LARGE");
  }

  const outputFormat = getResizeOutputFormat(file);
  const readableFile = isHeicFile(file)
    ? await decodeHeic(file, "image/png", 1)
    : file;
  const img = await loadImage(readableFile);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");

  if (outputFormat === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, outputFormat, 0.92);
  const dataUrl = await blobToDataUrl(blob);

  const originalName = file.name.replace(/\.[^/.]+$/, "");
  const extension = outputFormat === "jpeg" ? "jpg" : outputFormat;
  const filename = `${originalName}-${width}x${height}.${extension}`;

  return { blob, width, height, size: blob.size, dataUrl, filename };
}

export function isSupportedImage(file: File): boolean {
  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (supportedTypes.includes(file.type)) return true;
  if (isHeicFile(file)) return true;
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

export function getExtensionForFormat(format: ImageFormat): string {
  switch (format) {
    case "jpeg": return "jpg";
    case "png": return "png";
    case "webp": return "webp";
    case "avif": return "avif";
  }
}