import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Check,
  Loader2,
  X,
  Quote,
  BookOpen,
  ChevronDown,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'sonner';
import { ROLE_LIST, setActiveRole, type RoleId } from '@/lib/roles';
import { getDashboardForRole, toFrontendRole } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export function Login() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider
      clientId={
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '100000000000-dummyclientid.apps.googleusercontent.com'
      }
    >
      <LoginForm />
    </GoogleOAuthProvider>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  // Clear any stale session on login page load
  useEffect(() => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    localStorage.removeItem('campusly.role');
    localStorage.removeItem('cms_student_profile');
    localStorage.removeItem('cms_parent_child_data');
    localStorage.removeItem('cms_faculty_profile');
  }, []);

  const [roleId, setRoleId] = useState<RoleId | null>('student');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePinChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[index] = val.slice(-1);
    setPin(newPin);
    setPinError(null);

    if (val && index < 3) {
      setTimeout(() => {
        const nextInput = document.getElementById(`pin-input-${index + 1}`);
        nextInput?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
  };

  const verifyPin = (enteredPin: string) => {
    const credentialsMap: Record<
      string,
      { email: string; password?: string; admissionNumber?: string; role: RoleId; roleName: string }
    > = {
      '1111': {
        email: 'superadmin@college.com',
        password: 'password123',
        role: 'super_admin',
        roleName: 'Super Admin',
      },
      '1212': {
        email: 'lms.coordinator@college.com',
        password: 'password123',
        role: 'lms',
        roleName: 'LMS Coordinator',
      },
      '1313': {
        email: 'learning@college.com',
        password: 'password123',
        role: 'lms',
        roleName: 'LMS Portal',
      },
      '2222': {
        email: 'admin@college.com',
        password: 'password123',
        role: 'admin',
        roleName: 'System Admin',
      },
      '3333': {
        email: 'srinivas.faculty@gmail.com',
        password: 'password123',
        role: 'faculty',
        roleName: 'Faculty',
      },
      '4444': {
        email: 'hanish@gmail.com',
        password: 'password123',
        role: 'student',
        roleName: 'Student',
      },
      '5555': {
        email: 'hanish.parent@gmail.com',
        admissionNumber: 'CS2026101',
        role: 'parent',
        roleName: 'Parent',
      },
      '6666': {
        email: 'placement@college.com',
        password: 'password123',
        role: 'placement',
        roleName: 'Placement Officer',
      },
      '7777': {
        email: 'librarian@college.com',
        password: 'password123',
        role: 'librarian',
        roleName: 'Librarian',
      },
      '7778': {
        email: 'warden@college.com',
        password: 'password123',
        role: 'warden',
        roleName: 'Hostel Warden',
      },
      '7779': {
        email: 'transport@college.com',
        password: 'password123',
        role: 'transport',
        roleName: 'Transport Manager',
      },
      '8888': {
        email: 'principal@college.com',
        password: 'password123',
        role: 'principal',
        roleName: 'Principal',
      },
      '9999': {
        email: 'hod@college.com',
        password: 'password123',
        role: 'hod',
        roleName: 'Head of Department (HOD)',
      },
      '8080': {
        email: 'dean@college.com',
        password: 'password123',
        role: 'dean',
        roleName: 'Dean Academics',
      },
      '7070': {
        email: 'examcell@college.com',
        password: 'password123',
        role: 'exam_cell',
        roleName: 'Exam Cell Officer',
      },
      '6060': {
        email: 'accounts@college.com',
        password: 'password123',
        role: 'accounts',
        roleName: 'Accounts Manager',
      },
    };

    const match = credentialsMap[enteredPin];
    if (match) {
      setPinSuccess(true);
      setTimeout(() => {
        setRoleId(match.role);
        setEmail(match.email);
        if (match.password) setPassword(match.password);
        if (match.admissionNumber) setAdmissionNumber(match.admissionNumber);

        setIsPinModalOpen(false);
        setPin(['', '', '', '']);
        setPinSuccess(false);
        setPinError(null);
        toast.success(`Autofilled ${match.roleName} credentials! Press Sign In.`);
      }, 800);
    } else {
      setPinError(
        'Invalid PIN! Try 1111 (Super Admin), 1212 (LMS Coordinator), 1313 (LMS Portal), 2222 (Admin), 3333 (Faculty), 4444 (Student), 5555 (Parent), 6666 (Placement), 7777 (Librarian), 8888 (Principal), 9999 (HOD), 8080 (Dean), 7070 (Exam Cell), 6060 (Accounts).',
      );
      setPin(['', '', '', '']);
      setTimeout(() => {
        const firstInput = document.getElementById('pin-input-0');
        firstInput?.focus();
      }, 50);
    }
  };

  const handleQuickPin = (enteredPin: string) => {
    setPin(enteredPin.split(''));
  };

  useEffect(() => {
    const entered = pin.join('');
    if (entered.length === 4) {
      verifyPin(entered);
    }
  }, [pin]);

  const active = roleId ? ROLE_LIST.find((r) => r.id === roleId) : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (roleId === 'parent') {
        result = await login({ email, admissionNumber });
      } else {
        result = await login({ email, password });
      }

      if (result && result.needsVerification) {
        navigate({
          to: '/verify-otp',
          search: { email: result.email, target: 'email_verification' },
        });
        return;
      }

      // Direct login — no OTP step
      const user = result;

      if (roleId === 'lms') {
        setActiveRole('lms');
        localStorage.setItem('campusly.role', 'lms');
        navigate({ to: '/dashboard/admin/lms' });
      } else {
        setActiveRole(toFrontendRole(user.role));
        navigate({ to: getDashboardForRole(user.role) });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then((r) => r.json());

      const res = await api.post('/api/auth/google', {
        credential: tokenResponse.access_token,
        googleUserInfo: userInfo,
        role: roleId || 'student',
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
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/40 dark:to-slate-900 text-slate-900 dark:text-white relative">
      {/* Left — branding & quotation */}
      <div className="relative hidden lg:flex flex-col p-10 xl:p-14 overflow-hidden max-h-screen justify-between">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -right-20 size-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Top Brand Logo Header */}
        <Link to="/" className="relative inline-flex items-center gap-3 w-fit">
          <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-md shadow-blue-500/25">
            <GraduationCap className="size-6" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              <span>Campus ERP</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">College Management System</div>
          </div>
        </Link>

        {/* Center Hero Text & Quotation Block */}
        <div className="flex-1 flex flex-col justify-center max-w-lg relative z-10 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-7"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 uppercase mb-4 shadow-2xs">
                <Sparkles className="size-3 text-blue-600" /> EMPOWERING EDUCATION THROUGH TECHNOLOGY
              </span>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                College Management{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  System
                </span>
              </h1>
            </div>

            {/* Quotation card with soft glassmorphism & modern styling */}
            <div className="relative p-7 rounded-3xl border border-blue-200/60 dark:border-blue-900/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-md shadow-blue-500/5">
              <Quote className="size-10 text-blue-600/15 absolute -top-5 -left-3 rotate-180" />
              <blockquote className="text-base xl:text-lg font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "Education is not the preparation for life; education is life itself."
              </blockquote>
              <cite className="block mt-4 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 not-italic">
                — JOHN DEWEY
              </cite>
            </div>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-md">
              Manage academics, attendance, communication, and campus activities through one unified platform.
            </p>
          </motion.div>
        </div>

        <div className="relative text-xs text-slate-500 font-medium">
          © 2026 Campus ERP. All rights reserved.
        </div>
      </div>

      {/* Right — Sign-in Form Card */}
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-blue-900/5 my-auto"
        >
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="size-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow-md shadow-blue-500/25">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Campus ERP</span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Enter your institutional credentials to access the campus management system
          </p>

          {/* Role Selector Dropdown */}
          <div className="mt-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
              SELECT YOUR ROLE TO SIGN IN
            </label>
            <div className="relative">
              <select
                value={roleId ?? 'student'}
                onChange={(e) => {
                  const id = e.target.value as RoleId;
                  setRoleId(id);
                  setEmail(id === 'lms' ? 'learning@college.com' : '');
                  setPassword('');
                  setError(null);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 cursor-pointer transition"
              >
                {ROLE_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.short}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
            {active && (
              <div
                className="mt-2.5 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
              >
                <active.icon className="size-4 shrink-0" />
                <span>{active.description}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Preset Demo Role Autofill Banner */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
            >
              Select Demo Role Account (Autofills credentials)
            </button>
          </div>

          <form className="mt-4 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {roleId === 'parent'
                  ? 'Parent Email'
                  : roleId === 'student'
                    ? 'Email or Admission Number'
                    : roleId === 'lms'
                      ? 'LMS Portal Email'
                      : 'Email'}
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type={roleId === 'student' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    roleId === 'parent'
                      ? 'parent@example.com'
                      : roleId === 'student'
                        ? 'you@university.edu or Admission Number'
                        : roleId === 'lms'
                          ? 'learning@college.com'
                          : 'you@university.edu'
                  }
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {roleId !== 'parent' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student Admission ID (Admission No or Roll No) *
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM2026102"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            )}

            {roleId !== 'parent' && (
              <div className="flex items-center justify-between text-xs font-medium">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-70 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* PIN modal */}
          {isPinModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-sm p-6 overflow-hidden relative"
              >
                <div className="relative">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue-600 animate-pulse"></span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Demo Autofill Security Pin
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPinModalOpen(false);
                        setPin(['', '', '', '']);
                        setPinError(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Enter your 4-digit security PIN to populate preset credentials.
                    </p>

                    {/* PIN inputs */}
                    <div className="flex justify-center gap-3 my-5">
                      {pin.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`pin-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handlePinChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className={`size-11 rounded-xl text-center font-bold text-lg border-2 outline-none transition-all
                            ${
                              pinSuccess
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : pinError
                                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                                  : digit
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 focus:border-blue-600'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Status messages */}
                    {pinError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-medium text-rose-600 px-3 leading-tight mb-4"
                      >
                        {pinError}
                      </motion.p>
                    )}

                    {pinSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 mb-4"
                      >
                        <Check className="size-4 animate-bounce" /> PIN Verified! Autofilling...
                      </motion.div>
                    )}

                    {/* Cheat Sheet / Helper */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 text-left">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Available Demo PINs (Click to fill):
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700 dark:text-slate-300">
                        {[
                          { role: 'Super Admin', pin: '1111' },
                          { role: 'LMS Coord', pin: '1212' },
                          { role: 'Admin', pin: '2222' },
                          { role: 'Faculty', pin: '3333' },
                          { role: 'Student', pin: '4444' },
                          { role: 'Parent', pin: '5555' },
                          { role: 'Placement', pin: '6666' },
                          { role: 'Librarian', pin: '7777' },
                        ].map((item) => (
                          <div
                            key={item.pin}
                            className="flex items-center justify-between p-1 rounded-lg hover:bg-blue-50/60 dark:hover:bg-slate-800 transition cursor-pointer"
                            onClick={() => handleQuickPin(item.pin)}
                          >
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{item.role}</span>
                            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 shadow-2xs">
                              {item.pin}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating AI Assistant Chat Bubble (Matches bottom right icon in screenshot) */}
      <button
        onClick={() => setIsPinModalOpen(true)}
        className="fixed bottom-6 right-6 size-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white grid place-items-center shadow-lg shadow-blue-500/35 hover:scale-105 transition-all duration-200 cursor-pointer z-40 group"
        title="Quick Demo Autofill PINs"
      >
        <MessageSquare className="size-5 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-rose-500 border-2 border-white" />
      </button>
    </div>
  );
}
