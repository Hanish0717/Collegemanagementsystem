import { describe, it, expect, vi, beforeEach } from 'vitest';

// Allow tests to change responses per-case via this mutable object
let mockResponses: Record<string, (cols?: any, opts?: any) => any> = {};

vi.mock('@/lib/supabaseClient', () => {
  const supabase = {
    from: (table: string) => ({
      select: (cols: any, opts?: any) => {
        const responder = mockResponses[table];
        if (responder) return Promise.resolve(responder(cols, opts));
        return Promise.resolve({ data: [], count: 0, error: null });
      },
    }),
  };
  return { supabase };
});

import { fetchStats } from '../hostelService';

beforeEach(() => {
  mockResponses = {};
  vi.resetModules();
});

describe('fetchStats edge cases', () => {
  it('standard aggregates (rooms + allocations + fees)', async () => {
    mockResponses['hostel_rooms'] = (cols: any, opts: any) => {
      if (opts && opts.head) return { count: 10, data: null, error: null };
      return { data: [{ occupants: 1 }, { occupants: 0 }, { occupants: 2 }], error: null };
    };
    mockResponses['hostel_blocks'] = () => ({
      data: [{ total_rooms: 5, occupants: 3 }],
      error: null,
    });
    mockResponses['hostel_allocations'] = (_: any, opts: any) => ({
      count: 7,
      data: null,
      error: null,
    });
    mockResponses['hostel_complaints'] = (_: any, opts: any) => ({
      count: 2,
      data: null,
      error: null,
    });
    mockResponses['hostel_fees'] = () => ({
      data: [
        {
          amount_paid: 1000,
          paid_amount: 1000,
          total_amount: 1000,
          pending_amount: 0,
          payment_status: 'Paid',
          status: 'Paid',
        },
      ],
      error: null,
    });
    mockResponses['hostel_visitors'] = (_: any, opts: any) => ({
      count: 4,
      data: null,
      error: null,
    });

    const stats = await fetchStats();

    expect(stats.find((s: any) => s.label === 'Total Rooms')?.value).toBe('10');
    expect(stats.find((s: any) => s.label === 'Occupied Rooms')?.value).toBe('7');
    expect(stats.find((s: any) => s.label === 'Available Rooms')?.value).toBe('3');
    expect(stats.find((s: any) => s.label === 'Pending Complaints')?.value).toBe('2');
    expect(stats.find((s: any) => s.label === 'Fee Collection')?.value).toBe('₹1,000');
  });

  it('no rooms and no blocks returns zeros', async () => {
    mockResponses['hostel_rooms'] = (_: any, opts: any) => ({ count: 0, data: [], error: null });
    mockResponses['hostel_blocks'] = () => ({ data: [], error: null });
    mockResponses['hostel_allocations'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    mockResponses['hostel_complaints'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    mockResponses['hostel_fees'] = () => ({ data: [], error: null });
    mockResponses['hostel_visitors'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });

    const stats = await fetchStats();
    expect(stats.find((s: any) => s.label === 'Total Rooms')?.value).toBe('0');
    expect(stats.find((s: any) => s.label === 'Occupied Rooms')?.value).toBe('0');
    expect(stats.find((s: any) => s.label === 'Available Rooms')?.value).toBe('0');
    expect(stats.find((s: any) => s.label === 'Fee Collection')?.value).toBe('₹0');
  });

  it('blocks-only data aggregates correctly', async () => {
    // No explicit room rows
    mockResponses['hostel_rooms'] = (_: any, opts: any) => ({ count: 0, data: [], error: null });
    // Two blocks: 12 and 8 rooms
    mockResponses['hostel_blocks'] = () => ({
      data: [
        { total_rooms: 12, occupants: 3 },
        { total_rooms: 8, occupants: 2 },
      ],
      error: null,
    });
    mockResponses['hostel_allocations'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    mockResponses['hostel_complaints'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    mockResponses['hostel_fees'] = () => ({ data: [], error: null });
    mockResponses['hostel_visitors'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });

    const stats = await fetchStats();
    expect(stats.find((s: any) => s.label === 'Total Rooms')?.value).toBe('20');
    expect(stats.find((s: any) => s.label === 'Occupied Rooms')?.value).toBe('5');
    expect(stats.find((s: any) => s.label === 'Available Rooms')?.value).toBe('15');
  });

  it('counts overdue fees correctly', async () => {
    mockResponses['hostel_rooms'] = (_: any, opts: any) => ({ count: 0, data: [], error: null });
    mockResponses['hostel_blocks'] = () => ({ data: [], error: null });
    mockResponses['hostel_allocations'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    mockResponses['hostel_complaints'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });
    // Create a fee with due_date in the past and pending_amount > 0
    mockResponses['hostel_fees'] = () => ({
      data: [
        {
          amount_paid: 0,
          paid_amount: 0,
          total_amount: 1500,
          pending_amount: 1500,
          payment_status: 'Pending',
          status: 'Pending',
          due_date: '2020-01-01',
        },
      ],
      error: null,
    });
    mockResponses['hostel_visitors'] = (_: any, opts: any) => ({
      count: 0,
      data: null,
      error: null,
    });

    const stats = await fetchStats();
    expect(stats.find((s: any) => s.label === 'Overdue Payments')?.value).toBe('1');
  });
});
