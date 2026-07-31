import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { FloatingChatWidget } from "@/components/dashboard/FloatingChatWidget";
import { AuthProvider } from "../contexts/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="max-w-md text-center glass-card rounded-2xl p-10">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground glow-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { resolveDashboardRoute, normalizeRole } from "@/lib/roleResolver";
import { AuthErrorBoundary } from "@/components/common/AuthErrorBoundary";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[RootErrorComponent]", error);
  const router = useRouter();

  const handleGoHome = () => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("cms_user") : null;
    let role: string | null = null;
    if (userStr) {
      try {
        role = JSON.parse(userStr).role;
      } catch {}
    }
    if (!role && typeof window !== "undefined") {
      role = localStorage.getItem("campusly.role");
    }

    const targetRoute = resolveDashboardRoute(normalizeRole(role));
    window.location.href = targetRoute;
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cms_token");
      localStorage.removeItem("cms_user");
      localStorage.removeItem("campusly.role");
    }
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="size-12 rounded-full bg-amber-100 text-amber-600 grid place-items-center mx-auto mb-4 text-xl font-bold">
          ⚡
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Page Encountered an Error</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error?.message || "An unexpected navigation or rendering issue occurred."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition"
          >
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 text-sm font-medium transition"
          >
            Re-login
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EduSuite Pro — Empowering Digital Campus" },
      {
        name: "description",
        content:
          "A modern, beautiful campus management system to run students, faculty, attendance, exams, fees, library and more.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as any },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Caveat:wght@400;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
          <FloatingChatWidget />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
}
