import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/pages/auth/Login';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ search }: { search: Record<string, any> }) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cms_token');
      // If search has logout/clear OR if token is a demo/mock token, clear it so user can log in fresh
      if (search?.logout || search?.clear || (token && token.startsWith('demo_token_')) || (token && token.startsWith('faculty_token_'))) {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        localStorage.removeItem('campusly.role');
        localStorage.removeItem('cms_student_profile');
        localStorage.removeItem('cms_parent_child_data');
        localStorage.removeItem('cms_faculty_profile');
      }
    }
  },
  component: Login,
});

