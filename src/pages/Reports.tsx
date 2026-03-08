import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Calendar, Users, Package } from "lucide-react"

// البيانات الوهمية للتقارير
const monthlyProduction = [
  { month: 'يناير', production: 15420, target: 15000, revenue: 701000 },
  { month: 'فبراير', production: 16800, target: 16000, revenue: 756000 },
  { month: 'مارس', production: 18200, target: 17000, revenue: 819000 },
  { month: 'أبريل', production: 17500, target: 17500, revenue: 787500 },
  { month: 'مايو', production: 19300, target: 18000, revenue: 868500 },
  { month: 'يونيو', production: 20100, target: 19000, revenue: 904500 }
]

const salesByCustomer = [
  { name: 'أحمد محمد', sales: 234500, percentage: 28.5 },
  { name: 'فاطمة أحمد', sales: 189200, percentage: 23.1 },
  { name: 'محمود عبدالله', sales: 156800, percentage: 19.1 },
  { name: 'خالد يوسف', sales: 123400, percentage: 15.0 },
  { name: 'زبائن آخرون', sales: 117100, percentage: 14.3 }
]

const qualityTrends = [
  { month: 'يناير', excellent: 65, good: 28, acceptable: 7 },
  { month: 'فبراير', excellent: 68, good: 25, acceptable: 7 },
  { month: 'مارس', excellent: 72, good: 23, acceptable: 5 },
  { month: 'أبريل', excellent: 70, good: 25, acceptable: 5 },
  { month: 'مايو', excellent: 75, good: 20, acceptable: 5 },
  { month: 'يونيو', excellent: 78, good: 18, acceptable: 4 }
]

const expenseBreakdown = [
  { category: 'أجور العمال', amount: 280000, percentage: 42 },
  { category: 'صيانة المعدات', amount: 120000, percentage: 18 },
  { category: 'فواتير الكهرباء', amount: 85000, percentage: 13 },
  { category: 'مواد التشغيل', amount: 75000, percentage: 11 },
  { category: 'مصاريف يومية', amount: 65000, percentage: 10 },
  { category: 'أخرى', amount: 40000, percentage: 6 }
]

const topProducts = [
  { product: 'زيت زيتون بكر ممتاز', quantity: 8450, revenue: 380250 },
  { product: 'زيت زيتون درجة أولى', quantity: 6200, revenue: 310000 },
  { product: 'زيت زيتون عادي', quantity: 5800, revenue: 232000 },
  { product: 'تفل الزيتون', quantity: 3400, revenue: 68000 },
  { product: 'منتجات أخرى', quantity: 2100, revenue: 105000 }
]

const colors = ['hsl(var(--primary))', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Reports() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" dir="rtl">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">التقارير والتحليلات</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="current-month">
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 me-2" />
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">الشهر الحالي</SelectItem>
              <SelectItem value="last-month">الشهر الماضي</SelectItem>
              <SelectItem value="quarter">الربع الحالي</SelectItem>
              <SelectItem value="year">السنة الحالية</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="shadow-soft transition-smooth hover:shadow-olive">
            <Download className="h-4 w-4 me-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" dir="rtl">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="production">تقرير الإنتاج</TabsTrigger>
          <TabsTrigger value="sales">تقرير المبيعات</TabsTrigger>
          <TabsTrigger value="financial">التقرير المالي</TabsTrigger>
          <TabsTrigger value="quality">تقرير الجودة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48,365 ش</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 me-1" />
                  +15.2% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإنتاج</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,073 كغم</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 me-1" />
                  +8.7% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عدد الزبائن</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 me-1" />
                  +12 زبون جديد
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.5%</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingDown className="h-3 w-3 text-red-500 me-1" />
                  -1.2% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>الإنتاج والإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent className="pr-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyProduction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="left" />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="production" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>توزيع المبيعات حسب الزبون</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={salesByCustomer}
                      dataKey="percentage"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {salesByCustomer.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-4">
                  {salesByCustomer.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="truncate">{customer.name}</span>
                      </div>
                      <span className="font-medium">{customer.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>الإنتاج مقابل الهدف</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProduction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Bar dataKey="production" fill="hsl(var(--primary))" name="الإنتاج الفعلي" />
                    <Bar dataKey="target" fill="hsl(var(--muted))" name="الهدف" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>كفاءة الإنتاج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyProduction.map((month, index) => {
                    const efficiency = ((month.production / month.target) * 100).toFixed(1)
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{month.month}</span>
                          <span className={`font-medium ${
                            parseFloat(efficiency) >= 100 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {efficiency}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              parseFloat(efficiency) >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(parseFloat(efficiency), 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>
                أعلى 5 منتجات من حيث الكمية والإيرادات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية المباعة</TableHead>
                    <TableHead className="text-right">الإيرادات</TableHead>
                    <TableHead className="text-right">متوسط السعر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.product}</TableCell>
                      <TableCell>{product.quantity.toLocaleString()} كغم</TableCell>
                      <TableCell>{product.revenue.toLocaleString()} ش</TableCell>
                      <TableCell>{(product.revenue / product.quantity).toFixed(2)} ش/كغم</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>تفاصيل الزبائن الرئيسيين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesByCustomer.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.percentage}% من إجمالي المبيعات
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{customer.sales.toLocaleString()} ش</p>
                      <p className="text-sm text-muted-foreground">هذا الموسم</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>توزيع المصاريف</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-4">
                  {expenseBreakdown.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span>{expense.category}</span>
                      </div>
                      <span className="font-medium">{expense.amount.toLocaleString()} ش</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>ملخص مالي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-800">إجمالي الإيرادات</span>
                  <span className="text-2xl font-bold text-green-600">48,365 ش</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="font-medium text-red-800">إجمالي المصاريف</span>
                  <span className="text-2xl font-bold text-red-600">32,650 ش</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="font-medium text-primary">صافي الربح</span>
                  <span className="text-2xl font-bold text-primary">15,715 ش</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>توزيع جودة الإنتاج</CardTitle>
              <CardDescription>
                نسب جودة الزيت المنتج حسب الشهر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="excellent" stackId="a" fill="hsl(var(--primary))" name="ممتاز" />
                  <Bar dataKey="good" stackId="a" fill="#3b82f6" name="جيد" />
                  <Bar dataKey="acceptable" stackId="a" fill="#f59e0b" name="مقبول" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">ممتاز</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">جيد</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm">مقبول</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}