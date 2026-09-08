// 지원하는 이미지 형식
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

// AVIF 인코딩 브라우저 지원 여부 확인 (Feature Detection)
let avifSupportCache: boolean | null = null;

export function isAvifSupported(): boolean {
  if (avifSupportCache !== null) return avifSupportCache;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    avifSupportCache = canvas.toDataURL("image/avif").startsWith("data:image/avif");
  } catch {
    avifSupportCache = false;
  }
  return avifSupportCache;
}

// 이미지 파일을 읽어서 Image 객체로 만드는 함수
function loadImage(file: File): Promise<HTMLImageElement> {
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
    // PNG는 품질 설정이 의미 없으므로 품질 인자를 전달하지 않음
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

// Blob을 데이터 URL로 변환하는 함수 (미리보기용)
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("BLOB_TO_DATAURL_FAILED"));
    reader.readAsDataURL(blob);
  });
}

// 메인 변환 함수: 파일을 선택한 형식으로 변환
export async function convertImage(
  file: File,
  format: ImageFormat,
  quality: Quality
): Promise<ConversionResult> {
  const img = await loadImage(file);

  // Canvas에 이미지를 그림
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_FAILED");
  }

  // JPG 변환 시 투명 배경이 검은색으로 나오는 것을 방지하기 위해 흰 배경 채움
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  // Canvas를 선택한 형식의 Blob으로 변환
  const blob = await canvasToBlob(canvas, format, quality);
  const dataUrl = await blobToDataUrl(blob);

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
    dataUrl,
  };
}

// 파일이 지원하는 이미지 형식인지 확인하는 함수
export function isSupportedImage(file: File): boolean {
  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (supportedTypes.includes(file.type)) return true;

  // 파일 타입이 비어있는 경우 확장자로 확인
  const name = file.name.toLowerCase();
  return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp");
}

// 파일의 확장자를 반환하는 함수
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

// 변환 형식에 따른 다운로드용 확장자를 반환하는 함수
export function getExtensionForFormat(format: ImageFormat): string {
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
