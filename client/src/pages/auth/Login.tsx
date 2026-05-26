import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ROLE_LIST, setActiveRole, type RoleId } from "@/lib/roles";
import { getDashboardForRole, toFrontendRole } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export function Login() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-hero flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  // Clear any stale session on login page load
  useEffect(() => {
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_user");
    localStorage.removeItem("campusly.role");
  }, []);
  
  const [roleId, setRoleId] = useState<RoleId>("super_admin");
  const active = ROLE_LIST.find(r => r.id === roleId)!;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login({ email, password });
      // Direct login — no OTP step
      const user = result;
      setActiveRole(toFrontendRole(user.role));
      navigate({ to: getDashboardForRole(user.role) });
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

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setGoogleLoading(true);
    setError(null);
    try {
      // Exchange access token for user info
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      }).then(r => r.json());

      const res = await api.post('/api/auth/google', {
        credential: tokenResponse.access_token,
        googleUserInfo: userInfo,
        role: roleId,
      });

      if (res.data.token) {
        localStorage.setItem('cms_token', res.data.token);
        localStorage.setItem('cms_user', JSON.stringify(res.data.user));
        const role = toFrontendRole(res.data.user.role);
        localStorage.setItem('campusly.role', role);
        await refreshUser();
        navigate({ to: getDashboardForRole(res.data.user.role) });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Sign-In was cancelled or failed.'),
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-gradient-hero">
      {/* Left — role selection */}
      <div className="relative hidden lg:flex flex-col p-10 xl:p-14 overflow-hidden max-h-screen overflow-y-auto">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-20 size-96 rounded-full bg-gradient-primary opacity-25 blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gradient-violet opacity-25 blur-3xl animate-float pointer-events-none" />

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
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-card rounded-3xl p-8 shadow-soft my-auto"
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
                      autoComplete="off"
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
                      autoComplete="new-password"
                      className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" /> Remember me
                  </label>
                  <Link to="/forgot-password" className="text-indigo hover:underline">Forgot password?</Link>
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
                  Sign in as {active.name} <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background/60 py-2.5 text-sm font-medium hover:bg-muted/50 transition-all disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Create Account link — shown for all roles */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo hover:underline font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
