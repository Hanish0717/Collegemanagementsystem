import { useAlumni, ReportsTab } from "../AdminAlumni";

export function ReportsPage() {
  const { directoryList, donationLeaderboard } = useAlumni();

  return <ReportsTab alumni={directoryList} donations={donationLeaderboard} />;
}
