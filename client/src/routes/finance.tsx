import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute } from '@tanstack/react-router';
import { FinanceAccountsSuite } from '@/pages/accountant/FinanceAccountsSuite';

export const Route = createFileRoute('/finance')({
  component: FinanceAccountsSuite,
});
