import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette, Globe, Save, Trash2, Download, Upload } from "lucide-react"
import { useState } from "react"

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    lowStock: true,
    qualityAlerts: true,
    orderUpdates: false
  })

  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("ar")

  // إعدادات المعصرة
  const [pressSettings, setPressSettings] = useState({
    returnPercent: "6",
    oilSellPrice: "25",
    oilBuyPrice: "23",
    cashReturnCost: "1.5",
    plasticContainerPrice: "10",
    metalContainerPrice: "15"
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" dir="rtl">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">الإعدادات</h2>
        <div className="flex items-center gap-2">
          <Button className="shadow-soft transition-smooth hover:shadow-olive">
            <Save className="me-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="press" className="space-y-4" dir="rtl">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="press">إعدادات المعصرة</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="company">بيانات الشركة</TabsTrigger>
          <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
        </TabsList>

        <TabsContent value="press" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>إعدادات المعصرة والثوابت</CardTitle>
              <CardDescription>
                الثوابت المستخدمة في حساب الفواتير وطرق الدفع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="returnPercent">نسبة الرد (%)</Label>
                  <Input
                    id="returnPercent"
                    type="number"
                    value={pressSettings.returnPercent}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, returnPercent: e.target.value }))}
                    placeholder="أدخل نسبة الرد"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashReturnCost">تكلفة الرد نقداً (شيكل/كغم)</Label>
                  <Input
                    id="cashReturnCost"
                    type="number"
                    value={pressSettings.cashReturnCost}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, cashReturnCost: e.target.value }))}
                    placeholder="أدخل تكلفة الرد نقداً"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oilSellPrice">سعر بيع الزيت (شيكل/كغم)</Label>
                  <Input
                    id="oilSellPrice"
                    type="number"
                    value={pressSettings.oilSellPrice}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, oilSellPrice: e.target.value }))}
                    placeholder="أدخل سعر بيع الزيت"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oilBuyPrice">سعر شراء الزيت (شيكل/كغم)</Label>
                  <Input
                    id="oilBuyPrice"
                    type="number"
                    value={pressSettings.oilBuyPrice}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, oilBuyPrice: e.target.value }))}
                    placeholder="أدخل سعر شراء الزيت"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plasticContainerPrice">سعر التنكة البلاستيكية (شيكل)</Label>
                  <Input
                    id="plasticContainerPrice"
                    type="number"
                    value={pressSettings.plasticContainerPrice}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, plasticContainerPrice: e.target.value }))}
                    placeholder="أدخل سعر التنكة البلاستيكية"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metalContainerPrice">سعر التنكة الحديدية (شيكل)</Label>
                  <Input
                    id="metalContainerPrice"
                    type="number"
                    value={pressSettings.metalContainerPrice}
                    onChange={(e) => setPressSettings(prev => ({ ...prev, metalContainerPrice: e.target.value }))}
                    placeholder="أدخل سعر التنكة الحديدية"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>
                تحديث معلوماتك الشخصية وبيانات الحساب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">م م</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">تغيير الصورة</Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG أو GIF. حد أقصى 2 ميجابايت
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input id="firstName" defaultValue="محمد" placeholder="أدخل الاسم الأول" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input id="lastName" defaultValue="أحمد" placeholder="أدخل الاسم الأخير" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue="mohamed@example.com" placeholder="أدخل البريد الإلكتروني" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" defaultValue="+970-123-456789" placeholder="أدخل رقم الهاتف" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">المنصب</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنصب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="supervisor">مشرف</SelectItem>
                    <SelectItem value="operator">مشغل</SelectItem>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة شخصية</Label>
                <Textarea 
                  id="bio" 
                  placeholder="اكتب نبذة مختصرة عنك..."
                  defaultValue="مدير معصرة الزيتون مع خبرة 10 سنوات في صناعة زيت الزيتون"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>بيانات الشركة</CardTitle>
              <CardDescription>
                معلومات عن الشركة والمعصرة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم المعصرة</Label>
                  <Input id="companyName" defaultValue="معصرة الزيتون الفلسطينية" placeholder="أدخل اسم المعصرة" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">رقم الترخيص</Label>
                  <Input id="license" defaultValue="LIC-2024-001" placeholder="أدخل رقم الترخيص" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea id="address" defaultValue="رام الله، فلسطين - شارع الإرسال - مجمع الزيتون" placeholder="أدخل العنوان الكامل" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input id="website" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">الرقم الضريبي</Label>
                  <Input id="tax" defaultValue="TAX-123456789" placeholder="أدخل الرقم الضريبي" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف المعصرة</Label>
                <Textarea 
                  id="description" 
                  placeholder="وصف مختصر عن المعصرة..."
                  defaultValue="معصرة حديثة لإنتاج زيت الزيتون البكر الممتاز بأعلى معايير الجودة"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات الإنتاج</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">السعة اليومية (كغم)</Label>
                    <Input id="capacity" type="number" defaultValue="2000" placeholder="أدخل السعة اليومية" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lines">عدد خطوط الإنتاج</Label>
                    <Input id="lines" type="number" defaultValue="3" placeholder="أدخل عدد الخطوط" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select defaultValue="ils">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ils">شيكل إسرائيلي (₪)</SelectItem>
                      <SelectItem value="usd">دولار أمريكي ($)</SelectItem>
                      <SelectItem value="eur">يورو (€)</SelectItem>
                      <SelectItem value="jod">دينار أردني (JD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>إعدادات التنبيهات</CardTitle>
              <CardDescription>
                تخصيص التنبيهات التي تريد تلقيها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">قنوات التنبيه</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>البريد الإلكتروني</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي التنبيهات عبر البريد الإلكتروني
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>التنبيهات المنبثقة</Label>
                      <p className="text-sm text-muted-foreground">
                        تنبيهات داخل النظام
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>الرسائل النصية</Label>
                      <p className="text-sm text-muted-foreground">
                        تنبيهات عبر SMS للأحداث المهمة
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.sms}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">أنواع التنبيهات</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تنبيهات المخزون المنخفض</Label>
                      <p className="text-sm text-muted-foreground">
                        تنبيه عند انخفاض مستوى مخزون الزيت
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.lowStock}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, lowStock: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تنبيهات الجودة</Label>
                      <p className="text-sm text-muted-foreground">
                        تنبيه عند مشاكل في جودة الإنتاج
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.qualityAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, qualityAlerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تحديثات الطلبات</Label>
                      <p className="text-sm text-muted-foreground">
                        تنبيه عند تحديث حالة الفواتير
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, orderUpdates: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>المظهر واللغة</CardTitle>
              <CardDescription>
                تخصيص مظهر النظام واللغة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">المظهر</h3>
                <div className="space-y-2">
                  <Label>سمة الألوان</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السمة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="system">حسب النظام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">اللغة والتنسيق</h3>
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="he">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Select defaultValue="asia/gaza">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/gaza">آسيا/غزة</SelectItem>
                      <SelectItem value="asia/amman">آسيا/عمان</SelectItem>
                      <SelectItem value="asia/beirut">آسيا/بيروت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تنسيق التاريخ</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تنسيق التاريخ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">يوم/شهر/سنة</SelectItem>
                      <SelectItem value="mm/dd/yyyy">شهر/يوم/سنة</SelectItem>
                      <SelectItem value="yyyy-mm-dd">سنة-شهر-يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>النسخ الاحتياطي والاستعادة</CardTitle>
              <CardDescription>
                إدارة النسخ الاحتياطية للبيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 text-center space-y-4">
                    <Download className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">تصدير البيانات</h3>
                      <p className="text-sm text-muted-foreground">
                        تحميل نسخة احتياطية من جميع البيانات
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="me-2 h-4 w-4" />
                      تصدير الآن
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 text-center space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">استيراد البيانات</h3>
                      <p className="text-sm text-muted-foreground">
                        استعادة البيانات من نسخة احتياطية
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Upload className="ml-2 h-4 w-4" />
                      استيراد ملف
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">منطقة الخطر</h3>
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">حذف جميع البيانات</h4>
                        <p className="text-sm text-muted-foreground">
                          هذا الإجراء لا يمكن التراجع عنه
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف الكل
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف جميع البيانات بشكل دائم. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground">
                              حذف نهائياً
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}