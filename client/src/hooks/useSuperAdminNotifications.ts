import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications } from "../services/superAdminService";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export function useSuperAdminNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["superAdminNotifications"],
    queryFn: fetchNotifications,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data } = query;

  useEffect(() => {
    // Establishing real-time subscription to database changes on system_notifications table
    const channel = supabase
      .channel("system-notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_notifications" },
        (payload) => {
          console.log("Real-time notification update received:", payload);
          // Invalidate React Query cache for notifications and stats to force automatic sync
          queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
          queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });

          // Trigger a user-facing toast alert on incoming inserts
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new;
            if (newNotif && newNotif.unread) {
              toast.info(`🔔 New System Alert: ${newNotif.title}`, {
                description: `${newNotif.type} • Just now`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time system notifications via Supabase Realtime!");
        } else if (status === "CHANNEL_ERROR") {
          console.warn(
            "Could not connect to Supabase Realtime for system_notifications. " +
            "Ensure that the table is added to the publication: " +
            "'ALTER PUBLICATION supabase_realtime ADD TABLE system_notifications;'"
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
