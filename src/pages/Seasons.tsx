import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LogIn, Pencil, Lock, Users, Package, DollarSign, Calendar, Leaf } from "lucide-react";
import { useSeason, Season } from "@/contexts/SeasonContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

interface SeasonStats {
  customers: number;
  oilProduced: number;
  revenue: number;
}

export default function Seasons() {
  const { seasons, loading, enterSeason, closeSeason, refetch } = useSeason();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statsMap, setStatsMap] = useState<Record<string, SeasonStats>>({});

  useEffect(() => {
    if (seasons.length > 0 && user) {
      fetchAllStats();
    }
  }, [seasons, user]);

  const fetchAllStats = async () => {
    const map: Record<string, SeasonStats> = {};
    for (const season of seasons) {
      const [custRes, invRes] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("season_id", season.id),
        supabase.from("invoices").select("oil_produced, cash_amount").eq("user_id", user!.id).eq("season_id", season.id),
      ]);
      const invoices = invRes.data || [];
      map[season.id] = {
        customers: custRes.count || 0,
        oilProduced: invoices.reduce((s, i: any) => s + Number(i.oil_produced), 0),
        revenue: invoices.reduce((s, i: any) => s + Number(i.cash_amount), 0),
      };
    }
    setStatsMap(map);
  };

  const handleEnter = async (season: Season) => {
    await enterSeason(season.id);
    toast({ title: "تم الدخول", description: `تم تفعيل ${season.name}` });
    navigate("/dashboard");
  };

  const handleClose = async (season: Season) => {
    await closeSeason(season.id);
    toast({ title: "تم الإغلاق", description: `تم إغلاق ${season.name}` });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <p className="text-muted-foreground text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 olive-gradient rounded-lg flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">نظام إدارة معاصر الزيتون</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 me-1" />
            خروج
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Title + Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">المواسم</h2>
            <p className="text-muted-foreground mt-1">اختر موسمًا للدخول إليه أو أنشئ موسمًا جديدًا</p>
          </div>
          <Button size="lg" className="text-base px-6 py-3" onClick={() => navigate("/seasons/new")}>
            <Plus className="h-5 w-5 me-2" />
            إنشاء موسم جديد
          </Button>
        </div>

        {/* Empty State */}
        {seasons.length === 0 && (
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">لا يوجد مواسم بعد</h3>
              <p className="text-muted-foreground mb-6">أنشئ موسمك الأول لبدء استخدام النظام</p>
              <Button size="lg" onClick={() => navigate("/seasons/new")}>
                <Plus className="h-5 w-5 me-2" />
                إنشاء الموسم الأول
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Season Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {seasons.map((season) => {
            const stats = statsMap[season.id] || { customers: 0, oilProduced: 0, revenue: 0 };
            const isActive = season.status === "active";

            return (
              <Card
                key={season.id}
                className={`relative overflow-hidden transition-shadow hover:shadow-lg ${isActive ? "ring-2 ring-primary border-primary" : ""}`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                )}
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{season.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(season.start_date)}
                        {season.end_date ? ` — ${formatDate(season.end_date)}` : ""}
                      </p>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"} className="text-sm px-3 py-1">
                      {isActive ? "نشط" : "مغلق"}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">{stats.customers}</p>
                      <p className="text-xs text-muted-foreground">زبون</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <Package className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">{stats.oilProduced.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">كغم زيت</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">{stats.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">شيكل</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 text-base py-5"
                      onClick={() => handleEnter(season)}
                    >
                      <LogIn className="h-4 w-4 me-2" />
                      دخول الموسم
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      onClick={() => navigate(`/seasons/edit/${season.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isActive && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 text-destructive hover:text-destructive"
                        onClick={() => handleClose(season)}
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
