import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentAuditLogs, AuditLogItem } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { exportToCSV } from '../utils/exportUtils';
import { Download, RefreshCw, ShieldCheck } from 'lucide-react';

const MODULE_BADGE: Record<string, string> = {
  Authentication: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Approvals: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Reports: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Documents: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Settings: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function HODAuditPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const res = await fetchDepartmentAuditLogs(departmentCode);
    setLogs((res as any).logs || []);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, [departmentCode]);

  const columns: Column<AuditLogItem>[] = [
    { key: 'timestamp', header: 'Timestamp', render: i => <span className="font-mono text-xs text-blue-600">{i.timestamp}</span> },
    { key: 'user', header: 'User', render: i => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{i.user}</span> },
    { key: 'action', header: 'Action Performed', render: i => <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{i.action}</span> },
    {
      key: 'module', header: 'Module',
      render: i => <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${MODULE_BADGE[i.module] || 'bg-slate-100 text-slate-600'}`}>{i.module}</span>,
    },
    { key: 'ip', header: 'IP Address', render: i => <span className="font-mono text-xs text-slate-500">{i.ip}</span> },
    { key: 'status', header: 'Status', render: i => <StatusBadge status={i.status} /> },
  ];

  return (
    <PageContainer
      title="Audit Logs"
      subtitle={`Complete activity trail for all HOD actions performed within ${departmentInfo.name} management workspace`}
      breadcrumbItems={[{ label: 'Audit Logs' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={RefreshCw} onClick={loadLogs}>Refresh</Button>
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Audit_Trail_${departmentInfo.shortName}.csv`, logs);
              NotificationToast.success('Exported', 'Audit log CSV downloaded.');
            }}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      {/* Security Notice */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs font-semibold text-blue-700 dark:text-blue-300">
        <ShieldCheck className="size-5 shrink-0 text-blue-600" />
        All actions performed in the HOD Management Workspace are securely logged with timestamps, user identity, module, and IP address for compliance and audit trail purposes.
      </div>

      <AdvancedTable
        title={`${departmentInfo.shortName} HOD Activity Audit Trail`}
        subtitle="Real-time log of all HOD login, approval, report, document, and settings actions"
        columns={columns}
        data={logs}
        keyExtractor={i => i.id}
        searchPlaceholder="Search logs by action, module, or timestamp..."
      />
    </PageContainer>
  );
}
