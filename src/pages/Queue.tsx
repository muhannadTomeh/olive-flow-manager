import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, ArrowRight, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueueCustomer {
  id: string;
  name: string;
  phone?: string;
  bags: number;
  addedAt: Date;
  notes?: string;
}

const Queue = () => {
  const [queue, setQueue] = useState<QueueCustomer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    bags: "",
    notes: ""
  });
  const { toast } = useToast();

  const addToQueue = () => {
    if (!newCustomer.name || !newCustomer.bags) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الاسم وعدد الشوالات",
        variant: "destructive",
      });
      return;
    }

    const customer: QueueCustomer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone || undefined,
      bags: parseInt(newCustomer.bags),
      addedAt: new Date(),
      notes: newCustomer.notes || undefined,
    };

    setQueue(prev => [...prev, customer]);
    setNewCustomer({ name: "", phone: "", bags: "", notes: "" });
    
    toast({
      title: "تمت الإضافة",
      description: `تم إضافة ${customer.name} إلى الطابور`,
    });
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(c => c.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف الزبون من الطابور",
    });
  };

  const moveToInvoice = (customer: QueueCustomer) => {
    // هنا سننتقل إلى صفحة الفاتورة مع بيانات الزبون
    removeFromQueue(customer.id);
    toast({
      title: "نقل إلى الفاتورة",
      description: `تم نقل ${customer.name} إلى حساب الفاتورة`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة الطابور</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إضافة زبون جديد */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة زبون جديد
            </CardTitle>
            <CardDescription>
              أدخل بيانات الزبون لإضافته إلى الطابور
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم الزبون"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="رقم الهاتف (اختياري)"
              />
            </div>
            
            <div>
              <Label htmlFor="bags">عدد الشوالات *</Label>
              <Input
                id="bags"
                type="number"
                value={newCustomer.bags}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, bags: e.target.value }))}
                placeholder="عدد الشوالات"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ملاحظات إضافية (اختياري)"
                rows={3}
              />
            </div>
            
            <Button onClick={addToQueue} className="w-full">
              <UserPlus className="h-4 w-4 me-2" />
              إضافة إلى الطابور
            </Button>
          </CardContent>
        </Card>

        {/* قائمة الطابور */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الطابور الحالي ({queue.length} زبون)</CardTitle>
            <CardDescription>
              قائمة الزبائن المنتظرين بترتيب الوصول
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا يوجد زبائن في الطابور حالياً</p>
                <p className="text-sm">أضف زبوناً جديداً للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-foreground">{customer.name}</h3>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">📱 {customer.phone}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          🛍️ {customer.bags} شوال • ⏰ {customer.addedAt.toLocaleTimeString('ar-SA')}
                        </p>
                        {customer.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📝 {customer.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Button
                          onClick={() => moveToInvoice(customer)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ArrowRight className="h-4 w-4 me-1" />
                          إلى الفاتورة
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromQueue(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Queue;