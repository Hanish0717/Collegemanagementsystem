import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dean')({
  beforeLoad: ({ search, location }: { search: Record<string, any>; location: any }) => {
    const isRootDean = location.pathname === '/dean' || location.pathname === '/dean/';
    if (isRootDean && search?.module) {
      const mod = search.module.toString().toLowerCase();
      if (mod === 'student') throw redirect({ to: '/dean/student' });
      if (mod === 'examination' || mod === 'exam') throw redirect({ to: '/dean/examination' });
      if (mod === 'academic' || mod === 'acad') throw redirect({ to: '/dean/academic' });
      if (mod === 'ima') throw redirect({ to: '/dean/ima' });
      if (mod === 'iqac') throw redirect({ to: '/dean/iqac' });
    }
  },
  errorComponent: DeanModuleErrorBoundary,
  component: DashboardLayout,
});
