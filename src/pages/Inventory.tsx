import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Plus, Package, ArrowUp, ArrowDown, AlertTriangle, Search, Filter, Droplets, Wheat, Truck } from "lucide-react"
import { useState } from "react"

// البيانات الوهمية
const inventoryItems = [
  {
    id: 1,
    name: "زيت زيتون بكر ممتاز",
    category: "زيت",
    quantity: 1250,
    unit: "لتر",
    minStock: 200,
    maxStock: 2000,
    price: 45.50,
    lastUpdated: "2024-01-15",
    location: "مستودع أ - رف 1",
    batch: "B2024-001",
    expiryDate: "2025-12-30"
  },
  {
    id: 2,
    name: "زيت زيتون درجة أولى",
    category: "زيت",
    quantity: 850,
    unit: "لتر",
    minStock: 150,
    maxStock: 1500,
    price: 38.75,
    lastUpdated: "2024-01-15",
    location: "مستودع أ - رف 2",
    batch: "B2024-002",
    expiryDate: "2025-11-25"
  },
  {
    id: 3,
    name: "زيتون مخلل",
    category: "منتجات",
    quantity: 450,
    unit: "كغ",
    minStock: 100,
    maxStock: 800,
    price: 12.25,
    lastUpdated: "2024-01-14",
    location: "مستودع ب - رف 1",
    batch: "P2024-001",
    expiryDate: "2024-08-15"
  },
  {
    id: 4,
    name: "عبوات زجاجية 500مل",
    category: "تعبئة",
    quantity: 2500,
    unit: "قطعة",
    minStock: 500,
    maxStock: 5000,
    price: 1.25,
    lastUpdated: "2024-01-13",
    location: "مستودع ج - رف 3",
    batch: "PKG-001",
    expiryDate: "-"
  },
  {
    id: 5,
    name: "ملصقات المنتج",
    category: "تعبئة",
    quantity: 1800,
    unit: "قطعة",
    minStock: 200,
    maxStock: 3000,
    price: 0.15,
    lastUpdated: "2024-01-12",
    location: "مستودع ج - رف 1",
    batch: "LBL-001",
    expiryDate: "-"
  }
]

const movements = [
  {
    id: 1,
    type: "in",
    item: "زيت زيتون بكر ممتاز",
    quantity: 350,
    unit: "لتر",
    date: "2024-01-15",
    reference: "إنتاج يومي",
    operator: "أحمد محمد"
  },
  {
    id: 2,
    type: "out",
    item: "زيت زيتون درجة أولى",
    quantity: 200,
    unit: "لتر",
    date: "2024-01-15",
    reference: "طلب عميل #1234",
    operator: "سارة علي"
  },
  {
    id: 3,
    type: "in",
    item: "عبوات زجاجية 500مل",
    quantity: 1000,
    unit: "قطعة",
    date: "2024-01-14",
    reference: "شراء من المورد",
    operator: "محمد أحمد"
  }
]

const stockLevels = [
  { date: '01/10', oil: 1200, bottles: 2200, labels: 1500 },
  { date: '01/11', oil: 1350, bottles: 2100, labels: 1650 },
  { date: '01/12', oil: 1180, bottles: 2300, labels: 1800 },
  { date: '01/13', oil: 1420, bottles: 2500, labels: 1750 },
  { date: '01/14', oil: 1250, bottles: 2400, labels: 1900 },
  { date: '01/15', oil: 1380, bottles: 2500, labels: 1800 }
]

const alerts = [
  {
    id: 1,
    type: "low_stock",
    item: "ملصقات المنتج",
    currentStock: 180,
    minStock: 200,
    message: "المخزون أقل من الحد الأدنى"
  },
  {
    id: 2,
    type: "expiry_warning",
    item: "زيتون مخلل",
    expiryDate: "2024-08-15",
    message: "ينتهي خلال 7 أشهر"
  }
]

function getStockStatus(current: number, min: number, max: number) {
  if (current < min) return { status: "low", color: "destructive", text: "منخفض" }
  if (current > max * 0.8) return { status: "high", color: "default", text: "مرتفع" }
  return { status: "normal", color: "secondary", text: "طبيعي" }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "زيت": return <Droplets className="h-4 w-4" />
    case "منتجات": return <Wheat className="h-4 w-4" />
    case "تعبئة": return <Package className="h-4 w-4" />
    default: return <Package className="h-4 w-4" />
  }
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">إدارة المخزون</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shadow-soft transition-smooth hover:shadow-olive">
                <Plus className="ml-2 h-4 w-4" />
                إضافة عنصر
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة عنصر جديد للمخزون</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل العنصر الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemName" className="text-right">
                    اسم العنصر
                  </Label>
                  <Input id="itemName" placeholder="زيت زيتون" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    الفئة
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oil">زيت</SelectItem>
                      <SelectItem value="products">منتجات</SelectItem>
                      <SelectItem value="packaging">تعبئة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    الكمية
                  </Label>
                  <Input id="quantity" placeholder="1000" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    الوحدة
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الوحدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liter">لتر</SelectItem>
                      <SelectItem value="kg">كغ</SelectItem>
                      <SelectItem value="piece">قطعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    السعر
                  </Label>
                  <Input id="price" placeholder="45.50" className="col-span-3" />
                </div>
              </div>
              <Button className="w-full">إضافة للمخزون</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="items">عناصر المخزون</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزون</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5,875</div>
                <p className="text-xs text-muted-foreground">
                  +12 عنصر هذا الأسبوع
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪ 125,450</div>
                <p className="text-xs text-muted-foreground">
                  +8% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عناصر منخفضة</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  تحتاج إعادة طلب
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حركات اليوم</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  15 دخول، 9 خروج
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>مستويات المخزون</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stockLevels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line type="monotone" dataKey="oil" stroke="hsl(var(--primary))" strokeWidth={2} name="الزيت" />
                  <Line type="monotone" dataKey="bottles" stroke="#3b82f6" strokeWidth={2} name="العبوات" />
                  <Line type="monotone" dataKey="labels" stroke="#f59e0b" strokeWidth={2} name="الملصقات" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المخزون..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="زيت">زيت</SelectItem>
                <SelectItem value="منتجات">منتجات</SelectItem>
                <SelectItem value="تعبئة">تعبئة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>عناصر المخزون</CardTitle>
              <CardDescription>
                {filteredItems.length} عنصر من أصل {inventoryItems.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العنصر</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">آخر تحديث</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item.quantity, item.minStock, item.maxStock)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.quantity.toLocaleString()} {item.unit}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.color as any}>
                            {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell>₪ {item.price}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.lastUpdated}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>حركات المخزون الأخيرة</CardTitle>
              <CardDescription>
                سجل لجميع العمليات الداخلة والخارجة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {movement.type === 'in' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{movement.item}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.type === 'in' ? 'دخول' : 'خروج'}: {movement.quantity} {movement.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">{movement.reference}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{movement.date}</p>
                      <p>{movement.operator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>تنبيهات المخزون</CardTitle>
              <CardDescription>
                تنبيهات مهمة تحتاج للانتباه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">{alert.item}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      اتخاذ إجراء
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>العناصر المنخفضة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryItems
                    .filter(item => item.quantity < item.minStock)
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <Badge variant="destructive">
                          {item.quantity} / {item.minStock}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft transition-smooth hover:shadow-olive">
              <CardHeader>
                <CardTitle>التواريخ المنتهية قريباً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryItems
                    .filter(item => item.expiryDate !== "-")
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.expiryDate}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}