import React, { useState } from 'react';
import { useAlumni } from '../AdminAlumni';
import { GradientHeader, GlassCard } from './components/CardElements';
import {
  StyledTable,
  TableRow,
  TableCell,
  TablePagination,
  AdvancedTableToolbar,
} from './components/TableElements';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Eye, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function VerificationPage() {
  const { pendingAlumni, pendingLoading } = useAlumni();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  if (pendingLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="h-96 bg-muted rounded-3xl w-full" />
      </div>
    );
  }

  // Mock list of pending records
  const pendingList =
    pendingAlumni?.length > 0
      ? pendingAlumni
      : [
          {
            id: '1',
            name: 'Sarah Connor',
            batch: '2020',
            department: 'Mechanical Engineering',
            appliedAt: '2024-03-15T10:30:00Z',
            docsCount: 2,
          },
          {
            id: '2',
            name: 'John Smith',
            batch: '2018',
            department: 'Electrical Engineering',
            appliedAt: '2024-03-14T14:20:00Z',
            docsCount: 1,
          },
        ];

  const filteredList = pendingList.filter(
    (a: any) => a.name?.toLowerCase().includes(search.toLowerCase()) || a.batch?.includes(search),
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader
        title="Verification Center"
        description="Review and verify alumni registrations to ensure platform authenticity."
        icon={ShieldCheck}
        color="from-amber-500 to-orange-600"
      >
        <div className="flex bg-black/20 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            Pending (12)
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'approved' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'rejected' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            Rejected
          </button>
        </div>
      </GradientHeader>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">Verification Queue</h3>
            {activeTab === 'pending' && (
              <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                <Clock className="w-3 h-3 mr-1" /> Action Required
              </Badge>
            )}
          </div>
          {activeTab === 'pending' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Bulk Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> Bulk Reject
              </Button>
            </div>
          )}
        </div>

        <AdvancedTableToolbar
          onSearch={setSearch}
          searchPlaceholder="Search by applicant name or batch..."
        />

        <StyledTable
          headers={['Applicant', 'Academic Info', 'Submitted On', 'Documents', 'Actions']}
        >
          {filteredList.map((app: any) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{app.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: ALM-{app.id.padStart(4, '0')}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">Class of {app.batch}</p>
                <p className="text-xs text-muted-foreground">{app.department}</p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(app.appliedAt).toLocaleTimeString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4 mr-1.5" /> {app.docsCount} Docs
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl bg-muted/50 hover:bg-muted"
                    title="Review Docs"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl text-emerald-600 hover:bg-emerald-50"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:bg-rose-50"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>

        <TablePagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      </GlassCard>
    </div>
  );
}
