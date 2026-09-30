import { ArrowLeft, FileText, Mail, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

type Page = "about" | "privacy" | "terms" | "contact";

export default function InfoPages({ page, onBack }: { page: Page; onBack: () => void }) {
  const { language } = useI18n();
  const ko = language === "ko";
  const data = {
    about: {
      icon: ShieldCheck,
      title: ko ? "사이트 소개" : "About",
      intro: ko ? "올인원 간편 도구는 이미지·QR·계산·텍스트 작업을 별도 프로그램 설치 없이 브라우저에서 처리할 수 있도록 만든 무료 웹 도구입니다." : "All-in-One Simple Tools is a free web service for image, QR, calculator, and text tasks without installing separate software.",
      sections: [
        [ko ? "제공 기능" : "What we provide", ko ? "이미지 변환·압축·크기 조정·편집·일괄 변환, QR 코드 생성, 다양한 계산기, 글자 수·바이트 계산 기능을 제공합니다." : "Image conversion, compression, resizing, editing, batch conversion, QR generation, calculators, and text counting."],
        [ko ? "브라우저에서 처리" : "Browser-based processing", ko ? "지원되는 기능은 사용자의 브라우저에서 직접 처리하도록 설계해 불필요한 파일 업로드를 줄였습니다." : "Supported operations are designed to run directly in your browser."],
        [ko ? "서비스 운영 방향" : "Service direction", ko ? "사용하기 쉬운 무료 도구를 지속적으로 추가하고 PC와 모바일 모두에서 편리하게 이용할 수 있도록 개선합니다." : "We continuously add practical free tools and improve desktop and mobile usability."]
      ]
    },
    privacy: {
      icon: ShieldCheck,
      title: ko ? "개인정보처리방침" : "Privacy Policy",
      intro: ko ? "이 사이트는 개인정보를 최소한으로 처리하고, 브라우저에서 처리할 수 있는 기능은 로컬 처리를 우선합니다." : "This site minimizes personal-data processing and prioritizes local browser processing where possible.",
      sections: [
        [ko ? "파일 처리" : "File processing", ko ? "이미지 변환 등 브라우저 처리 기능은 선택한 파일을 브라우저에서 처리하며 사이트 서버에 저장하지 않습니다." : "Browser-based image operations process selected files in your browser and do not store them on our server."],
        [ko ? "방문 통계" : "Usage analytics", ko ? "사이트 이용 현황을 파악하기 위해 방문 통계 도구가 사용될 수 있습니다. 해당 서비스의 정책이 적용될 수 있습니다." : "Usage analytics may be used to understand site traffic and may be subject to the provider's policies."],
        [ko ? "광고 및 외부 서비스" : "Advertising and third parties", ko ? "광고 또는 분석 서비스를 도입하는 경우 관련 쿠키 및 데이터 처리 방식에 맞춰 이 안내를 업데이트합니다." : "If advertising or analytics services are introduced, this policy will be updated to describe applicable cookies and data practices."]
      ]
    },
    terms: {
      icon: FileText,
      title: ko ? "이용약관" : "Terms of Use",
      intro: ko ? "이 사이트는 편리한 무료 웹 도구를 제공하는 것을 목적으로 합니다." : "This site provides free web tools for convenience.",
      sections: [
        [ko ? "서비스 이용" : "Use of the service", ko ? "사용자는 관련 법령과 일반적인 웹 이용 규칙을 준수하여 서비스를 이용해야 합니다." : "Users must comply with applicable laws and generally accepted web-use rules."],
        [ko ? "결과 확인" : "Check results", ko ? "계산·변환 결과는 편의를 위한 것이므로 중요한 업무나 의사결정에 사용하기 전 결과를 직접 확인하시기 바랍니다." : "Tool results are provided for convenience. Verify results before using them for important work or decisions."],
        [ko ? "서비스 변경" : "Changes", ko ? "서비스 기능과 화면은 안정적인 운영과 개선을 위해 변경될 수 있습니다." : "Features and interface may change as the service is maintained and improved."]
      ]
    },
    contact: {
      icon: Mail,
      title: ko ? "문의하기" : "Contact",
      intro: ko ? "서비스 이용 중 오류나 개선 의견이 있다면 문의 내용을 알려주세요." : "Tell us about an issue or suggestion.",
      sections: [
        [ko ? "문의 방법" : "How to contact", ko ? "현재 사이트에는 자동 문의 전송 기능을 연결하지 않았습니다. 실제 운영에 사용할 이메일 주소를 정한 뒤 이 페이지에 연결할 수 있습니다." : "A live submission method is not connected yet. A service email can be added here when the site is ready."]
      ]
    }
  } as const;
  const selected = data[page];
  const Icon = selected.icon;
  return <section className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-md backdrop-blur-sm sm:p-7">
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-blue-50 p-2.5"><Icon className="h-5 w-5 text-blue-600" /></div>
      <div><h2 className="text-xl font-extrabold text-slate-800">{selected.title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{selected.intro}</p></div>
    </div>
    {selected.sections.map(([title, body]) => <div key={title} className="border-t border-slate-100 py-4"><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p></div>)}
    <button type="button" onClick={onBack} className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />{ko ? "도구로 돌아가기" : "Back to tools"}</button>
  </section>;
}
