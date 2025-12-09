import { DashboardCard } from "@/components/DashboardCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Leaf, 
  Factory, 
  Package, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Users,
  DollarSign,
  Clock
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const productionData = [
  { month: 'أسبوع 1', amount: 120 },
  { month: 'أسبوع 2', amount: 150 },
  { month: 'أسبوع 3', amount: 180 },
  { month: 'أسبوع 4', amount: 200 },
]

const paymentMethodsData = [
  { name: 'دفع بالزيت', value: 45, color: 'hsl(90 45% 25%)' },
  { name: 'دفع نقدي', value: 35, color: 'hsl(200 70% 50%)' },
  { name: 'دفع مختلط', value: 20, color: 'hsl(40 90% 50%)' },
]

const recentActivities = [
  { id: 1, activity: 'تم إنشاء فاتورة جديدة للزبون أحمد محمد', time: 'قبل 10 دقائق', type: 'invoice' },
  { id: 2, activity: 'تم إضافة زبون جديد إلى الطابور', time: 'قبل 30 دقيقة', type: 'queue' },
  { id: 3, activity: 'تم تسجيل مصروف صيانة بقيمة 150 شيكل', time: 'قبل ساعة', type: 'expense' },
  { id: 4, activity: 'تم بيع 20 كغم زيت', time: 'قبل ساعتين', type: 'sale' },
]

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المعصرة</p>
        </div>
        <div className="text-sm text-muted-foreground">
          آخر تحديث: اليوم {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="الزبائن في الطابور"
          value="5"
          description="زبون ينتظر"
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
        />
        <DashboardCard
          title="مخزون الزيت"
          value="250 كغم"
          description="متوفر في المخزن"
          icon={Package}
          trend={{ value: -5, isPositive: false }}
        />
        <DashboardCard
          title="الكاش المتوفر"
          value="15,000 ش"
          description="الرصيد الحالي"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="فواتير اليوم"
          value="8"
          description="تم إنجازها"
          icon={Factory}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* الإنتاج الأسبوعي */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              الإنتاج الأسبوعي
            </CardTitle>
            <CardDescription>
              كمية الزيت المنتج خلال الأسابيع الأخيرة (بالكيلوغرام)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع طرق الدفع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              توزيع طرق الدفع
            </CardTitle>
            <CardDescription>
              نسب طرق الدفع المستخدمة من قبل الزبائن
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {paymentMethodsData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الأنشطة الأخيرة والتنبيهات */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* الأنشطة الأخيرة */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الأنشطة الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'invoice' ? 'bg-blue-500' :
                    activity.type === 'queue' ? 'bg-green-500' :
                    activity.type === 'expense' ? 'bg-red-500' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* التنبيهات والملاحظات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              التنبيهات والملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">انخفاض المخزون</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">مخزون الزيت أقل من الحد الأدنى</p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">أداء جيد</span>
              </div>
              <p className="text-xs text-green-700 mt-1">تحقيق الهدف اليومي للإنتاج</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">إحصائيات سريعة</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold">15</div>
                  <div className="text-xs text-muted-foreground">زبون اليوم</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold">3</div>
                  <div className="text-xs text-muted-foreground">عمال نشطين</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}