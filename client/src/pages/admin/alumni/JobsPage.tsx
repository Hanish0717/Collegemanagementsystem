import { useAlumni, JobsTab } from "../AdminAlumni";

export function JobsPage() {
  const { jobList, jobsLoading, queryClient, directoryList } = useAlumni();

  return (
    <JobsTab
      list={jobList}
      isLoading={jobsLoading}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-jobs"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      }}
      alumniList={directoryList}
    />
  );
}
