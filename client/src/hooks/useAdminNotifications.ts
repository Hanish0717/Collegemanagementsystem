import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminNotifications } from '../services/adminService';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: fetchAdminNotifications,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    // Establishing real-time subscription to database changes on admin_notifications table
    const channel = supabase
      .channel('admin-notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          console.log('Real-time admin notification update received:', payload);
          // Invalidate React Query cache for notifications to force automatic sync
          queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });

          // Trigger a user-facing toast alert on incoming inserts
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new;
            if (newNotif && newNotif.unread) {
              toast.info(`🔔 Admin Alert: ${newNotif.title}`, {
                description: `${newNotif.category} • Just now`,
                duration: 5000,
              });
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(
            'Successfully subscribed to real-time admin notifications via Supabase Realtime!',
          );
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(
            'Could not connect to Supabase Realtime for admin_notifications. ' +
              'Ensure that the table is added to the publication: ' +
              "'ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;'",
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
