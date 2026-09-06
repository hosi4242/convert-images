export type Language = "ko" | "en";

export interface Translation {
  // 헤더
  headerTitle: string;
  headerSubtitle: string;

  // 언어 토글
  switchToEnglish: string;
  switchToKorean: string;

  // 처음으로 버튼
  homeButton: string;

  // 광고
  adSlot: string;

  // 개인정보 안내
  privacyNotice: string;

  // 업로드 박스
  uploadDropHere: string;
  uploadSelectButton: string;
  uploadFileInputAria: string;
  uploadSupportedFormats: string;

  // 업로드된 이미지 정보
  uploadedFileSize: string;
  uploadedImageSize: string;

  // 변환 설정
  settingsTitle: string;
  settingsFormat: string;
  settingsQuality: string;
  settingsQualityDisabledNote: string;
  settingsConvertButton: string;
  settingsConverting: string;

  // 변환 결과
  resultComplete: string;
  resultOriginal: string;
  resultConverted: string;
  resultDimensions: string;
  resultFileSize: string;
  resultReduced: (percent: string) => string;
  resultIncreased: (percent: string) => string;
  resultDownloadButton: string;
  resultResetButton: string;

  // 오류 메시지
  errorUnsupportedFormat: string;
  errorFileTooLarge: string;
  errorImageLoadFailed: string;
  errorConversionFailed: string;

  // SEO 설명
  seoDescriptionP1: string;
  seoDescriptionP2: string;

  // 방문자 수
  visitorCountLabel: string;
  visitorCountAria: string;

  // 푸터
  footerText: string;
}

const ko: Translation = {
  headerTitle: "간편 이미지 변환기",
  headerSubtitle: "JPG, PNG, WebP 이미지를 브라우저에서 빠르고 간편하게 변환하세요.",

  switchToEnglish: "English",
  switchToKorean: "한국어",

  homeButton: "처음으로",

  adSlot: "광고 영역",

  privacyNotice:
    "선택한 이미지는 외부 서버로 업로드되지 않고 사용자의 브라우저에서 직접 처리됩니다.",

  uploadDropHere: "이미지를 여기에 끌어놓거나",
  uploadSelectButton: "이미지 선택하기",
  uploadFileInputAria: "이미지 파일 선택",
  uploadSupportedFormats: "JPG, PNG, WebP · 최대 50MB",

  uploadedFileSize: "파일 크기",
  uploadedImageSize: "이미지 크기",

  settingsTitle: "변환 설정",
  settingsFormat: "변환 형식",
  settingsQuality: "이미지 품질",
  settingsQualityDisabledNote:
    "PNG는 무손실 압축 형식이라 품질 설정이 적용되지 않습니다.",
  settingsConvertButton: "이미지 변환하기",
  settingsConverting: "변환 중...",

  resultComplete: "변환이 완료되었습니다.",
  resultOriginal: "원본",
  resultConverted: "변환 후",
  resultDimensions: "크기",
  resultFileSize: "파일 크기",
  resultReduced: (percent) => `파일 크기 ${percent}% 감소`,
  resultIncreased: (percent) => `파일 크기가 ${percent}% 증가했습니다.`,
  resultDownloadButton: "변환된 이미지 다운로드",
  resultResetButton: "다른 이미지 변환하기",

  errorUnsupportedFormat:
    "지원하지 않는 이미지 형식입니다. JPG, PNG, WebP 파일을 선택해주세요.",
  errorFileTooLarge:
    "파일 크기가 너무 큽니다. 50MB 이하의 이미지를 선택해주세요.",
  errorImageLoadFailed:
    "이미지 파일을 읽지 못했습니다. 다른 이미지 파일을 사용해 주세요.",
  errorConversionFailed:
    "이미지를 변환하지 못했습니다. 다른 이미지 파일을 사용해 주세요.",

  seoDescriptionP1:
    "간편 이미지 변환기는 별도의 프로그램 설치 없이 웹브라우저에서 바로 이미지 형식을 바꿀 수 있는 무료 도구입니다. JPG를 PNG로, PNG를 WebP로 변환하는 등 다양한 형식 변환을 지원하며, 모든 처리는 브라우저 내에서 이루어져 이미지 파일이 외부로 전송되지 않아 안전합니다.",
  seoDescriptionP2:
    "품질 설정을 통해 파일 크기를 줄이면서도 화질을 유지할 수 있어 웹사이트 이미지 최적화에도 유용합니다. 지금 바로 이미지를 업로드해서 간편하게 변환해 보세요.",

  visitorCountLabel: "방문자 수",
  visitorCountAria: "방문자 수 새로고침",

  footerText:
    "간편 이미지 변환기 · 모든 변환은 브라우저에서 안전하게 처리되며 서버에 저장되지 않습니다",
};

const en: Translation = {
  headerTitle: "Simple Image Converter",
  headerSubtitle:
    "Convert JPG, PNG, and WebP images right in your browser — fast and easy.",

  switchToEnglish: "English",
  switchToKorean: "한국어",

  homeButton: "Home",

  adSlot: "Ad Space",

  privacyNotice:
    "Your selected image is processed directly in your browser and never uploaded to any external server.",

  uploadDropHere: "Drag and drop your image here, or",
  uploadSelectButton: "Select Image",
  uploadFileInputAria: "Select image file",
  uploadSupportedFormats: "JPG, PNG, WebP · Max 50MB",

  uploadedFileSize: "File size",
  uploadedImageSize: "Image size",

  settingsTitle: "Conversion Settings",
  settingsFormat: "Output format",
  settingsQuality: "Image quality",
  settingsQualityDisabledNote:
    "PNG is a lossless format, so quality settings do not apply.",
  settingsConvertButton: "Convert Image",
  settingsConverting: "Converting...",

  resultComplete: "Conversion complete.",
  resultOriginal: "Original",
  resultConverted: "Converted",
  resultDimensions: "Dimensions",
  resultFileSize: "File size",
  resultReduced: (percent) => `File size reduced by ${percent}%`,
  resultIncreased: (percent) => `File size increased by ${percent}%.`,
  resultDownloadButton: "Download Converted Image",
  resultResetButton: "Convert Another Image",

  errorUnsupportedFormat:
    "Unsupported image format. Please select a JPG, PNG, or WebP file.",
  errorFileTooLarge:
    "File is too large. Please select an image under 50MB.",
  errorImageLoadFailed:
    "Could not read the image file. Please try a different image.",
  errorConversionFailed:
    "Could not convert the image. Please try a different image file.",

  seoDescriptionP1:
    "Simple Image Converter is a free tool that lets you change image formats right in your web browser — no software installation needed. It supports converting JPG to PNG, PNG to WebP, and more. All processing happens locally in your browser, so your image files are never sent to an external server.",
  seoDescriptionP2:
    "With adjustable quality settings, you can reduce file size while maintaining image quality, making it perfect for optimizing website images too. Upload an image now and try it for yourself.",

  visitorCountLabel: "Visitors",
  visitorCountAria: "Refresh visitor count",

  footerText:
    "Simple Image Converter · All conversions are processed safely in your browser and are never stored on any server",
};

const translations: Record<Language, Translation> = { ko, en };

export function getTranslation(lang: Language): Translation {
  return translations[lang];
}
