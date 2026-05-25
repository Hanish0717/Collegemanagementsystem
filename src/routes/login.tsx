import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, ArrowRight, Github, Chrome, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { ROLE_LIST, setActiveRole, type RoleId } from "@/lib/roles";
import { getDashboardForRole, isAuthenticated, getStoredUser } from "@/services/authService";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        throw redirect({ to: getDashboardForRole(user.role) });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — College Management System" },
      { name: "description", content: "Sign in to your College Management System account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [roleId, setRoleId] = useState<RoleId>("super_admin");
  const active = ROLE_LIST.find(r => r.id === roleId)!;

  // Controlled form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });

      // Also sync the legacy role selector so sidebar picks it up
      setActiveRole(roleId);

      // Navigate to role-specific dashboard
      const dest = getDashboardForRole(user.role);
      navigate({ to: dest });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-gradient-hero">
      {/* Left — role selection */}
      <div className="relative hidden lg:flex flex-col p-10 xl:p-14 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-32 -right-20 size-96 rounded-full bg-gradient-primary opacity-25 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gradient-violet opacity-25 blur-3xl animate-float" />

        <Link to="/" className="relative inline-flex items-center gap-2 mb-8 w-fit">
          <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center text-white">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-bold text-xl">College Management System</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            Choose your <span className="text-gradient">role</span> to access the campus system
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Each role unlocks a customized dashboard with relevant academic analytics, administrative functions, and institutional insights.
          </p>

          <div className="mt-6 grid grid-cols-2 xl:grid-cols-3 gap-3 max-w-3xl">
            {ROLE_LIST.map(r => {
              const selected = r.id === roleId;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleId(r.id)}
                  className={`group relative text-left rounded-2xl p-4 border transition-all overflow-hidden
                    ${selected
                      ? "border-transparent shadow-soft -translate-y-0.5"
                      : "border-border bg-white/60 hover:-translate-y-0.5 hover:shadow-soft"}`}
                >
                  {selected && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-95`} />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`size-9 rounded-xl grid place-items-center ${selected ? "bg-white/15 text-white backdrop-blur" : `bg-gradient-to-br ${r.gradient} text-white`}`}>
                        <Icon className="size-4" />
                      </div>
                      {selected && (
                        <span className="size-5 rounded-full bg-white/20 grid place-items-center">
                          <Check className="size-3 text-white" />
                        </span>
                      )}
                    </div>
                    <div className={`mt-3 text-sm font-semibold ${selected ? "text-white" : ""}`}>{r.name}</div>
                    <div className={`text-[11px] mt-0.5 ${selected ? "text-white/85" : "text-muted-foreground"}`}>
                      {r.short}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 shadow-soft"
        >
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-bold text-lg">College Management System</span>
          </div>

          <div className={`rounded-2xl p-4 bg-gradient-to-br ${active.gradient} text-white shadow-soft`}>
            <div className="text-[11px] uppercase tracking-wide opacity-80">Signing in as</div>
            <div className="text-lg font-semibold mt-0.5">{active.name}</div>
            <div className="text-xs opacity-85 mt-0.5">{active.description}</div>
          </div>

          <h2 className="text-xl font-bold mt-6">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your institutional credentials to access the campus management system</p>

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div className="lg:hidden">
              <label className="text-xs font-medium">Role</label>
              <select
                value={roleId} onChange={(e)=>setRoleId(e.target.value as RoleId)}
                className="mt-1 w-full rounded-xl border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ROLE_LIST.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" /> Remember me
              </label>
              <a href="#" className="text-indigo hover:underline">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-white bg-gradient-to-r ${active.gradient} shadow-soft disabled:opacity-70`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Access as {active.name} <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border bg-background/60 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-accent">
              <Chrome className="size-4" /> Google
            </button>
            <button className="rounded-xl border bg-background/60 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-accent">
              <Github className="size-4" /> GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            New here? <Link to="/dashboard" className="text-indigo hover:underline">Take a tour</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
