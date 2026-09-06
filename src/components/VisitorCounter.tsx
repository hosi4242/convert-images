import { useEffect, useState } from "react";
import { Users, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/I18nContext";

interface VisitCounts {
  total: number;
  today: number;
}

export default function VisitorCounter() {
  const { t } = useI18n();
  const [counts, setCounts] = useState<VisitCounts | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function trackVisit() {
      const { data, error } = await supabase.rpc("track_visit");
      if (!cancelled && !error && data) {
        setCounts({ total: data.total, today: data.today });
      }
    }

    trackVisit();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    setLoading(true);

    const [totalRes, todayRes] = await Promise.all([
      supabase.from("visitor_counter").select("count").eq("id", 1).maybeSingle(),
      supabase
        .from("daily_visitors")
        .select("count")
        .eq("visit_date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
    ]);

    if (!totalRes.error && !todayRes.error) {
      setCounts({
        total: totalRes.data?.count ?? 0,
        today: todayRes.data?.count ?? 0,
      });
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="group inline-flex items-center gap-3 rounded-full border border-blue-100/60 bg-white/70 px-5 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={t.visitorCountAria}
        >
          <Users className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span className="flex items-center gap-2">
            <span>
              {t.visitorToday}:{" "}
              <span className="font-bold tabular-nums">
                {counts !== null ? counts.today.toLocaleString() : "..."}
              </span>
            </span>
            <span className="text-blue-200">|</span>
            <span>
              {t.visitorTotal}:{" "}
              <span className="font-bold tabular-nums">
                {counts !== null ? counts.total.toLocaleString() : "..."}
              </span>
            </span>
          </span>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 text-blue-400 transition-transform group-hover:rotate-180" />
          )}
        </button>
      </div>
    </div>
  );
}
