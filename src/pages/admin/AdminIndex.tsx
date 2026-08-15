import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building2, Receipt, Droplets, CalendarCheck, Filter, UserPlus, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminIndex() {
  const [stats, setStats] = useState({
    totalMills: 0,
    activeMills: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    totalInvoices: 0,
    totalOil: 0,
  });
  const [mills, setMills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactLink, setContactLink] = useState("");
  const [updatingLink, setUpdatingLink] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    email: "",
    password: "",
    mill_name: "",
    owner_name: "",
    phone: ""
  });
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setNewAccountData(prev => ({ ...prev, password: retVal }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-mill-account', {
        body: newAccountData
      });

      if (error) throw error;

      setCreatedCredentials({
        email: newAccountData.email,
        password: newAccountData.password
      });
      toast.success("تم إنشاء الحساب بنجاح");
      
      // Clear form but don't close modal until they copy credentials
      setNewAccountData({
        email: "",
        password: "",
        mill_name: "",
        owner_name: "",
        phone: ""
      });
      
      // Refresh list
      window.location.reload(); 
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all profiles and auth emails (via profiles linked to auth users)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) throw profilesError;

        // Fetch seasons to identify active ones
        const { data: seasons, error: seasonsError } = await supabase
          .from("seasons")
          .select("user_id, status");
        
        if (seasonsError) throw seasonsError;

        // Fetch all invoices for stats
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("oil_produced, created_at, user_id");

        if (invoicesError) throw invoicesError;

        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalOil = invoices.reduce((sum, inv) => sum + (inv.oil_produced || 0), 0);
        
        const activeUserIds = new Set(seasons.filter(s => s.status === 'open').map(s => s.user_id));
        
        const newThisWeek = profiles.filter(p => new Date(p.created_at) >= oneWeekAgo).length;
        const newThisMonth = profiles.filter(p => new Date(p.created_at) >= oneMonthAgo).length;

        setStats({
          totalMills: profiles.length,
          activeMills: activeUserIds.size,
          newThisWeek,
          newThisMonth,
          totalInvoices: invoices.length,
          totalOil,
        });

        // Prepare mill list
        // Note: For email, we might need a more complex join or just use what's in profile if stored
        // Since we can't easily join auth.users in public schema, we rely on profiles
        const millList = profiles.map(profile => {
          const userInvoices = invoices.filter(inv => inv.user_id === profile.user_id);
          const lastActivity = userInvoices.length > 0 
            ? new Date(Math.max(...userInvoices.map(inv => new Date(inv.created_at).getTime())))
            : new Date(profile.created_at);

          return {
            id: profile.user_id,
            name: profile.display_name || "معصرة غير مسمى",
            email: "---", // Auth email not directly in profiles table usually
            createdAt: profile.created_at,
            isActive: activeUserIds.has(profile.user_id),
            subscriptionStatus: profile.subscription_status || 'pending',
            invoiceCount: userInvoices.length,
            lastActivity,
          };
        });

        setMills(millList);
      } catch (error) {
        console.error("Admin data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchContactLink = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "contact_link")
        .single();
      if (data) setContactLink(data.value);
    };

    fetchData();
    fetchContactLink();
  }, []);

  const handleUpdateContactLink = async () => {
    setUpdatingLink(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({ 
        key: "contact_link", 
        value: contactLink,
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id
      });
    
    setUpdatingLink(false);
    if (!error) {
      alert("تم تحديث رابط التواصل بنجاح");
    }
  };

  if (loading) return <div className="p-8 text-center">جارٍ التحميل...</div>;

  const filteredMills = statusFilter === "all" 
    ? mills 
    : mills.filter(mill => mill.subscriptionStatus === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">موقف</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">قيد الانتظار</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          العودة للرئيسية
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">إعدادات النظام العالمية</CardTitle>
        </CardHeader>
        <CardContent className="text-right">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">رابط التواصل (واتساب، مسنجر، إلخ)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={contactLink}
                  onChange={(e) => setContactLink(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://wa.me/..."
                  dir="ltr"
                />
                <Button onClick={handleUpdateContactLink} disabled={updatingLink}>
                  {updatingLink ? "جاري الحفظ..." : "حفظ الرابط"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                هذا الرابط سيظهر لجميع المستخدمين في الصفحة الرئيسية عند النقر على "اطلب اشتراكك".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعاصر</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMills}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newThisWeek} جديد هذا الأسبوع
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معاصر نشطة</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMills}</div>
            <p className="text-xs text-muted-foreground">بمواسم مفتوحة حالياً</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيت المعالج</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOil.toLocaleString()} كغم</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تسجيلات الشهر</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mills Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>كل المعاصر</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="suspended">موقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المعصرة</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                <TableHead className="text-right">حالة الاشتراك</TableHead>
                <TableHead className="text-right">موسم نشط</TableHead>
                <TableHead className="text-right">عدد الفواتير</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMills.map((mill) => (
                <TableRow key={mill.id}>
                  <TableCell className="font-medium">{mill.name}</TableCell>
                  <TableCell>{new Date(mill.createdAt).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    {getStatusBadge(mill.subscriptionStatus)}
                  </TableCell>
                  <TableCell>{mill.invoiceCount}</TableCell>
                  <TableCell>
                    {mill.isActive ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">نعم</Badge>
                    ) : (
                      <Badge variant="secondary">لا</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/mill/${mill.id}`)}
                    >
                      عرض التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
