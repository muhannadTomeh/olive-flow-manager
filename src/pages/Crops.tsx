import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Leaf, 
  Plus, 
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  TrendingUp
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const farmsData = [
  {
    id: 1,
    name: "المزرعة الشرقية",
    location: "الرياض - حي العليا",
    area: "15 هكتار",
    trees: 450,
    variety: "بيكوال",
    status: "جاهز للقطف",
    harvestDate: "2024-11-15",
    expectedYield: "6,750 كيلو",
    quality: "ممتاز"
  },
  {
    id: 2,
    name: "مزرعة الوادي",
    location: "القصيم - بريدة",
    area: "22 هكتار",
    trees: 680,
    variety: "أربيكينا",
    status: "في طور النضج",
    harvestDate: "2024-12-01",
    expectedYield: "10,200 كيلو",
    quality: "جيد جداً"
  },
  {
    id: 3,
    name: "المزرعة الغربية",
    location: "المدينة المنورة",
    area: "18 هكتار",
    trees: 520,
    variety: "فرانتويو",
    status: "تم القطف",
    harvestDate: "2024-10-28",
    expectedYield: "7,800 كيلو",
    quality: "ممتاز"
  }
]

const yieldData = [
  { month: 'أكتوبر', planned: 8000, actual: 7800 },
  { month: 'نوفمبر', planned: 12000, actual: 0 },
  { month: 'ديسمبر', planned: 15000, actual: 0 },
  { month: 'يناير', planned: 5000, actual: 0 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'جاهز للقطف': return 'bg-green-100 text-green-800'
    case 'في طور النضج': return 'bg-yellow-100 text-yellow-800'
    case 'تم القطف': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function Crops() {
  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة المحاصيل</h1>
          <p className="text-muted-foreground mt-1">متابعة مزارع الزيتون ومراحل النضج</p>
        </div>
        <Button className="olive-gradient text-white">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مزرعة جديدة
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المزارع</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأشجار</p>
                <p className="text-2xl font-bold">1,650</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الإنتاج المتوقع</p>
                <p className="text-2xl font-bold">24.7 طن</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المساحة الإجمالية</p>
                <p className="text-2xl font-bold">55 هكتار</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Chart */}
      <Card>
        <CardHeader>
          <CardTitle>الإنتاج المخطط مقابل الفعلي</CardTitle>
          <CardDescription>
            مقارنة بين الإنتاج المخطط والفعلي للموسم الحالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="planned" fill="hsl(var(--primary))" name="مخطط" />
              <Bar dataKey="actual" fill="hsl(var(--accent))" name="فعلي" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Farms Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {farmsData.map((farm) => (
          <Card key={farm.id} className="shadow-soft hover:shadow-olive transition-smooth">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{farm.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {farm.location}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(farm.status)}>
                  {farm.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Farm Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">المساحة</p>
                  <p className="font-medium">{farm.area}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">عدد الأشجار</p>
                  <p className="font-medium">{farm.trees} شجرة</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الصنف</p>
                  <p className="font-medium">{farm.variety}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">تاريخ القطف</p>
                  <p className="font-medium">{new Date(farm.harvestDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>

              {/* Expected Yield */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الإنتاج المتوقع</span>
                  <span className="font-bold text-primary">{farm.expectedYield}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">الجودة المتوقعة</span>
                  <Badge variant="outline">{farm.quality}</Badge>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span>25°م</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>65%</span>
                </div>
                <Button variant="outline" size="sm">
                  تفاصيل أكثر
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}