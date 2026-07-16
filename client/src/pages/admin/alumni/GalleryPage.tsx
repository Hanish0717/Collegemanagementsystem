import { useAlumni } from "../AdminAlumni";
import { EventGalleryTab } from "../AlumniExtraTabs";

export function GalleryPage() {
  const { eventList } = useAlumni();

  return <EventGalleryTab eventList={eventList} />;
}
