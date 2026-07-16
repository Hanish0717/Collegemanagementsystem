import { useAlumni, DirectoryTab } from "../AdminAlumni";
import { useNavigate } from "@tanstack/react-router";

export function DirectoryPage() {
  const { directoryList, dirLoading, pendingAlumni, pendingLoading, setSelectedAlumniId, currentAlumniId, queryClient } = useAlumni();
  const navigate = useNavigate();

  return (
    <DirectoryTab
      list={directoryList}
      isLoading={dirLoading}
      pending={pendingAlumni}
      pendingLoading={pendingLoading}
      onSelectAlumni={(id: string) => {
        setSelectedAlumniId(id);
        navigate({ to: "/dashboard/admin/alumni/profile" });
      }}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
      }}
      currentAlumniId={currentAlumniId}
    />
  );
}
