import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock, UserPlus, Trash2, CheckCircle, Monitor, Play, Receipt,
  ChevronDown, Pause, Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { QuickInvoiceSheet } from "@/components/queue/QuickInvoiceSheet";

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
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const Queue = () => {
  const [allItems, setAllItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", bags: "", notes: "", estimatedMinutes: "" });
  const [showExtra, setShowExtra] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] = useState<QueueItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QueueItem | null>(null);
  const [postponeTarget, setPostponeTarget] = useState<QueueItem | null>(null);
  const [postponePosition, setPostponePosition] = useState<string>("");
  const { user } = useAuth();
  const { activeSeason } = useSeason();

  const processing = allItems.find((i) => i.status === "processing");
  const waiting = allItems.filter((i) => i.status === "waiting");
  const completed = allItems.filter((i) => i.status === "completed");

  useEffect(() => {
    if (user && activeSeason) fetchQueue();
  }, [user, activeSeason]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !activeSeason) return;
    const channel = supabase
      .channel("queue-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue", filter: `season_id=eq.${activeSeason.id}` },
        () => fetchQueue()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeSeason]);

  const fetchQueue = async () => {
    if (!user || !activeSeason) return;
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", user.id)
      .eq("season_id", activeSeason.id)
      .order("position", { ascending: true });
    setAllItems((data as QueueItem[]) || []);
    setLoading(false);
  };

  const addToQueue = async () => {
    if (!newCustomer.name || !newCustomer.bags) {
      toast.error("يرجى إدخال الاسم وعدد الشوالات");
      return;
    }
    const maxPos = allItems.length > 0 ? Math.max(...allItems.map((q) => q.position)) + 1 : 1;
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
      setNewCustomer({ name: "", phone: "", bags: "", notes: "", estimatedMinutes: "" });
      setShowExtra(false);
      setDialogOpen(false);
      toast.success(`تم إضافة ${newCustomer.name} إلى الطابور`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("queue").delete().eq("id", deleteTarget.id);
    toast.success("تم حذف الزبون من الطابور");
    setDeleteTarget(null);
  };

  const startProcessing = async (id: string) => {
    await supabase.from("queue").update({ status: "processing" }).eq("id", id);
    toast.success("تم بدء العصر");
  };

  const startNext = async () => {
    if (waiting.length === 0) return;
    await startProcessing(waiting[0].id);
  };

  const openInvoiceFor = (customer: QueueItem) => {
    setSelectedForInvoice(customer);
    setInvoiceSheetOpen(true);
  };

  const confirmPostpone = async () => {
    if (!postponeTarget || !postponePosition) return;
    const targetPos = parseInt(postponePosition);
    if (isNaN(targetPos)) return;

    // shift positions and reassign
    const others = waiting.filter((w) => w.id !== postponeTarget.id);
    const currentPos = postponeTarget.position;

    // simple approach: set the postponed item to maxPos + targetPos - 0.5 trick? Use integer reordering.
    // Reorder: insert at index (targetPos-1) in others array
    const insertIdx = Math.min(Math.max(targetPos - 1, 0), others.length);
    const newOrder = [...others];
    newOrder.splice(insertIdx, 0, postponeTarget);

    // Reassign positions starting from min waiting position
    const startPos = Math.min(...waiting.map((w) => w.position));
    for (let i = 0; i < newOrder.length; i++) {
      const item = newOrder[i];
      const newPos = startPos + i;
      if (item.position !== newPos) {
        await supabase.from("queue").update({ position: newPos }).eq("id", item.id);
      }
    }

    // If postponed item was processing, set back to waiting
    if (postponeTarget.status === "processing") {
      await supabase.from("queue").update({ status: "waiting" }).eq("id", postponeTarget.id);
    }

    toast.success("تم تأجيل الدور");
    setPostponeTarget(null);
    setPostponePosition("");
  };

  const openDisplay = () => {
    if (activeSeason) {
      window.open(`/display/${activeSeason.id}`, "_blank", "fullscreen=yes");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الطابور</h1>
            <p className="text-sm text-muted-foreground">
              {waiting.length} منتظر • {completed.length} منجز
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <UserPlus className="h-5 w-5 me-2" />
                إضافة زبون
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة زبون جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                    placeholder="اسم الزبون"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="bags">عدد الشوالات *</Label>
                  <Input
                    id="bags"
                    type="number"
                    value={newCustomer.bags}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, bags: e.target.value }))}
                    placeholder="عدد الشوالات"
                    min="1"
                  />
                </div>

                <Collapsible open={showExtra} onOpenChange={setShowExtra}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      تفاصيل إضافية
                      <ChevronDown className={`h-4 w-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="اختياري"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedMinutes">الوقت التقديري (دقائق)</Label>
                      <Input
                        id="estimatedMinutes"
                        type="number"
                        value={newCustomer.estimatedMinutes}
                        onChange={(e) => setNewCustomer((p) => ({ ...p, estimatedMinutes: e.target.value }))}
                        placeholder="اختياري"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">ملاحظات</Label>
                      <Textarea
                        id="notes"
                        value={newCustomer.notes}
                        onChange={(e) => setNewCustomer((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="ملاحظات إضافية"
                        rows={2}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button onClick={addToQueue} className="w-full" size="lg">
                  <UserPlus className="h-4 w-4 me-2" />
                  إضافة إلى الطابور
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {activeSeason && (
            <Button variant="outline" onClick={openDisplay}>
              <Monitor className="h-4 w-4 me-2" />
              شاشة العرض
            </Button>
          )}
        </div>
      </div>

      {/* Two-column operations layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RIGHT (first in RTL): Currently Processing */}
        <Card
          className={
            processing
              ? "border-2 border-primary/50 bg-primary/5"
              : "border-dashed border-2 border-muted bg-muted/20"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className={`h-5 w-5 ${processing ? "text-primary" : "text-muted-foreground"}`} />
              قيد العصر
            </CardTitle>
            <CardDescription>
              {processing ? "الزبون الحالي قيد العصر" : "لا يوجد زبون قيد العصر"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {processing ? (
              <>
                <div className="flex items-center gap-4 rounded-xl bg-background p-4 border">
                  <Badge className="bg-primary text-primary-foreground text-2xl px-4 py-2 font-bold">
                    #{processing.position}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-foreground truncate">{processing.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      🛍️ {processing.bags} شوال • ⏰ {formatTime(processing.created_at)}
                    </p>
                    {processing.notes && (
                      <p className="text-xs text-muted-foreground mt-1">📝 {processing.notes}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="lg"
                    className="h-14 text-base"
                    onClick={() => openInvoiceFor(processing)}
                  >
                    <Calculator className="h-5 w-5 me-2" />
                    حساب وفاتورة
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 text-base"
                    onClick={() => {
                      setPostponeTarget(processing);
                      setPostponePosition(String(Math.min(waiting.length + 1, 3)));
                    }}
                  >
                    <Pause className="h-5 w-5 me-2" />
                    تأجيل
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">اضغط "ابدأ التالي" لبدء عصر أول زبون</p>
                <Button size="lg" onClick={startNext} disabled={waiting.length === 0}>
                  <Play className="h-4 w-4 me-2" />
                  ابدأ التالي
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LEFT: Waiting queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>الطابور المنتظر ({waiting.length})</CardTitle>
              <CardDescription>بترتيب الوصول</CardDescription>
            </div>
            {!processing && waiting.length > 0 && (
              <Button onClick={startNext} size="sm">
                <Play className="h-4 w-4 me-1" />
                ابدأ التالي
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>
            ) : waiting.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>لا يوجد زبائن في الطابور</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {waiting.map((customer, idx) => (
                  <div
                    key={customer.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      idx === 0 ? "bg-primary/5 border-primary/30" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge
                        variant={idx === 0 ? "default" : "secondary"}
                        className="text-base font-bold shrink-0"
                      >
                        #{customer.position}
                      </Badge>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          🛍️ {customer.bags} شوال • {formatTime(customer.created_at)}
                          {customer.phone && ` • ${customer.phone}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!processing && idx === 0 && (
                        <Button size="sm" onClick={() => startProcessing(customer.id)}>
                          <Play className="h-3.5 w-3.5 me-1" />
                          ابدأ
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openInvoiceFor(customer)}
                        title="فاتورة سريعة"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(customer)}
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

      {/* Completed (compact) */}
      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              منجز اليوم ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {completed.map((c) => (
                <Badge key={c.id} variant="outline" className="text-sm py-1 px-3 line-through opacity-70">
                  #{c.position} {c.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Sheet */}
      <QuickInvoiceSheet
        open={invoiceSheetOpen}
        onOpenChange={setInvoiceSheetOpen}
        customer={selectedForInvoice}
        onCompleted={() => {
          setSelectedForInvoice(null);
          fetchQueue();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف <strong>{deleteTarget?.name}</strong> من الطابور؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Postpone Dialog */}
      <AlertDialog open={!!postponeTarget} onOpenChange={(o) => !o && setPostponeTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأجيل الدور</AlertDialogTitle>
            <AlertDialogDescription>
              إلى أي مكان في الطابور تريد نقل <strong>{postponeTarget?.name}</strong>؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>المكان الجديد</Label>
            <Select value={postponePosition} onValueChange={setPostponePosition}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المكان" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.max(waiting.length, 1) }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    المكان {n}
                  </SelectItem>
                ))}
                <SelectItem value={String(waiting.length + 1)}>
                  في النهاية
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPostpone}>تأجيل</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Queue;
