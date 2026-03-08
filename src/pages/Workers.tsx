import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Plus, Clock, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";

interface Worker {
  id: string;
  name: string;
  type: string;
  hourly_rate: number | null;
  shift_rate: number | null;
  total_earned: number;
  total_paid: number;
}

interface WorkRecord {
  id: string;
  worker_id: string;
  hours: number | null;
  shifts: number | null;
  amount: number;
  created_at: string;
}

const Workers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { inventory, updateInventory } = useInventory();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newWorker, setNewWorker] = useState({ name: "", type: 'hourly' as 'hourly' | 'shift', rate: "" });
  const [newRecord, setNewRecord] = useState({ workerId: "", value: "" });
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    if (user) { fetchWorkers(); fetchRecords(); }
  }, [user]);

  const fetchWorkers = async () => {
    const { data } = await supabase.from("workers").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    setWorkers((data as Worker[]) || []);
    setLoading(false);
  };

  const fetchRecords = async () => {
    const { data } = await supabase.from("work_records").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    setWorkRecords((data as WorkRecord[]) || []);
  };

  const addWorker = async () => {
    if (!newWorker.name || !newWorker.rate) {
      toast({ title: "خطأ", description: "يرجى إدخال جميع البيانات", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("workers").insert({
      user_id: user!.id,
      name: newWorker.name,
      type: newWorker.type,
      hourly_rate: newWorker.type === 'hourly' ? parseFloat(newWorker.rate) : null,
      shift_rate: newWorker.type === 'shift' ? parseFloat(newWorker.rate) : null,
    });
    if (!error) {
      setNewWorker({ name: "", type: 'hourly', rate: "" });
      toast({ title: "تمت الإضافة", description: `تم إضافة العامل ${newWorker.name}` });
      fetchWorkers();
    }
  };

  const addWorkRecord = async () => {
    if (!newRecord.workerId || !newRecord.value) {
      toast({ title: "خطأ", description: "يرجى اختيار العامل وإدخال البيانات", variant: "destructive" });
      return;
    }
    const worker = workers.find(w => w.id === newRecord.workerId);
    if (!worker) return;

    let amount = 0;
    let hours: number | null = null;
    let shifts: number | null = null;

    if (worker.type === 'hourly') {
      hours = parseFloat(newRecord.value);
      amount = hours * (worker.hourly_rate || 0);
    } else {
      shifts = parseInt(newRecord.value);
      amount = shifts * (worker.shift_rate || 0);
    }

    const { error } = await supabase.from("work_records").insert({
      user_id: user!.id, worker_id: worker.id, hours, shifts, amount,
    });

    if (!error) {
      await supabase.from("workers").update({
        total_earned: worker.total_earned + amount,
      }).eq("id", worker.id);

      setNewRecord({ workerId: "", value: "" });
      toast({ title: "تم التسجيل", description: `تم تسجيل العمل للعامل ${worker.name}` });
      fetchWorkers();
      fetchRecords();
    }
  };

  const payWorker = async (workerId: string, amount: number) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || amount <= 0) return;

    const balance = worker.total_earned - worker.total_paid;
    if (amount > balance) {
      toast({ title: "خطأ", description: "المبلغ أكبر من الرصيد المستحق", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("worker_payments").insert({
      user_id: user!.id, worker_id: workerId, amount,
    });

    if (!error) {
      await supabase.from("workers").update({ total_paid: worker.total_paid + amount }).eq("id", workerId);
      await updateInventory({ total_cash: inventory.total_cash - amount });
      toast({ title: "تم الدفع", description: `تم دفع ${amount} شيكل للعامل` });
      fetchWorkers();
      setPayAmount("");
    }
  };

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);
  const selectedRecords = workRecords.filter(r => r.worker_id === selectedWorkerId);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <UserCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة العمال</h1>
      </div>

      <Tabs defaultValue="list" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">قائمة العمال</TabsTrigger>
          <TabsTrigger value="add">إضافة عامل</TabsTrigger>
          <TabsTrigger value="work">تسجيل العمل</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العمال ({workers.length})</CardTitle>
              <CardDescription>عرض وإدارة جميع العمال والحسابات</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">المكتسب</TableHead>
                      <TableHead className="text-right">المدفوع</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => {
                      const balance = worker.total_earned - worker.total_paid;
                      return (
                        <TableRow key={worker.id}>
                          <TableCell className="text-right font-medium">{worker.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={worker.type === 'hourly' ? 'default' : 'secondary'}>
                              {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {worker.type === 'hourly' ? `${worker.hourly_rate} ش/ساعة` : `${worker.shift_rate} ش/شفت`}
                          </TableCell>
                          <TableCell className="text-right">{worker.total_earned} ش</TableCell>
                          <TableCell className="text-right">{worker.total_paid} ش</TableCell>
                          <TableCell className={`text-right ${balance > 0 ? "font-semibold" : "text-muted-foreground"}`}>
                            {balance} ش
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedWorkerId(worker.id)}>التفاصيل</Button>
                              {balance > 0 && (
                                <div className="flex gap-1">
                                  <Input type="number" placeholder="مبلغ" className="w-20 h-8" value={selectedWorkerId === worker.id ? payAmount : ""} onChange={(e) => { setSelectedWorkerId(worker.id); setPayAmount(e.target.value); }} />
                                  <Button size="sm" onClick={() => payWorker(worker.id, parseFloat(payAmount) || balance)}>
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {selectedWorker && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>سجل عمل: {selectedWorker.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">العمل</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-right">{new Date(record.created_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="text-right">
                          {record.hours ? `${record.hours} ساعة` : `${record.shifts} شفت`}
                        </TableCell>
                        <TableCell className="text-right">{record.amount} ش</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />إضافة عامل جديد</CardTitle>
              <CardDescription>أضف عامل جديد وحدد نوع وسعر العمل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workerName">اسم العامل</Label>
                <Input id="workerName" value={newWorker.name} onChange={(e) => setNewWorker(p => ({ ...p, name: e.target.value }))} placeholder="اسم العامل" />
              </div>
              <div>
                <Label>نوع العامل</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="workerType" value="hourly" checked={newWorker.type === 'hourly'} onChange={() => setNewWorker(p => ({ ...p, type: 'hourly' }))} />
                    عامل بالساعة
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="workerType" value="shift" checked={newWorker.type === 'shift'} onChange={() => setNewWorker(p => ({ ...p, type: 'shift' }))} />
                    عامل بالشفت
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="rate">{newWorker.type === 'hourly' ? 'سعر الساعة (شيكل)' : 'سعر الشفت (شيكل)'}</Label>
                <Input id="rate" type="number" value={newWorker.rate} onChange={(e) => setNewWorker(p => ({ ...p, rate: e.target.value }))} placeholder={newWorker.type === 'hourly' ? 'سعر الساعة' : 'سعر الشفت'} min="0" />
              </div>
              <Button onClick={addWorker} className="w-full"><Plus className="h-4 w-4 me-2" />إضافة العامل</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />تسجيل العمل</CardTitle>
              <CardDescription>سجل ساعات أو شفتات العمل للعمال</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اختر العامل</Label>
                <select value={newRecord.workerId} onChange={(e) => setNewRecord(p => ({ ...p, workerId: e.target.value }))} className="w-full p-2 border rounded-md bg-background text-foreground">
                  <option value="">اختر العامل</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} - {w.type === 'hourly' ? 'بالساعة' : 'بالشفت'}</option>
                  ))}
                </select>
              </div>
              {newRecord.workerId && (() => {
                const w = workers.find(w => w.id === newRecord.workerId);
                if (!w) return null;
                return (
                  <div>
                    <Label>{w.type === 'hourly' ? 'عدد الساعات' : 'عدد الشفتات'}</Label>
                    <Input type="number" value={newRecord.value} onChange={(e) => setNewRecord(p => ({ ...p, value: e.target.value }))} placeholder={w.type === 'hourly' ? 'عدد الساعات' : 'عدد الشفتات'} min="0" step={w.type === 'hourly' ? '0.5' : '1'} />
                    {newRecord.value && (
                      <p className="text-sm text-muted-foreground mt-2">
                        المبلغ: {(parseFloat(newRecord.value) * (w.type === 'hourly' ? (w.hourly_rate || 0) : (w.shift_rate || 0))).toFixed(2)} شيكل
                      </p>
                    )}
                  </div>
                );
              })()}
              <Button onClick={addWorkRecord} className="w-full" disabled={!newRecord.workerId || !newRecord.value}>
                <Plus className="h-4 w-4 me-2" />تسجيل العمل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workers;
