import { useAlumni } from "../AdminAlumni";
import { PlacementPortalTab } from "../AlumniExtraTabs";

export function PlacementsPage() {
  const { directoryList, stats } = useAlumni();

  return <PlacementPortalTab alumniList={directoryList} stats={stats} />;
}
