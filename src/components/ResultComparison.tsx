import { Download, RotateCcw, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { formatFileSize, getSizeChangePercent, getFileNameWithoutExtension, sanitizeFilename } from "@/utils/format";
import { type ConversionResult, getExtensionForFormat } from "@/utils/imageConverter";
import { useI18n } from "@/i18n/I18nContext";

interface ResultComparisonProps {
  originalFile: File;
  originalPreviewUrl: string;
  originalWidth: number;
  originalHeight: number;
  result: ConversionResult;
  onDownload: () => void;
  onReset: () => void;
}

export default function ResultComparison({
  originalFile,
  originalPreviewUrl,
  originalWidth,
  originalHeight,
  result,
  onReset,
}: ResultComparisonProps) {
  const { t } = useI18n();
  const sizeChangePercent = getSizeChangePercent(originalFile.size, result.size);
  const isReduced = sizeChangePercent > 0;

  const baseName = getFileNameWithoutExtension(originalFile.name);
  const extension = getExtensionForFormat(
    result.blob.type === "image/jpeg"
      ? "jpeg"
      : result.blob.type === "image/png"
        ? "png"
        : "webp"
  );
  const downloadName = `${sanitizeFilename(baseName)}.${extension}`;

  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center gap-2 rounded-xl bg-green-50/90 px-4 py-2.5 text-green-700 backdrop-blur-sm">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">{t.resultComplete}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-md backdrop-blur-sm">
          <p className="mb-2 text-sm font-semibold text-gray-500">{t.resultOriginal}</p>
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-2">
            <img
              src={originalPreviewUrl}
              alt={t.resultOriginal}
              className="max-h-48 w-auto max-w-full object-contain"
            />
          </div>
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="text-gray-400">{t.resultDimensions}</dt>
              <dd>{originalWidth} × {originalHeight} px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">{t.resultFileSize}</dt>
              <dd className="font-semibold">{formatFileSize(originalFile.size)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-white/80 p-3 shadow-md backdrop-blur-sm">
          <p className="mb-2 text-sm font-semibold text-blue-600">{t.resultConverted}</p>
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-2">
            <img
              src={result.dataUrl}
              alt={t.resultConverted}
              className="max-h-48 w-auto max-w-full object-contain"
            />
          </div>
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="text-gray-400">{t.resultDimensions}</dt>
              <dd>{result.width} × {result.height} px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">{t.resultFileSize}</dt>
              <dd className="font-semibold">{formatFileSize(result.size)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 backdrop-blur-sm ${
          isReduced ? "bg-green-50/90 text-green-700" : "bg-orange-50/90 text-orange-700"
        }`}
      >
        {isReduced ? (
          <TrendingDown className="h-5 w-5 flex-shrink-0" />
        ) : (
          <TrendingUp className="h-5 w-5 flex-shrink-0" />
        )}
        <p className="text-sm font-medium">
          {isReduced
            ? t.resultReduced(sizeChangePercent.toFixed(1))
            : t.resultIncreased(Math.abs(sizeChangePercent).toFixed(1))}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-200/50 transition-all hover:shadow-xl hover:shadow-blue-300/50 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <Download className="h-5 w-5" />
        {t.resultDownloadButton}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-6 py-2.5 text-base font-semibold text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
      >
        <RotateCcw className="h-5 w-5" />
        {t.resultResetButton}
      </button>
    </div>
  );
}
