import { useState, useCallback, useEffect } from "react";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  formatFileSize,
  getSizeChangePercent,
  getFileNameWithoutExtension,
  sanitizeFilename,
} from "@/utils/format";
import { useI18n } from "@/i18n/I18nContext";
import {
  compressImage,
  type Quality,
  type ConversionResult,
} from "@/utils/imageConverter";
import type { UploadedImage } from "@/types";

interface ImageCompressorProps {
  uploadedImage: UploadedImage;
  onReset: () => void;
}

type CompressionQuality = Extract<Quality, 0.5 | 0.7 | 0.9>;

const QUALITY_OPTIONS: {
  value: CompressionQuality;
  labelKey:
    | "compressionHigh"
    | "compressionMedium"
    | "compressionLow";
}[] = [
  {
    value: 0.9,
    labelKey: "compressionHigh",
  },
  {
    value: 0.7,
    labelKey: "compressionMedium",
  },
  {
    value: 0.5,
    labelKey: "compressionLow",
  },
];

export default function ImageCompressor({
  uploadedImage,
  onReset,
}: ImageCompressorProps) {
  const { t } = useI18n();

  const [quality, setQuality] =
    useState<CompressionQuality>(0.7);

  const [isCompressing, setIsCompressing] =
    useState(false);

  const [result, setResult] =
    useState<ConversionResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  // 새로운 이미지가 선택되면 이전 결과 초기화
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [uploadedImage.file]);

  const handleCompress = useCallback(async () => {
    setIsCompressing(true);
    setError(null);

    try {
      const compressionResult = await compressImage(
        uploadedImage.file,
        quality
      );

      setResult(compressionResult);
    } catch (err) {
      console.error("Compression failed:", err);
      setError(t.errorCompressionFailed);
    } finally {
      setIsCompressing(false);
    }
  }, [uploadedImage.file, quality, t]);

  const handleDownload = useCallback(() => {
    if (!result) return;

    const baseName = getFileNameWithoutExtension(
      uploadedImage.file.name
    );

    const fileName = `${sanitizeFilename(
      baseName
    )}-compressed.webp`;

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, [result, uploadedImage.file.name]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const sizeChangePercent = result
    ? getSizeChangePercent(
        uploadedImage.file.size,
        result.size
      )
    : 0;

  const isReduced = sizeChangePercent > 0;

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          {/* 이미지 정보 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 text-sm font-medium text-gray-500">
              {t.compressionOriginal}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {uploadedImage.file.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {formatFileSize(uploadedImage.file.size)}
                </p>
              </div>

              <div className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                {uploadedImage.file.type ||
                  "image"}
              </div>
            </div>
          </div>

          {/* 압축 설정 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t.compressionTitle}
            </h3>

            <p className="mb-5 text-sm leading-6 text-gray-600">
              {t.compressionDescription}
            </p>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-800">
                {t.compressionQuality}
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setQuality(option.value)
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      quality === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {t[option.labelKey]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">
              {t.compressionFormatNote}
            </div>
          </div>

          {/* 오류 */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 실행 버튼 */}
          <button
            type="button"
            onClick={handleCompress}
            disabled={isCompressing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCompressing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t.compressionCompressing}
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5" />
                {t.compressionButton}
              </>
            )}
          </button>

          {/* 처음으로 */}
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            {t.resultResetButton}
          </button>
        </>
      ) : (
        <>
          {/* 완료 메시지 */}
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />

            <div>
              <p className="font-semibold text-green-800">
                {t.compressionComplete}
              </p>

              <p className="mt-1 text-sm text-green-700">
                {isReduced
                  ? `${sizeChangePercent.toFixed(1)}%`
                  : t.compressionResult}
              </p>
            </div>
          </div>

          {/* 용량 비교 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm text-gray-500">
                  {t.compressionOriginal}
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {formatFileSize(
                    uploadedImage.file.size
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm text-gray-500">
                  {t.compressionResult}
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {formatFileSize(result.size)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {isReduced ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-600" />

                  <span className="font-semibold text-green-600">
                    {sizeChangePercent.toFixed(1)}%{" "}
                    {t.compressionResult}
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 text-orange-500" />

                  <span className="font-semibold text-orange-600">
                    {Math.abs(sizeChangePercent).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 결과 정보 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t.compressionFormat}
                </span>

                <span className="font-medium text-gray-900">
                  WebP
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t.compressionQuality}
                </span>

                <span className="font-medium text-gray-900">
                  {Math.round(quality * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t.compressionResult}
                </span>

                <span className="font-medium text-gray-900">
                  {formatFileSize(result.size)}
                </span>
              </div>
            </div>
          </div>

          {/* 다운로드 */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            {t.compressionDownloadButton}
          </button>

          {/* 다시 압축 */}
          <button
            type="button"
            onClick={handleRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            {t.compressionButton}
          </button>

          {/* 다른 이미지 */}
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            {t.resultResetButton}
          </button>
        </>
      )}
    </div>
  );
}
