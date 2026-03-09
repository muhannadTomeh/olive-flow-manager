import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Save, Copy, Leaf } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeason } from "@/contexts/SeasonContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SeasonSetup() {
  const { user } = useAuth();
  const { seasons, refetch, enterSeason } = useSeason();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    return_percent: "6",
    oil_sell_price: "25",
    oil_buy_price: "23",
    cash_return_cost: "1.5",
    plastic_container_price: "10",
    metal_container_price: "15",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && seasons.length > 0) {
      const season = seasons.find((s) => s.id === id);
      if (season) {
        setForm({
          name: season.name,
          start_date: season.start_date || "",
          end_date: season.end_date || "",
          return_percent: String(season.return_percent),
          oil_sell_price: String(season.oil_sell_price),
          oil_buy_price: String(season.oil_buy_price),
          cash_return_cost: String(season.cash_return_cost),
          plastic_container_price: String(season.plastic_container_price),
          metal_container_price: String(season.metal_container_price),
        });
      }
    }
  }, [isEdit, id, seasons]);

  const copyFromLastSeason = () => {
    if (seasons.length === 0) {
      toast({ title: "لا يوجد مواسم سابقة", variant: "destructive" });
      return;
    }
    const last = seasons[0]; // sorted by created_at desc
    setForm((prev) => ({
      ...prev,
      return_percent: String(last.return_percent),
      oil_sell_price: String(last.oil_sell_price),
      oil_buy_price: String(last.oil_buy_price),
      cash_return_cost: String(last.cash_return_cost),
      plastic_container_price: String(last.plastic_container_price),
      metal_container_price: String(last.metal_container_price),
    }));
    toast({ title: "تم النسخ", description: "تم نسخ إعدادات الموسم السابق" });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم الموسم", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      user_id: user!.id,
      name: form.name.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      return_percent: parseFloat(form.return_percent) || 6,
      oil_sell_price: parseFloat(form.oil_sell_price) || 25,
      oil_buy_price: parseFloat(form.oil_buy_price) || 23,
      cash_return_cost: parseFloat(form.cash_return_cost) || 1.5,
      plastic_container_price: parseFloat(form.plastic_container_price) || 10,
      metal_container_price: parseFloat(form.metal_container_price) || 15,
    };

    if (isEdit) {
      const { error } = await supabase.from("seasons").update(payload).eq("id", id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم الحفظ", description: "تم تحديث الموسم بنجاح" });
        await refetch();
        navigate("/seasons");
      }
    } else {
      // Deactivate all active seasons first
      await supabase
        .from("seasons")
        .update({ status: "closed" })
        .eq("user_id", user!.id)
        .eq("status", "active");

      const { data, error } = await supabase.from("seasons").insert({ ...payload, status: "active" }).select().single();
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        // Create inventory for this season
        await supabase.from("inventory").insert({ user_id: user!.id, season_id: data.id });
        toast({ title: "تم الإنشاء", description: `تم إنشاء ${form.name} وتفعيله` });
        await refetch();
        navigate("/dashboard");
      }
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-6 sticky top-0 z-40">
        <Button variant="ghost" onClick={() => navigate("/seasons")} className="me-4">
          <ArrowRight className="h-5 w-5 me-1" />
          رجوع
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 olive-gradient rounded-lg flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? "تعديل الموسم" : "إنشاء موسم جديد"}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الموسم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>اسم الموسم *</Label>
              <Input
                placeholder="مثال: موسم 2025"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-lg h-12 mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تاريخ البداية</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>تاريخ النهاية (اختياري)</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>إعدادات الموسم</CardTitle>
            {!isEdit && seasons.length > 0 && (
              <Button variant="outline" size="sm" onClick={copyFromLastSeason}>
                <Copy className="h-4 w-4 me-2" />
                نسخ من الموسم السابق
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نسبة الرد بالزيت (%)</Label>
                <Input
                  type="number"
                  value={form.return_percent}
                  onChange={(e) => setForm({ ...form, return_percent: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>تكلفة الرد النقدي (شيكل/كغم)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.cash_return_cost}
                  onChange={(e) => setForm({ ...form, cash_return_cost: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>سعر بيع الزيت (شيكل/كغم)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.oil_sell_price}
                  onChange={(e) => setForm({ ...form, oil_sell_price: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>سعر شراء الزيت (شيكل/كغم)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.oil_buy_price}
                  onChange={(e) => setForm({ ...form, oil_buy_price: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>سعر التنكة البلاستيكية (شيكل)</Label>
                <Input
                  type="number"
                  value={form.plastic_container_price}
                  onChange={(e) => setForm({ ...form, plastic_container_price: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>سعر التنكة المعدنية (شيكل)</Label>
                <Input
                  type="number"
                  value={form.metal_container_price}
                  onChange={(e) => setForm({ ...form, metal_container_price: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full text-lg py-6"
          size="lg"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-5 w-5 me-2" />
          {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء الموسم والدخول"}
        </Button>
      </main>
    </div>
  );
}
