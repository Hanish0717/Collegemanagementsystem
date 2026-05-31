import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messService from '@/services/messService';
import { feePaymentSchema } from '@/lib/validation/messSchemas';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { 
  CreditCard, Search, DollarSign, Calendar, RefreshCw, 
  ArrowRight, Check, X, ShieldAlert, FileText, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function MessFeesAdmin() {
  const qc = useQueryClient();
  const { data: fees = [], isLoading } = useQuery({ 
    queryKey: ['mess-fees'], 
    queryFn: messService.fetchMessFees 
  });
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<'ledger' | 'outstanding'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTarget, setPaymentTarget] = useState<any | null>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payMut = useMutation({ 
    mutationFn: ({ id, amount }: { id: string; amount: number }) => messService.payMessFee(id, amount), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-fees'] });
      toast.success("Payment recorded successfully!");
      closePaymentModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to submit payment");
    }
  });

  const openPaymentModal = (fee: any) => {
    setPaymentTarget(fee);
    setCollectAmount(String(fee.pending_amount));
    setErrors({});
  };

  const closePaymentModal = () => {
    setPaymentTarget(null);
    setCollectAmount('');
    setPaymentMethod('UPI');
    setErrors({});
  };

  const handleRecordPayment = () => {
    if (!paymentTarget) return;

    const res = feePaymentSchema.safeParse({ id: paymentTarget.id, amount: collectAmount });
    if (!res.success) { 
      setErrors({ amount: res.error.errors[0].message });
      toast.error("Please enter a valid amount");
      return; 
    }
    setErrors({});
    
    const amountVal = res.data.amount;
    
    if (amountVal > Number(paymentTarget.pending_amount)) {
      toast.error(`Amount exceeds pending dues (₹${paymentTarget.pending_amount})`);
      return;
    }

    if (!confirm(`Confirm collection of ₹${Number(amountVal).toFixed(2)} via ${paymentMethod}?`)) return;
    
    payMut.mutate({ id: paymentTarget.id, amount: amountVal });
  };

  // Financial Stats calculations
  const financialStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let outstandingCount = 0;

    fees.forEach((f: any) => {
      totalInvoiced += Number(f.mess_fee || 0);
      totalCollected += Number(f.paid_amount || 0);
      totalPending += Number(f.pending_amount || 0);
      if (Number(f.pending_amount || 0) > 0) {
        outstandingCount++;
      }
    });

    const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

    return {
      totalInvoiced,
      totalCollected,
      totalPending,
      outstandingCount,
      collectionRate
    };
  }, [fees]);

  // Filters based on search query
  const filteredLedger = useMemo(() => {
    return fees.filter((f: any) => {
      const q = searchQuery.toLowerCase();
      const matchText = (f.resident_name || '').toLowerCase().includes(q) || (f.resident_id || '').toLowerCase().includes(q);
      
      if (activeTab === 'outstanding') {
        return matchText && Number(f.pending_amount || 0) > 0;
      }
      return matchText;
    });
  }, [fees, searchQuery, activeTab]);

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Partially-Paid': 
      case 'Partially Paid': return 'warn';
      case 'Unpaid': 
      case 'Pending': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6 text-left relative min-h-screen">
      <PageHeader title="Mess Accounts & Ledger" desc="Monitor billing directories, collect subscription fees, and track outstanding ledger accounts." />

      {/* Financial Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Invoiced</span>
            <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">₹{financialStats.totalInvoiced.toLocaleString('en-IN')}</div>
          </div>
          <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border grid place-items-center text-slate-600">
            <FileText className="size-5" />
          </div>
        </Card>

        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Collected</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{financialStats.totalCollected.toLocaleString('en-IN')}</div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 grid place-items-center text-emerald-600">
            <ArrowUpRight className="size-5" />
          </div>
        </Card>

        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-rose-500/80 uppercase font-bold tracking-wider">Outstanding Dues</span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-450">₹{financialStats.totalPending.toLocaleString('en-IN')}</div>
          </div>
          <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 grid place-items-center text-rose-600">
            <DollarSign className="size-5" />
          </div>
        </Card>

        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-500/80 uppercase font-bold tracking-wider">Collection Rate</span>
            <div className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400">{financialStats.collectionRate.toFixed(1)}%</div>
          </div>
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/35 grid place-items-center text-indigo-650">
            <TrendingUp className="size-5" />
          </div>
        </Card>
      </div>

      {/* Tabs navigation & search */}
      <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-750'
              }`}
            >
              Ledger Directory
            </button>
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'outstanding'
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-750'
              }`}
            >
              <span>Dues Outstanding</span>
              {financialStats.outstandingCount > 0 && (
                <span className="bg-rose-500 text-white rounded-full text-[9px] px-1.5 py-0.5 font-extrabold">
                  {financialStats.outstandingCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search directory by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 text-xs bg-background/50 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Main ledger database view */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed rounded-3xl">
          <RefreshCw className="size-8 animate-spin text-indigo-500" />
          <span className="text-sm text-muted-foreground">Loading ledger directory...</span>
        </div>
      ) : filteredLedger.length === 0 ? (
        <div className="text-sm text-muted-foreground py-16 text-center border border-dashed rounded-3xl">
          {activeTab === 'outstanding' 
            ? "No outstanding mess dues found matching your filters!" 
            : "No accounts records matching your search query."}
        </div>
      ) : (
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b">
                <tr className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider text-left">
                  <th className="pb-3 pl-2">Subscriber Details</th>
                  <th className="pb-3">Payment Status</th>
                  <th className="pb-3 text-right">Mess Fee</th>
                  <th className="pb-3 text-right">Paid</th>
                  <th className="pb-3 text-right">Pending Dues</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLedger.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    {/* Member */}
                    <td className="py-4 pl-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{f.resident_name || 'Unknown Member'}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase">ID: {f.resident_id?.substring(0, 10)}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <Badge tone={getStatusBadgeTone(f.payment_status || 'Pending')}>{f.payment_status || 'Pending'}</Badge>
                      {f.payment_date && (
                        <span className="block text-[9px] text-muted-foreground mt-1">Paid: {new Date(f.payment_date).toLocaleDateString('en-IN')}</span>
                      )}
                    </td>

                    {/* Fee */}
                    <td className="py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      ₹{Number(f.mess_fee || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Paid */}
                    <td className="py-4 text-right font-bold text-emerald-600">
                      ₹{Number(f.paid_amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Pending */}
                    <td className="py-4 text-right font-bold text-rose-600">
                      ₹{Number(f.pending_amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Collect Action */}
                    <td className="py-4 text-right pr-2">
                      {Number(f.pending_amount || 0) > 0 ? (
                        <button
                          onClick={() => openPaymentModal(f)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg font-bold text-[10px] uppercase tracking-wider transition cursor-pointer border border-indigo-100"
                        >
                          Collect Dues
                        </button>
                      ) : (
                        <Badge tone="success" className="text-[9px] py-1 px-2.5">Fully Settled</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Collect Fee Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={closePaymentModal} />
          
          <div className="relative w-full max-w-md bg-background border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden text-left">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Record Fee Collection</h3>
              </div>
              <button onClick={closePaymentModal} className="p-1.5 rounded-lg border hover:bg-accent transition cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Resident info box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-450">Member Name:</span>
                  <strong className="text-slate-750 dark:text-slate-200">{paymentTarget.resident_name}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-455">Student ID:</span>
                  <strong className="text-slate-750 dark:text-slate-205 font-mono">{paymentTarget.resident_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Remaining Balance:</span>
                  <strong className="text-rose-650">₹{Number(paymentTarget.pending_amount).toFixed(2)}</strong>
                </div>
              </div>

              {/* Input Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1.5">Payment Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-8 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                  />
                </div>
                {errors.amount && <div className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.amount}</div>}
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1.5">Payment Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Card'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 border text-xs font-bold rounded-xl transition cursor-pointer ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50/35 text-indigo-650 dark:text-indigo-400 ring-1 ring-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated new status */}
              {collectAmount && !isNaN(Number(collectAmount)) && (
                <div className="text-[11px] text-muted-foreground bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/40 p-2.5 rounded-xl flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span>
                    New Pending Balance will be: <strong>₹{(Number(paymentTarget.pending_amount) - Number(collectAmount)).toFixed(2)}</strong>.
                  </span>
                </div>
              )}

              {/* Submit / Actions */}
              <div className="pt-4 flex gap-3 border-t">
                <button
                  onClick={handleRecordPayment}
                  disabled={payMut.isPending || !collectAmount}
                  className="flex-1 py-3 bg-gradient-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-soft cursor-pointer text-center"
                >
                  {payMut.isPending ? "Recording..." : "Record Payment"}
                </button>
                <button
                  onClick={closePaymentModal}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-accent transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
