import { useRef, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useI18n } from "@/i18n/I18nContext";

type QrType = "url" | "text" | "email" | "phone" | "wifi";

export default function QRGenerator() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [type, setType] = useState<QrType>("url");
  const [value, setValue] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const types: {id:QrType; label:string}[] = [
    {id:"url",label:ko?"URL":"URL"},{id:"text",label:ko?"텍스트":"Text"},
    {id:"email",label:ko?"이메일":"Email"},{id:"phone",label:ko?"전화":"Phone"},{id:"wifi",label:"Wi-Fi"}
  ];

  const qrValue = type === "email" ? (value.trim() ? `mailto:${value.trim()}` : "") :
    type === "phone" ? (value.trim() ? `tel:${value.trim()}` : "") :
    type === "wifi" ? (ssid.trim() ? `WIFI:T:${security};S:${ssid};P:${password};;` : "") : value.trim();

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
    <div className="mb-4 flex items-center gap-2"><QrCode className="h-5 w-5 text-blue-600"/><div><h2 className="text-lg font-bold text-gray-800">{ko?"QR 코드 생성기":"QR Code Generator"}</h2><p className="text-xs text-gray-500">{ko?"URL, 텍스트, 이메일, 전화번호, Wi-Fi 정보를 QR로 만들 수 있습니다.":"Create QR codes for URLs, text, email, phone, and Wi-Fi."}</p></div></div>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {types.map(item=><button key={item.id} type="button" onClick={()=>{setType(item.id);setValue("");}} className={`rounded-xl px-2 py-2.5 text-xs font-bold sm:text-sm ${type===item.id?"bg-blue-600 text-white":"bg-white text-gray-600 hover:bg-blue-50"}`}>{item.label}</button>)}
    </div>
    {type==="wifi" ? <div className="space-y-3">
      <input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder={ko?"Wi-Fi 이름(SSID)":"Wi-Fi name (SSID)"} className="w-full rounded-xl border px-3 py-2.5 text-sm"/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder={ko?"Wi-Fi 비밀번호":"Wi-Fi password"} className="w-full rounded-xl border px-3 py-2.5 text-sm"/>
      <select value={security} onChange={e=>setSecurity(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="">Open</option></select>
    </div> : <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{type==="url"?(ko?"웹사이트 주소":"Website URL"):type==="email"?(ko?"이메일 주소":"Email address"):type==="phone"?(ko?"전화번호":"Phone number"):(ko?"텍스트":"Text")}</span><textarea value={value} onChange={e=>setValue(e.target.value)} placeholder={type==="url"?(ko?"https://example.com":"https://example.com"):(ko?"QR 코드로 만들 내용을 입력하세요.":"Enter the content for your QR code.")} rows={4} className="w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/></label>}
    {qrValue && <div className="mt-5 flex flex-col items-center rounded-xl bg-blue-50/70 p-5"><div ref={qrContainerRef} className="rounded-xl bg-white p-3 shadow-sm"><QRCodeCanvas value={qrValue} size={Math.min(240, Math.max(180, typeof window==="undefined"?240:window.innerWidth-120))} level="M" includeMargin/></div><button type="button" onClick={handleDownload} className="mt-4 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-bold text-white"><Download className="h-5 w-5"/>{ko?"QR 코드 다운로드":"Download QR Code"}</button></div>}
  </section>;
}