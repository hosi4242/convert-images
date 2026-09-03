// 파일 크기를 읽기 쉬운 한국어 단위로 변환하는 함수
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// 파일 크기 변화율을 계산하는 함수 (음수면 증가, 양수면 감소)
export function getSizeChangePercent(original: number, converted: number): number {
  if (original === 0) return 0;
  return ((original - converted) / original) * 100;
}

// 파일명에서 확장자를 제거한 순수 이름을 추출하는 함수
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

// 다운로드에 문제가 없는 안전한 파일명으로 만드는 함수
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim() || "image";
}
