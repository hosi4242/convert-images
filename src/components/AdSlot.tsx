import { useI18n } from "@/i18n/I18nContext";

interface AdSlotProps {
  labelKey: "adSlot";
}

export default function AdSlot({ labelKey }: AdSlotProps) {
  const { t } = useI18n();
  return (
    <div
      className="my-2 flex items-center justify-center rounded-lg border border-dashed border-blue-200/50 bg-white/40 py-1.5 text-[10px] text-blue-300 backdrop-blur-sm"
      aria-hidden="true"
    >
      {t[labelKey]}
    </div>
  );
}
