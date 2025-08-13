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
import { Badge } from "@/components/ui/badge"
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">الإعدادات</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button className="shadow-soft transition-smooth hover:shadow-olive">
            <Save className="ml-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="company">بيانات الشركة</TabsTrigger>
          <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
        </TabsList>

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
                  <Input id="firstName" defaultValue="محمد" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input id="lastName" defaultValue="أحمد" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue="mohamed@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" defaultValue="+970-123-456789" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">المنصب</Label>
                <Select defaultValue="manager">
                  <SelectTrigger>
                    <SelectValue />
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
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input id="companyName" defaultValue="معصرة الزيتون الفلسطينية" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">رقم الترخيص</Label>
                  <Input id="license" defaultValue="LIC-2024-001" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea id="address" defaultValue="رام الله، فلسطين - شارع الإرسال - مجمع الزيتون" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input id="website" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">الرقم الضريبي</Label>
                  <Input id="tax" defaultValue="TAX-123456789" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الشركة</Label>
                <Textarea 
                  id="description" 
                  placeholder="وصف مختصر عن الشركة..."
                  defaultValue="معصرة حديثة لإنتاج زيت الزيتون البكر الممتاز بأعلى معايير الجودة"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات الإنتاج</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">السعة اليومية (لتر)</Label>
                    <Input id="capacity" type="number" defaultValue="2000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lines">عدد خطوط الإنتاج</Label>
                    <Input id="lines" type="number" defaultValue="3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select defaultValue="ils">
                    <SelectTrigger>
                      <SelectValue />
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
                        تنبيه عند انخفاض مستوى المخزون
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
                        تنبيه عند مشاكل في الجودة
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
                        تنبيه عند تحديث حالة الطلبات
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
                      <SelectValue />
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
                      <SelectValue />
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
                      <SelectValue />
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
                      <SelectValue />
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

        <TabsContent value="security" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>الأمان وكلمة المرور</CardTitle>
              <CardDescription>
                إدارة إعدادات الأمان وتغيير كلمة المرور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">تغيير كلمة المرور</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>تحديث كلمة المرور</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات الأمان</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>المصادقة الثنائية</Label>
                      <p className="text-sm text-muted-foreground">
                        طبقة حماية إضافية لحسابك
                      </p>
                    </div>
                    <Badge variant="outline">غير مفعل</Badge>
                  </div>
                  <Button variant="outline">تفعيل المصادقة الثنائية</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">الجلسات النشطة</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Windows PC - Chrome</p>
                      <p className="text-sm text-muted-foreground">
                        رام الله، فلسطين • الجلسة الحالية
                      </p>
                    </div>
                    <Badge>نشط</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">iPhone - Safari</p>
                      <p className="text-sm text-muted-foreground">
                        نابلس، فلسطين • آخر نشاط قبل ساعتين
                      </p>
                    </div>
                    <Button variant="outline" size="sm">إنهاء الجلسة</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card className="shadow-soft transition-smooth hover:shadow-olive">
            <CardHeader>
              <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
              <CardDescription>
                إدارة النسخ الاحتياطي للبيانات واستعادتها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">النسخ الاحتياطي التلقائي</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>النسخ الاحتياطي اليومي</Label>
                      <p className="text-sm text-muted-foreground">
                        نسخة احتياطية تلقائية كل يوم في الساعة 2:00 ص
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>وقت النسخ الاحتياطي</Label>
                    <Select defaultValue="02:00">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">12:00 ص</SelectItem>
                        <SelectItem value="02:00">2:00 ص</SelectItem>
                        <SelectItem value="04:00">4:00 ص</SelectItem>
                        <SelectItem value="06:00">6:00 ص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">النسخ الاحتياطي اليدوي</h3>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="ml-2 h-4 w-4" />
                    إنشاء نسخة احتياطية
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="ml-2 h-4 w-4" />
                    استعادة من نسخة احتياطية
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">النسخ الاحتياطية الأخيرة</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">نسخة احتياطية تلقائية</p>
                      <p className="text-sm text-muted-foreground">
                        2024-01-15 02:00 ص • حجم: 156 ميجابايت
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        استعادة
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">نسخة احتياطية يدوية</p>
                      <p className="text-sm text-muted-foreground">
                        2024-01-10 10:30 ص • حجم: 148 ميجابايت
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        استعادة
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">منطقة الخطر</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-destructive rounded-lg">
                    <h4 className="font-medium text-destructive">حذف جميع البيانات</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      حذف جميع البيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="mt-3">
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف جميع البيانات
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف جميع البيانات نهائياً ولن يمكن استعادتها. تأكد من وجود نسخة احتياطية قبل المتابعة.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            حذف نهائي
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}