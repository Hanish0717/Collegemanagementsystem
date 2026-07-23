import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { Database, Building2, Layers, CheckCircle2 } from 'lucide-react';

function HODResourcesComponent() {
  const { departmentCode, departmentInfo } = useHODDepartment();
  const code = (departmentCode || 'AIML').toUpperCase();

  const branchResources: Record<string, { subtitle: string; labSub: string; nodeSub: string; licenses: string; data: any[] }> = {
    MECH: {
      subtitle: 'Manage CAD/CAM machines, thermal test rigs, hydraulic turbines, and CNC labs.',
      labSub: 'CAD/CAM & Thermal Labs',
      nodeSub: '5-Axis CNC & Workstations',
      licenses: 'AutoCAD, SolidWorks, Ansys',
      data: [
        { id: 'AST-M01', name: 'CNC 5-Axis Milling Machine & Lathe', lab: 'CAM Lab 1', qty: 2, value: '₹35,00,000', status: 'Operational' },
        { id: 'AST-M02', name: 'Thermal Engineering Test Rig & Boiler', lab: 'Thermodynamics Lab', qty: 4, value: '₹14,00,000', status: 'Operational' },
        { id: 'AST-M03', name: 'Wind Tunnel & Fluid Mechanics Testbed', lab: 'Fluid Dynamics Lab', qty: 2, value: '₹8,50,000', status: 'Under Maintenance' },
      ],
    },
    EEE: {
      subtitle: 'Manage electrical machine banks, PLC-SCADA automation kits, and high-voltage labs.',
      labSub: 'Power & SCADA Labs',
      nodeSub: 'Transformer & Motor Banks',
      licenses: 'ETAP, MATLAB SimPower, PLC',
      data: [
        { id: 'AST-E01', name: '3-Phase Synchronous Generator & Motor Bank', lab: 'Electrical Machines Lab', qty: 6, value: '₹22,00,000', status: 'Operational' },
        { id: 'AST-E02', name: 'PLC & SCADA Automation Trainer Kit', lab: 'Control Systems Lab', qty: 12, value: '₹16,00,000', status: 'Operational' },
        { id: 'AST-E03', name: 'High Voltage Impulse Generator Testbed', lab: 'High Voltage Lab', qty: 1, value: '₹12,00,000', status: 'Operational' },
      ],
    },
    ECE: {
      subtitle: 'Manage FPGA boards, vector network analyzers, spectrum analyzers, and VLSI labs.',
      labSub: 'VLSI & Antenna Labs',
      nodeSub: 'FPGA & Cadence Systems',
      licenses: 'Cadence Virtuoso, Xilinx Vivado',
      data: [
        { id: 'AST-EC01', name: 'Cadence & Xilinx FPGA VLSI Workstations', lab: 'VLSI Design Lab', qty: 30, value: '₹28,00,000', status: 'Operational' },
        { id: 'AST-EC02', name: 'Vector Network Analyzer & Spectrum Suite', lab: 'Microwave & Antenna Lab', qty: 4, value: '₹19,00,000', status: 'Operational' },
        { id: 'AST-EC03', name: 'ARM Cortex & IoT Hardware Kits', lab: 'Embedded Systems Lab', qty: 20, value: '₹7,50,000', status: 'Operational' },
      ],
    },
    CSE: {
      subtitle: 'Manage server rack clusters, networking switches, software suites, and computer labs.',
      labSub: 'Cloud & Systems Labs',
      nodeSub: 'Dell PowerEdge Racks',
      licenses: 'RedHat, Oracle, Cisco IOS',
      data: [
        { id: 'AST-C01', name: 'Dell PowerEdge R750 Server Rack Cluster', lab: 'Cloud Computing Lab', qty: 4, value: '₹24,00,000', status: 'Operational' },
        { id: 'AST-C02', name: 'High-Performance Core i7 Development Nodes', lab: 'Systems Lab 1', qty: 40, value: '₹32,00,000', status: 'Operational' },
        { id: 'AST-C03', name: 'Cisco Managed Router & Catalyst Switches', lab: 'Networking Lab', qty: 10, value: '₹9,00,000', status: 'Operational' },
      ],
    },
    CIVIL: {
      subtitle: 'Manage UTM machines, Total Station survey instruments, and concrete testing labs.',
      labSub: 'Structural & Soil Labs',
      nodeSub: '1000 kN UTM & Surveyors',
      licenses: 'STAAD.Pro, ETABS, Revit',
      data: [
        { id: 'AST-CV01', name: 'Universal Testing Machine (1000 kN UTM)', lab: 'Structures Lab', qty: 1, value: '₹15,00,000', status: 'Operational' },
        { id: 'AST-CV02', name: 'Leica Total Station & GPS Survey Kit', lab: 'Surveying Lab', qty: 6, value: '₹18,00,000', status: 'Operational' },
      ],
    },
    IT: {
      subtitle: 'Manage private cloud clusters, cybersecurity testbeds, and DevOps labs.',
      labSub: 'DevOps & Cyber Labs',
      nodeSub: 'Kubernetes Nodes & Racks',
      licenses: 'Docker Enterprise, AWS Local',
      data: [
        { id: 'AST-IT01', name: 'Private Cloud Kubernetes Node Cluster', lab: 'DevOps Lab', qty: 3, value: '₹20,00,000', status: 'Operational' },
        { id: 'AST-IT02', name: 'Network Penetration & Defense Testbed', lab: 'Cyber Security Lab', qty: 15, value: '₹12,00,000', status: 'Operational' },
      ],
    },
    AIML: {
      subtitle: 'Manage specialized AI/ML laboratories, GPU compute servers, and robotics labs.',
      labSub: 'NVIDIA GPU Clusters',
      nodeSub: 'RTX 4090 / A100 Workstations',
      licenses: 'MATLAB, PyTorch Cloud, Ansys',
      data: [
        { id: 'AST-101', name: 'NVIDIA A100 GPU Server Cluster', lab: 'AI Research Lab 1', qty: 4, value: '₹18,00,000', status: 'Operational' },
        { id: 'AST-102', name: 'High-Performance Workstations (i9/64GB)', lab: 'Deep Learning Lab', qty: 25, value: '₹25,00,000', status: 'Operational' },
        { id: 'AST-103', name: 'Robot Operating System (ROS) Testbed', lab: 'Robotics & Vision Lab', qty: 2, value: '₹6,00,000', status: 'Under Maintenance' },
      ],
    },
  };

  const info = branchResources[code] || branchResources['AIML'];

  const resourcesConfig = {
    slug: 'resources',
    title: `${departmentInfo.shortName} Resources & Equipment Assets`,
    subtitle: info.subtitle,
    icon: Database,
    stats: [
      { label: 'Specialized Labs', value: 6, subtitle: info.labSub, icon: Building2, color: 'blue' },
      { label: 'Compute / Equip Nodes', value: 32, subtitle: info.nodeSub, icon: Database, color: 'purple' },
      { label: 'Active Licenses', value: 140, subtitle: info.licenses, icon: Layers, color: 'indigo' },
      { label: 'Asset Calibration', value: '100%', subtitle: 'Certified by Lab Incharge', icon: CheckCircle2, color: 'emerald' },
    ],
    sampleData: info.data,
    columns: [
      { key: 'id', header: 'Asset Tag', render: (i: any) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{i.id}</span> },
      { key: 'name', header: 'Equipment / System', render: (i: any) => <span className="font-extrabold text-slate-900 dark:text-white">{i.name}</span> },
      { key: 'lab', header: 'Location / Lab', render: (i: any) => <span className="font-semibold text-purple-600 dark:text-purple-400">{i.lab}</span> },
      { key: 'qty', header: 'Quantity', render: (i: any) => <span className="font-bold">{i.qty} Units</span> },
      { key: 'value', header: 'Est. Valuation', render: (i: any) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{i.value}</span> },
      { key: 'status', header: 'Condition', render: (i: any) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${i.status === 'Operational' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'}`}>{i.status}</span> },
    ],
  };

  return <HODSubModulePage config={resourcesConfig} />;
}

export const Route = createFileRoute('/hod/resources')({
  component: HODResourcesComponent,
});
