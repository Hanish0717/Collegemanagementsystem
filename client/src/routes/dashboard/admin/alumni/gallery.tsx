import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/pages/admin/alumni/GalleryPage";

export const Route = createFileRoute("/dashboard/admin/alumni/gallery")({
  component: GalleryPage,
});
