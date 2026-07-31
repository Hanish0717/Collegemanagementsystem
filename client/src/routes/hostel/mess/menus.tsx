import { createFileRoute } from '@tanstack/react-router';
import Menus from '@/pages/hostel/mess/Menus';

export const Route = createFileRoute('/hostel/mess/menus')({
  component: Menus,
});
