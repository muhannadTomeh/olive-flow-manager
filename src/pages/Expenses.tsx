import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sprout, Plus, Calendar, DollarSign, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  date: Date;
}

const EXPENSE_CATEGORIES = [
  "صيانة المعدات",
  "فطور العمال", 
  "مواد التشحيم",
  "النقل والمواصلات",
  "فواتير الكهرباء",
  "مواد التنظيف",
  "أدوات ومستلزمات",
  "أخرى"
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      category: "صيانة المعدات",
      amount: 450,
      description: "تغيير قطع غيار المعصرة",
      date: new Date("2024-01-15")
    },
    {
      id: "2", 
      category: "فطور العمال",
      amount: 80,
      description: "فطور يوم الخميس",
      date: new Date("2024-01-14")
    },
    {
      id: "3",
      category: "فواتير الكهرباء",
      amount: 320,
      date: new Date("2024-01-10")
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    description: ""
  });

  const [filter, setFilter] = useState({
    category: "",
    dateFrom: "",
    dateTo: ""
  });

  const { toast } = useToast();

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نوع المصروف والمبلغ",
        variant: "destructive",
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description || undefined,
      date: new Date()
    };

    setExpenses(prev => [expense, ...prev]);
    setNewExpense({ category: "", amount: "", description: "" });
    
    toast({
      title: "تمت الإضافة",
      description: `تم إضافة مصروف بقيمة ${expense.amount} شيكل`,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف المصروف بنجاح",
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTodayExpenses = () => {
    const today = new Date().toDateString();
    return expenses
      .filter(exp => exp.date.toDateString() === today)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }));
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter.category && expense.category !== filter.category) return false;
    if (filter.dateFrom && expense.date < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && expense.date > new Date(filter.dateTo)) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Sprout className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة المصاريف</h1>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{getTotalExpenses()} ش</div>
                <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{getTodayExpenses()} ش</div>
                <p className="text-sm text-muted-foreground">مصاريف اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{expenses.length}</div>
                <p className="text-sm text-muted-foreground">عدد المصاريف</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إضافة مصروف جديد */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة مصروف جديد
            </CardTitle>
            <CardDescription>
              سجل مصروف جديد للمعصرة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">نوع المصروف</Label>
              <select
                id="category"
                value={newExpense.category}
                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">اختر نوع المصروف</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="amount">المبلغ (شيكل)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="المبلغ بالشيكل"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المصروف..."
                rows={3}
              />
            </div>

            <Button onClick={addExpense} className="w-full">
              <Plus className="h-4 w-4 me-2" />
              إضافة المصروف
            </Button>
          </CardContent>
        </Card>

        {/* قائمة المصاريف */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>سجل المصاريف</CardTitle>
            <CardDescription>
              عرض وإدارة جميع مصاريف المعصرة
            </CardDescription>
            
            {/* فلاتر البحث */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <Label htmlFor="filterCategory">فلترة حسب النوع</Label>
                <select
                  id="filterCategory"
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">جميع الأنواع</option>
                  {EXPENSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="dateFrom">من تاريخ</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="dateTo">إلى تاريخ</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sprout className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد مصاريف مطابقة للفلاتر</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {expense.date.toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {expense.amount} ش
                      </TableCell>
                      <TableCell>
                        {expense.description || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات المصاريف حسب النوع */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المصاريف حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getExpensesByCategory().map(({ category, amount }) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-red-600">{amount} ش</div>
                  <p className="text-sm text-muted-foreground">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;