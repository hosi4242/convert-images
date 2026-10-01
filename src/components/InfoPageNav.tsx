import { Info, FileText, ShieldCheck, Mail } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export type InfoPageKey = "about" | "privacy" | "terms" | "contact";

export default function InfoPageNav({ active }: { active: InfoPageKey | null; onChange?: (page: InfoPageKey | null) => void }) {
  const { language } = useI18n();
  const ko = language === "ko";
  const items: [InfoPageKey, typeof Info, string][] = [
    ["about", Info, "/about"],
    ["privacy", ShieldCheck, "/privacy"],
    ["terms", FileText, "/terms"],
    ["contact", Mail, "/contact"]
  ];
  const labels: Record<InfoPageKey, string> = {
    about: ko ? "사이트 소개" : "About",
    privacy: ko ? "개인정보처리방침" : "Privacy",
    terms: ko ? "이용약관" : "Terms",
    contact: ko ? "문의하기" : "Contact"
  };

  return (
    <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5" aria-label={ko ? "사이트 정보" : "Site information"}>
      {items.map(([id, Icon, href]) => (
        <a key={id} href={href} className={`inline-flex items-center gap-1 text-[11px] font-medium ${active === id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
          <Icon className="h-3 w-3" />{labels[id]}
        </a>
      ))}
    </nav>
  );
}
