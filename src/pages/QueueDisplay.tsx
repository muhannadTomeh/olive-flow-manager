import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { RefreshCw } from "lucide-react";

interface QueueItem {
  id: string;
  name: string;
  position: number;
  status: string;
  bags: number;
}

const AVG_MINUTES_PER_BAG = 3;

function useElapsed(startTime: Date | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function QueueDisplay() {
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [now, setNow] = useState(new Date());
  const [processingStartTime, setProcessingStartTime] = useState<Date | null>(null);
  const [prevProcessingId, setPrevProcessingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (!user || !activeSeason) return;
    const { data } = await supabase
      .from("queue")
      .select("id, name, position, status, bags")
      .eq("user_id", user.id)
      .eq("season_id", activeSeason.id)
      .neq("status", "done")
      .order("position", { ascending: true });
    setItems(data || []);
    setNow(new Date());
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [user, activeSeason]);

  useEffect(() => {
    if (!user || !activeSeason) return;
    const channel = supabase
      .channel("queue-display")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
        fetchQueue();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeSeason]);

  const currentItem = items.find((i) => i.status === "processing");
  const waitingItems = items.filter((i) => i.status === "waiting");
  const nextItem = waitingItems[0];

  // Track when processing starts (reset timer on new processing item)
  useEffect(() => {
    if (currentItem && currentItem.id !== prevProcessingId) {
      setProcessingStartTime(new Date());
      setPrevProcessingId(currentItem.id);
    } else if (!currentItem) {
      setProcessingStartTime(null);
      setPrevProcessingId(null);
    }
  }, [currentItem?.id]);

  const elapsed = useElapsed(processingStartTime);
  const estimatedMinutes = currentItem ? currentItem.bags * AVG_MINUTES_PER_BAG : 0;
  const estimatedSeconds = estimatedMinutes * 60;
  const remaining = Math.max(0, estimatedSeconds - elapsed);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-green-900/80 px-10 py-4 flex items-center justify-between">
        <h1 className="text-4xl font-black">طابور المعصرة</h1>
        <div className="flex items-center gap-4 text-green-300 text-lg">
          <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: "3s" }} />
          <span className="font-mono text-2xl">
            {now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        {/* Current Turn */}
        {currentItem ? (
          <div className="w-full max-w-4xl text-center">
            <p className="text-green-400 text-3xl font-bold mb-4">🫒 جاري العصر الآن</p>
            <div className="bg-green-800/40 border-4 border-green-500 rounded-3xl p-10 flex flex-col items-center gap-6">
              <div className="text-[12rem] leading-none font-black text-green-400 drop-shadow-[0_0_40px_rgba(74,222,128,0.4)]">
                {currentItem.position}
              </div>
              <p className="text-5xl font-bold text-white">{currentItem.name}</p>
              {/* Estimated time */}
              <div className="flex items-center gap-8 mt-2">
                <div className="text-center">
                  <p className="text-green-400/60 text-sm mb-1">الوقت المنقضي</p>
                  <p className="text-4xl font-mono font-bold text-green-300">{formatTimer(elapsed)}</p>
                </div>
                <div className="w-px h-12 bg-green-500/30" />
                <div className="text-center">
                  <p className="text-green-400/60 text-sm mb-1">الوقت المتبقي (تقديري)</p>
                  <p className={`text-4xl font-mono font-bold ${remaining > 0 ? "text-yellow-300" : "text-red-400"}`}>
                    {formatTimer(remaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl text-center">
            <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-16">
              <p className="text-white/30 text-4xl">لا يوجد عصر حالياً</p>
            </div>
          </div>
        )}

        {/* Next Turn */}
        {nextItem ? (
          <div className="w-full max-w-3xl text-center">
            <p className="text-yellow-400 text-2xl font-bold mb-3">⏳ الدور التالي</p>
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-2xl p-8 flex items-center justify-center gap-10">
              <div className="text-8xl font-black text-yellow-400">
                {nextItem.position}
              </div>
              <p className="text-4xl font-bold text-yellow-100">{nextItem.name}</p>
            </div>
          </div>
        ) : !currentItem ? null : (
          <div className="w-full max-w-3xl text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="text-white/20 text-2xl">لا يوجد دور تالي</p>
            </div>
          </div>
        )}

        {/* Remaining queue count */}
        {waitingItems.length > 1 && (
          <div className="text-white/40 text-2xl mt-4">
            عدد المنتظرين: <span className="text-white/70 font-bold text-3xl">{waitingItems.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
