import { createFileRoute } from "@tanstack/react-router";
import { FacultyCounselling } from "@/pages/faculty/FacultyCounselling";

export const Route = createFileRoute("/faculty/students")({
  component: FacultyCounselling,
});
