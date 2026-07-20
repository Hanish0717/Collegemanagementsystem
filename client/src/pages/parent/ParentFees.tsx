import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, DollarSign, Download } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import api from '@/lib/api';

export function ParentFees() {
  const [fees, setFees] = useState<any[]>([]);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Total Due', value: '₹0', tone: 'warn' as const },
    { label: 'Overdue', value: '₹0', tone: 'danger' as const },
    { label: 'Paid This Year', value: '₹0', tone: 'success' as const },
    { label: 'Next Due', value: 'None', tone: 'info' as const },
  ]);
  const [scholarship, setScholarship] = useState({
    type: 'None',
    discount: '0%',
    validUntil: '-',
    status: 'Inactive',
    isActive: false,
  });

  const fetchFees = async () => {
    try {
      let dbData: any = null;
      // Fetch fresh data from the server directly to bypass any stale local storage
      const res = await api.get('/api/parent-module/student-data');
      if (res.data?.success && res.data?.data) {
        dbData = res.data.data;
        localStorage.setItem('cms_parent_child_data', JSON.stringify(dbData));
      }

      if (dbData && dbData.fees) {
        setFees(dbData.fees);
        if (dbData.fees.length > 0) {
          const mapped = dbData.fees.map((f: any) => {
            const capType = f.feeType.charAt(0).toUpperCase() + f.feeType.slice(1) + ' Fee';
            const statusStr =
              f.paymentStatus === 'paid'
                ? 'Paid'
                : f.paymentStatus === 'overdue'
                  ? 'Overdue'
                  : 'Pending';
            return {
              id: f.id || f._id,
              feeType: capType,
              amount: `₹${Number(f.totalAmount).toLocaleString('en-IN')}`,
              dueDate: new Date(f.dueDate).toISOString().split('T')[0],
              status: statusStr,
              receipt: f.transactionId || '-',
              remaining: f.totalAmount - f.paidAmount,
              paid: f.paidAmount,
              remainingAmount: f.totalAmount - f.paidAmount,
            };
          });
          setFeeRecords(mapped);

          // Compute statistics
          const totalDue = mapped
            .filter((r: any) => r.status !== 'Paid')
            .reduce((sum: number, r: any) => sum + r.remaining, 0);
          const totalOverdue = mapped
            .filter((r: any) => r.status === 'Overdue')
            .reduce((sum: number, r: any) => sum + r.remaining, 0);
          const totalPaid = mapped.reduce((sum: number, r: any) => sum + r.paid, 0);

          const nextDueItem = mapped
            .filter((r: any) => r.status !== 'Paid')
            .sort(
              (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
            )[0];
          const nextDueStr = nextDueItem
            ? new Date(nextDueItem.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'None';

          setStats([
            {
              label: 'Total Due',
              value: `₹${Number(totalDue).toLocaleString('en-IN')}`,
              tone: 'warn' as const,
            },
            {
              label: 'Overdue',
              value: `₹${Number(totalOverdue).toLocaleString('en-IN')}`,
              tone: 'danger' as const,
            },
            {
              label: 'Paid This Year',
              value: `₹${Number(totalPaid).toLocaleString('en-IN')}`,
              tone: 'success' as const,
            },
            { label: 'Next Due', value: nextDueStr, tone: 'info' as const },
          ]);

          // Compute dynamic merit scholarship details based on dynamic CGPA
          const cgpaItem = dbData.stats?.find((s: any) => s.label.includes('CGPA'));
          const cgpaVal = cgpaItem ? Number(cgpaItem.value) : 0;
          if (cgpaVal >= 8.5) {
            setScholarship({
              type: 'Merit Scholarship',
              discount: '10% on Tuition Fee',
              validUntil: 'Semester 8',
              status: 'Active',
              isActive: true,
            });
          } else {
            setScholarship({
              type: 'None',
              discount: '0%',
              validUntil: '-',
              status: 'Inactive',
              isActive: false,
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading parent fees:', err);
    }
  };

  const handlePayFee = async (feeId: string, remainingAmount: number) => {
    try {
      const res = await api.post(`/api/fees/pay/${feeId}`, {
        amount: remainingAmount,
        paymentMethod: 'Card',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        remarks: 'Paid online by parent',
      });

      if (res.data?.success) {
        toast.success('Payment processed successfully!');
        fetchFees();
      } else {
        toast.error('Failed to process payment');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to process payment');
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Details"
        desc="View fee structure, payment history, and pending dues."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Fee Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {['Fee Type', 'Amount', 'Due Date', 'Payment Status', 'Receipt'].map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeRecords.map((record, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{record.feeType}</td>
                  <td className="py-3 px-4 font-medium">{record.amount}</td>
                  <td className="py-3 px-4">{record.dueDate}</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        record.status === 'Paid'
                          ? 'success'
                          : record.status === 'Overdue'
                            ? 'danger'
                            : 'warn'
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {record.status === 'Paid' ? (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {record.receipt}
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayFee(record.id, record.remainingAmount)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer hover:shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="size-5 text-amber-600" />
          <h3 className="font-semibold">Fee Reminders</h3>
        </div>
        <div className="space-y-2">
          {feeRecords
            .filter((f) => f.status !== 'Paid')
            .map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div>
                  <div className="text-sm font-medium">{record.feeType}</div>
                  <div className="text-xs text-muted-foreground">Due: {record.dueDate}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{record.amount}</div>
                    <Badge tone={record.status === 'Overdue' ? 'danger' : 'warn'}>
                      {record.status}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handlePayFee(record.id, record.remainingAmount)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Pay
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Scholarship Details</h3>
        <div className="p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Scholarship Type</div>
              <div className="text-sm font-medium mt-1">{scholarship.type}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Discount</div>
              <div className="text-sm font-medium mt-1">{scholarship.discount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Valid Until</div>
              <div className="text-sm font-medium mt-1">{scholarship.validUntil}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge tone={scholarship.isActive ? 'success' : 'info'} className="mt-1">
                {scholarship.status}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
