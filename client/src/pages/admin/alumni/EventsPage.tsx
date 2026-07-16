import { useRouterState } from "@tanstack/react-router";
import { useAlumni, EventsTab } from "../AdminAlumni";

export function EventsPage() {
  const { eventList, eventsLoading, queryClient, directoryList } = useAlumni();
  const searchStr = useRouterState({ select: (r) => r.location.searchStr });
  const initialSection = new URLSearchParams(searchStr).get("section") || undefined;

  return (
    <EventsTab
      list={eventList}
      isLoading={eventsLoading}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      }}
      alumniList={directoryList}
      initialSection={initialSection}
    />
  );
}
