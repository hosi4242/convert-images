import { useRef, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useI18n } from "@/i18n/I18nContext";

export default function QRGenerator() {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">{t.qrTitle}</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        {t.qrDescription}
      </p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.qrInputLabel}
        </span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.qrInputPlaceholder}
          rows={4}
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      {value.trim() && (
        <div className="mt-5 flex flex-col items-center rounded-xl bg-blue-50/70 p-5">
          <div ref={qrContainerRef} className="rounded-xl bg-white p-3 shadow-sm">
            <QRCodeCanvas
              value={value}
              size={Math.min(240, Math.max(180, window.innerWidth - 120))}
              level="M"
              includeMargin
            />
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="mt-4 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="h-5 w-5" />
            {t.qrDownloadButton}
          </button>
        </div>
      )}
    </section>
  );
}
