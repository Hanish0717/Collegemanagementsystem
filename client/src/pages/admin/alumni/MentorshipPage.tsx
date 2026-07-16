import { useAlumni, MentorshipTab } from "../AdminAlumni";

export function MentorshipPage() {
  const { mentorshipRequests, mentorLoading, queryClient, directoryList } = useAlumni();

  return (
    <MentorshipTab
      requests={mentorshipRequests}
      isLoading={mentorLoading}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-mentorship"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      }}
      alumniList={directoryList}
    />
  );
}
