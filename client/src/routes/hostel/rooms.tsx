import { createFileRoute } from "@tanstack/react-router";
import { HostelRooms } from "@/pages/hostel/HostelRooms";

export const Route = createFileRoute("/hostel/rooms")({
  component: HostelRooms,
});
