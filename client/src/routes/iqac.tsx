import { createFileRoute } from '@tanstack/react-router';
import { IqacQualitySuite } from '@/pages/iqac/IqacQualitySuite';

export const Route = createFileRoute('/iqac')({
  component: IqacQualitySuite,
});
