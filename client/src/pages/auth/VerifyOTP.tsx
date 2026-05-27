import { useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export function VerifyOTP() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/verify-otp" }) as {
    phoneNumber?: string;
    email?: string;
    target?: string;
  };

  const targetEmail = search.email;
  const otpType = search.target || "email_verification";

  // Determine display identifier (email)
  const displayIdentifier = targetEmail || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    if (!targetEmail) {
      navigate({ to: "/login" });
    }
  }, [targetEmail, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      if (otpType === "email_verification") {
        await api.post("/api/auth/send-otp", {
          email: targetEmail,
          type: otpType,
        });
        setTimer(300);
        setSuccess("A new OTP has been sent to your email.");
      } else {
        // Password reset uses forgot-password endpoint
        await api.post("/api/auth/forgot-password", { email: targetEmail });
        setTimer(300);
        setSuccess(`A new OTP has been sent to ${targetEmail}`);
      }
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend OTP. Please try again.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setError(null);
    setLoading(true);

    try {
      if (otpType === "email_verification") {
        // Email OTP verification (registration / email verification)
        const { data } = await api.post("/api/auth/verify-otp", {
          email: targetEmail,
          otp,
          type: otpType,
        });

        // After successful verification, store JWT and redirect
        if (data.token) {
          localStorage.setItem("cms_token", data.token);
          localStorage.setItem("cms_user", JSON.stringify(data.user));
          if (data.user?.role) {
            const roleMap: Record<string, string> = {
              "super-admin": "super_admin",
              admin: "admin",
              faculty: "faculty",
              student: "student",
              parent: "parent",
              librarian: "librarian",
              "placement-officer": "placement",
              "hostel-warden": "warden",
              "transport-manager": "transport",
            };
            localStorage.setItem("campusly.role", roleMap[data.user.role] || "student");
          }
          setSuccess("Email verified! Redirecting to dashboard…");
          const dashboardMap: Record<string, string> = {
            "super-admin": "/dashboard/super-admin",
            admin: "/dashboard/admin",
            faculty: "/dashboard/faculty",
            student: "/dashboard/student",
            parent: "/dashboard/parent",
            librarian: "/dashboard/librarian",
            "placement-officer": "/dashboard/placement",
            "hostel-warden": "/dashboard/hostel",
            "transport-manager": "/dashboard/transport",
          };
          const dashPath = dashboardMap[data.user?.role] || "/dashboard";
          setTimeout(() => navigate({ to: dashPath }), 1500);
        } else {
          setSuccess("Email verified! You can now sign in.");
          setTimeout(() => navigate({ to: "/login" }), 2000);
        }
      } else if (otpType === "password_reset") {
        // Email-based verification (password reset)
        await api.post("/api/auth/reset-password", {
          email: targetEmail,
          otp,
          type: otpType,
        });
        setSuccess("Verified! Redirecting to login…");
        setTimeout(() => navigate({ to: "/login" }), 2000);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Verification failed. Please check the OTP and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Determine the description text
  const descriptionText = "A 6-digit OTP has been sent to";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -right-20 size-96 rounded-full bg-gradient-primary opacity-25 blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gradient-violet opacity-25 blur-3xl animate-float pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 shadow-soft relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-gradient-primary grid place-items-center text-white shadow-soft">
            <ShieldCheck className="size-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center">Verify it's you</h2>
        <p className="text-sm text-muted-foreground text-center mt-2 px-4">
          {descriptionText}
          <br />
          <span className="font-semibold text-foreground">{displayIdentifier}</span>
        </p>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              required
              autoFocus
              className="w-full text-center text-3xl tracking-[1em] font-bold rounded-2xl border bg-background/60 py-4 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-white bg-gradient-primary shadow-soft disabled:opacity-70 transition-all glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                Verify and Continue <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm">
          {timer > 0 ? (
            <p className="text-muted-foreground text-center">
              Code expires in{" "}
              <span className="font-medium text-foreground">{formatTime(timer)}</span>
            </p>
          ) : (
            <p className="text-red-500 font-medium">Code expired</p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="inline-flex items-center gap-1.5 text-indigo font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            <RefreshCw className={`size-3.5 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending…" : "Resend Code"}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
