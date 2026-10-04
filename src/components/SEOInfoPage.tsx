import { ArrowLeft, ArrowRight, Calculator, FileText, Image as ImageIcon, Mail, QrCode, ShieldCheck, Type, Ruler, Clock } from "lucide-react";
import { useEffect, useState } from "react";

type PageKey =
  | "image-converter" | "image-compressor" | "image-resizer" | "image-size-compare" | "image-dpi-calculator"
  | "qr-code" | "calculator" | "loan-calculator" | "installment-calculator" | "unit-converter" | "time-calculator"
  | "text-tools" | "text-cleaner" | "pdf-tools" | "about" | "privacy" | "terms" | "contact";

type Lang = "ko" | "en";
type PageData = {
  title: string; description: string; heading: string; intro: string;
  icon: typeof ImageIcon;
  sections: Array<[string, string]>;
};

const pages: Record<PageKey, Record<Lang, PageData>> = {
  "image-converter": {
    ko:{title:"이미지 변환 무료 도구 | JPG PNG WebP AVIF",description:"JPG, PNG, WebP, HEIC/HEIF 이미지를 JPG, PNG, WebP, AVIF 형식으로 변환하는 무료 브라우저 기반 도구입니다.",heading:"이미지 변환",intro:"JPG, PNG, WebP, HEIC/HEIF 이미지를 JPG, PNG, WebP, AVIF 형식으로 변환할 수 있습니다. 별도 프로그램 설치 없이 브라우저에서 사용할 수 있으며 지원되는 변환 과정은 브라우저에서 처리됩니다.",icon:ImageIcon,sections:[["어떤 경우에 사용하나요?","웹사이트에 올릴 이미지 형식을 바꾸거나 특정 프로그램에서 필요한 형식으로 변환할 때 사용할 수 있습니다."],["사용 방법","메인 화면에서 이미지 도구와 이미지 변환을 선택하고 파일을 추가한 뒤 원하는 출력 형식을 지정하여 변환하세요."],["지원 형식과 주의사항","입력은 JPG/JPEG, PNG, WebP, HEIC/HEIF를 지원하며 출력은 JPG, PNG, WebP, AVIF를 지원합니다. 투명 배경이나 압축 방식이 다른 형식은 변환 후 결과를 확인하세요."],["파일 처리","이미지 변환은 브라우저에서 처리하도록 설계되어 있으며 변환을 위해 이미지 파일을 외부 서버에 업로드하지 않습니다."]]},
    en:{title:"Free Image Converter | JPG PNG WebP AVIF",description:"Convert JPG, PNG, WebP, and HEIC/HEIF images to JPG, PNG, WebP, or AVIF in your browser.",heading:"Image Converter",intro:"Convert JPG, PNG, WebP, and HEIC/HEIF images to JPG, PNG, WebP, or AVIF without installing software. Supported conversion is designed to run locally in the browser.",icon:ImageIcon,sections:[["When to use it","Use it when you need a different image format for a website, document, or application."],["How to use it","Choose Image Tools and Convert Image on the home page, select a supported input file and output format, then run the conversion."],["Supported formats and notes","Supported inputs are JPG/JPEG, PNG, WebP, and HEIC/HEIF. Supported outputs are JPG, PNG, WebP, and AVIF. Check transparency and image quality after conversion when they matter."],["File processing","Image conversion is designed to run in your browser. Image files are not uploaded to an external server for conversion."]]}
  },
  "image-compressor": {
    ko:{title:"이미지 용량 줄이기 무료 도구 | 온라인 이미지 압축",description:"이미지 파일 용량을 줄이는 무료 브라우저 기반 이미지 압축 도구입니다.",heading:"이미지 압축",intro:"사진이나 이미지의 가로·세로 크기는 유지하면서 파일 용량을 줄이고 싶을 때 사용할 수 있습니다.",icon:ImageIcon,sections:[["언제 사용하나요?","웹사이트, 이메일, 문서 첨부처럼 파일 크기 제한이 있는 경우 이미지 용량을 줄이면 편리합니다."],["사용 방법","이미지 도구에서 이미지 압축을 선택하고 파일을 업로드한 뒤 압축 결과를 확인하고 다운로드하세요."],["화질과 용량","용량을 더 크게 줄일수록 이미지 품질에 영향을 줄 수 있습니다. 중요한 이미지는 원본을 별도로 보관하세요."],["파일 처리","지원되는 이미지 처리는 브라우저에서 수행되며 변환을 위해 이미지 파일을 외부 서버에 업로드하지 않습니다."]]},
    en:{title:"Free Image Compressor | Reduce Image File Size",description:"Reduce image file size with a free browser-based image compression tool.",heading:"Image Compressor",intro:"Reduce the file size of photos and images while keeping their original dimensions.",icon:ImageIcon,sections:[["When to use it","Useful for websites, email attachments, and documents with file-size limits."],["How to use it","Choose Image Tools and Compress Image, upload a file, review the result, and download it."],["Quality and size","Stronger compression can affect image quality. Keep the original file when the image is important."],["File processing","Supported image processing runs in the browser and does not upload the image to an external server."]]}
  },
  "image-resizer": {
    ko:{title:"이미지 크기 조절 무료 도구 | 사진 가로 세로 변경",description:"사진과 이미지의 가로·세로 크기를 간편하게 조절하는 무료 온라인 도구입니다.",heading:"이미지 크기 조절",intro:"프로필 이미지, 문서, 웹사이트처럼 특정 픽셀 크기가 필요한 경우 이미지 크기를 조절할 수 있습니다.",icon:ImageIcon,sections:[["왜 크기를 조절하나요?","필요한 픽셀 크기로 줄이면 웹이나 문서에서 활용하기 편리하고 불필요하게 큰 파일을 줄이는 데 도움이 됩니다."],["사용 방법","이미지 도구에서 크기 조정을 선택하고 파일을 업로드한 뒤 원하는 가로·세로 크기를 설정하세요."],["비율 유지","사진이 찌그러지는 것을 줄이려면 특별한 목적이 없는 경우 원본 가로세로 비율을 유지하세요."],["브라우저 처리","이미지 크기 조절은 브라우저에서 처리되도록 설계되어 있습니다."]]},
    en:{title:"Free Image Resizer | Change Image Dimensions",description:"Resize photos and images by width and height with a free browser-based tool.",heading:"Image Resizer",intro:"Resize images when a specific pixel width or height is needed for profiles, documents, or websites.",icon:ImageIcon,sections:[["Why resize images?","A suitable pixel size can make images easier to use on websites and documents and can avoid unnecessarily large files."],["How to use it","Choose Image Tools and Resize Image, upload a file, and set the desired width and height."],["Keep the aspect ratio","To avoid distortion, keep the original aspect ratio unless you have a specific reason not to."],["Browser processing","Image resizing is designed to run directly in your browser."]]}
  },
  "image-size-compare": {
    ko:{title:"이미지 용량 비교 무료 | 두 이미지 파일 크기 비교",description:"두 이미지의 파일 용량과 크기 차이를 브라우저에서 비교하는 무료 도구입니다.",heading:"이미지 용량 비교",intro:"두 이미지 파일의 용량과 형식을 한눈에 비교하고 어느 파일이 더 큰지 확인할 수 있습니다.",icon:ImageIcon,sections:[["무엇을 비교하나요?","두 이미지의 파일 크기, 파일 형식과 용량 차이 및 증감률을 확인할 수 있습니다."],["언제 유용한가요?","이미지 압축 전후, 형식 변환 전후 또는 서로 다른 이미지 파일의 용량을 비교할 때 활용할 수 있습니다."],["사용 방법","이미지 도구에서 용량 비교를 선택하고 비교할 두 파일을 지정하면 결과가 표시됩니다."],["파일 처리","비교 기능은 브라우저에서 파일 정보를 읽어 처리하며 이미지 파일을 외부 서버에 업로드하지 않습니다."]]},
    en:{title:"Image Size Comparison Tool | Compare Two Image Files",description:"Compare the file size and format of two images directly in your browser.",heading:"Image Size Comparison",intro:"Compare two image files side by side to see their file sizes, formats, and size difference.",icon:ImageIcon,sections:[["What is compared?","The tool shows each file size and format, plus the absolute difference and percentage change."],["When is it useful?","Use it to compare images before and after compression or format conversion, or to compare alternative files."],["How to use it","Choose Image Tools and Size Compare, then select the two image files."],["File processing","The comparison reads file information in your browser and does not upload image files to an external server."]]}
  },
  "image-dpi-calculator": {
    ko:{title:"DPI 계산기 무료 | 이미지 인쇄 크기 계산",description:"이미지 픽셀 크기와 DPI를 기준으로 예상 인쇄 크기를 계산하는 무료 도구입니다.",heading:"이미지 DPI 계산기",intro:"이미지의 가로·세로 픽셀과 DPI를 입력하면 예상 인쇄 크기를 인치와 센티미터로 확인할 수 있습니다.",icon:Ruler,sections:[["DPI란?","DPI는 인쇄에서 이미지의 픽셀 정보가 일정한 물리적 크기에 얼마나 배치되는지를 나타내는 값으로 사용됩니다."],["사용 방법","가로·세로 픽셀과 목표 DPI를 입력하면 예상 인쇄 크기가 계산됩니다."],["인쇄 전 확인","실제 출력 크기는 프린터, 용지, 여백과 출력 설정에 따라 달라질 수 있으므로 최종 인쇄 설정을 함께 확인하세요."],["계산 목적","이 도구의 결과는 인쇄 크기를 가늠하기 위한 참고값입니다. 중요한 출력물은 실제 출력 조건을 확인하세요."]]},
    en:{title:"DPI Calculator | Estimate Image Print Size",description:"Estimate image print size from pixel dimensions and DPI with a free browser-based calculator.",heading:"Image DPI Calculator",intro:"Enter image width, height, and DPI to estimate the physical print size in inches and centimeters.",icon:Ruler,sections:[["What is DPI?","DPI is commonly used in printing to describe how image information is placed across a physical output size."],["How to use it","Enter the pixel width, pixel height, and target DPI to calculate an estimated print size."],["Before printing","Actual output size can vary with the printer, paper, margins, and print settings, so check the final settings."],["Use as an estimate","The result is a reference for estimating print dimensions. Verify important print jobs against their actual output conditions."]]}
  },
  "qr-code": {
    ko:{title:"QR코드 생성 무료 도구 | URL 텍스트 Wi-Fi",description:"URL과 텍스트 등 필요한 정보를 간편하게 QR코드로 만드는 무료 온라인 도구입니다.",heading:"QR코드 생성",intro:"웹사이트 주소나 텍스트를 빠르게 공유할 때 사용할 수 있는 무료 QR코드 생성 도구입니다.",icon:QrCode,sections:[["사용할 수 있는 정보","웹사이트 주소, 간단한 텍스트, Wi-Fi 접속 정보 등 QR코드로 공유하기 적합한 정보를 입력할 수 있습니다."],["사용 방법","QR코드 메뉴에서 정보를 입력하고 생성된 QR코드를 확인한 뒤 필요한 방식으로 저장하세요."],["스캔 테스트","중요한 QR코드는 배포 전에 스마트폰으로 직접 스캔하여 정보가 정확한지 확인하세요."],["개인정보 주의","QR코드에 민감한 개인정보나 공개하면 안 되는 정보를 넣지 않는 것을 권장합니다."]]},
    en:{title:"Free QR Code Generator | URL Text Wi-Fi",description:"Create QR codes for URLs, text, and Wi-Fi information with a free online QR code generator.",heading:"QR Code Generator",intro:"Create a QR code when you need to share a website address or text quickly.",icon:QrCode,sections:[["Supported information","You can enter website URLs, short text, and suitable Wi-Fi connection information."],["How to use it","Open QR Code, enter the information, generate the code, and save it as needed."],["Scan test","For important QR codes, scan the generated code with a smartphone before publishing or printing it."],["Privacy note","Avoid putting sensitive personal information or information that should not be public into a QR code."]]}
  },
  "calculator": {
    ko:{title:"복합 계산기 무료 | 퍼센트 할인 부가세 증감률 마진",description:"퍼센트, 할인, 부가세, 증감률, 마진 등 자주 사용하는 계산을 한곳에서 확인하는 무료 계산기입니다.",heading:"복합 계산기",intro:"퍼센트와 할인, 부가세, 증감률, 마진 등 자주 필요한 계산을 브라우저에서 확인할 수 있습니다.",icon:Calculator,sections:[["퍼센트와 증감률","전체에서 일정 비율을 계산하거나 기존 값과 새로운 값의 증가·감소 비율을 확인할 수 있습니다."],["할인과 부가세","상품 가격을 기준으로 할인 금액과 할인 후 가격, 부가세 포함·제외 금액을 계산할 수 있습니다."],["마진 계산","판매가격과 원가를 기준으로 금액과 비율을 확인할 수 있습니다. 실제 세무·회계 업무에서는 적용 기준을 별도로 확인하세요."],["결과 확인","중요한 업무나 의사결정에 사용하기 전 입력값과 적용 기준을 직접 확인하세요."]]},
    en:{title:"Free Calculator | Percent Discount VAT Margin",description:"Calculate percentages, discounts, VAT, changes, and margins with a free browser-based calculator.",heading:"Calculator",intro:"Check common everyday calculations such as percentages, discounts, VAT, percentage changes, and margins in your browser.",icon:Calculator,sections:[["Percent and change","Calculate a percentage of a total or check the increase or decrease between two values."],["Discount and VAT","Calculate discount amounts, discounted prices, and VAT-inclusive or VAT-exclusive amounts."],["Margin","Check margin amounts and percentages from selling price and cost. Confirm the applicable accounting or tax rules for real business use."],["Check important results","Verify inputs and applicable rules before using results for important work or decisions."]]}
  },
  "loan-calculator": {
    ko:{title:"대출 이자 계산기 무료 | 원리금균등 상환 계산",description:"대출 원금, 금리, 기간을 입력해 예상 월 상환액과 총 이자 등을 확인하는 무료 계산기입니다.",heading:"대출 이자 계산기",intro:"대출 원금과 연이율, 상환 기간을 입력해 원리금균등 방식의 예상 상환 정보를 확인할 수 있습니다.",icon:Calculator,sections:[["계산 항목","대출 원금, 연이율, 상환 기간을 기준으로 예상 월 상환액과 총 상환액, 총 이자를 확인할 수 있습니다."],["사용 방법","복합 계산기에서 대출 이자를 선택하고 금액·금리·기간을 입력하세요."],["계산의 한계","실제 금융상품은 상환 방식, 금리 조건, 수수료, 우대금리 등에 따라 결과가 달라질 수 있습니다."],["중요한 금융 결정","이 계산기는 참고용입니다. 실제 대출 계약이나 금융 의사결정 전 금융기관의 공식 조건을 확인하세요."]]},
    en:{title:"Loan Interest Calculator | Estimate Monthly Payments",description:"Estimate monthly payments and total interest from loan amount, rate, and term.",heading:"Loan Calculator",intro:"Enter the principal, annual interest rate, and term to estimate payments using an equal-payment amortization method.",icon:Calculator,sections:[["What is calculated","The tool estimates monthly payment, total payment, and total interest from the entered principal, rate, and term."],["How to use it","Open Calculator, choose Loan Interest, and enter the amount, rate, and term."],["Important limitations","Actual financial products can differ because of repayment methods, fees, rate conditions, and discounts."],["Financial decisions","This calculator is for reference. Check official terms with the relevant financial institution before making a real loan decision."]]}
  },
  "installment-calculator": {
    ko:{title:"할부 계산기 무료 | 월 할부금과 총 이자 계산",description:"할부 원금, 금리, 개월 수를 입력해 예상 월 납입액과 총 이자를 계산하는 무료 도구입니다.",heading:"할부 계산기",intro:"할부 금액과 금리, 할부 기간을 입력해 예상 월 납입액과 총 상환액을 확인할 수 있습니다.",icon:Calculator,sections:[["무엇을 계산하나요?","입력한 할부 원금과 연이율, 개월 수를 기준으로 예상 월 납입액과 총 상환액, 총 이자를 계산합니다."],["사용 방법","복합 계산기에서 할부를 선택하고 원금·금리·기간을 입력하세요."],["실제 할부 조건","카드사나 금융기관의 실제 할부는 수수료, 무이자 조건, 상환 방식 등에 따라 달라질 수 있습니다."],["참고용 계산","실제 결제나 금융상품 선택 전에는 해당 금융기관이 제공하는 공식 금액과 조건을 확인하세요."]]},
    en:{title:"Installment Calculator | Monthly Payment Estimate",description:"Estimate monthly installment payments and total interest from principal, rate, and term.",heading:"Installment Calculator",intro:"Enter an installment amount, interest rate, and term to estimate monthly payments and total repayment.",icon:Calculator,sections:[["What is calculated","The tool estimates monthly payment, total repayment, and total interest from the entered principal, annual rate, and number of months."],["How to use it","Open Calculator, choose Installment, and enter the principal, rate, and term."],["Actual installment terms","Real card or financial-product terms can differ because of fees, promotional rates, and repayment methods."],["Reference only","Check the official amount and terms from the relevant provider before making an actual payment or financial decision."]]}
  },
  "unit-converter": {
    ko:{title:"단위 변환기 무료 | 길이 무게 넓이 부피 온도 데이터",description:"길이, 무게, 넓이, 부피, 온도, 데이터 용량을 간편하게 변환하는 무료 단위 변환기입니다.",heading:"단위 변환기",intro:"일상에서 자주 사용하는 길이·무게·넓이·부피·온도·데이터 용량 단위를 브라우저에서 변환할 수 있습니다.",icon:Ruler,sections:[["지원 단위","길이, 무게, 넓이, 부피, 온도, 데이터 용량 카테고리에서 다양한 단위를 선택할 수 있습니다."],["사용 방법","복합 계산기에서 단위 변환을 선택하고 카테고리와 입력 단위를 지정한 뒤 값을 입력하세요."],["변환 기준","일부 단위는 국제적으로 사용되는 환산 기준을 따르며, 온도는 섭씨·화씨·켈빈 간 변환을 지원합니다."],["결과 확인","계약, 거래, 제조 등 정확성이 중요한 업무에서는 해당 분야의 공식 단위 기준과 반올림 규칙을 함께 확인하세요."]]},
    en:{title:"Unit Converter | Length Weight Area Volume Temperature Data",description:"Convert length, weight, area, volume, temperature, and data units with a free browser-based unit converter.",heading:"Unit Converter",intro:"Convert commonly used length, weight, area, volume, temperature, and data units directly in your browser.",icon:Ruler,sections:[["Supported units","Choose from categories for length, weight, area, volume, temperature, and data size."],["How to use it","Open Calculator, choose Unit Converter, select a category and units, then enter a value."],["Conversion basis","Common conversion standards are used for supported units, with Celsius, Fahrenheit, and Kelvin temperature conversion."],["Check important results","For contracts, manufacturing, or other precision-sensitive work, confirm the applicable official unit standard and rounding rules."]]}
  },
  "time-calculator": {
    ko:{title:"시간 계산기 무료 | 시간 차이와 경과 시간 계산",description:"시작 시간과 종료 시간을 입력해 경과 시간과 휴식 시간을 계산하는 무료 시간 계산기입니다.",heading:"시간 계산기",intro:"두 시간 사이의 경과 시간을 계산하고 필요한 경우 휴식 시간을 제외한 실제 시간을 확인할 수 있습니다.",icon:Clock,sections:[["무엇을 계산하나요?","시작 시간과 종료 시간을 기준으로 전체 경과 시간을 계산하고 입력한 휴식 시간을 제외한 시간을 확인할 수 있습니다."],["사용 방법","복합 계산기에서 시간을 선택하고 시작·종료 시간을 입력하세요. 필요하면 휴식 시간을 입력할 수 있습니다."],["자정 넘김","종료 시간이 시작 시간보다 이른 경우 다음 날까지 이어지는 시간으로 계산될 수 있습니다."],["업무 기록 주의","근무시간이나 급여 계산에 사용할 때는 회사 규정과 법정 기준 등 실제 적용 기준을 별도로 확인하세요."]]},
    en:{title:"Time Calculator | Calculate Elapsed Time",description:"Calculate elapsed time between start and end times, with an optional break.",heading:"Time Calculator",intro:"Calculate elapsed time between two times and optionally subtract a break to estimate net time.",icon:Clock,sections:[["What is calculated","The tool calculates elapsed time between a start and end time and can subtract a break."],["How to use it","Open Calculator, choose Time, and enter the start and end times. Add a break when needed."],["Across midnight","If the end time is earlier than the start time, the calculation can treat it as continuing into the next day."],["Work-time note","For payroll or working-hour records, confirm the applicable company rules and legal standards separately."]]}
  },
  "text-tools": {
    ko:{title:"글자 수 세기 무료 | 공백 제외 바이트 계산",description:"글자 수, 공백 제외 글자 수, 줄 수, 단어 수와 UTF-8 바이트 수를 확인하는 무료 텍스트 도구입니다.",heading:"텍스트 도구",intro:"블로그, 자기소개서, 문서, 게시글처럼 글자 수 제한이 있는 글의 문자와 바이트 정보를 확인할 수 있습니다.",icon:Type,sections:[["확인 정보","전체 글자 수, 공백 제외 글자 수, 줄 수, 단어 수와 UTF-8 기준 바이트 수를 확인할 수 있습니다."],["사용 방법","텍스트 도구를 선택하고 글을 입력하거나 붙여넣으면 결과가 바로 표시됩니다."],["바이트와 글자 수","한글과 영문, 숫자, 특수문자는 인코딩에 따라 필요한 바이트 수가 달라질 수 있습니다."],["개인정보 주의","민감한 개인정보가 포함된 글은 온라인 도구에 입력하기 전에 필요한 보호조치를 확인하세요."]]},
    en:{title:"Character Counter | Characters Words Lines and Bytes",description:"Count characters, non-space characters, lines, words, and UTF-8 bytes with a free text tool.",heading:"Text Tools",intro:"Check character and byte information for blog posts, applications, documents, and other text with length limits.",icon:Type,sections:[["Available counts","Check total characters, characters excluding spaces, lines, words, and UTF-8 byte size."],["How to use it","Open Text Tools and paste or type your text. Results update as you work."],["Bytes versus characters","Byte size can differ from character count because different characters can use different numbers of bytes in UTF-8."],["Privacy note","Avoid entering sensitive personal information into an online tool unless appropriate safeguards are in place."]]}
  },
  "text-cleaner": {
    ko:{title:"텍스트 정리 도구 무료 | 공백 줄 중복 문장 정리",description:"줄 앞뒤 공백, 연속 공백, 빈 줄, 중복 줄을 정리하는 무료 온라인 텍스트 도구입니다.",heading:"텍스트 정리",intro:"복사한 텍스트의 불필요한 공백과 빈 줄, 중복 줄을 빠르게 정리할 수 있습니다.",icon:Type,sections:[["정리할 수 있는 항목","줄 앞뒤 공백 제거, 연속 공백·탭 정리, 빈 줄 제거, 중복 줄 제거 기능을 제공합니다."],["사용 방법","텍스트를 붙여넣고 필요한 정리 옵션을 선택하면 정리된 결과를 확인하고 복사할 수 있습니다."],["언제 유용한가요?","웹페이지나 문서에서 복사한 목록을 정리하거나 여러 줄의 텍스트를 깔끔하게 다듬을 때 활용할 수 있습니다."],["원본 보관","중복 줄 제거 등 일부 작업은 원래의 반복을 의도적으로 삭제할 수 있으므로 중요한 텍스트는 원본을 별도로 보관하세요."]]},
    en:{title:"Text Cleaner | Remove Spaces Blank and Duplicate Lines",description:"Clean leading spaces, repeated spaces, blank lines, and duplicate lines with a free browser text tool.",heading:"Text Cleaner",intro:"Clean unnecessary spaces, blank lines, and duplicate lines from pasted text.",icon:Type,sections:[["Cleaning options","Remove leading and trailing spaces, collapse repeated spaces and tabs, remove blank lines, and remove duplicate lines."],["How to use it","Paste text, choose the cleaning options you need, then review and copy the cleaned result."],["When useful","Useful for cleaning lists copied from websites or documents and tidying multi-line text."],["Keep the original","Some operations intentionally remove repeated content, so keep the original text separately when it matters."]]}
  },
  "pdf-tools": {
    ko:{title:"PDF 도구 무료 | 이미지 PDF 변환·합치기·분할",description:"이미지를 PDF로 변환하고 PDF를 합치거나 페이지를 관리·분할하며 기본 정보를 확인할 수 있는 무료 브라우저 기반 도구입니다.",heading:"PDF 도구",intro:"JPG·PNG 이미지를 PDF로 만들고, 여러 PDF를 하나로 합치거나 페이지를 삭제·순서 변경·분할하고 PDF의 기본 정보를 확인할 수 있습니다.",icon:FileText,sections:[["이미지를 PDF로 변환","여러 JPG 또는 PNG 이미지를 한 번에 추가해 하나의 PDF 파일로 만들 수 있습니다."],["PDF 합치기","여러 개의 PDF 파일을 선택해 선택한 순서대로 하나의 PDF로 병합할 수 있습니다."],["페이지 관리와 PDF 분할","PDF의 페이지를 선택해 삭제하거나 페이지 순서를 변경할 수 있으며, 원하는 시작 페이지와 끝 페이지를 지정해 새로운 PDF로 분할할 수 있습니다."],["PDF 정보 확인","PDF의 전체 페이지 수와 파일 크기를 확인할 수 있습니다."],["파일 처리와 주의사항","지원되는 PDF·이미지 작업은 브라우저에서 처리하도록 설계되어 있습니다. 중요한 문서는 작업 후 페이지 순서와 내용을 확인하고 원본 파일을 별도로 보관하세요."]]},
    en:{title:"Free PDF Tools | Images to PDF, Merge and Split",description:"Convert images to PDF, merge and manage PDF pages, split PDFs, and check basic PDF information in your browser.",heading:"PDF Tools",intro:"Create PDFs from JPG or PNG images, merge multiple PDFs, delete or reorder pages, split selected page ranges, and check basic PDF information.",icon:FileText,sections:[["Convert images to PDF","Add multiple JPG or PNG images and create a single PDF file from them."],["Merge PDFs","Select multiple PDF files and combine them into one PDF in the selected order."],["Manage pages and split PDFs","Delete selected pages or change page order, and create a new PDF from a chosen start and end page range."],["Check PDF information","Check the total page count and file size of a PDF."],["File processing and notes","Supported PDF and image operations are designed to run in the browser. For important documents, verify page order and content after processing and keep the original file separately."]]}
  },
  about: {
    ko:{title:"사이트 소개 | ToolMingle",description:"ToolMingle의 서비스 목적과 제공 기능을 안내합니다.",heading:"사이트 소개",intro:"ToolMingle은 이미지, QR코드, 계산, 텍스트, PDF 작업을 브라우저에서 간편하게 이용할 수 있는 무료 웹 도구입니다.",icon:ShieldCheck,sections:[["제공 기능","이미지 변환·압축·크기 조정·편집·일괄 변환·용량 비교·DPI 계산, QR코드, 계산, 텍스트, PDF 도구를 제공합니다."],["브라우저 중심 처리","지원되는 파일 작업은 브라우저에서 직접 처리하는 것을 우선합니다."],["서비스 운영","기능과 화면은 안정적인 운영과 개선을 위해 변경될 수 있습니다."]]},
    en:{title:"About ToolMingle",description:"Learn about ToolMingle and its browser-based tools.",heading:"About ToolMingle",intro:"ToolMingle provides free browser-based tools for images, QR codes, calculations, text, and PDF tasks.",icon:ShieldCheck,sections:[["Tools","Image conversion, compression, resizing, editing, batch conversion, size comparison, DPI calculation, QR, calculator, text, and PDF tools."],["Browser-focused processing","Supported file operations are designed to prioritize processing directly in the browser."],["Service operation","Features and screens may change as the service is maintained and improved."]]}
  },
  privacy: {
    ko:{title:"개인정보처리방침 | ToolMingle",description:"ToolMingle의 개인정보 및 쿠키, 방문 통계, 광고 관련 처리 방침입니다.",heading:"개인정보처리방침",intro:"ToolMingle은 서비스 운영에 필요한 범위에서 정보를 최소한으로 처리하고 브라우저 처리를 우선합니다.",icon:ShieldCheck,sections:[["1. 파일 처리","이미지 변환·압축·크기 조정 등 브라우저 기반 파일 작업은 사용자의 브라우저에서 처리하도록 설계되어 있으며 변환을 위해 이미지 파일을 사이트 서버에 저장하지 않습니다."],["2. 방문 통계 및 기술 정보","현재 사이트는 Cloudflare Web Analytics와 누적 방문자 수 표시를 위한 CountAPI를 사용합니다. 각 외부 서비스의 정책이 적용될 수 있습니다."],["3. 광고 서비스","현재 ToolMingle에는 Google AdSense 관련 광고 코드가 포함되어 있습니다. 광고가 제공되는 경우 Google 및 제3자 광고 사업자가 쿠키, 웹 비콘, IP 주소 또는 기타 식별자를 사용할 수 있습니다."],["4. Google의 데이터 이용 및 쿠키","Google 및 파트너는 광고 제공과 관련하여 사이트 방문 정보와 쿠키 등의 기술을 사용할 수 있습니다."],["5. 문의 정보","문의하기를 통해 제공한 연락처는 문의 답변과 서비스 개선에 필요한 범위에서 이용할 수 있습니다."],["6. 외부 서비스","Cloudflare Web Analytics, CountAPI, Google AdSense 관련 서비스 등 외부 서비스의 정책이 적용될 수 있습니다."],["7. EU·영국·스위스 이용자","해당 지역 이용자의 광고 관련 처리는 Google의 동의 정책과 적용 법령에 따라 처리될 수 있습니다."],["8. 변경","서비스 기능이나 외부 서비스가 변경되는 경우 이 방침도 실제 운영 상태에 맞게 업데이트합니다."]]},
    en:{title:"Privacy Policy | ToolMingle",description:"ToolMingle privacy, cookies, analytics, and advertising information.",heading:"Privacy Policy",intro:"ToolMingle minimizes information processing where practical and prioritizes browser-based processing.",icon:ShieldCheck,sections:[["1. File processing","Browser-based image operations are designed to process files in the browser and do not store image files on the site server for conversion."],["2. Analytics and technical information","The site uses Cloudflare Web Analytics and CountAPI for the visitor counter. Their respective policies may apply."],["3. Advertising","ToolMingle includes Google AdSense-related advertising code. When ads are served, Google and third-party providers may use cookies, web beacons, IP addresses, or other identifiers."],["4. Google data and cookies","Google and its partners may use site-visit information and cookies in connection with advertising."],["5. Contact information","Contact details provided through inquiries may be used to respond and improve the service as needed."],["6. External services","Policies of Cloudflare Web Analytics, CountAPI, Google AdSense-related services, and other external services may apply."],["7. EEA, UK, and Switzerland","Advertising-related processing for users in these regions may follow Google's consent policies and applicable laws."],["8. Changes","This policy may be updated when service features or external services change."]]}
  },
  terms: {
    ko:{title:"이용약관 | ToolMingle",description:"ToolMingle의 이용약관과 서비스 이용 시 유의사항을 안내합니다.",heading:"이용약관",intro:"ToolMingle은 일상적인 파일·텍스트·계산 작업을 돕는 무료 웹 도구를 제공합니다.",icon:FileText,sections:[["서비스 이용","사용자는 관련 법령과 일반적인 웹 이용 규칙을 준수하여 서비스를 이용해야 합니다."],["결과 확인","계산·변환 결과는 편의를 위한 것이므로 중요한 업무에 사용하기 전 결과와 적용 기준을 확인해야 합니다."],["파일과 개인정보","사용자는 자신이 입력하거나 업로드하는 정보에 대한 적법한 권한을 보유해야 합니다."],["서비스 변경","서비스 기능과 화면은 안정적인 운영과 개선을 위해 변경되거나 일시 중단될 수 있습니다."],["면책","서비스는 가능한 범위에서 정상적인 기능을 제공하도록 운영하지만 모든 환경에서 오류가 없음을 보장하지 않습니다."]]},
    en:{title:"Terms of Use | ToolMingle",description:"ToolMingle terms and important notes for using the service.",heading:"Terms of Use",intro:"ToolMingle provides free web tools for everyday file, text, and calculation tasks.",icon:FileText,sections:[["Use of the service","Use the service in compliance with applicable laws and ordinary web-use rules."],["Check results","Calculations and conversions are provided for convenience. Verify results and applicable rules before important use."],["Files and information","You must have appropriate rights to files and information you enter or upload."],["Service changes","Features and screens may change or be temporarily unavailable during maintenance or improvement."],["Disclaimer","The service is operated to provide functionality where practical, but error-free operation in every environment is not guaranteed."]]}
  },
  contact: {
    ko:{title:"문의하기 | ToolMingle",description:"ToolMingle의 오류 신고 및 개선 의견 문의 방법을 안내합니다.",heading:"문의하기",intro:"서비스 이용 중 오류나 개선 의견이 있다면 아래 이메일로 알려주세요.",icon:Mail,sections:[["문의 이메일","lucidpoverty@gmail.com"],["문의 방법","이메일 주소를 클릭하면 문의 메일을 작성할 수 있습니다."],["문의 내용","사용한 기능, 발생 상황, 기기와 브라우저 정보를 함께 적어주시면 확인에 도움이 됩니다."],["개인정보 주의","문의에 불필요한 주민등록번호, 비밀번호, 금융정보 등 민감한 개인정보를 보내지 마세요."]]},
    en:{title:"Contact | ToolMingle",description:"Contact ToolMingle about errors, questions, and suggestions.",heading:"Contact",intro:"If you find an error or have a suggestion, please contact us by email.",icon:Mail,sections:[["Email","lucidpoverty@gmail.com"],["How to contact","Click the email address to start a message."],["Useful details","Include the tool used, what happened, and your device and browser when reporting an issue."],["Privacy note","Do not send unnecessary sensitive information such as passwords or financial details."]]}
  }
};

