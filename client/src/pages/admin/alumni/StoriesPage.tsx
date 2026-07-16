import { useAlumni, StoriesTab } from "../AdminAlumni";

export function StoriesPage() {
  const { successStories, storiesLoading, directoryList, queryClient } = useAlumni();

  return (
    <StoriesTab
      stories={successStories}
      isLoading={storiesLoading}
      alumniList={directoryList}
      onRefetch={() => queryClient.invalidateQueries({ queryKey: ["alumni-stories"] })}
    />
  );
}
