import { createFileRoute } from '@tanstack/react-router';
import Menus from '@/pages/dashboard/hostel/mess/Menus';

export const Route = createFileRoute('/dashboard/hostel/mess/menus')({
  component: Menus,
});
