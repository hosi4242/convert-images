export type Language = "ko" | "en";

export interface Translation {
  headerTitle: string;
  headerSubtitle: string;
  switchToEnglish: string;
  switchToKorean: string;
  homeButton: string;
  adSlot: string;
  privacyNotice: string;
  uploadDropHere: string;
  uploadSelectButton: string;
  uploadFileInputAria: string;
  uploadSupportedFormats: string;
  uploadedFileSize: string;
  uploadedImageSize: string;
  settingsTitle: string;
  settingsFormat: string;
  settingsQuality: string;
  settingsQualityDisabledNote: string;
  settingsConvertButton: string;
  settingsConverting: string;
  resultComplete: string;
  resultOriginal: string;
  resultConverted: string;
  resultDimensions: string;
  resultFileSize: string;
  resultReduced: (percent: string) => string;
  resultIncreased: (percent: string) => string;
  resultDownloadButton: string;
  resultResetButton: string;
  conversionTab: string;
  compressionTab: string;
  compressionTitle: string;
  compressionDescription: string;
  compressionQuality: string;
  compressionHigh: string;
  compressionMedium: string;
  compressionLow: string;
  compressionFormatNote: string;
  compressionButton: string;
  compressionCompressing: string;
  compressionComplete: string;
  compressionOriginal: string;
  compressionResult: string;
  compressionFormat: string;
  compressionDownloadButton: string;
  resizeTab: string;
  qrTab: string;
  qrTitle: string;
  qrDescription: string;
  qrInputLabel: string;
  qrInputPlaceholder: string;
  qrDownloadButton: string;
  errorUnsupportedFormat: string;
  errorFileTooLarge: string;
  errorImageLoadFailed: string;
  errorHeicLoadFailed: string;
  errorConversionFailed: string;
  errorCompressionFailed: string;
  errorAvifNotSupported: string;
  seoDescriptionP1: string;
  seoDescriptionP2: string;
  footerText: string;
}

const ko: Translation = {
  headerTitle: "간편 이미지 변환기",
  headerSubtitle: "JPG, PNG, WebP, AVIF, HEIC 이미지를 브라우저에서 빠르고 간편하게 변환하세요.",
  switchToEnglish: "English",
  switchToKorean: "한국어",
  homeButton: "처음으로",
  adSlot: "광고 영역",
  privacyNotice: "선택한 이미지는 외부 서버로 업로드되지 않고 사용자의 브라우저에서 직접 처리됩니다.",
  uploadDropHere: "이미지를 여기에 끌어놓거나",
  uploadSelectButton: "이미지 선택하기",
  uploadFileInputAria: "이미지 파일 선택",
  uploadSupportedFormats: "JPG, PNG, WebP, AVIF, HEIC · 최대 50MB",
  uploadedFileSize: "파일 크기",
  uploadedImageSize: "이미지 크기",
  settingsTitle: "변환 설정",
  settingsFormat: "변환 형식",
  settingsQuality: "이미지 품질",
  settingsQualityDisabledNote: "PNG는 무손실 압축 형식이라 품질 설정이 적용되지 않습니다.",
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
  conversionTab: "이미지 변환",
  compressionTab: "이미지 용량 줄이기",
  compressionTitle: "이미지 용량 줄이기",
  compressionDescription: "이미지의 가로·세로 크기는 그대로 유지하면서 WebP로 다시 압축해 파일 용량을 줄입니다.",
  compressionQuality: "압축 품질",
  compressionHigh: "높은 품질 (90%)",
  compressionMedium: "균형 (70%)",
  compressionLow: "높은 압축 (50%)",
  compressionFormatNote: "용량 줄이기 결과는 WebP 형식으로 저장됩니다. 모든 처리는 브라우저에서 이루어집니다.",
  compressionButton: "이미지 용량 줄이기",
  compressionCompressing: "용량 줄이는 중...",
  compressionComplete: "이미지 용량 줄이기가 완료되었습니다.",
  compressionOriginal: "원본",
  compressionResult: "압축 후",
  compressionFormat: "파일 형식",
  compressionDownloadButton: "압축된 이미지 다운로드",
  resizeTab: "이미지 크기 조정",
  qrTab: "QR 코드",
  qrTitle: "QR 코드 생성기",
  qrDescription: "내용을 입력하면 QR 코드가 생성됩니다.",
  qrInputLabel: "텍스트 또는 URL",
  qrInputPlaceholder: "QR 코드로 만들 텍스트나 웹사이트 주소를 입력하세요.",
  qrDownloadButton: "QR 코드 다운로드",
  errorUnsupportedFormat: "지원하지 않는 이미지 형식입니다. JPG, PNG, WebP, HEIC 파일을 선택해주세요.",
  errorFileTooLarge: "파일 크기가 너무 큽니다. 50MB 이하의 이미지를 선택해주세요.",
  errorImageLoadFailed: "이미지 파일을 읽지 못했습니다. 다른 이미지 파일을 사용해 주세요.",
  errorHeicLoadFailed: "HEIC 이미지를 읽지 못했습니다. 파일이 손상되었거나 지원되지 않는 HEIC 형식일 수 있습니다.",
  errorConversionFailed: "이미지를 변환하지 못했습니다. 다른 이미지 파일을 사용해 주세요.",
  errorCompressionFailed: "이미지 용량을 줄이지 못했습니다. 다른 이미지 파일을 사용해 주세요.",
  errorAvifNotSupported: "AVIF 변환 중 오류가 발생했습니다. 다른 이미지 파일을 사용하거나 WebP, PNG, JPG를 이용해 주세요.",
  seoDescriptionP1: "간편 이미지 변환기는 별도의 프로그램 설치 없이 웹브라우저에서 바로 이미지 형식을 바꿀 수 있는 무료 도구입니다. JPG, PNG, WebP, AVIF뿐 아니라 아이폰에서 많이 사용하는 HEIC 이미지도 JPG, PNG, WebP, AVIF로 변환할 수 있습니다. 모든 처리는 브라우저 내에서 이루어져 이미지 파일이 외부로 전송되지 않아 안전합니다.",
  seoDescriptionP2: "품질 설정을 통해 파일 크기를 줄이면서도 화질을 유지할 수 있어 웹사이트 이미지 최적화에도 유용합니다. 지금 바로 이미지를 업로드해서 간편하게 변환해 보세요.",
  footerText: "간편 이미지 변환기 · 모든 변환은 브라우저에서 안전하게 처리되며 서버에 저장되지 않습니다",
};

