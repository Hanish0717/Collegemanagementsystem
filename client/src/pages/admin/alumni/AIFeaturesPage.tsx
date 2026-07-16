import { useAlumni, AIFeaturesTab } from "../AdminAlumni";

export function AIFeaturesPage() {
  const { currentAlumniId } = useAlumni();

  return <AIFeaturesTab currentAlumniId={currentAlumniId} />;
}
