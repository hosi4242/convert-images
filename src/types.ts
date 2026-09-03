// 업로드된 이미지 파일의 정보
export interface UploadedImage {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}
