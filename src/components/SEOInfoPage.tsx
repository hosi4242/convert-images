import { ArrowLeft, ArrowRight, Calculator, FileText, Image as ImageIcon, Mail, QrCode, ShieldCheck, Type } from "lucide-react";
import { useEffect } from "react";

type PageKey =
  | "image-converter"
  | "image-compressor"
  | "image-resizer"
  | "qr-code"
  | "calculator"
  | "text-tools"
  | "pdf-tools"
  | "about"
  | "privacy"
  | "terms"
  | "contact";

type PageData = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  icon: typeof ImageIcon;
  sections: Array<[string, string]>;
};

const pages: Record<PageKey, PageData> = {
  "image-converter": {
    title: "이미지 변환 무료 도구 | JPG PNG WebP AVIF",
    description: "JPG, PNG, WebP, AVIF 등 이미지 파일 형식을 브라우저에서 간편하게 변환하는 무료 온라인 도구입니다.",
    heading: "이미지 변환",
    intro: "JPG, PNG, WebP, AVIF 등 자주 사용하는 이미지 형식을 별도 프로그램 설치 없이 브라우저에서 변환할 수 있습니다. 이미지 파일은 지원되는 변환 과정에서 브라우저에서 처리됩니다.",
    icon: ImageIcon,
    sections: [
      ["어떤 경우에 사용하나요?", "웹사이트에 올릴 이미지 형식을 바꾸거나, 특정 프로그램에서 필요한 파일 형식으로 변환할 때 사용할 수 있습니다. 원본 파일과 변환 결과를 비교한 뒤 필요한 파일을 다운로드하세요."],
      ["사용 방법", "메인 화면에서 이미지 도구를 선택한 뒤 이미지 변환을 선택합니다. 파일을 업로드하고 원하는 출력 형식을 선택한 다음 변환을 실행하면 됩니다."],
      ["지원 형식과 주의사항", "브라우저와 파일 특성에 따라 지원 범위와 결과가 달라질 수 있습니다. 특히 투명 배경이나 압축 방식이 다른 형식으로 변환할 때 결과를 확인하는 것이 좋습니다."],
      ["개인정보와 파일 처리", "이미지 변환 기능은 브라우저에서 처리하도록 설계되어 있으며, 변환을 위해 이미지 파일을 외부 서버에 업로드하지 않습니다."]
    ]
  },
  "image-compressor": {
    title: "이미지 용량 줄이기 무료 도구 | 온라인 이미지 압축",
    description: "이미지의 파일 용량을 줄이는 무료 브라우저 기반 이미지 압축 도구입니다.",
    heading: "이미지 압축",
    intro: "사진이나 이미지의 가로·세로 크기는 유지하면서 파일 용량을 줄이고 싶을 때 사용할 수 있는 무료 이미지 압축 도구입니다.",
    icon: ImageIcon,
    sections: [
      ["이미지 압축이 필요한 경우", "웹사이트 업로드, 이메일 첨부, 문서 첨부처럼 파일 크기 제한이 있는 경우 이미지 용량을 줄이면 편리합니다."],
      ["사용 방법", "이미지 도구에서 이미지 압축을 선택하고 파일을 업로드합니다. 압축 결과를 확인한 뒤 원하는 파일을 다운로드할 수 있습니다."],
      ["화질과 용량의 관계", "일반적으로 파일 용량을 더 크게 줄일수록 이미지 품질에도 영향을 줄 수 있습니다. 중요한 이미지라면 원본을 별도로 보관하고 압축 결과를 확인하세요."],
      ["파일 처리", "지원되는 이미지 처리는 브라우저에서 수행되며 변환을 위해 이미지 파일을 외부 서버에 업로드하지 않습니다."]
    ]
  },
  "image-resizer": {
    title: "이미지 크기 조절 무료 도구 | 사진 가로 세로 변경",
    description: "사진과 이미지의 가로·세로 크기를 간편하게 조절하는 무료 온라인 도구입니다.",
    heading: "이미지 크기 조절",
    intro: "프로필 이미지, 문서용 사진, 웹사이트 이미지처럼 특정 픽셀 크기가 필요한 경우 이미지의 가로·세로 크기를 조절할 수 있습니다.",
    icon: ImageIcon,
    sections: [
      ["이미지 크기를 줄이는 이유", "웹페이지나 문서에 큰 이미지를 그대로 사용하면 파일 크기와 표시 속도에 영향을 줄 수 있습니다. 필요한 크기로 조절하면 활용하기 편리합니다."],
      ["사용 방법", "이미지 도구에서 크기 조정을 선택하고 파일을 업로드한 뒤 원하는 가로·세로 크기를 설정합니다. 결과를 확인하고 다운로드하세요."],
      ["비율 확인", "가로와 세로 비율을 유지해야 사진이 찌그러지는 것을 줄일 수 있습니다. 특별한 목적이 없다면 원본 비율을 유지하는 것이 좋습니다."],
      ["브라우저 처리", "이미지 크기 조절은 브라우저에서 처리되도록 설계되어 있으며 파일을 외부 서버로 전송하지 않습니다."]
    ]
  },
  "qr-code": {
    title: "QR코드 생성 무료 도구 | URL 텍스트 Wi-Fi",
    description: "URL과 텍스트 등 필요한 정보를 간편하게 QR코드로 만드는 무료 온라인 도구입니다.",
    heading: "QR코드 생성",
    intro: "웹사이트 주소나 텍스트를 다른 사람에게 빠르게 공유하고 싶을 때 사용할 수 있는 무료 QR코드 생성 도구입니다.",
    icon: QrCode,
    sections: [
      ["어디에 사용할 수 있나요?", "웹사이트 주소, 간단한 텍스트, Wi-Fi 접속 정보 등 QR코드로 공유하기 적합한 정보를 입력할 수 있습니다."],
      ["사용 방법", "QR코드 메뉴를 선택하고 필요한 정보를 입력하면 QR코드를 생성할 수 있습니다. 생성된 QR코드는 화면에서 확인한 뒤 필요한 방식으로 저장하거나 사용할 수 있습니다."],
      ["스캔 테스트", "중요한 QR코드는 배포하기 전에 스마트폰으로 직접 스캔하여 입력된 정보가 정확한지 확인하는 것이 좋습니다."],
      ["개인정보 주의", "QR코드에 민감한 개인정보나 공개하면 안 되는 정보를 넣지 않는 것을 권장합니다."]
    ]
  },
  "calculator": {
    title: "복합 계산기 무료 | 퍼센트 할인 부가세 증감률 마진",
    description: "퍼센트, 할인, 부가세, 증감률, 마진 등 일상에서 자주 사용하는 계산을 한곳에서 확인하는 무료 계산기입니다.",
    heading: "복합 계산기",
    intro: "퍼센트와 할인, 부가세, 증감률, 마진 등 자주 필요한 계산을 별도의 계산 앱 없이 브라우저에서 확인할 수 있습니다.",
    icon: Calculator,
    sections: [
      ["퍼센트와 증감률", "전체에서 일정 비율이 얼마인지 계산하거나 기존 값과 새로운 값의 증가·감소 비율을 확인할 때 사용할 수 있습니다."],
      ["할인과 부가세", "상품 가격을 기준으로 할인 금액이나 할인 후 가격을 확인하고, 부가세를 포함하거나 제외한 금액을 계산할 수 있습니다."],
      ["마진 계산", "판매가격과 원가를 기준으로 금액과 비율을 확인할 때 사용할 수 있습니다. 실제 사업·세무 업무에서는 적용 기준을 별도로 확인하세요."],
      ["계산 결과 확인", "계산기는 편의를 위한 도구입니다. 계약, 세금, 회계 등 중요한 업무에 사용하기 전 입력값과 적용 기준을 직접 확인하세요."]
    ]
  },
  "text-tools": {
    title: "글자 수 세기 무료 | 공백 제외 바이트 계산",
    description: "글자 수, 공백 제외 글자 수, 줄 수, 단어 수와 UTF-8 바이트 수를 확인하는 무료 텍스트 도구입니다.",
    heading: "텍스트 도구",
    intro: "블로그, 자기소개서, 문서, 게시글처럼 글자 수 제한이 있는 글을 작성할 때 필요한 기본적인 문자와 바이트 정보를 빠르게 확인할 수 있습니다.",
    icon: Type,
    sections: [
      ["확인할 수 있는 정보", "입력한 텍스트의 전체 글자 수, 공백을 제외한 글자 수, 줄 수, 단어 수와 UTF-8 기준 바이트 수를 확인할 수 있습니다."],
      ["사용 방법", "텍스트 도구를 선택하고 글을 입력하거나 붙여넣으면 결과가 바로 표시됩니다. 필요한 기준에 맞춰 글을 수정하면서 수치를 확인할 수 있습니다."],
      ["바이트와 글자 수는 다릅니다", "한글과 영문, 숫자, 특수문자는 문자 인코딩에 따라 필요한 바이트 수가 달라질 수 있습니다. 시스템에서 바이트 제한을 제시했다면 해당 기준을 확인하세요."],
      ["개인정보 주의", "민감한 개인정보가 포함된 글은 온라인 도구에 입력하기 전에 필요한 보호조치를 확인하세요."]
    ]
  },
  "pdf-tools": {
    title: "PDF 도구 무료 | 이미지 PDF 변환 온라인",
    description: "여러 JPG와 PNG 이미지를 하나의 PDF로 묶고 PDF 파일의 기본 정보를 확인할 수 있는 무료 브라우저 기반 도구입니다.",
    heading: "PDF 도구",
    intro: "여러 이미지 파일을 하나의 PDF로 묶거나 PDF 파일의 기본 정보를 확인할 때 사용할 수 있는 간단한 브라우저 기반 도구입니다.",
    icon: FileText,
    sections: [
      ["이미지를 PDF로 묶기", "JPG나 PNG 이미지가 여러 장 있을 때 하나의 PDF 파일로 정리할 수 있습니다. 문서 제출이나 보관용 파일을 만들 때 활용할 수 있습니다."],
      ["사용 방법", "PDF 도구를 선택하고 지원되는 파일을 추가한 뒤 필요한 작업을 선택합니다. 생성 결과를 확인한 후 파일을 저장하세요."],
      ["파일 확인", "PDF의 페이지 수와 기본적인 파일 정보를 확인할 수 있습니다. 중요한 문서는 생성 후 실제 페이지 순서와 내용이 정확한지 확인하세요."],
      ["파일 처리", "지원되는 PDF·이미지 작업은 브라우저에서 처리하도록 설계되어 있습니다. 중요한 문서는 작업 전에 원본 파일을 별도로 보관하세요."]
    ]
  },
  about: {
    title: "사이트 소개 | 올인원 간편 도구",
    description: "올인원 간편 도구의 서비스 목적과 제공 기능을 안내합니다.",
    heading: "사이트 소개",
    intro: "올인원 간편 도구는 이미지, QR코드, 계산, 텍스트, PDF 작업을 별도 프로그램 설치 없이 브라우저에서 간편하게 이용할 수 있도록 만든 무료 웹 도구입니다.",
    icon: ShieldCheck,
    sections: [
      ["제공 기능", "이미지 변환·압축·크기 조정·편집·일괄 변환, QR코드 생성, 복합 계산, 글자 수·바이트 계산, PDF 관련 도구를 제공합니다."],
      ["브라우저 중심 처리", "지원되는 파일 작업은 브라우저에서 직접 처리하는 것을 우선하며, 이미지 변환을 위해 파일을 외부 서버에 업로드하지 않는 구조를 사용합니다."],
      ["서비스 운영", "사이트의 기능과 화면은 안정적인 운영과 개선을 위해 변경될 수 있습니다. 서비스 이용 중 발견한 오류나 개선 의견은 문의 페이지를 통해 알려주세요."]
    ]
  },
  privacy: {
    title: "개인정보처리방침 | 올인원 간편 도구",
    description: "올인원 간편 도구의 개인정보 및 쿠키, 방문 통계, 광고 관련 처리 방침입니다.",
    heading: "개인정보처리방침",
    intro: "올인원 간편 도구는 서비스 운영에 필요한 범위에서 정보를 최소한으로 처리하고, 브라우저에서 처리할 수 있는 파일 작업은 로컬 처리를 우선합니다.",
    icon: ShieldCheck,
    sections: [
      ["1. 파일 처리", "이미지 변환·압축·크기 조정 등 브라우저 기반 파일 작업은 사용자의 브라우저에서 처리하도록 설계되어 있으며, 변환을 위해 이미지 파일을 사이트 서버에 저장하지 않습니다. 사용자가 직접 외부 서비스로 이동하거나 외부 기능을 이용하는 경우에는 해당 서비스의 정책이 적용될 수 있습니다."],
      ["2. 방문 통계 및 기술 정보", "현재 사이트는 Cloudflare Web Analytics를 사용하며, 누적 방문자 수 표시를 위해 CountAPI 외부 서비스를 사용합니다. 이러한 서비스는 접속 과정에서 IP 주소, 브라우저·기기 정보, 방문 경로 등 기술 정보를 처리할 수 있으며 각 제공자의 정책이 적용될 수 있습니다."],
      ["3. 광고 서비스", "향후 Google AdSense 등 광고 서비스를 사용하는 경우 광고 제공, 측정, 보안 및 개인화와 관련된 쿠키 또는 유사 기술이 사용될 수 있습니다. 광고 서비스를 실제 도입하면 해당 내용과 필요한 고지 사항을 이 페이지에 반영합니다."],
      ["4. 문의 정보", "문의하기 기능을 통해 이메일 등 연락처를 제공하는 경우 문의에 답변하고 서비스 개선에 필요한 범위에서 해당 정보를 이용할 수 있습니다. 별도의 보관이 필요한 경우 관련 법령에서 정한 기간을 따릅니다."],
      ["5. 외부 서비스", "Cloudflare, 방문자 통계 서비스, 향후 광고·분석 서비스 등 외부 서비스가 사용될 수 있으며 각 서비스의 개인정보처리방침이 적용될 수 있습니다."],
      ["6. 변경", "서비스 기능이나 외부 서비스가 변경되는 경우 이 개인정보처리방침도 실제 운영 상태에 맞게 업데이트합니다."]
    ]
  },
  terms: {
    title: "이용약관 | 올인원 간편 도구",
    description: "올인원 간편 도구의 이용약관과 서비스 이용 시 유의사항을 안내합니다.",
    heading: "이용약관",
    intro: "이 사이트는 일상적인 파일·텍스트·계산 작업을 편리하게 돕기 위한 무료 웹 도구를 제공합니다.",
    icon: FileText,
    sections: [
      ["서비스 이용", "사용자는 관련 법령과 일반적인 웹 이용 규칙을 준수하여 서비스를 이용해야 합니다."],
      ["결과 확인", "계산·변환 결과는 편의를 위한 것이므로 중요한 업무, 계약, 세무·회계 또는 의사결정에 사용하기 전 결과와 적용 기준을 직접 확인해야 합니다."],
      ["파일과 개인정보", "사용자는 자신이 업로드하거나 입력하는 파일과 정보에 대한 적법한 권한을 보유해야 합니다. 민감한 정보는 온라인 도구에 입력하기 전에 필요한 보호조치를 확인하세요."],
      ["서비스 변경", "서비스 기능과 화면은 안정적인 운영과 개선을 위해 변경되거나 일시 중단될 수 있습니다."],
      ["면책", "서비스는 가능한 범위에서 정상적인 기능을 제공하도록 운영하지만 모든 환경에서 오류가 없음을 보장하지 않습니다."]
    ]
  },
  contact: {
    title: "문의하기 | 올인원 간편 도구",
    description: "올인원 간편 도구의 오류 신고 및 개선 의견 문의 방법을 안내합니다.",
    heading: "문의하기",
    intro: "서비스 이용 중 오류나 개선 의견이 있다면 아래 이메일로 알려주세요.",
    icon: Mail,
    sections: [
      ["문의 이메일", "lucidpoverty@gmail.com"],
      ["문의 방법", "아래 이메일 주소를 클릭하면 문의 메일을 작성할 수 있습니다."],
      ["문의 내용", "오류를 알려주실 때에는 사용한 기능, 발생한 상황, 사용 기기와 브라우저 정보를 함께 적어주시면 확인에 도움이 됩니다."],
      ["개인정보 주의", "오류 문의에 불필요한 주민등록번호, 비밀번호, 금융정보 등 민감한 개인정보를 보내지 마세요."]
    ]
  }
};

