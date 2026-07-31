import { createFileRoute } from "@tanstack/react-router";
import { NetworkingPage } from "@/pages/admin/alumni/NetworkingPage";

export const Route = createFileRoute("/admin/alumni/networking")({
  component: NetworkingPage,
});
