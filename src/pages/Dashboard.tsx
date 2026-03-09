import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, Users, CheckCircle, Sprout, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Dashboard() {
  const { user } = useAuth();
  const { inventory } = useInventory();
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);
  const [stats, setStats] = useState({
    waitingCount: 0,
    doneCount: 0,
    todayExpenses: 0
  });

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [waitingRes, doneRes, expenseRes] = await Promise.all([
    supabase.from("queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).neq("status", "done"),
    supabase.from("queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "done"),
    supabase.from("expenses").select("amount").eq("user_id", user!.id).gte("created_at", today)]
    );

    setStats({
      waitingCount: waitingRes.count || 0,
      doneCount: doneRes.count || 0,
      todayExpenses: (expenseRes.data || []).reduce((s: number, e: any) => s + Number(e.amount), 0)
    });
  };

  const cards = [
  { title: "الزبائن في الطابور", value: `${stats.waitingCount}`, desc: "ينتظرون (بدون المنجزين)", icon: Clock },
  { title: "الزبائن المنجزين", value: `${stats.doneCount}`, desc: "تم إنجاز طلباتهم", icon: CheckCircle },
  { title: "مصاريف اليوم", value: `${stats.todayExpenses} ش`, desc: "تم صرفها اليوم", icon: Sprout }];


  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-primary">الرئيسية</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على أداء المعصرة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) =>
        <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* المخزون */}
      <Card>
        


















        
        











































        
      </Card>
    </div>);

}