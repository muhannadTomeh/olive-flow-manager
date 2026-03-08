import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, Users, Factory, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";

export default function Dashboard() {
  const { user } = useAuth();
  const { inventory } = useInventory();
  const [stats, setStats] = useState({
    queueCount: 0,
    todayInvoices: 0,
    totalCustomers: 0,
    totalWorkers: 0,
    todayExpenses: 0,
  });

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [queueRes, invoiceRes, customerRes, workerRes, expenseRes] = await Promise.all([
      supabase.from("queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user!.id).gte("created_at", today),
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("workers").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("expenses").select("amount").eq("user_id", user!.id).gte("created_at", today),
    ]);

    setStats({
      queueCount: queueRes.count || 0,
      todayInvoices: invoiceRes.count || 0,
      totalCustomers: customerRes.count || 0,
      totalWorkers: workerRes.count || 0,
      todayExpenses: (expenseRes.data || []).reduce((s: number, e: any) => s + Number(e.amount), 0),
    });
  };

  const cards = [
    { title: "الزبائن في الطابور", value: `${stats.queueCount}`, desc: "زبون ينتظر", icon: Clock },
    { title: "مخزون الزيت", value: `${inventory.total_oil} كغم`, desc: "متوفر في المخزن", icon: Package },
    { title: "الكاش المتوفر", value: `${inventory.total_cash} ش`, desc: "الرصيد الحالي", icon: DollarSign },
    { title: "فواتير اليوم", value: `${stats.todayInvoices}`, desc: "تم إنجازها", icon: Factory },
    { title: "إجمالي الزبائن", value: `${stats.totalCustomers}`, desc: "مسجلين في النظام", icon: Users },
    { title: "مصاريف اليوم", value: `${stats.todayExpenses} ش`, desc: "تم صرفها اليوم", icon: Sprout },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على أداء المعصرة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
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
        ))}
      </div>
    </div>
  );
}
