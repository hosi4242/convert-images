import { type ImageFormat, type Quality } from "@/utils/imageConverter";
import { useI18n } from "@/i18n/I18nContext";

interface ConversionSettingsProps {
  format: ImageFormat;
  quality: Quality;
  onFormatChange: (format: ImageFormat) => void;
  onQualityChange: (quality: Quality) => void;
  onConvert: () => void;
  isConverting: boolean;
}

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 0.5, label: "50%" },
  { value: 0.7, label: "70%" },
  { value: 0.8, label: "80%" },
  { value: 0.9, label: "90%" },
  { value: 1, label: "100%" },
];

function isQualityApplicable(format: ImageFormat): boolean {
  return format === "jpeg" || format === "webp" || format === "avif";
}

export default function ConversionSettings({
  format,
  quality,
  onFormatChange,
  onQualityChange,
  onConvert,
  isConverting,
}: ConversionSettingsProps) {
  const { t } = useI18n();
  const qualityEnabled = isQualityApplicable(format);

  return (
    <div className="animate-fade-in rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-sm">
      <h2 className="text-lg font-bold text-gray-900">{t.settingsTitle}</h2>

      <div className="mt-3">
        <label
          htmlFor="format-select"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {t.settingsFormat}
        </label>
        <select
          id="format-select"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as ImageFormat)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="webp">WebP</option>
          <option value="jpeg">JPG</option>
          <option value="png">PNG</option>
          <option value="avif">AVIF (.avif)</option>
        </select>
      </div>

      <div className="mt-3">
        <label
          htmlFor="quality-select"
          className={`mb-2 block text-sm font-medium ${
            qualityEnabled ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {t.settingsQuality}
        </label>
        <select
          id="quality-select"
          value={quality}
          onChange={(e) => onQualityChange(Number(e.target.value) as Quality)}
          disabled={!qualityEnabled}
          className={`w-full rounded-xl border px-4 py-2.5 text-base focus:outline-none focus:ring-2 ${
            qualityEnabled
              ? "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          {QUALITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {!qualityEnabled && (
          <p className="mt-2 text-xs text-gray-400">
            {t.settingsQualityDisabledNote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onConvert}
        disabled={isConverting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-200/50 transition-all hover:shadow-xl hover:shadow-blue-300/50 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:from-blue-400 disabled:to-sky-300"
      >
        {isConverting ? t.settingsConverting : t.settingsConvertButton}
      </button>
    </div>
  );
}
