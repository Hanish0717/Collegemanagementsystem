import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, toggleUserStatus } from "../services/superAdminService";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update user status");
    },
  });

  const { error } = query;

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load users.",
      );
    }
  }, [error]);

  useEffect(() => {
    const channel = supabase
      .channel("users-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    toggleStatus: toggleStatusMutation.mutate,
    isMutating: toggleStatusMutation.isPending,
  };
}
