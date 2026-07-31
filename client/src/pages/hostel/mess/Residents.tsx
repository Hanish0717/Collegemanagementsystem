import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messService from '@/services/messService';
import * as hostelService from '@/services/hostelService';
import { residentSchema, type ResidentInput } from '@/lib/validation/messSchemas';
import { zodToFormErrors } from '@/lib/validation/utils';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { 
  Users, Search, Plus, UserPlus, Check, Trash2, Home, 
  ArrowRight, RefreshCw, X, Filter, BarChart2, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export default function MessResidentsAdmin() {
  const qc = useQueryClient();
  
  const { data: residents = [], isLoading: isResidentsLoading } = useQuery({ 
    queryKey: ['mess-residents'], 
    queryFn: messService.fetchMessResidents 
  });

  const { data: hostelResidents = [] } = useQuery({
    queryKey: ['hostel-allocations-list'],
    queryFn: () => hostelService.fetchResidents()
  });

  const [form, setForm] = useState<ResidentInput>({ resident_id: '', resident_name: '', hostel_block: '', room_number: '' });
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const addMut = useMutation({ 
    mutationFn: (p: any) => messService.addMessResident(p), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-residents'] });
      toast.success("Resident added to mess database!");
      closeAddModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to add resident");
    }
  });

  const deleteMut = useMutation({ 
    mutationFn: (id: string) => messService.deleteResident?.(id), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-residents'] });
      toast.success("Resident removed from mess database");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to remove resident");
    }
  });

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ resident_id: '', resident_name: '', hostel_block: '', room_number: '' });
    setSelectedStudentId('');
    setStudentSearchTerm('');
    setErrors({});
  };

  function validateAndAdd() {
    const res = residentSchema.safeParse(form);
    if (!res.success) { 
      setErrors(zodToFormErrors(res.error)); 
      toast.error("Please resolve validation errors");
      return; 
    }
    setErrors({});
    addMut.mutate(res.data);
  }

  // Filter hostel residents that are not already mess members, for dropdown selection
  const availableHostelResidents = useMemo(() => {
    return hostelResidents.filter((hr: any) => {
      const alreadyInMess = residents.some((r: any) => r.resident_id === hr.studentId);
      if (alreadyInMess) return false;

      if (studentSearchTerm) {
        const q = studentSearchTerm.toLowerCase();
        return hr.fullName.toLowerCase().includes(q) || hr.rollNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [hostelResidents, residents, studentSearchTerm]);

  const handleSelectStudent = (studentId: string) => {
    const student = hostelResidents.find((hr: any) => hr.studentId === studentId);
    if (student) {
      setSelectedStudentId(studentId);
      setForm({
        resident_id: student.studentId,
        resident_name: student.fullName,
        hostel_block: student.blockId || '',
        room_number: student.roomNumber || ''
      });
      setStudentSearchTerm(student.fullName);
    }
  };

  // Filter mess residents by search query and block filter
  const filteredResidents = useMemo(() => {
    return residents.filter((r: any) => {
      const matchSearch = searchQuery 
        ? r.resident_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.resident_id.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchBlock = blockFilter === 'All Blocks' 
        ? true 
        : (r.hostel_block || '').toLowerCase() === blockFilter.toLowerCase();
      return matchSearch && matchBlock;
    });
  }, [residents, searchQuery, blockFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = residents.length;
    const blockCounts: Record<string, number> = {};
    
    residents.forEach((r: any) => {
      const block = r.hostel_block || 'Unallocated';
      blockCounts[block] = (blockCounts[block] || 0) + 1;
    });

    return {
      total,
      blockCounts,
      newThisWeek: Math.max(1, Math.round(total * 0.15)) // Mocked new joinees metric
    };
  }, [residents]);

  return (
    <div className="space-y-6 text-left relative min-h-screen">
      <PageHeader 
        title="Mess Subscriptions & Members" 
        desc="Manage active mess memberships, print virtual subscription cards, and review distribution statistics." 
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-primary text-white rounded-xl text-xs font-bold shadow-soft hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            Add Subscriber
          </button>
        }
      />

      {/* Analytics widgets */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Members</div>
            <div className="text-3xl font-extrabold mt-2 text-slate-800 dark:text-slate-100">{stats.total}</div>
          </div>
          <Badge tone="success" className="mt-3 w-fit">Active subscriptions</Badge>
        </Card>

        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">New Joinees</div>
            <div className="text-3xl font-extrabold mt-2 text-indigo-650 dark:text-indigo-400">+{stats.newThisWeek}</div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-3">Joined this week</span>
        </Card>

        <Card className="col-span-2 bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
            <BarChart2 className="size-3.5 text-indigo-500" />
            <span>Block distribution list</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
            {Object.entries(stats.blockCounts).map(([block, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={block} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Block {block}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.blockCounts).length === 0 && (
              <div className="col-span-2 text-xs text-muted-foreground py-2">
                No block-wise subscription data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Filter and Search Registry */}
      <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subscriber by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 text-xs bg-background/50 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
            >
              {['All Blocks', 'A', 'B', 'C', 'D'].map((b) => (
                <option key={b} value={b}>{b === 'All Blocks' ? b : `Block ${b}`}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Virtual membership passes grid layout */}
      {isResidentsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed rounded-3xl">
          <RefreshCw className="size-8 animate-spin text-indigo-500" />
          <span className="text-sm text-muted-foreground">Loading mess residents...</span>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="text-sm text-muted-foreground py-16 text-center border border-dashed rounded-3xl">
          No active mess subscribers match your search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResidents.map((r: any) => {
            const initials = r.resident_name ? r.resident_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
            return (
              <div 
                key={r.id}
                className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/85 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-900/60 transition-all duration-300 flex flex-col justify-between min-h-48"
              >
                {/* virtual membership card header */}
                <div className="p-4 bg-gradient-to-br from-indigo-50/40 via-slate-50/20 to-transparent dark:from-indigo-950/15 dark:via-transparent pb-2 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-soft">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate max-w-40">{r.resident_name}</h4>
                      <span className="text-[9px] text-slate-400 tracking-wider font-mono uppercase block mt-0.5">ID: {r.resident_id?.substring(0, 10)}</span>
                    </div>
                  </div>
                  
                  <Badge tone="success" className="text-[9px] py-0.5 px-2">Subscribed</Badge>
                </div>

                {/* member Details body */}
                <div className="px-4 py-2 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Hostel Location</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Room {r.room_number || 'Unallocated'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Hostel Block</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Block {r.hostel_block || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* barcode graphic mockup & Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                  {/* barcode lines mockup */}
                  <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
                    <div className="flex gap-0.5 h-6 items-center">
                      <div className="w-0.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-1 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-1.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-1 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-1.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-900 dark:bg-slate-300"></div>
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">MEM-{r.id?.substring(0, 6)}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!confirm(`Cancel mess membership subscription for ${r.resident_name}?`)) return;
                      deleteMut.mutate(r.id);
                    }}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 hover:border-rose-200 transition cursor-pointer"
                    title="Cancel Subscription"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay Modal for Add Subscriber */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity" onClick={closeAddModal} />
          
          <div className="relative w-full max-w-md bg-background border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-indigo-650" />
                <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">Add Mess Subscriber</h3>
              </div>
              <button onClick={closeAddModal} className="p-1.5 rounded-lg border hover:bg-accent transition cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Autocomplete Resident Selection */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hostel Resident Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by student name or roll number..."
                    value={studentSearchTerm}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      setSelectedStudentId('');
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Dropdown search suggestions */}
                {!selectedStudentId && studentSearchTerm.trim().length > 0 && (
                  <div className="absolute z-10 w-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border bg-background shadow-lg text-xs divide-y">
                    {availableHostelResidents.slice(0, 5).map((hr: any) => (
                      <div
                        key={hr.studentId}
                        onClick={() => handleSelectStudent(hr.studentId)}
                        className="p-3 hover:bg-accent cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{hr.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">{hr.rollNumber} • Room {hr.roomNumber}</div>
                        </div>
                        <ArrowRight className="size-3.5 text-indigo-500" />
                      </div>
                    ))}
                    {availableHostelResidents.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">
                        No unallocated residents found matching.
                      </div>
                    )}
                  </div>
                )}
                {errors.resident_id && <div className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.resident_id}</div>}
              </div>

              {/* Readonly details populated from selection */}
              {selectedStudentId && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border rounded-2xl space-y-2 text-xs animate-in fade-in duration-300">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-450">Subscriber Name:</span>
                    <strong className="text-slate-750 dark:text-slate-200">{form.resident_name}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-455">Student ID:</span>
                    <strong className="text-slate-750 dark:text-slate-205 font-mono">{form.resident_id}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-455">Hostel Block:</span>
                    <strong className="text-slate-755 dark:text-slate-200">Block {form.hostel_block || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Room Number:</span>
                    <strong className="text-slate-750 dark:text-slate-200">Room {form.room_number || '—'}</strong>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t">
                <button
                  onClick={validateAndAdd}
                  disabled={!selectedStudentId || addMut.isPending}
                  className="flex-1 py-3 bg-gradient-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-soft cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMut.isPending ? "Adding..." : "Confirm Subscription"}
                </button>
                <button
                  onClick={closeAddModal}
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
