import { createFileRoute } from '@tanstack/react-router';
import { FinanceAccountsSuite } from '@/pages/accountant/FinanceAccountsSuite';

export const Route = createFileRoute('/dashboard/finance')({
  component: FinanceAccountsSuite,
});
