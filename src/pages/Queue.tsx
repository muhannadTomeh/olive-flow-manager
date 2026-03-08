import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface QueueItem {
  id: string;
  name: string;
  phone: string | null;
  bags: number;
  notes: string | null;
  position: number;
  created_at: string;
}

const Queue = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", bags: "", notes: "" });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchQueue();
  }, [user]);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", user!.id)
      .order("position", { ascending: true });
    setQueue((data as QueueItem[]) || []);
    setLoading(false);
  };

  const addToQueue = async () => {
    if (!newCustomer.name || !newCustomer.bags) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم وعدد الشوالات", variant: "destructive" });
      return;
    }
    const maxPos = queue.length > 0 ? Math.max(...queue.map(q => q.position)) + 1 : 0;
    const { error } = await supabase.from("queue").insert({
      user_id: user!.id,
      name: newCustomer.name,
      phone: newCustomer.phone || null,
      bags: parseInt(newCustomer.bags),
      notes: newCustomer.notes || null,
      position: maxPos,
    });
    if (!error) {
      setNewCustomer({ name: "", phone: "", bags: "", notes: "" });
      toast({ title: "تمت الإضافة", description: `تم إضافة ${newCustomer.name} إلى الطابور` });
      fetchQueue();
    }
  };

  const removeFromQueue = async (id: string) => {
    await supabase.from("queue").delete().eq("id", id);
    toast({ title: "تم الحذف", description: "تم حذف الزبون من الطابور" });
    fetchQueue();
  };

  const moveToInvoice = (customer: QueueItem) => {
    navigate("/invoices", { state: { customerName: customer.name, customerPhone: customer.phone, queueId: customer.id } });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة الطابور</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة زبون جديد
            </CardTitle>
            <CardDescription>أدخل بيانات الزبون لإضافته إلى الطابور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="اسم الزبون" />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف (اختياري)" />
            </div>
            <div>
              <Label htmlFor="bags">عدد الشوالات *</Label>
              <Input id="bags" type="number" value={newCustomer.bags} onChange={(e) => setNewCustomer(p => ({ ...p, bags: e.target.value }))} placeholder="عدد الشوالات" min="1" />
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" value={newCustomer.notes} onChange={(e) => setNewCustomer(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات إضافية (اختياري)" rows={3} />
            </div>
            <Button onClick={addToQueue} className="w-full">
              <UserPlus className="h-4 w-4 me-2" />
              إضافة إلى الطابور
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الطابور الحالي ({queue.length} زبون)</CardTitle>
            <CardDescription>قائمة الزبائن المنتظرين بترتيب الوصول</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا يوجد زبائن في الطابور حالياً</p>
                <p className="text-sm">أضف زبوناً جديداً للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                      <div>
                        <h3 className="font-semibold text-foreground">{customer.name}</h3>
                        {customer.phone && <p className="text-sm text-muted-foreground">📱 {customer.phone}</p>}
                        <p className="text-sm text-muted-foreground">
                          🛍️ {customer.bags} شوال • ⏰ {new Date(customer.created_at).toLocaleTimeString('ar-SA')}
                        </p>
                        {customer.notes && <p className="text-sm text-muted-foreground mt-1">📝 {customer.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => moveToInvoice(customer)} className="bg-primary hover:bg-primary/90">
                        <ArrowLeft className="h-4 w-4 me-1" />
                        إلى الفاتورة
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeFromQueue(customer.id)}>
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
