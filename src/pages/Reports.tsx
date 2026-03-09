import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useInventory } from "@/hooks/useInventory";

export default function Reports() {
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const { inventory } = useInventory();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalCustomers: 0,
    totalOilProduced: 0,
    totalCashEarned: 0,
    totalOilEarned: 0,
    totalExpenses: 0,
    totalSales: 0,
    totalPurchases: 0
  });
  const [topCustomers, setTopCustomers] = useState<{name: string;count: number;oil: number;}[]>([]);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    const [invoicesRes, customersRes, expensesRes, salesRes, purchasesRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("user_id", user!.id).eq("season_id", activeSeason!.id),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("season_id", activeSeason!.id),
    supabase.from("expenses").select("amount").eq("user_id", user!.id).eq("season_id", activeSeason!.id),
    supabase.from("oil_transactions").select("total_price").eq("user_id", user!.id).eq("season_id", activeSeason!.id).eq("type", "sell"),
    supabase.from("oil_transactions").select("total_price").eq("user_id", user!.id).eq("season_id", activeSeason!.id).eq("type", "buy")]
    );

    const invoices = invoicesRes.data || [];
    const totalOilProduced = invoices.reduce((s, i: any) => s + Number(i.oil_produced), 0);
    const totalCashEarned = invoices.reduce((s, i: any) => s + Number(i.cash_amount), 0);
    const totalOilEarned = invoices.reduce((s, i: any) => s + Number(i.oil_amount), 0);
    const totalExpenses = (expensesRes.data || []).reduce((s, e: any) => s + Number(e.amount), 0);
    const totalSales = (salesRes.data || []).reduce((s, t: any) => s + Number(t.total_price), 0);
    const totalPurchases = (purchasesRes.data || []).reduce((s, t: any) => s + Number(t.total_price), 0);

    setStats({
      totalInvoices: invoices.length,
      totalCustomers: customersRes.count || 0,
      totalOilProduced,
      totalCashEarned,
      totalOilEarned,
      totalExpenses,
      totalSales,
      totalPurchases
    });

    // Top customers
    const customerMap: Record<string, {count: number;oil: number;}> = {};
    invoices.forEach((inv: any) => {
      if (!customerMap[inv.customer_name]) customerMap[inv.customer_name] = { count: 0, oil: 0 };
      customerMap[inv.customer_name].count++;
      customerMap[inv.customer_name].oil += Number(inv.oil_produced);
    });
    const top = Object.entries(customerMap).
    map(([name, d]) => ({ name, ...d })).
    sort((a, b) => b.count - a.count).
    slice(0, 10);
    setTopCustomers(top);
  };

  const netProfit = stats.totalCashEarned + stats.totalSales - stats.totalPurchases - stats.totalExpenses;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalInvoices}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيت المنتج</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalOilProduced} كغم</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalSales} ش</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الأرباح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className={`text-2xl font-bold ${netProfit >= 0 ? '' : 'text-destructive'}`}>{netProfit.toFixed(0)} ش</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ملخص مالي</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-right font-medium">إيرادات من الفواتير (نقد)</TableCell>
                  <TableCell className="text-right">{stats.totalCashEarned.toFixed(0)} ش</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-medium">إيرادات من الفواتير (زيت)</TableCell>
                  <TableCell className="text-right">{stats.totalOilEarned.toFixed(2)} كغم</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-medium">مبيعات الزيت</TableCell>
                  <TableCell className="text-right">{stats.totalSales} ش</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-medium">مشتريات الزيت</TableCell>
                  <TableCell className="text-right">{stats.totalPurchases} ش</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-medium">إجمالي المصاريف</TableCell>
                  <TableCell className="text-right text-destructive">{stats.totalExpenses} ش</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-bold">مخزون الزيت الحالي</TableCell>
                  <TableCell className="text-right font-bold">{inventory.total_oil} كغم</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right font-bold">الكاش الحالي</TableCell>
                  <TableCell className="text-right font-bold">{inventory.total_cash} ش</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        



























        
      </div>
    </div>);

}