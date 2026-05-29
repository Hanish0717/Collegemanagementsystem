import { useQuery } from "@tanstack/react-query";
import { fetchSuperAdminStats } from "../services/superAdminService";
import { toast } from "sonner";
import { useEffect } from "react";

export function useSuperAdminStats() {
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

  return query;
}
