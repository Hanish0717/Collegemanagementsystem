import { useAlumni, ProfileTab } from "../AdminAlumni";

export function ProfilePage() {
  const { directoryList, selectedAlumniId, setSelectedAlumniId, selectedProfile, profileDetailLoading, queryClient } = useAlumni();

  return (
    <ProfileTab
      directory={directoryList}
      selectedId={selectedAlumniId}
      onSelectId={setSelectedAlumniId}
      profile={selectedProfile}
      isLoading={profileDetailLoading}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-profile-detail", selectedAlumniId] });
        queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
      }}
    />
  );
}
