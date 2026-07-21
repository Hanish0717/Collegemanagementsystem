import { createFileRoute } from "@tanstack/react-router";
import { VerifyOTP } from "@/pages/auth/VerifyOTP";

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOTP,
});
