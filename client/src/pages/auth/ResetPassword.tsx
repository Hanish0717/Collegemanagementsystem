import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Lock, ArrowRight, Loader2, KeySquare, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export function ResetPassword() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/reset-password" }) as { email?: string };
  const { email } = search;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      navigate({ to: "/login" });
    }
  }, [email, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", { email, otp, password });
      navigate({ to: "/login" });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to reset password. OTP may be invalid or expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center text-white">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-bold text-lg">College Management System</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white shadow-soft shrink-0">
            <KeySquare className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Set New Password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Enter OTP sent to {email}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 mb-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs font-medium">6-Digit OTP</label>
            <div className="mt-1 relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-center tracking-widest text-lg font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">New Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Confirm New Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-white bg-gradient-primary shadow-soft disabled:opacity-70 transition-all glow-primary mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                Update Password <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
