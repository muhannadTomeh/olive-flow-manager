import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Plus, DollarSign, Pencil, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
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
  notes: string | null;
  created_at: string;
}

const Workers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { inventory, updateInventory } = useInventory();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: "", type: 'hourly' as 'hourly' | 'shift', rate: "" });
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editWorker, setEditWorker] = useState({ name: "", type: 'hourly' as 'hourly' | 'shift', rate: "" });
  const [payingWorkerId, setPayingWorkerId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  
  // Work registration state
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [workValue, setWorkValue] = useState("");
  const [workNotes, setWorkNotes] = useState("");

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
      setAddDialogOpen(false);
      toast({ title: "تمت الإضافة", description: `تم إضافة العامل ${newWorker.name}` });
      fetchWorkers();
    }
  };

  const updateWorkerDetails = async (workerId: string) => {
    if (!editWorker.name || !editWorker.rate) {
      toast({ title: "خطأ", description: "يرجى إدخال جميع البيانات", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("workers").update({
      name: editWorker.name,
      type: editWorker.type,
      hourly_rate: editWorker.type === 'hourly' ? parseFloat(editWorker.rate) : null,
      shift_rate: editWorker.type === 'shift' ? parseFloat(editWorker.rate) : null,
    }).eq("id", workerId);
    if (!error) {
      setEditingWorkerId(null);
      toast({ title: "تم التحديث", description: "تم تحديث بيانات العامل" });
      fetchWorkers();
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
      setPayingWorkerId(null);
    }
  };

  const registerWork = async () => {
    if (!selectedWorkerId || !workValue || parseFloat(workValue) <= 0) {
      toast({ title: "خطأ", description: "يرجى اختيار العامل وإدخال القيمة", variant: "destructive" });
      return;
    }

    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    const val = parseFloat(workValue);
    const amount = worker.type === 'hourly'
      ? val * (worker.hourly_rate || 0)
      : val * (worker.shift_rate || 0);

    const record: any = {
      user_id: user!.id,
      worker_id: selectedWorkerId,
      amount,
      notes: workNotes.trim() || null,
    };
    if (worker.type === 'hourly') {
      record.hours = val;
    } else {
      record.shifts = val;
    }

    const { error } = await supabase.from("work_records").insert(record);
    if (!error) {
      await supabase.from("workers").update({ total_earned: worker.total_earned + amount }).eq("id", selectedWorkerId);
      toast({ title: "تم التسجيل", description: `تم تسجيل ${val} ${worker.type === 'hourly' ? 'ساعة' : 'شفت'} للعامل ${worker.name} (${amount} ش)` });
      setWorkValue("");
      setWorkNotes("");
      fetchWorkers();
      fetchRecords();
    }
  };

  const startEdit = (worker: Worker) => {
    setEditWorker({
      name: worker.name,
      type: worker.type as 'hourly' | 'shift',
      rate: String(worker.type === 'hourly' ? worker.hourly_rate || 0 : worker.shift_rate || 0),
    });
    setEditingWorkerId(worker.id);
  };

  const selectedWorkerForReg = workers.find(w => w.id === selectedWorkerId);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">إدارة العمال</h1>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 me-2" />إضافة عامل</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عامل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" dir="rtl">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="list">قائمة العمال</TabsTrigger>
          <TabsTrigger value="register">تسجيل العمل</TabsTrigger>
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
              ) : workers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا يوجد عمال. أضف عاملاً جديداً.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                      <TableHead className="text-right">التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => {
                      const balance = worker.total_earned - worker.total_paid;
                      const isExpanded = expandedWorkerId === worker.id;
                      const workerRecords = workRecords.filter(r => r.worker_id === worker.id);

                      return (
                        <>
                          <TableRow key={worker.id}>
                            <TableCell className="text-right font-medium">{worker.name}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={worker.type === 'hourly' ? 'default' : 'secondary'}>
                                {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEdit(worker)}>
                                  <Pencil className="h-3 w-3 me-1" />تعديل
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setPayingWorkerId(payingWorkerId === worker.id ? null : worker.id)}>
                                  <DollarSign className="h-3 w-3 me-1" />دفعة
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" onClick={() => setExpandedWorkerId(isExpanded ? null : worker.id)}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>

                          {editingWorkerId === worker.id && (
                            <TableRow key={`edit-${worker.id}`}>
                              <TableCell colSpan={4}>
                                <div className="flex flex-wrap gap-3 items-end p-3 bg-muted/50 rounded-lg">
                                  <div>
                                    <Label className="text-xs">الاسم</Label>
                                    <Input value={editWorker.name} onChange={(e) => setEditWorker(p => ({ ...p, name: e.target.value }))} className="w-32 h-8" />
                                  </div>
                                  <div>
                                    <Label className="text-xs">النوع</Label>
                                    <select value={editWorker.type} onChange={(e) => setEditWorker(p => ({ ...p, type: e.target.value as 'hourly' | 'shift' }))} className="w-28 h-8 p-1 border rounded-md bg-background text-foreground text-sm">
                                      <option value="hourly">بالساعة</option>
                                      <option value="shift">بالشفت</option>
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">{editWorker.type === 'hourly' ? 'سعر الساعة' : 'سعر الشفت'}</Label>
                                    <Input type="number" value={editWorker.rate} onChange={(e) => setEditWorker(p => ({ ...p, rate: e.target.value }))} className="w-24 h-8" min="0" />
                                  </div>
                                  <Button size="sm" onClick={() => updateWorkerDetails(worker.id)}>حفظ</Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingWorkerId(null)}>إلغاء</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {payingWorkerId === worker.id && (
                            <TableRow key={`pay-${worker.id}`}>
                              <TableCell colSpan={4}>
                                <div className="flex flex-wrap gap-3 items-end p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm text-muted-foreground">المتبقي: <span className="font-semibold text-foreground">{balance} ش</span></p>
                                  <Input type="number" placeholder="مبلغ الدفعة" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-32 h-8" min="0" max={balance} />
                                  <Button size="sm" onClick={() => payWorker(worker.id, parseFloat(payAmount) || 0)} disabled={!payAmount || parseFloat(payAmount) <= 0}>
                                    <DollarSign className="h-3 w-3 me-1" />دفع
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => payWorker(worker.id, balance)} disabled={balance <= 0}>دفع الكل</Button>
                                  <Button size="sm" variant="ghost" onClick={() => { setPayingWorkerId(null); setPayAmount(""); }}>إلغاء</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {isExpanded && (
                            <TableRow key={`details-${worker.id}`}>
                              <TableCell colSpan={4}>
                                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                      <p className="text-xs text-muted-foreground">المستحق</p>
                                      <p className="text-lg font-bold text-foreground">{worker.total_earned} ش</p>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                      <p className="text-xs text-muted-foreground">المدفوع</p>
                                      <p className="text-lg font-bold text-foreground">{worker.total_paid} ش</p>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                      <p className="text-xs text-muted-foreground">المتبقي</p>
                                      <p className={`text-lg font-bold ${balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{balance} ش</p>
                                    </div>
                                  </div>
                                  {workerRecords.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">سجل العمل</p>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-right">التاريخ</TableHead>
                                            <TableHead className="text-right">العمل</TableHead>
                                            <TableHead className="text-right">المبلغ</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {workerRecords.map((record) => (
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
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                تسجيل العمل
              </CardTitle>
              <CardDescription>تسجيل ساعات أو شفتات العمل للعمال</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا يوجد عمال. أضف عاملاً أولاً.</p>
              ) : (
                <>
                  <div>
                    <Label>اختر العامل</Label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => { setSelectedWorkerId(e.target.value); setWorkValue(""); }}
                      className="w-full h-10 p-2 border rounded-md bg-background text-foreground mt-1"
                    >
                      <option value="">-- اختر عامل --</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.type === 'hourly' ? 'بالساعة' : 'بالشفت'})</option>
                      ))}
                    </select>
                  </div>

                  {selectedWorkerForReg && (
                    <>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p>النوع: <Badge variant={selectedWorkerForReg.type === 'hourly' ? 'default' : 'secondary'}>{selectedWorkerForReg.type === 'hourly' ? 'بالساعة' : 'بالشفت'}</Badge></p>
                        <p className="mt-1">الأجر: <span className="font-semibold">{selectedWorkerForReg.type === 'hourly' ? selectedWorkerForReg.hourly_rate : selectedWorkerForReg.shift_rate} ش/{selectedWorkerForReg.type === 'hourly' ? 'ساعة' : 'شفت'}</span></p>
                      </div>

                      <div>
                        <Label>{selectedWorkerForReg.type === 'hourly' ? 'عدد الساعات' : 'عدد الشفتات'}</Label>
                        <Input
                          type="number"
                          value={workValue}
                          onChange={(e) => setWorkValue(e.target.value)}
                          placeholder={selectedWorkerForReg.type === 'hourly' ? 'أدخل عدد الساعات' : 'أدخل عدد الشفتات'}
                          min="0"
                          step="0.5"
                        />
                      </div>

                      {workValue && parseFloat(workValue) > 0 && (
                        <div className="p-3 bg-primary/10 rounded-lg text-sm">
                          <p>المبلغ المحسوب: <span className="font-bold text-primary">
                            {(parseFloat(workValue) * (selectedWorkerForReg.type === 'hourly' ? (selectedWorkerForReg.hourly_rate || 0) : (selectedWorkerForReg.shift_rate || 0))).toFixed(2)} ش
                          </span></p>
                        </div>
                      )}

                      <div>
                        <Label>ملاحظات (اختياري)</Label>
                        <Input
                          value={workNotes}
                          onChange={(e) => setWorkNotes(e.target.value)}
                          placeholder="أضف ملاحظة..."
                        />
                      </div>

                      <Button onClick={registerWork} className="w-full" disabled={!workValue || parseFloat(workValue) <= 0}>
                        <ClipboardList className="h-4 w-4 me-2" />تسجيل العمل
                      </Button>
                    </>
                  )}

                  {/* Recent records */}
                  {workRecords.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-2">آخر التسجيلات</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                             <TableHead className="text-right">العامل</TableHead>
                             <TableHead className="text-right">العمل</TableHead>
                             <TableHead className="text-right">المبلغ</TableHead>
                             <TableHead className="text-right">ملاحظات</TableHead>
                             <TableHead className="text-right">التاريخ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workRecords.slice(0, 10).map((record) => {
                            const w = workers.find(x => x.id === record.worker_id);
                            return (
                              <TableRow key={record.id}>
                                <TableCell className="text-right font-medium">{w?.name || '—'}</TableCell>
                                <TableCell className="text-right">
                                  {record.hours ? `${record.hours} ساعة` : `${record.shifts} شفت`}
                                </TableCell>
                                <TableCell className="text-right">{record.amount} ش</TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">{record.notes || '—'}</TableCell>
                                <TableCell className="text-right">{new Date(record.created_at).toLocaleDateString('ar-SA')}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workers;
