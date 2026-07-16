import { useAlumni, VerificationTab } from "../AdminAlumni";

export function VerificationPage() {
  const { directoryList } = useAlumni();

  return <VerificationTab alumniList={directoryList} />;
}
