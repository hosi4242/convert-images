import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clock3, RotateCcw, Maximize2, Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const PRESETS = [1, 5, 10, 15, 25, 30, 60];

export default function TimerPage() {
  const { language, toggleLanguage } = useI18n();
  const ko = language === "ko";
  const [seconds, setSeconds] = useState(5 * 60);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = ko ? "온라인 타이머 | 무료 타이머 - ToolMingle" : "Online Timer | Free Timer - ToolMingle";
    const description = ko
      ? "설치 없이 브라우저에서 바로 사용하는 무료 온라인 타이머. 1분부터 60분까지 간편하게 설정하고 시작, 일시정지, 초기화할 수 있습니다."
      : "A free online timer that runs in your browser. Set 1 to 60 minutes and start, pause, resume, or reset without installing anything.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.origin + "/timer";
    const old = document.getElementById("toolmingle-timer-jsonld");
    old?.remove();
    const faq = ko ? [
      ["온라인 타이머는 무료인가요?", "네. ToolMingle의 온라인 타이머는 별도 설치나 회원가입 없이 무료로 사용할 수 있습니다."],
      ["타이머가 끝나면 소리가 나나요?", "네. 소리 설정이 켜져 있으면 종료 시 브라우저에서 알림음을 재생합니다."],
      ["모바일에서도 사용할 수 있나요?", "네. 휴대폰과 태블릿을 포함한 모바일 화면에 맞게 사용할 수 있습니다."]
    ] : [
      ["Is the online timer free?", "Yes. ToolMingle's online timer is free to use without installation or sign-up."],
      ["Will the timer play a sound when it ends?", "Yes. When sound is enabled, the browser plays an alert sound when the timer finishes."],
      ["Can I use it on mobile?", "Yes. The timer is designed to work on phones and tablets as well as desktop browsers."]
    ];
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {"@type":"WebPage","name":document.title,"description":description,"url":window.location.href,"inLanguage":ko ? "ko-KR" : "en-US"},
        {"@type":"WebApplication","name":"ToolMingle Online Timer","applicationCategory":"UtilitiesApplication","operatingSystem":"Web Browser","url":window.location.href,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}},
        {"@type":"FAQPage","mainEntity":faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}
      ]
    };
    const script = document.createElement("script");
    script.id = "toolmingle-timer-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById("toolmingle-timer-jsonld")?.remove(); };
  }, [language, ko]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setRunning(false);
          if (sound) playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, sound]);

  const playBeep = () => {
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const formatTime = (value: number) => {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;
    return h > 0 ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const progress = useMemo(() => seconds > 0 ? remaining / seconds : 0, [remaining, seconds]);

  const setMinutes = (minutes: number) => {
    const value = minutes * 60;
    setRunning(false);
    setSeconds(value);
    setRemaining(value);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(seconds);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <a href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />{ko ? "도구로 돌아가기" : "Back to tools"}
          </a>
          <button type="button" onClick={toggleLanguage} className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700">{ko ? "EN" : "한"}</button>
        </div>

        <header className="mb-5 rounded-3xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 px-5 py-7 text-white shadow-lg sm:px-10 sm:py-9">
          <div className="mb-4 inline-flex rounded-xl bg-white/15 p-3"><Clock3 className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{ko ? "온라인 타이머" : "Online Timer"}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">
            {ko ? "공부, 운동, 요리, 휴식 등 필요한 시간만큼 설정하고 바로 시작하세요. 설치와 회원가입이 필요하지 않습니다." : "Set the time you need for study, exercise, cooking, breaks, and more. No installation or sign-up required."}
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="rounded-2xl bg-slate-900 px-4 py-10 text-center sm:py-14">
            <div className="text-6xl font-black tabular-nums tracking-tight text-white sm:text-8xl" aria-live="polite">{formatTime(remaining)}</div>
            <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-sky-400 transition-[width] duration-300" style={{width:`${progress*100}%`}} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map(minute => <button key={minute} type="button" onClick={() => setMinutes(minute)} className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold transition ${seconds===minute*60 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}>{minute}{ko ? "분" : " min"}</button>)}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setRunning(v => !v)} disabled={remaining===0} className="min-h-12 rounded-xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{running ? (ko ? "일시정지" : "Pause") : remaining===seconds ? (ko ? "시작" : "Start") : (ko ? "계속" : "Resume")}</button>
            <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-4 w-4" />{ko ? "초기화" : "Reset"}</button>
            <button type="button" onClick={() => setSound(v => !v)} className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">{sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}{sound ? (ko ? "소리 켜짐" : "Sound on") : (ko ? "소리 꺼짐" : "Sound off")}</button>
            <button type="button" onClick={toggleFullscreen} className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"><Maximize2 className="h-4 w-4" />{ko ? "전체 화면" : "Fullscreen"}</button>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-extrabold text-slate-800">{ko ? "온라인 타이머 사용법" : "How to use the online timer"}</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {(ko ? ["원하는 시간을 선택합니다.","시작 버튼을 눌러 카운트다운을 시작합니다.","필요하면 일시정지하거나 초기화할 수 있습니다.","공부나 운동처럼 집중이 필요한 상황에서는 전체 화면으로 사용할 수 있습니다."] : ["Choose a preset time.","Press Start to begin the countdown.","Pause, resume, or reset whenever needed.","Use fullscreen mode when you want a distraction-free timer."]).map((item,i)=><li key={i} className="flex gap-2"><span className="font-bold text-blue-600">{i+1}.</span>{item}</li>)}
          </ol>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-4 font-extrabold text-slate-800">{ko ? "자주 묻는 질문" : "Frequently asked questions"}</h2>
          {(ko ? [["온라인 타이머는 무료인가요?","네. 별도 설치나 회원가입 없이 무료로 사용할 수 있습니다."],["타이머가 끝나면 소리가 나나요?","소리 설정이 켜져 있으면 종료 시 알림음이 재생됩니다."],["모바일에서도 사용할 수 있나요?","네. 휴대폰과 태블릿에서도 사용할 수 있습니다."]] : [["Is the online timer free?","Yes. It is free to use without installation or sign-up."],["Will the timer play a sound?","When sound is enabled, an alert sound plays when the timer finishes."],["Can I use it on mobile?","Yes. It works on phones and tablets as well as desktop browsers."]]).map(([q,a])=><details key={q} className="border-b border-slate-100 px-5 last:border-b-0"><summary className="cursor-pointer py-4 text-sm font-bold text-slate-700">{q}</summary><p className="pb-4 text-sm leading-6 text-slate-600">{a}</p></details>)}
        </section>

        <nav className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm font-bold text-slate-700">{ko ? "다른 도구도 사용해 보세요" : "Try more tools"}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[["/time-calculator",ko?"시간 계산기":"Time Calculator"],["/calculator",ko?"복합 계산기":"Calculator"],["/text-tools",ko?"텍스트 도구":"Text Tools"],["/qr-code","QR Code"]].map(([href,label])=><a key={href} href={href} className="min-h-10 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700">{label}</a>)}
          </div>
        </nav>
        <footer className="py-6 text-center text-xs text-slate-400">ToolMingle · {ko ? "온라인 타이머" : "Online Timer"}</footer>
      </div>
    </main>
  );
}
