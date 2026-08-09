import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, Receipt, Droplets, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminIndex() {
  const [stats, setStats] = useState({
    totalMills: 0,
    activeMills: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    totalInvoices: 0,
    totalOil: 0,
  });
  const [mills, setMills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all profiles and auth emails (via profiles linked to auth users)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) throw profilesError;

        // Fetch seasons to identify active ones
        const { data: seasons, error: seasonsError } = await supabase
          .from("seasons")
          .select("user_id, status");
        
        if (seasonsError) throw seasonsError;

        // Fetch all invoices for stats
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("oil_produced, created_at, user_id");

        if (invoicesError) throw invoicesError;

        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalOil = invoices.reduce((sum, inv) => sum + (inv.oil_produced || 0), 0);
        
        const activeUserIds = new Set(seasons.filter(s => s.status === 'open').map(s => s.user_id));
        
        const newThisWeek = profiles.filter(p => new Date(p.created_at) >= oneWeekAgo).length;
        const newThisMonth = profiles.filter(p => new Date(p.created_at) >= oneMonthAgo).length;

        setStats({
          totalMills: profiles.length,
          activeMills: activeUserIds.size,
          newThisWeek,
          newThisMonth,
          totalInvoices: invoices.length,
          totalOil,
        });

        // Prepare mill list
        // Note: For email, we might need a more complex join or just use what's in profile if stored
        // Since we can't easily join auth.users in public schema, we rely on profiles
        const millList = profiles.map(profile => {
          const userInvoices = invoices.filter(inv => inv.user_id === profile.user_id);
          const lastActivity = userInvoices.length > 0 
            ? new Date(Math.max(...userInvoices.map(inv => new Date(inv.created_at).getTime())))
            : new Date(profile.created_at);

          return {
            id: profile.user_id,
            name: profile.display_name || "معصرة غير مسمى",
            email: "---", // Auth email not directly in profiles table usually
            createdAt: profile.created_at,
            isActive: activeUserIds.has(profile.user_id),
            invoiceCount: userInvoices.length,
            lastActivity,
          };
        });

        setMills(millList);
      } catch (error) {
        console.error("Admin data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>جارٍ التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعاصر</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMills}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newThisWeek} جديد هذا الأسبوع
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معاصر نشطة</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMills}</div>
            <p className="text-xs text-muted-foreground">بمواسم مفتوحة حالياً</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيت المعالج</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOil.toLocaleString()} كغم</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تسجيلات الشهر</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mills Table */}
      <Card>
        <CardHeader>
          <CardTitle>كل المعاصر</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المعصرة</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                <TableHead className="text-right">موسم نشط</TableHead>
                <TableHead className="text-right">عدد الفواتير</TableHead>
                <TableHead className="text-right">آخر نشاط</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mills.map((mill) => (
                <TableRow key={mill.id}>
                  <TableCell className="font-medium">{mill.name}</TableCell>
                  <TableCell>{new Date(mill.createdAt).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    {mill.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">نعم</Badge>
                    ) : (
                      <Badge variant="secondary">لا</Badge>
                    )}
                  </TableCell>
                  <TableCell>{mill.invoiceCount}</TableCell>
                  <TableCell>{mill.lastActivity.toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/mill/${mill.id}`)}
                    >
                      عرض التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
