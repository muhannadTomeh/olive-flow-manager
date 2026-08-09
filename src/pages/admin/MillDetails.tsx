import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowRight, Receipt, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MillDetails() {
  const { id: millId } = useParams();
  const navigate = useNavigate();
  const [millData, setMillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!millId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Log administrative access
        await supabase.rpc('log_admin_access', {
          target_user_id: millId,
          action: 'viewed_mill_details'
        });

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", millId)
          .single();

        // Fetch current season
        const { data: seasons } = await supabase
          .from("seasons")
          .select("*")
          .eq("user_id", millId)
          .eq("status", "open")
          .limit(1);

        const currentSeason = seasons?.[0] || null;

        // Fetch last 10 invoices
        const { data: invoices } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", millId)
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch inventory
        const { data: inventory } = await supabase
          .from("inventory")
          .select("*")
          .eq("user_id", millId)
          .limit(1);

        setMillData({
          profile,
          currentSeason,
          invoices: invoices || [],
          inventory: inventory?.[0] || null
        });
      } catch (error) {
        console.error("Error fetching mill details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [millId]);

  if (loading) return <div className="p-8 text-center">جارٍ تحميل بيانات المعصرة...</div>;
  if (!millData) return <div className="p-8 text-center">لم يتم العثور على بيانات.</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">وضع الدعم الفني</AlertTitle>
        <AlertDescription className="text-blue-700">
          أنت تشاهد بيانات <strong>[{millData.profile?.display_name || 'معصرة'}]</strong> بوضع الدعم — القراءة فقط.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للوحة المشرف
        </Button>
        <h1 className="text-2xl font-bold">{millData.profile?.display_name || 'تفاصيل المعصرة'}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Season */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">الموسم الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            {millData.currentSeason ? (
              <div className="space-y-2">
                <p className="font-bold">{millData.currentSeason.name}</p>
                <div className="text-sm space-y-1">
                  <p>تاريخ البدء: {new Date(millData.currentSeason.start_date).toLocaleDateString("ar-EG")}</p>
                  <p>الرد: {millData.currentSeason.return_percent}%</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">لا يوجد موسم مفتوح حالياً</p>
            )}
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">حالة المخزن</CardTitle>
          </CardHeader>
          <CardContent>
            {millData.inventory ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي الزيت:</span>
                  <span className="font-bold">{millData.inventory.total_oil} كغم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي النقد:</span>
                  <span className="font-bold">{millData.inventory.total_cash} ₪</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">لا توجد بيانات مخزن</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">إحصائيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">آخر 10 فواتير:</span>
              <span className="font-bold">{millData.invoices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>آخر 10 فواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الزبون</TableHead>
                <TableHead className="text-right">الزيت المنتج</TableHead>
                <TableHead className="text-right">المبلغ النقدي</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {millData.invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.customer_name}</TableCell>
                  <TableCell>{inv.oil_produced} كغم</TableCell>
                  <TableCell>{inv.cash_amount} ₪</TableCell>
                  <TableCell>{new Date(inv.created_at).toLocaleDateString("ar-EG")}</TableCell>
                </TableRow>
              ))}
              {millData.invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    لا توجد فواتير مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
