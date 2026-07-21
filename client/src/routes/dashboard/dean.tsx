import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean')({
  beforeLoad: ({ search, location }: { search: Record<string, any>; location: any }) => {
    const isRootDean = location.pathname === '/dashboard/dean' || location.pathname === '/dashboard/dean/';
    if (isRootDean && search?.module) {
      const mod = search.module.toString().toLowerCase();
      if (mod === 'student') throw redirect({ to: '/dashboard/dean/student' });
      if (mod === 'examination' || mod === 'exam') throw redirect({ to: '/dashboard/dean/examination' });
      if (mod === 'academic' || mod === 'acad') throw redirect({ to: '/dashboard/dean/academic' });
      if (mod === 'ima') throw redirect({ to: '/dashboard/dean/ima' });
      if (mod === 'iqac') throw redirect({ to: '/dashboard/dean/iqac' });
    }
  },
  errorComponent: DeanModuleErrorBoundary,
  component: () => <Outlet />,
});
