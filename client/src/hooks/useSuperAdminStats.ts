import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSuperAdminStats } from "../services/superAdminService";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSuperAdminStats() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["superAdminStats"],
    queryFn: fetchSuperAdminStats,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { error } = query;

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load super admin statistics.",
      );
    }
  }, [error]);

  useEffect(() => {
    const channel = supabase
      .channel("stats-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
