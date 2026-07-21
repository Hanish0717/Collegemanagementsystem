import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { Database, Building2, Layers, CheckCircle2 } from 'lucide-react';

const resourcesConfig = {
  slug: 'resources',
  title: 'Department Resources & Assets',
  subtitle: 'Manage specialized AI/ML laboratories, GPU compute servers, software licenses, and equipment inventories.',
  icon: Database,
  stats: [
    { label: 'Specialized Labs', value: 6, subtitle: 'NVIDIA GPU Clusters', icon: Building2, color: 'blue' },
    { label: 'Compute Nodes', value: 32, subtitle: 'RTX 4090 / A100 Workstations', icon: Database, color: 'purple' },
    { label: 'Active Licenses', value: 140, subtitle: 'MATLAB, PyTorch Cloud, Ansys', icon: Layers, color: 'indigo' },
    { label: 'Asset Calibration', value: '100%', subtitle: 'Certified by Lab Incharge', icon: CheckCircle2, color: 'emerald' },
  ],
  sampleData: [
    { id: 'AST-101', name: 'NVIDIA A100 GPU Server Cluster', lab: 'AI Research Lab 1', qty: 4, value: '₹18,00,000', status: 'Operational' },
    { id: 'AST-102', name: 'High-Performance Workstations (i9/64GB)', lab: 'Deep Learning Lab', qty: 25, value: '₹25,00,000', status: 'Operational' },
    { id: 'AST-103', name: 'Robot Operating System (ROS) Testbed', lab: 'Robotics & Vision Lab', qty: 2, value: '₹6,00,000', status: 'Under Maintenance' },
  ],
  columns: [
    { key: 'id', header: 'Asset Tag', render: (i: any) => <span className="font-mono font-bold text-blue-600">{i.id}</span> },
    { key: 'name', header: 'Equipment / System', render: (i: any) => <span className="font-extrabold text-slate-900 dark:text-white">{i.name}</span> },
    { key: 'lab', header: 'Location / Lab', render: (i: any) => <span className="font-semibold text-purple-600">{i.lab}</span> },
    { key: 'qty', header: 'Quantity', render: (i: any) => <span className="font-bold">{i.qty} Units</span> },
    { key: 'value', header: 'Est. Valuation', render: (i: any) => <span className="font-bold text-emerald-600">{i.value}</span> },
    { key: 'status', header: 'Condition', render: (i: any) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${i.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{i.status}</span> },
  ],
};

export const Route = createFileRoute('/hod/resources')({
  component: () => <HODSubModulePage config={resourcesConfig} />,
});
