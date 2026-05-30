import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  Department
} from "../services/superAdminService";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useDepartments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const addMutation = useMutation({
    mutationFn: addDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department added successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add department");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: Omit<Department, "id"> }) =>
      updateDepartment(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update department");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete department");
    },
  });

  const { error } = query;

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load departments.",
      );
    }
  }, [error]);

  useEffect(() => {
    const channel = supabase
      .channel("departments-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["departments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    addDepartment: addMutation.mutateAsync,
    updateDepartment: updateMutation.mutateAsync,
    deleteDepartment: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
