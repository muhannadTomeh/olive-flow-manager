import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock, CheckCircle, Sprout, Users, Plus, Receipt,
  Wallet, ArrowLeft, Droplets, DollarSign, UserPlus, Play,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useInventory } from "@/hooks/useInventory";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    waitingCount: 0,
    doneCount: 0,
    todayExpenses: 0,
    totalCustomers: 0,
  });
  const [queuePreview, setQueuePreview] = useState<{ id: string; name: string; position: number }[]>([]);

  useEffect(() => {
    if (user && activeSeason) {
      fetchStats();
      fetchQueuePreview();
    }
  }, [user, activeSeason]);

  const fetchStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [waitingRes, doneRes, expenseRes, customerRes] = await Promise.all([
      supabase.from("queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("season_id", activeSeason!.id).neq("status", "done"),
      supabase.from("queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("season_id", activeSeason!.id).eq("status", "done"),
      supabase.from("expenses").select("amount").eq("user_id", user!.id).eq("season_id", activeSeason!.id).gte("created_at", today),
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("season_id", activeSeason!.id),
    ]);
    setStats({
      waitingCount: waitingRes.count || 0,
      doneCount: doneRes.count || 0,
      todayExpenses: (expenseRes.data || []).reduce((s: number, e: any) => s + Number(e.amount), 0),
      totalCustomers: customerRes.count || 0,
    });
  };

  const fetchQueuePreview = async () => {
    const { data } = await supabase
      .from("queue")
      .select("id, name, position")
      .eq("user_id", user!.id)
      .eq("season_id", activeSeason!.id)
      .neq("status", "done")
      .order("position", { ascending: true })
      .limit(5);
    setQueuePreview(data || []);
  };

  const statCards = [
    { label: "الزبائن", value: stats.totalCustomers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "في الطابور", value: stats.waitingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "تم الإنجاز", value: stats.doneCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "مصاريف اليوم", value: `${stats.todayExpenses} ₪`, icon: Wallet, color: "text-red-500", bg: "bg-red-50" },
    { label: "الزيت (كغ)", value: inventory.total_oil.toFixed(1), icon: Droplets, color: "text-primary", bg: "bg-primary/5" },
    { label: "الرصيد", value: `${inventory.total_cash.toFixed(0)} ₪`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const quickActions = [
    { label: "إضافة للطابور", icon: UserPlus, onClick: () => navigate("/queue"), color: "bg-primary hover:bg-primary/90" },
    { label: "فتح الطابور", icon: Clock, onClick: () => navigate("/queue"), color: "bg-amber-600 hover:bg-amber-700" },
    { label: "إنشاء فاتورة", icon: Receipt, onClick: () => navigate("/invoices"), color: "bg-blue-600 hover:bg-blue-700" },
    { label: "إضافة مصروف", icon: Wallet, onClick: () => navigate("/expenses"), color: "bg-red-500 hover:bg-red-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-0.5">نظرة عامة على أداء المعصرة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className="text-2xl font-bold text-foreground leading-none">{card.value}</span>
              <span className="text-[11px] text-muted-foreground font-medium">{card.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Queue Preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">الطابور</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                if (queuePreview.length === 0) return;
                const { data: existingProcessing } = await supabase
                  .from("queue")
                  .select("id")
                  .eq("user_id", user!.id)
                  .eq("season_id", activeSeason!.id)
                  .eq("status", "processing")
                  .maybeSingle();
                if (existingProcessing) {
                  toast.error("يوجد زبون قيد العصر بالفعل");
                  return;
                }
                await supabase.from("queue").update({ status: "processing" }).eq("id", queuePreview[0].id);
                toast.success(`تم بدء عصر ${queuePreview[0].name}`);
                fetchQueuePreview();
              }}
              disabled={queuePreview.length === 0}
              className="gap-1 text-xs"
            >
              <Play className="h-3.5 w-3.5" />
              ابدأ التالي
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/queue")} className="gap-1 text-primary text-xs">
              عرض الكل
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {queuePreview.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا يوجد أحد في الطابور</p>
          ) : (
            <div className="space-y-2">
              {queuePreview.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {item.position}
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  {i === 0 && (
                    <Badge variant="secondary" className="mr-auto text-[10px] px-2 py-0.5">التالي</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
