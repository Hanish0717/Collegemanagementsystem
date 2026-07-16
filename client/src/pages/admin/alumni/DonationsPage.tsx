import { useAlumni, DonationsTab } from "../AdminAlumni";

export function DonationsPage() {
  const { donationLeaderboard, leaderboardLoading, directoryList, queryClient } = useAlumni();

  return (
    <DonationsTab
      leaderboard={donationLeaderboard}
      isLoading={leaderboardLoading}
      alumniList={directoryList}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-leaderboard"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      }}
    />
  );
}
