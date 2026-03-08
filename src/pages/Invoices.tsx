import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Calculator, FileText, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface PaymentMethod {
  type: 'oil' | 'cash' | 'mixed';
  oilAmount: number;
  cashAmount: number;
  total: string;
}

interface InvoiceRecord {
  id: string;
  customer_name: string;
  oil_produced: number;
  container_count: number;
  container_type: string;
  payment_type: string;
  oil_amount: number;
  cash_amount: number;
  total_display: string;
  created_at: string;
}

interface ContainerType {
  id: string;
  name: string;
  price: number;
}

const Invoices = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { inventory, updateInventory, refetch: refetchInventory } = useInventory();
  const location = useLocation();
  const { toast } = useToast();

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerPhone: "",
    oilProduced: 0,
  });
  const [containerCounts, setContainerCounts] = useState<Record<string, number>>({});
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [queueCustomers, setQueueCustomers] = useState<{ id: string; name: string; phone: string | null; position: number }[]>([]);

  useEffect(() => {
    if (location.state) {
      const s = location.state as any;
      if (s.customerName) setInvoiceData(p => ({ ...p, customerName: s.customerName, customerPhone: s.customerPhone || "" }));
      if (s.queueId) setQueueId(s.queueId);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchQueueCustomers();
      fetchContainerTypes();
    }
  }, [user]);

  const fetchContainerTypes = async () => {
    const { data } = await supabase
      .from("container_types")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });
    const types = (data as ContainerType[]) || [];
    setContainerTypes(types);
    // Initialize counts to 0 for each type
    const counts: Record<string, number> = {};
    types.forEach(t => { counts[t.id] = 0; });
    setContainerCounts(prev => {
      // Keep existing non-zero values if types match
      const merged = { ...counts };
      Object.keys(prev).forEach(k => { if (merged[k] !== undefined) merged[k] = prev[k]; });
      return merged;
    });
  };

  const fetchQueueCustomers = async () => {
    const { data } = await supabase
      .from("queue")
      .select("id, name, phone, position")
      .eq("user_id", user!.id)
      .order("position", { ascending: true });
    setQueueCustomers(data || []);
  };

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setInvoices((data as InvoiceRecord[]) || []);
  };

  const getTotalContainerCost = () => {
    let total = 0;
    containerTypes.forEach(ct => {
      total += (containerCounts[ct.id] || 0) * ct.price;
    });
    return total;
  };

  const getTotalContainerCount = () => {
    return Object.values(containerCounts).reduce((s, v) => s + v, 0);
  };

  const getContainerSummary = () => {
    return containerTypes
      .filter(ct => (containerCounts[ct.id] || 0) > 0)
      .map(ct => `${containerCounts[ct.id]} ${ct.name}`)
      .join(" + ");
  };

  const calculatePaymentMethods = () => {
    if (!invoiceData.oilProduced) {
      toast({ title: "خطأ", description: "يرجى إدخال كمية الزيت", variant: "destructive" });
      return;
    }
    const { oilProduced } = invoiceData;
    const totalContainerCost = getTotalContainerCost();

    const oilReturn = (oilProduced * settings.return_percent) / 100;
    const containerReturnInOil = totalContainerCost / settings.oil_buy_price;
    const totalOilPayment = oilReturn + containerReturnInOil;

    const cashReturn = oilProduced * settings.cash_return_cost;
    const totalCashPayment = cashReturn + totalContainerCost;

    const methods: PaymentMethod[] = [
      { type: 'oil', oilAmount: totalOilPayment, cashAmount: 0, total: `${totalOilPayment.toFixed(2)} كغم زيت` },
      { type: 'cash', oilAmount: 0, cashAmount: totalCashPayment, total: `${totalCashPayment.toFixed(2)} شيكل` },
      { type: 'mixed', oilAmount: oilReturn, cashAmount: totalContainerCost, total: `${oilReturn.toFixed(2)} كغم زيت + ${totalContainerCost.toFixed(2)} شيكل` },
    ];
    setPaymentMethods(methods);
    toast({ title: "تم الحساب", description: "تم حساب طرق الدفع الثلاثة" });
  };

  const processInvoice = async (method: PaymentMethod) => {
    if (!invoiceData.customerName) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم الزبون", variant: "destructive" });
      return;
    }

    let customerId: string | null = null;
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user!.id)
      .eq("name", invoiceData.customerName)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust } = await supabase
        .from("customers")
        .insert({ user_id: user!.id, name: invoiceData.customerName, phone: invoiceData.customerPhone || null })
        .select("id")
        .single();
      if (newCust) customerId = newCust.id;
    }

    const containerSummary = getContainerSummary() || "بدون تنكات";

    const { error } = await supabase.from("invoices").insert({
      user_id: user!.id,
      customer_id: customerId,
      customer_name: invoiceData.customerName,
      oil_produced: invoiceData.oilProduced,
      container_count: getTotalContainerCount(),
      container_type: containerSummary,
      payment_type: method.type,
      oil_amount: method.oilAmount,
      cash_amount: method.cashAmount,
      total_display: method.total,
    });

    if (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حفظ الفاتورة", variant: "destructive" });
      return;
    }

    const oilChange = invoiceData.oilProduced - method.oilAmount;
    await updateInventory({
      total_oil: inventory.total_oil + oilChange,
      total_cash: inventory.total_cash + method.cashAmount,
    });

    if (queueId && queueId !== "manual") {
      await supabase.from("queue").delete().eq("id", queueId);
      setQueueId(null);
    }

    toast({ title: "تمت معالجة الفاتورة", description: `تم إنشاء فاتورة لـ ${invoiceData.customerName}` });
    setInvoiceData({ customerName: "", customerPhone: "", oilProduced: 0 });
    const resetCounts: Record<string, number> = {};
    containerTypes.forEach(ct => { resetCounts[ct.id] = 0; });
    setContainerCounts(resetCounts);
    setPaymentMethods([]);
    fetchInvoices();
    fetchQueueCustomers();
    refetchInventory();
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.customer_name.includes(searchTerm)
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">حساب الرد</h1>
      </div>

      <Tabs defaultValue="create" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">إنشاء فاتورة جديدة</TabsTrigger>
          <TabsTrigger value="history">سجل الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  بيانات الفاتورة
                </CardTitle>
                <CardDescription>أدخل بيانات الإنتاج لحساب الفاتورة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اسم الزبون</Label>
                  <Select
                    value={queueId || "manual"}
                    onValueChange={(val) => {
                      if (val === "manual") {
                        setQueueId(null);
                        setInvoiceData(p => ({ ...p, customerName: "", customerPhone: "" }));
                      } else {
                        const c = queueCustomers.find(q => q.id === val);
                        if (c) {
                          setQueueId(c.id);
                          setInvoiceData(p => ({ ...p, customerName: c.name, customerPhone: c.phone || "" }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر زبون من الطابور" />
                    </SelectTrigger>
                    <SelectContent>
                      {queueCustomers.map((c, i) => (
                        <SelectItem key={c.id} value={c.id}>
                          #{i + 1} - {c.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="manual">إدخال يدوي</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!queueId || queueId === "manual") && (
                    <Input className="mt-2" value={invoiceData.customerName} onChange={(e) => setInvoiceData(p => ({ ...p, customerName: e.target.value }))} placeholder="أدخل اسم الزبون يدوياً" />
                  )}
                </div>
                <div>
                  <Label htmlFor="oilProduced">كمية الزيت المنتج (كغم)</Label>
                  <Input id="oilProduced" type="number" value={invoiceData.oilProduced || ""} onChange={(e) => setInvoiceData(p => ({ ...p, oilProduced: parseFloat(e.target.value) || 0 }))} placeholder="كمية الزيت بالكيلوغرام" min="0" step="0.1" />
                </div>

                {containerTypes.length > 0 && (
                  <div className="space-y-3">
                    <Label>عدد التنكات لكل نوع</Label>
                    {containerTypes.map(ct => (
                      <div key={ct.id} className="flex items-center gap-3">
                        <Label className="w-40 text-sm">{ct.name}:</Label>
                        <Input
                          type="number"
                          className="w-24"
                          value={containerCounts[ct.id] || 0}
                          onChange={(e) => setContainerCounts(p => ({ ...p, [ct.id]: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {containerTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">لم يتم إضافة أنواع تنكات بعد. أضفها من الإعدادات.</p>
                )}

                <Button onClick={calculatePaymentMethods} className="w-full">
                  <Calculator className="h-4 w-4 me-2" />
                  حساب طرق الدفع
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  طرق الدفع المتاحة
                </CardTitle>
                <CardDescription>اختر طريقة الدفع المناسبة للزبون</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>أدخل بيانات الإنتاج واضغط "حساب طرق الدفع"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={method.type === 'oil' ? 'default' : method.type === 'cash' ? 'secondary' : 'outline'}>
                            {method.type === 'oil' ? 'دفع بالزيت فقط' : method.type === 'cash' ? 'دفع نقدي فقط' : 'دفع مختلط'}
                          </Badge>
                          <Button size="sm" onClick={() => processInvoice(method)}>اختيار هذه الطريقة</Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          {method.oilAmount > 0 && <p>🫒 زيت: {method.oilAmount.toFixed(2)} كغم</p>}
                          {method.cashAmount > 0 && <p>💰 نقد: {method.cashAmount.toFixed(2)} شيكل</p>}
                          <p className="font-semibold text-primary">الإجمالي: {method.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل الفواتير</CardTitle>
              <CardDescription>عرض وإدارة جميع الفواتير السابقة</CardDescription>
              <div className="pt-4">
                <Input placeholder="البحث باسم الزبون..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد فواتير</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">اسم الزبون</TableHead>
                      <TableHead className="text-right">كمية الزيت</TableHead>
                      <TableHead className="text-right">التنكات</TableHead>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(inv.created_at).toLocaleDateString('ar-SA')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{inv.customer_name}</TableCell>
                        <TableCell className="text-right">{inv.oil_produced} كغم</TableCell>
                        <TableCell className="text-right">{inv.container_count} ({inv.container_type})</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={inv.payment_type === 'oil' ? 'default' : inv.payment_type === 'cash' ? 'secondary' : 'outline'}>
                            {inv.payment_type === 'oil' ? 'زيت' : inv.payment_type === 'cash' ? 'نقدي' : 'مختلط'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{inv.total_display}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
