import { type ImageFormat } from "@/utils/imageConverter";
import { useI18n } from "@/i18n/I18nContext";

interface ConversionSettingsProps {
  format: ImageFormat;
  onFormatChange: (format: ImageFormat) => void;
  onConvert: () => void;
  isConverting: boolean;
}

export default function ConversionSettings({
  format,
  onFormatChange,
  onConvert,
  isConverting,
}: ConversionSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="animate-fade-in rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-sm">
      <h2 className="text-lg font-bold text-gray-900">{t.settingsTitle}</h2>

      <div className="mt-3">
        <label htmlFor="format-select" className="mb-2 block text-sm font-medium text-gray-700">
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
