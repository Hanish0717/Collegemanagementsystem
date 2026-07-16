import { useAlumni, EventsTab } from "../AdminAlumni";

export function EventsPage() {
  const { eventList, eventsLoading, queryClient, directoryList } = useAlumni();

  return (
    <EventsTab
      list={eventList}
      isLoading={eventsLoading}
      onRefetch={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      }}
      alumniList={directoryList}
    />
  );
}
