import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock supabase client to capture channel handlers
vi.mock('@/lib/supabaseClient', () => {
  const handlers: any[] = [];
  const supabase = {
    channel: (name: string) => {
      const ch: any = {
        on: (_event: string, _filter: any, cb: any) => {
          handlers.push(cb);
          return ch;
        },
        subscribe: () => ({ id: 'mock-sub' }),
      };
      return ch;
    },
    removeChannel: vi.fn(),
    _handlers: handlers,
  };
  return { supabase };
});

// Mock @tanstack/react-router to bypass router context requirement
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...original,
    useRouterState: (options?: any) => {
      if (options?.select) {
        return options.select({ location: { pathname: '/hostel' } });
      }
      return { location: { pathname: '/hostel' } };
    },
    useNavigate: () => vi.fn(),
  };
});

import { supabase } from '@/lib/supabaseClient';
import { HostelDashboard } from '../HostelDashboard';

describe('HostelDashboard realtime subscriptions', () => {
  it('registers realtime handlers and invalidates queries when events fire', async () => {
    const qc = new QueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { unmount } = render(
      <QueryClientProvider client={qc}>
        <HostelDashboard />
      </QueryClientProvider>
    );

    // wait for effect to run and register handlers
    await waitFor(() => {
      expect((supabase as any)._handlers.length).toBeGreaterThan(0);
    });

    // simulate a postgres change event by invoking all registered handlers
    (supabase as any)._handlers.forEach((h: any) => h());

    // component's invalidateHostelDashboard calls invalidateQueries multiple times
    expect(invalidateSpy).toHaveBeenCalled();

    unmount();
  });
});
