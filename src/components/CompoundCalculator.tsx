import { useMemo, useState } from "react";
import { Calculator, Percent, Receipt, CalendarDays, Ruler } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

type CalcMode = "basic" | "percent" | "discount" | "vat" | "date" | "unit";

export default function CompoundCalculator() {
  const { language } = useI18n();
  const ko = language === "ko";
  const [mode, setMode] = useState<CalcMode>("basic");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [op, setOp] = useState("+");
  const [percent, setPercent] = useState("");
  const [price, setPrice] = useState("");
  const [vatRate, setVatRate] = useState("10");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [unit, setUnit] = useState("m");

  const basicResult = useMemo(() => {
    const x = Number(a), y = Number(b);
    if (!a || !b || !Number.isFinite(x) || !Number.isFinite(y)) return "";
    if (op === "/" && y === 0) return ko ? "0으로 나눌 수 없습니다." : "Cannot divide by zero.";
    const value = op === "+" ? x + y : op === "-" ? x - y : op === "×" ? x * y : x / y;
    return Number.isInteger(value) ? String(value) : value.toLocaleString(undefined, { maximumFractionDigits: 10 });
  }, [a, b, op, ko]);

  const percentResult = useMemo(() => {
    const x = Number(a), p = Number(percent);
    if (!a || !percent || !Number.isFinite(x) || !Number.isFinite(p)) return "";
    return (x * p / 100).toLocaleString(undefined, { maximumFractionDigits: 10 });
  }, [a, percent]);

  const discountResult = useMemo(() => {
    const x = Number(price), p = Number(percent);
    if (!price || !percent || !Number.isFinite(x) || !Number.isFinite(p)) return "";
    const saved = x * p / 100;
    return (x - saved).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, [price, percent]);

  const vatResult = useMemo(() => {
    const x = Number(price), r = Number(vatRate);
    if (!price || !Number.isFinite(x) || !Number.isFinite(r)) return null;
    const vat = x * r / 100;
    return { vat, total: x + vat };
  }, [price, vatRate]);

  const dateResult = useMemo(() => {
    if (!start || !end) return "";
    const s = new Date(start), e = new Date(end);
    const days = Math.round((e.getTime() - s.getTime()) / 86400000);
    if (!Number.isFinite(days)) return "";
    return days >= 0 ? String(days) : "";
  }, [start, end]);

  const unitResult = useMemo<string[]>(() => {
    const x = Number(unitValue);
    if (!unitValue || !Number.isFinite(x)) return [];
    const factors: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };
    const meters = x * factors[unit];
    return [
      `mm: ${meters / 0.001}`,
      `cm: ${meters / 0.01}`,
      `m: ${meters}`,
      `km: ${meters / 1000}`,
    ];
  }, [unitValue, unit]);

  const reset = () => {
    setA(""); setB(""); setPercent(""); setPrice(""); setStart(""); setEnd(""); setUnitValue("");
  };

  const tools = [
    { id: "basic" as const, icon: Calculator, label: ko ? "일반 계산" : "Basic" },
    { id: "percent" as const, icon: Percent, label: ko ? "퍼센트" : "Percent" },
    { id: "discount" as const, icon: Receipt, label: ko ? "할인 계산" : "Discount" },
    { id: "vat" as const, icon: Receipt, label: ko ? "부가세" : "VAT" },
    { id: "date" as const, icon: CalendarDays, label: ko ? "날짜·기간" : "Date" },
    { id: "unit" as const, icon: Ruler, label: ko ? "단위 변환" : "Units" },
  ];

  const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const card = "rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5";

  return (
    <section className={card}>
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">{ko ? "복합 계산기" : "Compound Calculator"}</h2>
          <p className="text-xs text-gray-500">{ko ? "자주 사용하는 계산을 한곳에서 빠르게 처리하세요." : "Common calculations in one place."}</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tools.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => { setMode(id); reset(); }}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm ${mode === id ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-blue-50"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {mode === "basic" && (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input className={field} inputMode="decimal" value={a} onChange={e => setA(e.target.value)} placeholder={ko ? "첫 번째 숫자" : "First number"} />
            <select className={field + " w-16"} value={op} onChange={e => setOp(e.target.value)}><option>+</option><option>-</option><option>×</option><option>/</option></select>
            <input className={field} inputMode="decimal" value={b} onChange={e => setB(e.target.value)} placeholder={ko ? "두 번째 숫자" : "Second number"} />
          </div>
          <Result value={basicResult} label={ko ? "계산 결과" : "Result"} />
        </div>
      )}

      {mode === "percent" && (
        <div className="space-y-3">
          <input className={field} inputMode="decimal" value={a} onChange={e => setA(e.target.value)} placeholder={ko ? "기준 금액 또는 숫자" : "Base amount or number"} />
          <div className="grid grid-cols-[1fr_auto] items-center gap-2"><input className={field} inputMode="decimal" value={percent} onChange={e => setPercent(e.target.value)} placeholder={ko ? "퍼센트" : "Percent"} /><span className="font-bold">%</span></div>
          <Result value={percentResult} label={ko ? "계산 결과" : "Result"} />
        </div>
      )}

      {mode === "discount" && (
        <div className="space-y-3">
          <input className={field} inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder={ko ? "원래 가격" : "Original price"} />
          <div className="grid grid-cols-[1fr_auto] items-center gap-2"><input className={field} inputMode="decimal" value={percent} onChange={e => setPercent(e.target.value)} placeholder={ko ? "할인율" : "Discount rate"} /><span className="font-bold">%</span></div>
          <Result value={discountResult} label={ko ? "할인 후 가격" : "Price after discount"} suffix={ko ? "원" : ""} />
        </div>
      )}

      {mode === "vat" && (
        <div className="space-y-3">
          <input className={field} inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder={ko ? "공급가액" : "Net amount"} />
          <div className="grid grid-cols-[1fr_auto] items-center gap-2"><input className={field} inputMode="decimal" value={vatRate} onChange={e => setVatRate(e.target.value)} /><span className="font-bold">%</span></div>
          {vatResult && <div className="rounded-xl bg-blue-50 p-4 text-sm"><p>{ko ? "부가세" : "VAT"} <strong>{vatResult.vat.toLocaleString()}</strong></p><p className="mt-1">{ko ? "합계" : "Total"} <strong>{vatResult.total.toLocaleString()}</strong></p></div>}
        </div>
      )}

      {mode === "date" && (
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">{ko ? "시작일" : "Start date"}</label><input type="date" className={field} value={start} onChange={e => setStart(e.target.value)} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">{ko ? "종료일" : "End date"}</label><input type="date" className={field} value={end} onChange={e => setEnd(e.target.value)} /></div>
          <Result value={dateResult} label={ko ? "두 날짜 사이 기간" : "Days between"} suffix={dateResult ? (ko ? "일" : " days") : ""} />
        </div>
      )}

      {mode === "unit" && (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_100px] gap-2"><input className={field} inputMode="decimal" value={unitValue} onChange={e => setUnitValue(e.target.value)} placeholder={ko ? "숫자 입력" : "Enter value"} /><select className={field} value={unit} onChange={e => setUnit(e.target.value)}><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option><option value="km">km</option></select></div>
          {unitResult.length > 0 && <div className="grid grid-cols-2 gap-2 rounded-xl bg-blue-50 p-4 text-sm">{unitResult.map(x => <div key={x}>{x}</div>)}</div>}
        </div>
      )}

      <button type="button" onClick={reset} className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">{ko ? "입력 초기화" : "Reset"}</button>
    </section>
  );
}

function Result({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
  return <div className="rounded-xl bg-blue-50 p-4"><div className="text-xs font-semibold text-blue-600">{label}</div><div className="mt-1 min-h-6 text-lg font-bold text-gray-800">{value ? value + (value ? " " + suffix : "") : "—"}</div></div>;
}
