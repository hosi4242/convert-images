import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { formatFileSize } from "@/utils/format";
import { useI18n } from "@/i18n/I18nContext";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  uploadedImage: {
    file: File;
    width: number;
    height: number;
    size: number;
    previewUrl: string;
  } | null;
}

export default function UploadBox({ onFileSelect, uploadedImage }: UploadBoxProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (uploadedImage) {
    return (
      <div className="animate-fade-in rounded-2xl border border-white/60 bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={uploadedImage.previewUrl}
            alt={uploadedImage.file.name}
            className="h-24 w-24 flex-shrink-0 rounded-lg border border-gray-200 object-contain bg-gray-50"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {uploadedImage.file.name}
            </p>
            <dl className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex gap-2">
                <dt className="text-gray-400">{t.uploadedFileSize}</dt>
                <dd>{formatFileSize(uploadedImage.size)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400">{t.uploadedImageSize}</dt>
                <dd>
                  {uploadedImage.width} × {uploadedImage.height} px
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
        isDragging
          ? "border-blue-500 bg-blue-50/80 scale-[1.01]"
          : "border-blue-200 bg-white/70 hover:border-blue-400 hover:bg-blue-50/40 backdrop-blur-sm"
      }`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-400 shadow-lg shadow-blue-200/50">
        <Upload className="h-6 w-6 text-white" strokeWidth={2} />
      </div>
      <p className="text-sm text-gray-600 sm:text-base">
        {t.uploadDropHere}
      </p>
      <button
        type="button"
        onClick={handleButtonClick}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/50 transition-all hover:shadow-xl hover:shadow-blue-300/50 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:text-base"
      >
        <ImageIcon className="h-5 w-5" />
        {t.uploadSelectButton}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
        onChange={handleFileChange}
        className="hidden"
        aria-label={t.uploadFileInputAria}
      />
      <p className="mt-3 text-xs text-gray-400">
        {t.uploadSupportedFormats}
      </p>
    </div>
  );
}
