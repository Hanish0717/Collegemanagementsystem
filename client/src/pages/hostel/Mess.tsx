import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/ui';
import {
  fetchMenus,
  fetchMessResidents,
  fetchMessFees,
  fetchFeedback,
  createMenu,
  submitFeedback,
  payMessFee,
  fetchDailyReport,
  fetchMonthlyRevenue,
} from '@/services/messService';

export default function MessPage() {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: menus = [] } = useQuery({ queryKey: ['mess-menus', selectedDate], queryFn: () => fetchMenus({ start: selectedDate, end: selectedDate }) });
  const { data: residents = [] } = useQuery({ queryKey: ['mess-residents'], queryFn: fetchMessResidents });
  const { data: fees = [] } = useQuery({ queryKey: ['mess-fees'], queryFn: fetchMessFees });
  const { data: feedback = [] } = useQuery({ queryKey: ['mess-feedback'], queryFn: fetchFeedback });

  const totalMembers = residents.length;
  const mealsServedToday = menus.length * totalMembers;
  const monthlyRevenue = fees.reduce((s: any, f: any) => s + Number(f.paid_amount || 0), 0);
  const pendingFees = fees.reduce((s: any, f: any) => s + Number(f.pending_amount || 0), 0);
  const avgRating = feedback.length ? (feedback.reduce((s: any, f: any) => s + (f.rating || 0), 0) / feedback.length).toFixed(2) : 'N/A';

  return (
    <div className="space-y-6">
      <PageHeader title="Mess & Food" desc="Manage menus, members, feedback and fees." />

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-gradient-soft">
          <div className="text-xs text-muted-foreground">Total Mess Members</div>
          <div className="text-2xl font-bold mt-2">{totalMembers}</div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-soft">
          <div className="text-xs text-muted-foreground">Meals Served Today</div>
          <div className="text-2xl font-bold mt-2">{mealsServedToday}</div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-soft">
          <div className="text-xs text-muted-foreground">Monthly Mess Revenue</div>
          <div className="text-2xl font-bold mt-2">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-soft">
          <div className="text-xs text-muted-foreground">Pending Mess Fees</div>
          <div className="text-2xl font-bold mt-2">₹{pendingFees.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="p-4 border rounded-xl">
            <h3 className="font-semibold mb-3">Today's Menu — {selectedDate}</h3>
            {menus.length === 0 ? <div className="text-sm text-muted-foreground">No menu found for this date.</div> : (
              <div className="space-y-2">
                {menus.map((m: any) => (
                  <div key={m.id} className="p-3 border rounded">
                    <div className="font-medium">{m.meal_type}</div>
                    <div className="text-xs text-muted-foreground">{JSON.stringify(m.food_items)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="p-4 border rounded-xl">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="text-sm">Average Rating: {avgRating}</div>
            <div className="text-sm mt-2">Members: {totalMembers}</div>
            <div className="text-sm">Meals Today: {mealsServedToday}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
