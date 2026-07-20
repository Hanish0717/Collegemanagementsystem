import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Play,
  FileText,
  MessageSquare,
  Video,
  HelpCircle,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { setActiveRole } from '@/lib/roles';
import { toast } from 'sonner';

const LMS_EMAIL = 'learning@college.com';
const LMS_PASSWORD = 'password123';

const features = [
  { icon: FileText, label: 'Study Notes', desc: 'Download course PDFs & guides' },
  { icon: Video, label: 'Video Lectures', desc: 'Embedded recorded lectures' },
  { icon: HelpCircle, label: 'Interactive Quizzes', desc: 'Auto-graded MCQ assessments' },
  { icon: MessageSquare, label: 'Discussion Forum', desc: 'Peer & faculty doubt clearing' },
  { icon: BookOpen, label: 'Assignments', desc: 'Submit & track homework status' },
  { icon: Calendar, label: 'Online Classes', desc: 'Join live virtual sessions' },
];

export function LMSLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(LMS_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autofilled, setAutofilled] = useState(false);

  const handleAutofill = () => {
    setEmail(LMS_EMAIL);
    setPassword(LMS_PASSWORD);
    setAutofilled(true);
    toast.success('Demo credentials auto-filled!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login({ email, password });
      // Set lms as the frontend role
      setActiveRole('lms');
      localStorage.setItem('campusly.role', 'lms');
      toast.success('Welcome to the LMS Portal!');
      navigate({ to: '/dashboard/admin/lms' });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 size-64 rounded-full bg-emerald-400/10 blur-2xl" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* LEFT — Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:flex flex-col gap-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BookOpen className="size-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-xl tracking-tight">CMS Learning Portal</div>
              <div className="text-emerald-400 text-xs font-medium">Learning Management System</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Your Digital{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Classroom
              </span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Access course notes, video lectures, interactive quizzes, assignments, live virtual
              classes, and engage in discussion forums — all in one place.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition"
              >
                <div className="size-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="size-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">{f.label}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5 leading-snug">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer quote */}
          <div className="border-t border-white/10 pt-5">
            <blockquote className="text-slate-400 text-xs italic leading-relaxed">
              "The more that you read, the more things you will know. The more that you learn, the
              more places you'll go."
            </blockquote>
            <cite className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1.5 block not-italic">
              — Dr. Seuss
            </cite>
          </div>
        </motion.div>

        {/* RIGHT — Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <BookOpen className="size-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">CMS Learning Portal</div>
                <div className="text-emerald-400 text-xs">Learning Management System</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Sign In to LMS</h2>
              <p className="text-slate-300 text-sm mt-1">
                Access your digital classroom and learning resources
              </p>
            </div>

            {/* Demo credentials banner */}
            <button
              type="button"
              onClick={handleAutofill}
              className={`w-full mb-5 px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                autofilled
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <Play className="size-2.5 text-emerald-400 fill-emerald-400 translate-x-px" />
                </span>
                {autofilled ? 'Demo credentials filled!' : 'Click to auto-fill demo credentials'}
              </span>
              <span className="font-mono text-[10px] opacity-60">learning@college.com</span>
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-xs"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learning@college.com"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 disabled:opacity-70 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Enter Learning Portal
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-slate-500">or access as</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Quick role links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold text-center transition"
              >
                Main CMS Login
              </Link>
              <Link
                to="/dashboard/admin/lms"
                className="px-3 py-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold text-center transition"
              >
                Guest LMS View
              </Link>
            </div>

            <p className="text-center text-[10px] text-slate-500 mt-5">
              © {new Date().getFullYear()} College Management System. LMS Portal.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LMSLogin;
