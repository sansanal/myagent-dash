import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "superadmin";

export function useRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role");
      if (!isMounted) return;
      if (error) {
        console.error("Error fetching roles", error);
        setRoles([]);
      } else {
        setRoles((data || []).map((r: any) => r.role) as AppRole[]);
      }
      setLoading(false);
    };

    fetchRoles();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchRoles();
    });

    return () => {
      isMounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);

  return { roles, hasRole, loading };
}
