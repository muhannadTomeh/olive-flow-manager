import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, TrendingUp, TrendingDown, Package, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number; // بالكيلوغرام
  price: number; // السعر للكيلوغرام الواحد
  totalPrice: number;
  supplier?: string; // للشراء
  buyer?: string; // للبيع
  date: Date;
  notes?: string;
}

interface Inventory {
  totalOil: number;
  totalCash: number;
}

const OilTrading = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: 'buy',
      amount: 100,
      price: 23,
      totalPrice: 2300,
      supplier: "مورد الزيتون الذهبي",
      date: new Date("2024-01-10"),
    },
    {
      id: "2",
      type: 'sell',
      amount: 50,
      price: 25,
      totalPrice: 1250,
      buyer: "متجر الأطعمة الطبيعية",
      date: new Date("2024-01-15"),
    }
  ]);

  const [inventory, setInventory] = useState<Inventory>({
    totalOil: 250, // كيلوغرام
    totalCash: 15000 // شيكل
  });

  const [newTransaction, setNewTransaction] = useState({
    type: 'buy' as 'buy' | 'sell',
    amount: "",
    price: "",
    supplier: "",
    buyer: "",
    notes: ""
  });

  const { toast } = useToast();

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.price) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الكمية والسعر",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    const price = parseFloat(newTransaction.price);
    const totalPrice = amount * price;

    // التحقق من المخزون
    if (newTransaction.type === 'sell' && amount > inventory.totalOil) {
      toast({
        title: "خطأ",
        description: `الكمية المتوفرة في المخزون: ${inventory.totalOil} كغم فقط`,
        variant: "destructive",
      });
      return;
    }

    if (newTransaction.type === 'buy' && totalPrice > inventory.totalCash) {
      toast({
        title: "خطأ",
        description: `المبلغ المتوفر في الكاش: ${inventory.totalCash} شيكل فقط`,
        variant: "destructive",
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      amount,
      price,
      totalPrice,
      date: new Date(),
      notes: newTransaction.notes || undefined,
      ...(newTransaction.type === 'buy' 
        ? { supplier: newTransaction.supplier }
        : { buyer: newTransaction.buyer }
      )
    };

    setTransactions(prev => [transaction, ...prev]);

    // تحديث المخزون
    setInventory(prev => ({
      totalOil: newTransaction.type === 'buy' 
        ? prev.totalOil + amount 
        : prev.totalOil - amount,
      totalCash: newTransaction.type === 'buy'
        ? prev.totalCash - totalPrice
        : prev.totalCash + totalPrice
    }));

    // إعادة تعيين النموذج
    setNewTransaction({
      type: 'buy',
      amount: "",
      price: "",
      supplier: "",
      buyer: "",
      notes: ""
    });

    toast({
      title: "تمت العملية",
      description: `تم تسجيل عملية ${newTransaction.type === 'buy' ? 'الشراء' : 'البيع'} بنجاح`,
    });
  };

  const getTotalPurchases = () => {
    return transactions
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + t.totalPrice, 0);
  };

  const getTotalSales = () => {
    return transactions
      .filter(t => t.type === 'sell')
      .reduce((sum, t) => sum + t.totalPrice, 0);
  };

  const getProfit = () => {
    return getTotalSales() - getTotalPurchases();
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">بيع وشراء الزيت</h1>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{inventory.totalOil} كغم</div>
                <p className="text-sm text-muted-foreground">مخزون الزيت</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{inventory.totalCash} ش</div>
                <p className="text-sm text-muted-foreground">الكاش المتوفر</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{getTotalSales()} ش</div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{getTotalPurchases()} ش</div>
                <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add-transaction" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-transaction">إضافة عملية</TabsTrigger>
          <TabsTrigger value="history">سجل العمليات</TabsTrigger>
        </TabsList>

        <TabsContent value="add-transaction">
          <Card>
            <CardHeader>
              <CardTitle>إضافة عملية بيع أو شراء</CardTitle>
              <CardDescription>
                سجل عملية شراء أو بيع زيت جديدة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>نوع العملية</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="transactionType"
                      value="buy"
                      checked={newTransaction.type === 'buy'}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as 'buy' | 'sell' }))}
                    />
                    شراء زيت
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="transactionType"
                      value="sell"
                      checked={newTransaction.type === 'sell'}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as 'buy' | 'sell' }))}
                    />
                    بيع زيت
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">الكمية (كغم)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="الكمية بالكيلوغرام"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label htmlFor="price">السعر (شيكل/كغم)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newTransaction.price}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="السعر للكيلوغرام الواحد"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {newTransaction.amount && newTransaction.price && (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-lg font-semibold">
                    الإجمالي: {(parseFloat(newTransaction.amount) * parseFloat(newTransaction.price)).toFixed(2)} شيكل
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="party">
                  {newTransaction.type === 'buy' ? 'اسم المورد' : 'اسم المشتري'} (اختياري)
                </Label>
                <Input
                  id="party"
                  value={newTransaction.type === 'buy' ? newTransaction.supplier : newTransaction.buyer}
                  onChange={(e) => setNewTransaction(prev => ({ 
                    ...prev, 
                    [newTransaction.type === 'buy' ? 'supplier' : 'buyer']: e.target.value 
                  }))}
                  placeholder={newTransaction.type === 'buy' ? 'اسم المورد' : 'اسم المشتري'}
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Input
                  id="notes"
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات إضافية"
                />
              </div>

              <Button onClick={addTransaction} className="w-full">
                {newTransaction.type === 'buy' ? (
                  <TrendingDown className="h-4 w-4 ml-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 ml-2" />
                )}
                تسجيل العملية
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل عمليات البيع والشراء</CardTitle>
              <CardDescription>
                عرض جميع عمليات البيع والشراء المسجلة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد عمليات مسجلة</p>
                  <p className="text-sm">ابدأ بإضافة عملية بيع أو شراء</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{getTotalSales()}</div>
                        <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{getTotalPurchases()}</div>
                        <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className={`text-2xl font-bold ${getProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {getProfit()}
                        </div>
                        <p className="text-sm text-muted-foreground">صافي الربح</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>الطرف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {transaction.date.toLocaleDateString('ar-SA')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'buy' ? 'secondary' : 'default'}>
                              {transaction.type === 'buy' ? (
                                <><TrendingDown className="h-4 w-4 ml-1" /> شراء</>
                              ) : (
                                <><TrendingUp className="h-4 w-4 ml-1" /> بيع</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.amount} كغم</TableCell>
                          <TableCell>{transaction.price} ش/كغم</TableCell>
                          <TableCell className={transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'buy' ? '-' : '+'}{transaction.totalPrice} ش
                          </TableCell>
                          <TableCell>
                            {transaction.supplier || transaction.buyer || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OilTrading;