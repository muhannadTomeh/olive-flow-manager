import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, RefreshCw, CheckCircle } from "lucide-react";

interface QueueItem {
  id: string;
  name: string;
  position: number;
  status: string;
  bags: number;
}

interface SeasonInfo {
  name: string;
}

export default function PublicQueueDisplay() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const [now, setNow] = useState(new Date());

  const fetchData = async () => {
    if (!seasonId) return;

    const [queueRes, seasonRes] = await Promise.all([
      supabase
        .from("queue")
        .select("id, name, position, status, bags")
        .eq("season_id", seasonId)
        .in("status", ["waiting", "processing", "completed"])
        .order("position", { ascending: true }),
      supabase
        .from("seasons")
        .select("name")
        .eq("id", seasonId)
        .single(),
    ]);

    setItems(queueRes.data || []);
    if (seasonRes.data) setSeason(seasonRes.data);
    setNow(new Date());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [seasonId]);

  useEffect(() => {
    if (!seasonId) return;
    const channel = supabase
      .channel("public-queue-display")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [seasonId]);

  const processing = items.find((i) => i.status === "processing");
  const waiting = items.filter((i) => i.status === "waiting");
  const completed = items.filter((i) => i.status === "completed");

  return (
    <div className="fixed inset-0 bg-[#0a1a0f] text-white overflow-hidden flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#1a3a1f] to-[#0d2612] px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Monitor className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold tracking-wide">طابور المعصرة</h1>
          {season && (
            <span className="text-green-400/70 text-lg">— {season.name}</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-green-400/60 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: "3s" }} />
          <span>تحديث تلقائي</span>
          <span className="text-lg font-mono">
            {now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Current Processing */}
      {processing && (
        <div className="mx-8 mt-6 p-6 rounded-2xl bg-gradient-to-l from-green-600/30 to-green-800/20 border-2 border-green-500/50 animate-pulse" style={{ animationDuration: "2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center text-4xl font-bold shadow-lg shadow-green-500/30">
                {processing.position}
              </div>
              <div>
                <p className="text-sm text-green-400 font-medium mb-1">🫒 جاري العصر الآن</p>
                <p className="text-4xl font-bold">{processing.name}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-green-400/70 text-sm">عدد الشوالات</p>
              <p className="text-3xl font-bold">{processing.bags}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden px-8 mt-6 pb-6 flex gap-6">
        {/* Waiting List */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-green-400/80">قائمة الانتظار</h2>
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              {waiting.length} منتظر
            </span>
          </div>

          {waiting.length === 0 && !processing ? (
            <div className="flex items-center justify-center text-white/30 text-2xl mt-20">
              لا يوجد أحد في الطابور حالياً
            </div>
          ) : (
            <div className="grid gap-3 overflow-y-auto max-h-[calc(100vh-320px)]">
              {waiting.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                    idx === 0
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-white/10 text-white/70"
                    }`}>
                      {item.position}
                    </div>
                    <div>
                      <p className={`text-2xl font-semibold ${idx === 0 ? "text-yellow-100" : ""}`}>
                        {item.name}
                      </p>
                      {idx === 0 && (
                        <p className="text-yellow-400/70 text-sm mt-0.5">⏳ التالي</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-white/40 text-xs">شوالات</p>
                    <p className="text-xl font-bold text-white/70">{item.bags}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed List */}
        {completed.length > 0 && (
          <div className="w-80 border-r border-white/10 pr-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold text-green-500/80">منجز</h2>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                {completed.length}
              </span>
            </div>
            <div className="grid gap-2 overflow-y-auto max-h-[calc(100vh-320px)]">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg font-bold text-green-500/60">
                    {item.position}
                  </div>
                  <p className="text-lg text-white/40 line-through">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
