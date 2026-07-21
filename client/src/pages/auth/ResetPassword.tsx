import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, ArrowRight, Loader2, KeySquare, Hash, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function ResetPassword() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reset-password' }) as { email?: string };
  const { email } = search;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      navigate({ to: '/login' });
    }
  }, [email, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', { email, otp, password });
      navigate({ to: '/login' });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. OTP may be invalid or expired.';
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

        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-blue-600 grid place-items-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <KeySquare className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Set New Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter OTP sent to {email}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 mb-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">6-Digit OTP Code</label>
            <div className="mt-1 relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-center tracking-widest text-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg transition"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-70 transition-all duration-200 cursor-pointer mt-4"
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
