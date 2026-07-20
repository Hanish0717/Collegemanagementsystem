import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReportsData } from '../services/superAdminService';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSuperAdminAnalytics(filter?: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['superAdminReportsData', filter],
    queryFn: () => fetchReportsData(filter),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { error } = query;

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load system analytics.');
    }
  }, [error]);

  useEffect(() => {
    const channel = supabase
      .channel('analytics-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        queryClient.invalidateQueries({ queryKey: ['superAdminReportsData'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
