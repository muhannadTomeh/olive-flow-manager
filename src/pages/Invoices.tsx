import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Calculator, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// إعدادات النظام الافتراضية
const SYSTEM_SETTINGS = {
  returnPercent: 6, // نسبة الرد
  oilSellPrice: 25, // سعر بيع الزيت
  oilBuyPrice: 23, // سعر شراء الزيت
  cashReturnCost: 1.5, // تكلفة الرد نقداً
  plasticContainerPrice: 10, // سعر الجلان البلاستيكي
  metalContainerPrice: 15, // سعر الجلان الحديدي
};

interface InvoiceData {
  customerName: string;
  oilProduced: number;
  containerCount: number;
  containerType: 'plastic' | 'metal';
}

interface PaymentMethod {
  type: 'oil' | 'cash' | 'mixed';
  oilAmount: number;
  cashAmount: number;
  total: string;
}

const Invoices = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    customerName: "",
    oilProduced: 0,
    containerCount: 0,
    containerType: 'plastic'
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { toast } = useToast();

  const calculatePaymentMethods = () => {
    if (!invoiceData.oilProduced || !invoiceData.containerCount) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كمية الزيت وعدد التنكات",
        variant: "destructive",
      });
      return;
    }

    const { oilProduced, containerCount, containerType } = invoiceData;
    const containerPrice = containerType === 'plastic' 
      ? SYSTEM_SETTINGS.plasticContainerPrice 
      : SYSTEM_SETTINGS.metalContainerPrice;

    // طريقة الدفع بالزيت فقط
    const oilReturn = (oilProduced * SYSTEM_SETTINGS.returnPercent) / 100;
    const containerReturnInOil = (containerCount * containerPrice) / SYSTEM_SETTINGS.oilBuyPrice;
    const totalOilPayment = oilReturn + containerReturnInOil;

    // طريقة الدفع نقداً فقط
    const cashReturn = oilProduced * SYSTEM_SETTINGS.cashReturnCost;
    const containerReturnCash = containerCount * containerPrice;
    const totalCashPayment = cashReturn + containerReturnCash;

    // طريقة الدفع المختلط
    const mixedOilReturn = oilReturn;
    const mixedCashReturn = containerReturnCash;

    const methods: PaymentMethod[] = [
      {
        type: 'oil',
        oilAmount: totalOilPayment,
        cashAmount: 0,
        total: `${totalOilPayment.toFixed(2)} كغم زيت`
      },
      {
        type: 'cash',
        oilAmount: 0,
        cashAmount: totalCashPayment,
        total: `${totalCashPayment.toFixed(2)} شيكل`
      },
      {
        type: 'mixed',
        oilAmount: mixedOilReturn,
        cashAmount: mixedCashReturn,
        total: `${mixedOilReturn.toFixed(2)} كغم زيت + ${mixedCashReturn.toFixed(2)} شيكل`
      }
    ];

    setPaymentMethods(methods);
    toast({
      title: "تم الحساب",
      description: "تم حساب طرق الدفع الثلاثة",
    });
  };

  const processInvoice = (paymentMethod: PaymentMethod) => {
    toast({
      title: "تمت معالجة الفاتورة",
      description: `تم إنشاء فاتورة لـ ${invoiceData.customerName}`,
    });
    
    // إعادة تعيين النموذج
    setInvoiceData({
      customerName: "",
      oilProduced: 0,
      containerCount: 0,
      containerType: 'plastic'
    });
    setPaymentMethods([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة الفواتير</h1>
      </div>

      <Tabs defaultValue="create" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">إنشاء فاتورة جديدة</TabsTrigger>
          <TabsTrigger value="history">سجل الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* إدخال البيانات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  بيانات الفاتورة
                </CardTitle>
                <CardDescription>
                  أدخل بيانات الإنتاج لحساب الفاتورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">اسم الزبون</Label>
                  <Input
                    id="customerName"
                    value={invoiceData.customerName}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="اسم الزبون"
                  />
                </div>

                <div>
                  <Label htmlFor="oilProduced">كمية الزيت المنتج (كغم)</Label>
                  <Input
                    id="oilProduced"
                    type="number"
                    value={invoiceData.oilProduced || ""}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, oilProduced: parseFloat(e.target.value) || 0 }))}
                    placeholder="كمية الزيت بالكيلوغرام"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label htmlFor="containerCount">عدد التنكات</Label>
                  <Input
                    id="containerCount"
                    type="number"
                    value={invoiceData.containerCount || ""}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, containerCount: parseInt(e.target.value) || 0 }))}
                    placeholder="عدد التنكات"
                    min="0"
                  />
                </div>

                <div>
                  <Label>نوع التنكة</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="containerType"
                        value="plastic"
                        checked={invoiceData.containerType === 'plastic'}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, containerType: e.target.value as 'plastic' | 'metal' }))}
                      />
                      بلاستيك ({SYSTEM_SETTINGS.plasticContainerPrice} شيكل)
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="containerType"
                        value="metal"
                        checked={invoiceData.containerType === 'metal'}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, containerType: e.target.value as 'plastic' | 'metal' }))}
                      />
                      حديد ({SYSTEM_SETTINGS.metalContainerPrice} شيكل)
                    </label>
                  </div>
                </div>

                <Button onClick={calculatePaymentMethods} className="w-full">
                  <Calculator className="h-4 w-4 ml-2" />
                  حساب طرق الدفع
                </Button>
              </CardContent>
            </Card>

            {/* طرق الدفع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  طرق الدفع المتاحة
                </CardTitle>
                <CardDescription>
                  اختر طريقة الدفع المناسبة للزبون
                </CardDescription>
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
                            {method.type === 'oil' ? 'دفع بالزيت فقط' : 
                             method.type === 'cash' ? 'دفع نقدي فقط' : 'دفع مختلط'}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => processInvoice(method)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            اختيار هذه الطريقة
                          </Button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {method.oilAmount > 0 && (
                            <p>🫒 زيت: {method.oilAmount.toFixed(2)} كغم</p>
                          )}
                          {method.cashAmount > 0 && (
                            <p>💰 نقد: {method.cashAmount.toFixed(2)} شيكل</p>
                          )}
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
              <CardDescription>
                عرض وإدارة جميع الفواتير السابقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد فواتير بعد</p>
                <p className="text-sm">ستظهر الفواتير هنا بعد إنشائها</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;