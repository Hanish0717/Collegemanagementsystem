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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/40 dark:to-slate-900 p-4 relative">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -right-20 size-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-blue-900/5 relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="size-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow-md shadow-blue-500/25">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Campus ERP</span>
        </Link>

        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-blue-600 grid place-items-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <KeyRound className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Forgot Password?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We'll send you an OTP verification code</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 mb-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Registered Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-70 transition-all duration-200 cursor-pointer mt-2"
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

          <p className="mt-8 text-center text-xs text-slate-500 font-medium">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </>
      </motion.div>
    </div>
  );
}
