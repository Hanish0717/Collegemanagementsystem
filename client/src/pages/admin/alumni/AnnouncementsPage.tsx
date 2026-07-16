import { useAlumni, AnnouncementsTab } from "../AdminAlumni";

export function AnnouncementsPage() {
  const { directoryList } = useAlumni();

  return <AnnouncementsTab alumniList={directoryList} />;
}
