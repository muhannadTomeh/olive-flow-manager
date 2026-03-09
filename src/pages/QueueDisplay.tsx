import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { Monitor, RefreshCw } from "lucide-react";

interface QueueItem {
  id: string;
  name: string;
  position: number;
  status: string;
  bags: number;
}

export default function QueueDisplay() {
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [now, setNow] = useState(new Date());

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

  // Realtime subscription
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

  return (
    <div className="fixed inset-0 bg-[#0a1a0f] text-white overflow-hidden flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#1a3a1f] to-[#0d2612] px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Monitor className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold tracking-wide">طابور المعصرة</h1>
          {activeSeason && (
            <span className="text-green-400/70 text-lg">— {activeSeason.name}</span>
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
      {currentItem && (
        <div className="mx-8 mt-6 p-6 rounded-2xl bg-gradient-to-l from-green-600/30 to-green-800/20 border-2 border-green-500/50 animate-pulse" style={{ animationDuration: "2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center text-4xl font-bold shadow-lg shadow-green-500/30">
                {currentItem.position}
              </div>
              <div>
                <p className="text-sm text-green-400 font-medium mb-1">🫒 جاري العصر الآن</p>
                <p className="text-4xl font-bold">{currentItem.name}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-green-400/70 text-sm">عدد الشوالات</p>
              <p className="text-3xl font-bold">{currentItem.bags}</p>
            </div>
          </div>
        </div>
      )}

      {/* Waiting List */}
      <div className="flex-1 overflow-hidden px-8 mt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-green-400/80">قائمة الانتظار</h2>
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
            {waitingItems.length} منتظر
          </span>
        </div>

        {waitingItems.length === 0 && !currentItem ? (
          <div className="flex-1 flex items-center justify-center text-white/30 text-2xl mt-20">
            لا يوجد أحد في الطابور حالياً
          </div>
        ) : (
          <div className="grid gap-3 overflow-y-auto max-h-[calc(100vh-320px)]">
            {waitingItems.map((item, idx) => (
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
    </div>
  );
}
