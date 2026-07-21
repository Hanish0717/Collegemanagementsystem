import { createFileRoute } from '@tanstack/react-router';
import { ImaMaintenanceModule } from '@/pages/ima/ImaMaintenanceModule';

export const Route = createFileRoute('/dashboard/ima')({
  component: ImaMaintenanceModule,
});
