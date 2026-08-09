import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoleContextType {
  isAdmin: boolean | null;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  isAdmin: null,
  loading: true,
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', { 
        _user_id: user.id, 
        _role: 'platform_admin' 
      });

      if (error) {
        console.error("Error checking role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
      setLoading(false);
    };

    checkRole();
  }, []);

  return (
    <RoleContext.Provider value={{ isAdmin, loading }}>
      {children}
    </RoleContext.Provider>
  );
};
