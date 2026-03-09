import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";

interface QueueItem {
  id: string;
  name: string;
  position: number;
  status: string;
  bags: number;
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function QueueDisplay() {
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [prevProcessingId, setPrevProcessingId] = useState<string | null>(null);
  const [fadeKey, setFadeKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clock = useClock();

  const fetchQueue = async () => {
    if (!user || !activeSeason) return;
    const { data } = await supabase
      .from("queue")
      .select("id, name, position, status, bags")
      .eq("user_id", user.id)
      .eq("season_id", activeSeason.id)
      .in("status", ["waiting", "processing"])
      .order("position", { ascending: true });
    setItems(data || []);
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
  const nextThree = waitingItems.slice(0, 3);

  // Play sound & trigger animation on processing change
  useEffect(() => {
    if (currentItem && currentItem.id !== prevProcessingId) {
      setPrevProcessingId(currentItem.id);
      setFadeKey((k) => k + 1);
      // Play notification sound
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgip2teleAkKSsi2lJPVqBmq2bjGdHQFuCla+fkm5OQlmBk6+hlnZVQ1d/ka2hl3xbRVZ9jqmgloBhSFV7i6WdsHxhPlN4h6GevndiN0h4gZ2dwXRZMkJ0fJeYtXBRK0NwdpOTs25NKERycJGQrm1KJ0ZycY+Oq2xJJkZzco+Oq21JJ0d0c4+Oqm1KKEh1dJCPqG1LKkl2dpGRpm1NK0t3d5OSo21PLUx5eJOTo2xQLk16eZSUoWtRME57epWVn2tSMVB8e5aWnmpTMlF9fJeXnGpUNFJ+fZiYm2lVNVN/fpmZmmhWNlSAf5qamWdXN1WBgJubl2ZYOFeChJybleVZOViDhZ2dlONaOlmEhp6ek+FbPFqFh5+fkeBcPVuGiKCgj99ePlyHiaChjt5fP12Iiquan95gQF6JiqsA");
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    } else if (!currentItem) {
      setPrevProcessingId(null);
    }
  }, [currentItem?.id]);

  const hours = String(clock.getHours()).padStart(2, "0");
  const minutes = String(clock.getMinutes()).padStart(2, "0");
  const seconds = String(clock.getSeconds()).padStart(2, "0");

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col" dir="rtl"
      style={{ background: "linear-gradient(160deg, #020a04 0%, #0a1f10 40%, #0d2914 70%, #061208 100%)" }}
    >
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
      />

      {/* Clock */}
      <div className="flex justify-center pt-6 pb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-white/30 font-mono text-3xl">{seconds}</span>
          <span className="text-white/40 font-mono text-5xl mx-1 animate-pulse">:</span>
          <span className="text-white font-mono text-7xl font-bold tracking-widest"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.15)" }}
          >
            {minutes}
          </span>
          <span className="text-white/40 font-mono text-5xl mx-1 animate-pulse">:</span>
          <span className="text-white font-mono text-7xl font-bold tracking-widest"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.15)" }}
          >
            {hours}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        {/* Current Processing */}
        {currentItem ? (
          <div
            key={fadeKey}
            className="w-full max-w-3xl text-center"
            style={{ animation: "qd-fade-scale 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <p className="text-2xl font-bold mb-5 tracking-wide"
              style={{ color: "#6ee7b7" }}
            >
              🫒 جاري العصر الآن
            </p>
            <div className="relative rounded-[2rem] p-8 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(22,101,52,0.5) 0%, rgba(5,46,22,0.6) 100%)",
                border: "2px solid rgba(74,222,128,0.3)",
                boxShadow: "0 0 60px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Glow behind number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full blur-[80px] opacity-30"
                  style={{ background: "#22c55e" }}
                />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <span className="font-black text-white leading-none"
                  style={{
                    fontSize: "clamp(8rem, 20vw, 16rem)",
                    textShadow: "0 0 80px rgba(74,222,128,0.4), 0 4px 0 rgba(0,0,0,0.3)",
                  }}
                >
                  {currentItem.position}
                </span>
                <span className="text-white text-4xl font-bold tracking-wide"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                  {currentItem.name}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl text-center">
            <div className="rounded-[2rem] p-16"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-white/20 text-4xl font-light">لا يوجد عصر حالياً</p>
            </div>
          </div>
        )}

        {/* Next in queue */}
        {nextThree.length > 0 && (
          <div className="w-full max-w-2xl text-center">
            <p className="text-xl font-bold mb-4 tracking-wide"
              style={{ color: "#fbbf24" }}
            >
              ⏳ الدور القادم
            </p>
            <div className="flex flex-col gap-3">
              {nextThree.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl px-8 py-5 transition-all"
                  style={{
                    background: idx === 0
                      ? "linear-gradient(135deg, rgba(234,179,8,0.12) 0%, rgba(161,98,7,0.08) 100%)"
                      : "rgba(255,255,255,0.03)",
                    border: idx === 0
                      ? "1px solid rgba(250,204,21,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                    animation: `qd-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s both`,
                  }}
                >
                  <div className="flex items-center gap-6">
                    <span
                      className="font-black leading-none"
                      style={{
                        fontSize: idx === 0 ? "4rem" : "3rem",
                        color: idx === 0 ? "#fbbf24" : "rgba(255,255,255,0.4)",
                        textShadow: idx === 0 ? "0 0 30px rgba(251,191,36,0.3)" : "none",
                      }}
                    >
                      {item.position}
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: idx === 0 ? "2rem" : "1.5rem",
                        color: idx === 0 ? "#fef3c7" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  {idx === 0 && (
                    <span className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                    >
                      التالي
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting count */}
        {waitingItems.length > 3 && (
          <p className="text-white/25 text-lg mt-2">
            +{waitingItems.length - 3} منتظرين آخرين
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 flex justify-between items-center text-white/20 text-sm">
        <span>معصرة الزيتون</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          مباشر
        </span>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes qd-fade-scale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes qd-slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
