import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, AlertCircle, ArrowLeft } from "lucide-react";

export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -right-20 size-96 rounded-full bg-gradient-primary opacity-25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gradient-violet opacity-25 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 shadow-soft text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center text-white">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-bold text-xl">College Management System</span>
        </div>

        <div className="size-16 rounded-2xl bg-amber-500/10 grid place-items-center text-amber-500 mx-auto mb-4 border border-amber-500/20">
          <AlertCircle className="size-8" />
        </div>

        <h2 className="text-xl font-bold">Self-Registration Disabled</h2>
        <p className="text-sm text-muted-foreground mt-3 mb-6 leading-relaxed">
          Direct signup for students, parents, and faculty is disabled. Account credentials must be provided by the college administration.
        </p>

        <Link
          to="/login"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-soft hover:opacity-95 transition"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}
