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
  DollarSign
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const productionData = [
  { month: 'يناير', amount: 1200 },
  { month: 'فبراير', amount: 1100 },
  { month: 'مارس', amount: 1400 },
  { month: 'أبريل', amount: 1300 },
  { month: 'مايو', amount: 1600 },
  { month: 'يونيو', amount: 1800 },
]

const qualityData = [
  { name: 'ممتاز', value: 45, color: 'hsl(90 45% 25%)' },
  { name: 'جيد جداً', value: 35, color: 'hsl(80 40% 35%)' },
  { name: 'جيد', value: 15, color: 'hsl(70 35% 45%)' },
  { name: 'متوسط', value: 5, color: 'hsl(60 30% 55%)' },
]

const recentActivities = [
  { id: 1, activity: 'تم استلام 500 كيلو زيتون من المزرعة الشرقية', time: 'قبل ساعتين', type: 'receive' },
  { id: 2, activity: 'انتهاء عملية عصر الدفعة رقم 145', time: 'قبل 4 ساعات', type: 'production' },
  { id: 3, activity: 'شحن 200 لتر زيت للعميل أحمد محمد', time: 'أمس', type: 'shipment' },
  { id: 4, activity: 'فحص جودة لدفعة زيت جديدة', time: 'أمس', type: 'quality' },
]

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المعصرة</p>
        </div>
        <div className="text-sm text-muted-foreground">
          آخر تحديث: اليوم {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="إجمالي الإنتاج اليومي"
          value="450 لتر"
          description="زيت زيتون طازج"
          icon={Factory}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="المخزون الحالي"
          value="2,350 لتر"
          description="في المخازن"
          icon={Package}
          trend={{ value: -5, isPositive: false }}
        />
        <DashboardCard
          title="الزيتون المتاح"
          value="1,200 كيلو"
          description="جاهز للعصر"
          icon={Leaf}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="المبيعات الشهرية"
          value="85,500 ر.س"
          description="إجمالي المبيعات"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              الإنتاج الشهري
            </CardTitle>
            <CardDescription>
              كمية الزيت المنتج خلال الأشهر الستة الماضية (باللتر)
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

        {/* Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              توزيع جودة الزيت
            </CardTitle>
            <CardDescription>
              تصنيف جودة الإنتاج الحالي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {qualityData.map((item, index) => (
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

      {/* Recent Activities and Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
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
                    activity.type === 'receive' ? 'bg-blue-500' :
                    activity.type === 'production' ? 'bg-green-500' :
                    activity.type === 'shipment' ? 'bg-orange-500' :
                    'bg-purple-500'
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

        {/* Quick Stats & Alerts */}
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
              <p className="text-xs text-yellow-700 mt-1">المخزون أقل من الحد الأدنى</p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">الإنتاج جيد</span>
              </div>
              <p className="text-xs text-green-700 mt-1">تحقيق الهدف المطلوب</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">إحصائيات سريعة</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold">15</div>
                  <div className="text-xs text-muted-foreground">عميل نشط</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold">3</div>
                  <div className="text-xs text-muted-foreground">طلبات معلقة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}