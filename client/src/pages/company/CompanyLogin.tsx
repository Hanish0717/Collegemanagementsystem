import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Briefcase, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";
import { recruiterLogin, recruiterChangePassword } from "@/services/companyRecruiterService";

export const CompanyLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Force Password Change Modal State
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await recruiterLogin(email, password);
      if (res.needsPasswordChange) {
        toast.info("Temporary password detected. Please set a new secure password.");
        setMustChangePassword(true);
      } else {
        toast.success(`Welcome back, ${res.user.name}!`);
        router.navigate({ to: "/company/dashboard" });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials or account disabled.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setChangingPass(true);
    try {
      await recruiterChangePassword(password, newPassword);
      toast.success("Password updated successfully! Welcome to your dashboard.");
      setMustChangePassword(false);
      router.navigate({ to: "/company/dashboard" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground relative overflow-hidden px-4">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 size-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/25 mx-auto border border-purple-400/30">
            <Briefcase className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-3">Corporate Recruiter Portal</h1>
          <p className="text-sm text-muted-foreground">Campus Placement &amp; Candidate Evaluation System</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Recruiter Portal</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-1 border-t border-border text-center text-xs text-muted-foreground">
            <span className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-4 text-purple-500" /> Secure Corporate RBAC Authorization
            </span>
          </div>
        </div>

        {/* Demo Helper Badge */}
        <div className="text-center p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs text-purple-500 dark:text-purple-300">
          <p className="font-semibold">Demo Recruiter Login:</p>
          <p className="font-mono text-[11px] mt-0.5 opacity-90">anjali.sharma@google.com | Recruit@Google123</p>
        </div>
      </div>

      {/* MANDATORY FORCE PASSWORD CHANGE MODAL */}
      {mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Key className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Change Temporary Password</h3>
                <p className="text-xs text-muted-foreground">First-time login security setup required</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">New Password *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
                >
                  {changingPass ? "Updating Password..." : "Save Password & Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
