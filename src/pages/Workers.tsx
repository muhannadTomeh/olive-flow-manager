import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Plus, Clock, DollarSign, Calculator, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  type: 'hourly' | 'shift';
  hourlyRate?: number;
  shiftRate?: number;
  totalEarned: number;
  totalPaid: number;
  balance: number;
  lastWorked: Date;
}

interface WorkRecord {
  id: string;
  workerId: string;
  date: Date;
  hours?: number;
  shifts?: number;
  amount: number;
  isPaid: boolean;
}

const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: "1",
      name: "محمد أحمد",
      type: 'hourly',
      hourlyRate: 25,
      totalEarned: 1200,
      totalPaid: 1000,
      balance: 200,
      lastWorked: new Date("2024-01-15")
    },
    {
      id: "2",
      name: "أحمد محمود",
      type: 'shift',
      shiftRate: 150,
      totalEarned: 2250,
      totalPaid: 2000,
      balance: 250,
      lastWorked: new Date("2024-01-20")
    }
  ]);

  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([
    {
      id: "1",
      workerId: "1",
      date: new Date("2024-01-15"),
      hours: 8,
      amount: 200,
      isPaid: true
    },
    {
      id: "2",
      workerId: "2",
      date: new Date("2024-01-20"),
      shifts: 1,
      amount: 150,
      isPaid: false
    }
  ]);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [newWorker, setNewWorker] = useState({
    name: "",
    type: 'hourly' as 'hourly' | 'shift',
    rate: ""
  });
  const [newRecord, setNewRecord] = useState({
    workerId: "",
    hours: "",
    shifts: "",
    amount: ""
  });

  const { toast } = useToast();

  const addWorker = () => {
    if (!newWorker.name || !newWorker.rate) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const worker: Worker = {
      id: Date.now().toString(),
      name: newWorker.name,
      type: newWorker.type,
      ...(newWorker.type === 'hourly' 
        ? { hourlyRate: parseFloat(newWorker.rate) }
        : { shiftRate: parseFloat(newWorker.rate) }
      ),
      totalEarned: 0,
      totalPaid: 0,
      balance: 0,
      lastWorked: new Date()
    };

    setWorkers(prev => [...prev, worker]);
    setNewWorker({ name: "", type: 'hourly', rate: "" });
    
    toast({
      title: "تمت الإضافة",
      description: `تم إضافة العامل ${worker.name} بنجاح`,
    });
  };

  const addWorkRecord = () => {
    if (!newRecord.workerId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار العامل",
        variant: "destructive",
      });
      return;
    }

    const worker = workers.find(w => w.id === newRecord.workerId);
    if (!worker) return;

    let amount = 0;
    let recordData: Partial<WorkRecord> = {};

    if (worker.type === 'hourly') {
      if (!newRecord.hours) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال عدد الساعات",
          variant: "destructive",
        });
        return;
      }
      const hours = parseFloat(newRecord.hours);
      amount = hours * (worker.hourlyRate || 0);
      recordData = { hours };
    } else {
      if (!newRecord.shifts) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال عدد الشفتات",
          variant: "destructive",
        });
        return;
      }
      const shifts = parseInt(newRecord.shifts);
      amount = shifts * (worker.shiftRate || 0);
      recordData = { shifts };
    }

    const record: WorkRecord = {
      id: Date.now().toString(),
      workerId: newRecord.workerId,
      date: new Date(),
      amount,
      isPaid: false,
      ...recordData
    };

    setWorkRecords(prev => [...prev, record]);
    
    // تحديث رصيد العامل
    setWorkers(prev => prev.map(w => 
      w.id === newRecord.workerId
        ? { 
            ...w, 
            totalEarned: w.totalEarned + amount,
            balance: w.balance + amount,
            lastWorked: new Date()
          }
        : w
    ));

    setNewRecord({ workerId: "", hours: "", shifts: "", amount: "" });
    
    toast({
      title: "تم التسجيل",
      description: `تم تسجيل العمل للعامل ${worker.name}`,
    });
  };

  const payWorker = (workerId: string, amount: number) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId
        ? {
            ...w,
            totalPaid: w.totalPaid + amount,
            balance: w.balance - amount
          }
        : w
    ));

    toast({
      title: "تم الدفع",
      description: `تم دفع ${amount} شيكل للعامل`,
    });
  };

  const getWorkerRecords = (workerId: string) => {
    return workRecords.filter(record => record.workerId === workerId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة العمال</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">قائمة العمال</TabsTrigger>
          <TabsTrigger value="add">إضافة عامل</TabsTrigger>
          <TabsTrigger value="work">تسجيل العمل</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>قائمة العمال ({workers.length})</CardTitle>
                <CardDescription>
                  عرض وإدارة جميع العمال والحسابات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>نوع العامل</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المكتسب</TableHead>
                      <TableHead>المدفوع</TableHead>
                      <TableHead>الرصيد</TableHead>
                      <TableHead>آخر عمل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell>
                          <Badge variant={worker.type === 'hourly' ? 'default' : 'secondary'}>
                            {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {worker.type === 'hourly' 
                            ? `${worker.hourlyRate} شيكل/ساعة`
                            : `${worker.shiftRate} شيكل/شفت`
                          }
                        </TableCell>
                        <TableCell className="text-green-600">{worker.totalEarned} شيكل</TableCell>
                        <TableCell className="text-blue-600">{worker.totalPaid} شيكل</TableCell>
                        <TableCell className={worker.balance > 0 ? "text-orange-600 font-semibold" : "text-muted-foreground"}>
                          {worker.balance} شيكل
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {worker.lastWorked.toLocaleDateString('ar-SA')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWorker(worker)}
                            >
                              التفاصيل
                            </Button>
                            {worker.balance > 0 && (
                              <Button
                                size="sm"
                                onClick={() => payWorker(worker.id, worker.balance)}
                              >
                                <DollarSign className="h-4 w-4 ml-1" />
                                دفع
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {selectedWorker && (
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل العامل: {selectedWorker.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedWorker.totalEarned}</div>
                          <p className="text-sm text-muted-foreground">إجمالي المكتسب</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedWorker.totalPaid}</div>
                          <p className="text-sm text-muted-foreground">إجمالي المدفوع</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">{selectedWorker.balance}</div>
                          <p className="text-sm text-muted-foreground">الرصيد المستحق</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {getWorkerRecords(selectedWorker.id).length}
                          </div>
                          <p className="text-sm text-muted-foreground">أيام العمل</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>العمل</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getWorkerRecords(selectedWorker.id).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date.toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>
                              {record.hours && `${record.hours} ساعة`}
                              {record.shifts && `${record.shifts} شفت`}
                            </TableCell>
                            <TableCell>{record.amount} شيكل</TableCell>
                            <TableCell>
                              <Badge variant={record.isPaid ? 'default' : 'secondary'}>
                                {record.isPaid ? 'مدفوع' : 'غير مدفوع'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إضافة عامل جديد
              </CardTitle>
              <CardDescription>
                أضف عامل جديد وحدد نوع وسعر العمل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workerName">اسم العامل</Label>
                <Input
                  id="workerName"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم العامل"
                />
              </div>

              <div>
                <Label>نوع العامل</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="workerType"
                      value="hourly"
                      checked={newWorker.type === 'hourly'}
                      onChange={(e) => setNewWorker(prev => ({ ...prev, type: e.target.value as 'hourly' | 'shift' }))}
                    />
                    عامل بالساعة
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="workerType"
                      value="shift"
                      checked={newWorker.type === 'shift'}
                      onChange={(e) => setNewWorker(prev => ({ ...prev, type: e.target.value as 'hourly' | 'shift' }))}
                    />
                    عامل بالشفت
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="rate">
                  {newWorker.type === 'hourly' ? 'سعر الساعة (شيكل)' : 'سعر الشفت (شيكل)'}
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={newWorker.rate}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, rate: e.target.value }))}
                  placeholder={newWorker.type === 'hourly' ? 'سعر الساعة' : 'سعر الشفت'}
                  min="0"
                />
              </div>

              <Button onClick={addWorker} className="w-full">
                <Plus className="h-4 w-4 ml-2" />
                إضافة العامل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                تسجيل العمل
              </CardTitle>
              <CardDescription>
                سجل ساعات أو شفتات العمل للعمال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="selectWorker">اختر العامل</Label>
                <select
                  id="selectWorker"
                  value={newRecord.workerId}
                  onChange={(e) => {
                    const workerId = e.target.value;
                    setNewRecord(prev => ({ ...prev, workerId }));
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">اختر العامل</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                    </option>
                  ))}
                </select>
              </div>

              {newRecord.workerId && (
                <>
                  {workers.find(w => w.id === newRecord.workerId)?.type === 'hourly' ? (
                    <div>
                      <Label htmlFor="hours">عدد الساعات</Label>
                      <Input
                        id="hours"
                        type="number"
                        value={newRecord.hours}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, hours: e.target.value }))}
                        placeholder="عدد الساعات"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="shifts">عدد الشفتات</Label>
                      <Input
                        id="shifts"
                        type="number"
                        value={newRecord.shifts}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, shifts: e.target.value }))}
                        placeholder="عدد الشفتات"
                        min="0"
                      />
                    </div>
                  )}

                  <Button onClick={addWorkRecord} className="w-full">
                    <Calculator className="h-4 w-4 ml-2" />
                    تسجيل العمل
                  </Button>
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