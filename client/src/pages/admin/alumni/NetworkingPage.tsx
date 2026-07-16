import { useAlumni, NetworkingTab } from "../AdminAlumni";

export function NetworkingPage() {
  const { feedPosts, feedLoading, connections, connsLoading, directoryList, currentAlumniId, queryClient } = useAlumni();

  return (
    <NetworkingTab
      posts={feedPosts}
      isLoading={feedLoading}
      connections={connections}
      connsLoading={connsLoading}
      alumniList={directoryList}
      currentAlumniId={currentAlumniId}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-feed"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-connections"] });
      }}
    />
  );
}
