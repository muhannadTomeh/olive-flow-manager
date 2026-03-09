import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useNavigate } from "react-router-dom";

interface QueueItem {
  id: string;
  name: string;
  phone: string | null;
  bags: number;
  notes: string | null;
  position: number;
  created_at: string;
  status: string;
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const Queue = () => {
  const [allItems, setAllItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", bags: "", notes: "" });
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSeason } = useSeason();
  const navigate = useNavigate();

  const waiting = allItems.filter(i => i.status === "waiting");
  const completed = allItems.filter(i => i.status === "completed");

  useEffect(() => {
    if (user) fetchQueue();
  }, [user]);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", user!.id)
      .eq("season_id", activeSeason!.id)
      .order("position", { ascending: true });
    setAllItems((data as QueueItem[]) || []);
    setLoading(false);
  };

  const addToQueue = async () => {
    if (!newCustomer.name || !newCustomer.bags) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم وعدد الشوالات", variant: "destructive" });
      return;
    }
    // Cumulative: always use max position from ALL items (waiting + completed)
    const maxPos = allItems.length > 0 ? Math.max(...allItems.map(q => q.position)) + 1 : 1;
    const { error } = await supabase.from("queue").insert({
      user_id: user!.id,
      season_id: activeSeason!.id,
      name: newCustomer.name,
      phone: newCustomer.phone || null,
      bags: parseInt(newCustomer.bags),
      notes: newCustomer.notes || null,
      position: maxPos,
      status: "waiting",
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

  const markCompleted = async (id: string) => {
    await supabase.from("queue").update({ status: "completed" }).eq("id", id);
    fetchQueue();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة الطابور</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add customer form */}
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

        {/* Queue + Completed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waiting queue */}
          <Card>
            <CardHeader>
              <CardTitle>الطابور ({waiting.length} زبون)</CardTitle>
              <CardDescription>قائمة الزبائن المنتظرين بترتيب الوصول</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>
              ) : waiting.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا يوجد زبائن في الطابور حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waiting.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Badge variant="default">#{customer.position}</Badge>
                        <div>
                          <h3 className="font-semibold text-foreground">{customer.name}</h3>
                          {customer.phone && <p className="text-sm text-muted-foreground">📱 {customer.phone}</p>}
                          <p className="text-sm text-muted-foreground">
                            🛍️ {customer.bags} شوال • ⏰ {formatTime(customer.created_at)}
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

          {/* Completed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                منجز ({completed.length})
              </CardTitle>
              <CardDescription>الزبائن الذين تم إنجاز خدمتهم</CardDescription>
            </CardHeader>
            <CardContent>
              {completed.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">لا يوجد زبائن منجزين بعد</p>
              ) : (
                <div className="space-y-3">
                  {completed.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">#{customer.position}</Badge>
                        <div>
                          <h3 className="font-semibold text-muted-foreground line-through">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            🛍️ {customer.bags} شوال • ⏰ {formatTime(customer.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeFromQueue(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Queue;
