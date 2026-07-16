import { useAlumni, MessagingTab } from "../AdminAlumni";

export function MessagingPage() {
  const { directoryList, currentAlumniId } = useAlumni();

  return <MessagingTab alumniList={directoryList} currentAlumniId={currentAlumniId} />;
}
