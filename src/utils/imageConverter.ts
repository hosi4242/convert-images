// AVIF 인코딩을 위한 WASM 라이브러리
import { encode as encodeAvif } from "@jsquash/avif";

// 지원하는 출력 이미지 형식
export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

// 변환 결과에 들어가는 정보
export interface ConversionResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
}

// 이미지 품질 설정값 (0 ~ 1 사이)
export type Quality = 0.5 | 0.7 | 0.8 | 0.9 | 1;

const HEIC_EXTENSIONS = [".heic", ".heif"];
const HEIC_MIME_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];

/** HEIC/HEIF 파일인지 확인합니다. */
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();

  return (
    HEIC_MIME_TYPES.includes(file.type.toLowerCase()) ||
    HEIC_EXTENSIONS.some((ext) => name.endsWith(ext))
  );
}

/** HEIC 디코더는 처음 HEIC 파일을 사용할 때만 동적으로 불러옵니다. */
async function decodeHeic(
  file: File,
  type: "image/jpeg" | "image/png",
  quality: Quality
): Promise<Blob> {
  const { heicTo } = await import("heic-to");

  const result = await heicTo({
    blob: file,
    type,
    quality,
  });

  if (!(result instanceof Blob)) {
    throw new Error("HEIC_DECODE_FAILED");
  }

  return result;
}

// HEIC 미리보기용 JPEG Blob을 만듭니다.
export async function createPreviewUrl(file: File): Promise<string> {
  if (!isHeicFile(file)) {
    return URL.createObjectURL(file);
  }

  const previewBlob = await decodeHeic(file, "image/jpeg", 0.9);
  return URL.createObjectURL(previewBlob);
}

// HEIC를 브라우저에서 읽을 수 있는 일반 이미지 Blob으로 바꿉니다.
async function getReadableImageFile(
  file: File,
  format: ImageFormat,
  quality: Quality
): Promise<File | Blob> {
  if (!isHeicFile(file)) return file;

  if (format === "jpeg") {
    return decodeHeic(file, "image/jpeg", quality);
  }

  return decodeHeic(file, "image/png", 1);
}

// AVIF를 WASM 라이브러리로 인코딩하는 함수
async function convertToAvif(
  canvas: HTMLCanvasElement,
  quality: Quality
): Promise<Blob> {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_FAILED");
  }

  const imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const avifQuality = Math.round(quality * 100);

  const avifBuffer = await encodeAvif(imageData, {
    quality: avifQuality,
  });

  return new Blob([avifBuffer], {
    type: "image/avif",
  });
}

// 일반 이미지 파일을 Image 객체로 만드는 함수
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

// Canvas에서 Blob으로 변환하는 함수
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: Quality
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`;
    const qualityArg = format === "png" ? undefined : quality;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("CANVAS_TO_BLOB_FAILED"));
        }
      },
      mimeType,
      qualityArg
    );
  });
}

// Blob을 데이터 URL로 변환하는 함수
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);

    reader.onerror = () =>
      reject(new Error("BLOB_TO_DATAURL_FAILED"));

    reader.readAsDataURL(blob);
  });
}

// 메인 이미지 변환 함수
export async function convertImage(
  file: File,
  format: ImageFormat,
  quality: Quality
): Promise<ConversionResult> {
  const readableFile = await getReadableImageFile(
    file,
    format,
    quality
  );

  const img = await loadImage(readableFile);

  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_FAILED");
  }

  // JPG 변환 시 투명 배경이 검게 나오는 것을 방지
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

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
    dataUrl,
  };
}

/**
 * 이미지 용량 줄이기
 *
 * 원본 이미지의 가로/세로 크기는 그대로 유지하고
 * WebP 형식으로 다시 인코딩하여 파일 용량을 줄입니다.
 *
 * 모든 처리는 사용자의 브라우저에서 이루어집니다.
 */
export async function compressImage(
  file: File,
  quality: Quality
): Promise<ConversionResult> {
  // HEIC는 PNG로 디코딩한 뒤 Canvas에서 WebP로 압축합니다.
  const readableFile = isHeicFile(file)
    ? await decodeHeic(file, "image/png", 1)
    : file;

  const img = await loadImage(readableFile);

  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_FAILED");
  }

  ctx.drawImage(img, 0, 0);

  // WebP로 압축
  const blob = await canvasToBlob(
    canvas,
    "webp",
    quality
  );

  const dataUrl = await blobToDataUrl(blob);

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
    dataUrl,
  };
}

// 파일이 지원하는 입력 이미지 형식인지 확인
export function isSupportedImage(file: File): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

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

  return filename
    .substring(lastDotIndex + 1)
    .toLowerCase();
}

export function getExtensionForFormat(
  format: ImageFormat
): string {
  switch (format) {
    case "jpeg":
      return "jpg";

    case "png":
      return "png";

    case "webp":
      return "webp";

    case "avif":
      return "avif";
  }
}
