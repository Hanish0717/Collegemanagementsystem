import { createFileRoute } from "@tanstack/react-router";
import { HostelRooms } from "@/pages/hostel/HostelRooms";

export const Route = createFileRoute("/dashboard/hostel/rooms")({
  component: HostelRooms,
});
