import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { ROLE_LIST, type RoleId } from "@/lib/roles";
import { useSearch } from "@tanstack/react-router";
import api from "@/lib/api";

export function Register() {
  const navigate = useNavigate();
  const search: any = useSearch({ strict: false });
  const initialRole = (search.role as RoleId) || "student";
  const allowedRoles: RoleId[] = ["student", "parent"];
  const finalRole = allowedRoles.includes(initialRole) ? initialRole : "student";
  const [roleId, setRoleId] = useState<RoleId>(finalRole);
  const active =
    ROLE_LIST.find((r) => r.id === roleId) || ROLE_LIST.find((r) => r.id === "student")!;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        name,
        email,
        mobile,
        password,
        role: active.id,
      });

      // Redirect to OTP verification page with email
      navigate({
        to: "/verify-otp",
        search: { email: email, target: "email_verification" },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again.";
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            Register as a <span className="text-gradient">{active.name}</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Your role determines your access permissions and the tools available to you on the
            campus management platform.
          </p>

          <div className="mt-6 grid grid-cols-2 xl:grid-cols-3 gap-3 max-w-3xl">
            {ROLE_LIST.filter((r) => r.id === roleId).map((r) => {
              const selected = r.id === roleId;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  // Single role mode
                  className={`group relative text-left rounded-2xl p-4 border transition-all overflow-hidden
                    ${
                      selected
                        ? "border-transparent shadow-soft -translate-y-0.5"
                        : "border-border bg-white/60 hover:-translate-y-0.5 hover:shadow-soft"
                    }`}
                >
                  {selected && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-95`}
                    />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div
                        className={`size-9 rounded-xl grid place-items-center ${
                          selected
                            ? "bg-white/15 text-white backdrop-blur"
                            : `bg-gradient-to-br ${r.gradient} text-white`
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      {selected && (
                        <span className="size-5 rounded-full bg-white/20 grid place-items-center">
                          <Check className="size-3 text-white" />
                        </span>
                      )}
                    </div>
                    <div className={`mt-3 text-sm font-semibold ${selected ? "text-white" : ""}`}>
                      {r.name}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${selected ? "text-white/85" : "text-muted-foreground"}`}
                    >
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
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 shadow-soft my-auto"
        >
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-bold text-lg">College Management System</span>
          </div>

          <h2 className="text-xl font-bold mt-2">Create an account</h2>
          <p className="text-sm text-muted-foreground mt-1">Register to join the platform</p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="mt-5 space-y-3.5" onSubmit={submit}>
            <div className="lg:hidden">
              <label className="text-xs font-medium">Role</label>
              <select
                value={roleId}
                disabled
                className="mt-1 w-full rounded-xl border bg-background/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring opacity-80"
              >
                <option value={active.id}>{active.name}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium">Full Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
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
              <label className="text-xs font-medium">Mobile Number</label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="text-xs font-medium">Confirm Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-white bg-gradient-to-r ${active.gradient} shadow-soft disabled:opacity-70 transition-all`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Register as {active.name} <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
