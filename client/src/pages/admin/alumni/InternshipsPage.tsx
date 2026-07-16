import { useAlumni } from "../AdminAlumni";
import { InternshipsTab } from "../AlumniExtraTabs";

export function InternshipsPage() {
  const { directoryList } = useAlumni();

  return <InternshipsTab alumniList={directoryList} />;
}
