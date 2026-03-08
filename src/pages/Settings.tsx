import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useInventory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Settings() {
  const { settings, loading, updateSettings } = useSettings();
  const { inventory, updateInventory } = useInventory();
  const { toast } = useToast();

  const [form, setForm] = useState({
    return_percent: "",
    oil_sell_price: "",
    oil_buy_price: "",
    cash_return_cost: "",
    plastic_container_price: "",
    metal_container_price: "",
  });

  const [inventoryForm, setInventoryForm] = useState({
    total_oil: "",
    total_cash: "",
  });

  useEffect(() => {
    if (!loading) {
      setForm({
        return_percent: String(settings.return_percent),
        oil_sell_price: String(settings.oil_sell_price),
        oil_buy_price: String(settings.oil_buy_price),
        cash_return_cost: String(settings.cash_return_cost),
        plastic_container_price: String(settings.plastic_container_price),
        metal_container_price: String(settings.metal_container_price),
      });
      setInventoryForm({
        total_oil: String(inventory.total_oil),
        total_cash: String(inventory.total_cash),
      });
    }
  }, [loading, settings, inventory]);

  const saveSettings = async () => {
    const result = await updateSettings({
      return_percent: parseFloat(form.return_percent),
      oil_sell_price: parseFloat(form.oil_sell_price),
      oil_buy_price: parseFloat(form.oil_buy_price),
      cash_return_cost: parseFloat(form.cash_return_cost),
      plastic_container_price: parseFloat(form.plastic_container_price),
      metal_container_price: parseFloat(form.metal_container_price),
    });
    if (!result?.error) {
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات المعصرة بنجاح" });
    }
  };

  const saveInventory = async () => {
    const result = await updateInventory({
      total_oil: parseFloat(inventoryForm.total_oil),
      total_cash: parseFloat(inventoryForm.total_cash),
    });
    if (!result?.error) {
      toast({ title: "تم الحفظ", description: "تم تحديث المخزون بنجاح" });
    }
  };

  if (loading) return <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات المعصرة والثوابت</CardTitle>
          <CardDescription>الثوابت المستخدمة في حساب الفواتير وطرق الدفع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>نسبة الرد (%)</Label>
              <Input type="number" value={form.return_percent} onChange={(e) => setForm(p => ({ ...p, return_percent: e.target.value }))} min="0" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>تكلفة الرد نقداً (شيكل/كغم)</Label>
              <Input type="number" value={form.cash_return_cost} onChange={(e) => setForm(p => ({ ...p, cash_return_cost: e.target.value }))} min="0" step="0.1" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>سعر بيع الزيت (شيكل/كغم)</Label>
              <Input type="number" value={form.oil_sell_price} onChange={(e) => setForm(p => ({ ...p, oil_sell_price: e.target.value }))} min="0" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>سعر شراء الزيت (شيكل/كغم)</Label>
              <Input type="number" value={form.oil_buy_price} onChange={(e) => setForm(p => ({ ...p, oil_buy_price: e.target.value }))} min="0" step="0.1" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>سعر التنكة البلاستيكية (شيكل)</Label>
              <Input type="number" value={form.plastic_container_price} onChange={(e) => setForm(p => ({ ...p, plastic_container_price: e.target.value }))} min="0" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>سعر التنكة الحديدية (شيكل)</Label>
              <Input type="number" value={form.metal_container_price} onChange={(e) => setForm(p => ({ ...p, metal_container_price: e.target.value }))} min="0" step="0.1" />
            </div>
          </div>
          <Button onClick={saveSettings}><Save className="h-4 w-4 me-2" />حفظ الإعدادات</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المخزون الحالي</CardTitle>
          <CardDescription>تعديل كمية الزيت والكاش المتوفر يدوياً</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>كمية الزيت (كغم)</Label>
              <Input type="number" value={inventoryForm.total_oil} onChange={(e) => setInventoryForm(p => ({ ...p, total_oil: e.target.value }))} min="0" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>الكاش المتوفر (شيكل)</Label>
              <Input type="number" value={inventoryForm.total_cash} onChange={(e) => setInventoryForm(p => ({ ...p, total_cash: e.target.value }))} min="0" step="0.1" />
            </div>
          </div>
          <Button onClick={saveInventory}><Save className="h-4 w-4 me-2" />حفظ المخزون</Button>
        </CardContent>
      </Card>
    </div>
  );
}
