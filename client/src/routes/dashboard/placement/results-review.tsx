import { createFileRoute } from "@tanstack/react-router";
import { RecruiterResultsReview } from "@/pages/placement/RecruiterResultsReview";

export const Route = createFileRoute("/dashboard/placement/results-review")({
  component: RecruiterResultsReview,
});
