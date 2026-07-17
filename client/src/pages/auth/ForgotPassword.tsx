import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      navigate({ to: '/reset-password', search: { email } });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to send reset link. Please try again.';
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

        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white shadow-soft shrink-0">
              <KeyRound className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground mt-0.5">We'll send you an OTP code</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 mb-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-medium">Registered Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-white bg-gradient-primary shadow-soft disabled:opacity-70 transition-all glow-primary mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP Code <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </>
      </motion.div>
    </div>
  );
}