const toolKeys: PageKey[] = ["image-converter","image-compressor","image-resizer","image-size-compare","image-dpi-calculator","qr-code","calculator","loan-calculator","installment-calculator","unit-converter","time-calculator","text-tools","text-cleaner","pdf-tools"];

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ko";
  const saved = localStorage.getItem("image-converter-lang");
  if (saved === "en" || saved === "ko") return saved;
  return navigator.language.toLowerCase().startsWith("en") ? "en" : "ko";
}

export default function SEOInfoPage({ page }: { page: PageKey }) {
  const [language,setLanguage]=useState<Lang>(getInitialLang);
  const data=pages[page][language];
  const Icon=data.icon;

  useEffect(()=>{
    document.documentElement.lang=language;
    document.title=data.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content",data.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href",window.location.origin+window.location.pathname);
  },[language,data]);

  const toggle=()=>{const next=language==="ko"?"en":"ko";setLanguage(next);localStorage.setItem("image-converter-lang",next);};
  const related=toolKeys.filter(key=>key!==page).slice(0,6);
  const infoPages: PageKey[]=["about","privacy","terms","contact"];
  const label=(ko:string,en:string)=>language==="ko"?ko:en;

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={toggle} className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700" aria-label={label("영어로 보기","한국어로 보기")}>
            {language==="ko" ? "EN" : "한"}
          </button>
        </div>
        <header className="mb-5 rounded-3xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 px-5 py-7 text-white shadow-lg sm:px-10 sm:py-9">
          <div className="mb-4 inline-flex rounded-xl bg-white/15 p-3"><Icon className="h-7 w-7"/></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{data.heading}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">{data.intro}</p>
        </header>

        <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          {data.sections.map(([title,body])=>(
            <section key={title} className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
              <h2 className="text-base font-extrabold text-slate-800 sm:text-lg">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 break-words">
                {title===(language==="ko"?"문의 이메일":"Email") ? <a className="font-semibold text-blue-600 hover:underline" href="mailto:lucidpoverty@gmail.com">lucidpoverty@gmail.com</a> : body}
                {title===(language==="ko"?"4. Google의 데이터 이용 및 쿠키":"4. Google data and cookies") && <> <a className="font-semibold text-blue-600 hover:underline" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">Google data use</a> · <a className="font-semibold text-blue-600 hover:underline" href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ads Settings</a></>}
              </p>
            </section>
          ))}

          {!infoPages.includes(page) && (
            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
              <h2 className="font-bold text-slate-800">{label("바로 사용하기","Use the tool")}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{label("이 도구를 직접 사용하려면 메인 페이지에서 해당 기능을 선택하세요.","Open the home page and select this tool to use it directly.")}</p>
              <a href="/" className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                {label("도구 사용하기","Use tool")} <ArrowRight className="h-4 w-4"/>
              </a>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-5">
            <a href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4"/> {label("메인 도구로 돌아가기","Back to tools")}
            </a>
          </div>
        </article>

        {related.length>0 && (
          <nav className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-label={label("관련 도구","Related tools")}>
            <h2 className="font-bold text-slate-800">{label("관련 도구","Related tools")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {related.map(key=><a key={key} href={`/${key}`} className="min-h-10 rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700">{pages[key][language].heading}</a>)}
            </div>
          </nav>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <a href="/about" className="hover:text-slate-600">{label("사이트 소개","About")}</a>
            <a href="/privacy" className="hover:text-slate-600">{label("개인정보처리방침","Privacy")}</a>
            <a href="/terms" className="hover:text-slate-600">{label("이용약관","Terms")}</a>
            <a href="/contact" className="hover:text-slate-600">{label("문의하기","Contact")}</a>
          </nav>
        </footer>
      </div>
    </main>
  );
}

export function getSEOPage(pathname: string): PageKey | null {
  const path=pathname.replace(/\/$/,"")||"/";
  if(path==="/") return null;
  const key=path.slice(1) as PageKey;
  return pages[key] ? key : null;
}
