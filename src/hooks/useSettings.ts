import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MillSettings {
  return_percent: number;
  oil_sell_price: number;
  oil_buy_price: number;
  cash_return_cost: number;
  plastic_container_price: number;
  metal_container_price: number;
}

const DEFAULT_SETTINGS: MillSettings = {
  return_percent: 6,
  oil_sell_price: 25,
  oil_buy_price: 23,
  cash_return_cost: 1.5,
  plastic_container_price: 10,
  metal_container_price: 15,
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MillSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        return_percent: Number(data.return_percent),
        oil_sell_price: Number(data.oil_sell_price),
        oil_buy_price: Number(data.oil_buy_price),
        cash_return_cost: Number(data.cash_return_cost),
        plastic_container_price: Number(data.plastic_container_price),
        metal_container_price: Number(data.metal_container_price),
      });
    } else if (!data && !error) {
      // Create default settings
      await supabase.from("settings").insert({ user_id: user.id });
    }
    setLoading(false);
  };

  const updateSettings = async (newSettings: Partial<MillSettings>) => {
    if (!user) return;
    const { error } = await supabase
      .from("settings")
      .update(newSettings)
      .eq("user_id", user.id);

    if (!error) {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    }
    return { error };
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