const en: Translation = {
  headerTitle: "Simple Image Converter",
  headerSubtitle: "Convert JPG, PNG, WebP, AVIF, and HEIC images right in your browser — fast and easy.",
  switchToEnglish: "English",
  switchToKorean: "한국어",
  homeButton: "Home",
  adSlot: "Ad Space",
  privacyNotice: "Your selected image is processed directly in your browser and never uploaded to any external server.",
  uploadDropHere: "Drag and drop your image here, or",
  uploadSelectButton: "Select Image",
  uploadFileInputAria: "Select image file",
  uploadSupportedFormats: "JPG, PNG, WebP, AVIF, HEIC · Max 50MB",
  uploadedFileSize: "File size",
  uploadedImageSize: "Image size",
  settingsTitle: "Conversion Settings",
  settingsFormat: "Output format",
  settingsQuality: "Image quality",
  settingsQualityDisabledNote: "PNG is a lossless format, so quality settings do not apply.",
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
  conversionTab: "Convert Image",
  compressionTab: "Compress Image",
  compressionTitle: "Reduce Image Size",
  compressionDescription: "Keep the original image dimensions while recompressing the image as WebP to reduce file size.",
  compressionQuality: "Compression quality",
  compressionHigh: "High quality (90%)",
  compressionMedium: "Balanced (70%)",
  compressionLow: "High compression (50%)",
  compressionFormatNote: "The compressed image is saved as WebP. All processing happens in your browser.",
  compressionButton: "Reduce Image Size",
  compressionCompressing: "Compressing...",
  compressionComplete: "Image compression is complete.",
  compressionOriginal: "Original",
  compressionResult: "Compressed",
  compressionFormat: "Format",
  compressionDownloadButton: "Download Compressed Image",
  resizeTab: "Resize Image",
  qrTab: "QR Code",
  qrTitle: "QR Code Generator",
  qrDescription: "Enter content to generate a QR code.",
  qrInputLabel: "Text or URL",
  qrInputPlaceholder: "Enter the text or website address to turn into a QR code.",
  qrDownloadButton: "Download QR Code",
  errorUnsupportedFormat: "Unsupported image format. Please select a JPG, PNG, WebP, or HEIC file.",
  errorFileTooLarge: "File is too large. Please select an image under 50MB.",
  errorImageLoadFailed: "Could not read the image file. Please try a different image.",
  errorHeicLoadFailed: "Could not read the HEIC image. The file may be damaged or use an unsupported HEIC format.",
  errorConversionFailed: "Could not convert the image. Please try a different image file.",
  errorCompressionFailed: "Could not reduce the image size. Please try a different image file.",
  errorAvifNotSupported: "An error occurred during AVIF conversion. Please try a different image file or use WebP, PNG, or JPG instead.",
  seoDescriptionP1: "Simple Image Converter is a free tool that lets you change image formats right in your web browser — no software installation needed. It supports JPG, PNG, WebP, AVIF, and HEIC images, including converting iPhone HEIC photos to JPG, PNG, WebP, or AVIF. All processing happens locally in your browser, so your image files are never sent to an external server.",
  seoDescriptionP2: "With adjustable quality settings, you can reduce file size while maintaining image quality, making it perfect for optimizing website images too. Upload an image now and try it for yourself.",
  footerText: "Simple Image Converter · All conversions are processed safely in your browser and are never stored on any server",
};

const translations: Record<Language, Translation> = { ko, en };

export function getTranslation(lang: Language): Translation {
  return translations[lang];
}
