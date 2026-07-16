import { useAlumni, DashboardTab } from "../AdminAlumni";
import { useNavigate } from "@tanstack/react-router";

export function DashboardPage() {
  const { stats, statsLoading, donationLeaderboard, eventList, directoryList, mentorshipRequests } = useAlumni();
  const navigate = useNavigate();

  return (
    <DashboardTab
      stats={stats}
      isLoading={statsLoading}
      onNavigate={(tabId: string) => navigate({ to: tabId === "dashboard" ? "/dashboard/admin/alumni" : `/dashboard/admin/alumni/${tabId}` })}
      donationLeaderboard={donationLeaderboard}
      eventList={eventList}
      directoryList={directoryList}
      mentorshipRequests={mentorshipRequests}
    />
  );
}
