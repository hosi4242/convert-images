import { ArrowLeft, FileText, Mail, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

type Page = "about" | "privacy" | "terms" | "contact";

export default function InfoPages({ page, onBack }: { page: Page; onBack: () => void }) {
  const { language } = useI18n();
  const ko = language === "ko";
  const data = {
    about: {
      icon: ShieldCheck,
      title: ko ? "사이트 소개" : "About ToolMingle",
      intro: ko
        ? "ToolMingle은 일상에서 반복되는 디지털 작업을 더 간단하게 해결하기 위해 만든 무료 온라인 도구 모음입니다. 복잡한 프로그램을 설치하거나 계정을 만들지 않고 필요한 기능을 바로 찾아 사용할 수 있도록 설계합니다."
        : "ToolMingle is a free collection of practical browser tools built to make everyday digital tasks simpler. The goal is to help visitors find and use a useful feature without installing a desktop application or creating an account.",
      sections: [
        [ko ? "어떤 도구를 제공하나요?" : "Tools available",
         ko ? "이미지 변환·압축·크기 조절·편집·일괄 변환·용량 비교·DPI 계산, QR 코드 생성, 퍼센트와 할인 계산, 대출 및 할부 추정, 단위·시간 변환, 텍스트 분석·정리, PDF 작업, 온라인 타이머를 제공합니다. 도구별 지원 형식과 입력 조건은 해당 도구 페이지에서 확인할 수 있습니다."
           : "The collection includes image conversion, compression, resizing, editing, batch conversion, size comparison and DPI estimation; QR code generation; everyday, loan and installment estimates; unit and time conversion; text analysis and cleanup; PDF utilities; and an online timer. Each tool page explains its supported inputs and important limitations."],
        [ko ? "사용 방법" : "How to use a tool",
         ko ? "홈 화면에서 도구 종류와 기능을 선택하고 화면에 표시되는 입력값 또는 파일을 준비하세요. 실행 후 결과를 확인하고 필요한 경우 저장하거나 다운로드합니다. 파일 형식, 크기, 브라우저 지원 여부에 따라 이용 가능한 기능이 달라질 수 있습니다."
           : "Choose a category and tool on the home page, provide the requested value or file, and run it. Review the result before saving or downloading. Available operations may depend on file format, file size and browser support."],
        [ko ? "개인정보와 파일" : "Privacy and files",
         ko ? "파일을 선택하기 전에 각 도구의 처리 안내를 확인하세요. 브라우저에서 로컬 처리하는 기능은 파일을 변환 목적으로 외부 서버에 전송하지 않도록 설계되어 있습니다. 광고 및 방문 통계 등 외부 서비스는 별도로 적용될 수 있으며 자세한 내용은 개인정보처리방침에 안내합니다."
           : "Check each tool's processing note before selecting a file. Tools designed for local browser processing do not send files to an external server for conversion. Advertising and analytics services may operate separately; see the Privacy Policy for details."],
        [ko ? "운영 및 개선" : "Maintenance and feedback",
         ko ? "기능의 정확성, 호환성, 사용 편의성을 지속적으로 점검하고 개선합니다. 모든 환경에서 결과를 보장할 수는 없으므로 중요한 작업은 원본을 보관하고 결과를 확인하세요. 오류나 개선 의견은 문의 페이지의 이메일로 보내주세요."
           : "We aim to improve usability, compatibility and reliability over time. Results cannot be guaranteed in every environment, so keep a copy of important originals and verify outputs. Please use the Contact page to report a problem or suggest an improvement."]
      ]
    },
    privacy: {
      icon: ShieldCheck,
      title: ko ? "개인정보처리방침" : "Privacy Policy",
      intro: ko
        ? "ToolMingle은 서비스 운영에 필요한 정보만 처리하고, 지원되는 기능에서는 브라우저 내 처리를 우선하도록 설계합니다. 이 안내는 사이트 기능 및 사용 중인 외부 서비스에 따라 적용됩니다."
        : "ToolMingle aims to limit data processing to what is needed to operate the service and prefers in-browser processing where supported. This notice applies in light of the site's features and third-party services in use.",
      sections: [
        [ko ? "사용자가 선택한 파일" : "Files you select",
         ko ? "브라우저에서 직접 처리하도록 구현된 이미지 도구는 선택한 파일을 사이트 서버에 업로드하지 않고 사용자의 브라우저에서 처리합니다. 모든 도구와 모든 파일 형식이 동일한 방식으로 처리된다고 단정할 수 없으므로 각 기능의 안내를 확인하세요. 파일은 직접 다운로드하거나 저장하기 전까지 사용자의 작업 환경에 남아 있을 수 있습니다."
           : "Image tools implemented for direct browser processing work on selected files without uploading them to this site's server. Not every tool or file format necessarily works the same way, so read the processing note for the feature you use. Files may remain in your local working environment until you download or otherwise save them."],
        [ko ? "방문 통계 및 기술 정보" : "Analytics and technical information",
         ko ? "사이트는 Cloudflare Web Analytics 및 Google Tag Manager 등 운영·측정 도구를 사용할 수 있습니다. 이 서비스는 방문·기술 정보를 처리할 수 있으며 각 제공자의 정책과 설정이 적용됩니다. 자세한 사항은 해당 서비스의 정책을 확인하세요."
           : "The site may use services such as Cloudflare Web Analytics and Google Tag Manager for operation and measurement. These providers may process visit or technical information under their own policies and settings. Please consult their notices for details."],
        [ko ? "광고 및 Google AdSense" : "Advertising and Google AdSense",
         ko ? "사이트에는 Google AdSense 광고 스크립트가 포함되어 있습니다. 광고가 제공되는 경우 Google 및 파트너가 쿠키 또는 유사 기술, IP 주소, 브라우저·기기 정보를 이용해 광고를 제공하고 측정할 수 있습니다. 광고 개인 최적화와 관련된 선택은 Google 계정 및 광고 설정에 따라 달라질 수 있습니다. Google 개인정보처리방침: https://policies.google.com/privacy"
           : "The site includes Google AdSense code. When ads are served, Google and its partners may use cookies or similar technologies, IP addresses, and browser or device information to deliver and measure ads. Personalization choices may depend on your Google account and ad settings. Google Privacy Policy: https://policies.google.com/privacy"],
        [ko ? "문의 및 방침 변경" : "Contact and updates",
         ko ? "개인정보 처리에 관한 문의는 lucidpoverty@gmail.com 으로 보내주세요. 서비스 기능이나 외부 서비스가 변경되면 이 방침도 수정될 수 있으며, 페이지에 게시된 최신 내용을 확인하시기 바랍니다."
           : "For privacy-related questions, email lucidpoverty@gmail.com. This notice may be updated when site features or third-party services change; please review the latest version published here."]
      ]
    },
    terms: {
      icon: FileText,
      title: ko ? "이용약관" : "Terms of Use",
      intro: ko
        ? "ToolMingle은 일상적인 디지털 작업을 돕는 무료 웹 도구를 제공합니다. 서비스를 이용하면 아래 사항에 동의하는 것으로 간주됩니다."
        : "ToolMingle provides free web utilities for everyday digital tasks. By using the service, you agree to the following terms.",
      sections: [
        [ko ? "허용되는 이용" : "Acceptable use",
         ko ? "서비스를 관련 법령에 따라 이용하고, 타인의 권리 침해, 서비스 운영 방해, 보안 우회 또는 악용을 시도하지 않아야 합니다."
           : "Use the service in accordance with applicable laws. Do not infringe others' rights, disrupt operation, bypass security or misuse the tools."],
        [ko ? "결과와 정확성" : "Results and accuracy",
         ko ? "계산·변환 결과는 참고 및 편의 목적으로 제공됩니다. 입력값, 반올림, 파일 형식, 브라우저 환경에 따라 결과가 달라질 수 있습니다. 중요한 금융·세무·업무·인쇄 결과는 공식 자료 또는 전문가와 확인하세요. 대출·할부 계산은 금융상품 제안이나 금융 조언이 아닙니다."
           : "Calculations and conversions are provided for convenience and reference. Results may vary with inputs, rounding, file formats and browser environments. Verify important financial, tax, business or print decisions against official sources or a qualified professional. Loan and installment estimates are not financial offers or advice."],
        [ko ? "파일 및 백업" : "Files and backups",
         ko ? "파일 작업 전 원본을 보관할 책임은 사용자에게 있습니다. 다운로드한 결과가 필요한 용도에 맞는지 직접 확인하세요."
           : "You are responsible for keeping original copies before file operations. Check that downloaded results meet your needs."],
        [ko ? "서비스 제공 및 변경" : "Availability and changes",
         ko ? "서비스는 무료로 제공되며 기능, 지원 형식, 화면 및 제공 여부는 유지보수나 개선 과정에서 변경 또는 중단될 수 있습니다."
           : "The service is provided free of charge. Features, supported formats, interface and availability may change or be discontinued during maintenance or improvement."],
        [ko ? "문의" : "Contact",
         ko ? "약관 또는 서비스에 대한 문의는 lucidpoverty@gmail.com 으로 보내주세요."
           : "Questions about these terms or the service can be sent to lucidpoverty@gmail.com."]
      ]
    },
    contact: {
      icon: Mail,
      title: ko ? "문의하기" : "Contact ToolMingle",
      intro: ko
        ? "오류 신고, 기능 제안, 사용 중 불편한 점 또는 개인정보 관련 문의를 환영합니다. 확인에 필요한 정보를 함께 보내주시면 도움이 됩니다."
        : "We welcome bug reports, feature suggestions, usability feedback and privacy questions. A few details help us investigate.",
      sections: [
        [ko ? "이메일" : "Email",
         ko ? "lucidpoverty@gmail.com 으로 문의해 주세요. 사이트 운영자는 문의 내용을 확인하고 답변하기 위해 이메일 주소와 메시지 내용을 처리할 수 있습니다."
           : "Email lucidpoverty@gmail.com. The site operator may process your email address and message to review and respond to your inquiry."],
        [ko ? "오류를 신고할 때" : "When reporting a problem",
         ko ? "가능하면 문제가 발생한 도구 이름 또는 페이지 주소, 사용한 브라우저와 기기, 재현 순서, 표시된 오류 문구를 적어주세요. 비밀번호, 인증 코드, 민감한 개인정보 또는 원본 파일은 보내지 마세요."
           : "If possible, include the tool or page URL, browser and device, steps to reproduce, and the exact error message. Do not send passwords, verification codes, sensitive personal information or original files."],
        [ko ? "답변 시간" : "Response time",
         ko ? "문의량과 문제의 복잡도에 따라 답변이 늦어질 수 있습니다. 모든 문의에 개별 답변을 보장하지는 않습니다."
           : "Response time depends on inquiry volume and complexity. An individual reply to every message cannot be guaranteed."]
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