const homeHref = "/";

export default function SEOInfoPage({ page }: { page: PageKey }) {
  const data = pages[page];
  const Icon = data.icon;

  useEffect(() => {
    document.title = data.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", data.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute("href", window.location.href.split("?")[0]);
  }, [data]);

  const related = (Object.keys(pages) as PageKey[]).filter((key) => key !== page && !["about","privacy","terms","contact"].includes(key)).slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5 rounded-3xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 px-6 py-8 text-white shadow-lg sm:px-10">
          <div className="mb-4 inline-flex rounded-xl bg-white/15 p-3"><Icon className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{data.heading}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">{data.intro}</p>
        </header>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {data.sections.map(([title, body]) => (
            <section key={title} className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
              <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{title === "문의 이메일" ? <a className="font-semibold text-blue-600 hover:underline" href="mailto:lucidpoverty@gmail.com">lucidpoverty@gmail.com</a> : body}</p>
            </section>
          ))}

          {!["privacy","terms","contact"].includes(page) && (
            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <h2 className="font-bold text-slate-800">바로 사용하기</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">이 도구를 직접 사용하려면 메인 페이지에서 해당 기능을 선택하세요.</p>
              <a href={homeHref} className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                도구 사용하기 <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-5">
            <a href={homeHref} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> 메인 도구로 돌아가기
            </a>
          </div>
        </article>

        {related.length > 0 && (
          <nav className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" aria-label="관련 도구">
            <h2 className="font-bold text-slate-800">관련 도구</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((key) => (
                <a key={key} href={`/${key}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                  {pages[key].heading}
                </a>
              ))}
            </div>
          </nav>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <a href="/about" className="hover:text-slate-600">사이트 소개</a>
            <a href="/privacy" className="hover:text-slate-600">개인정보처리방침</a>
            <a href="/terms" className="hover:text-slate-600">이용약관</a>
            <a href="/contact" className="hover:text-slate-600">문의하기</a>
          </nav>
        </footer>
      </div>
    </main>
  );
}

export function getSEOPage(pathname: string): PageKey | null {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/") return null;
  const key = path.slice(1) as PageKey;
  return pages[key] ? key : null;
}
