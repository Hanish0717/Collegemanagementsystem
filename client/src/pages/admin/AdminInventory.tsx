import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Sliders,
  FileSpreadsheet,
  Cpu,
  Trash2,
  CheckCircle,
  Plus,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminInventory() {
  const [assets, setAssets] = useState([
    { id: "AST-101", name: "AIML Supercomputing Node", category: "Lab Equipment", lab: "AIML Lab 1", qty: 2, status: "Healthy" },
    { id: "AST-102", name: "Dell OptiPlex 7090 Desktop", category: "Computers", lab: "CSE Lab 3", qty: 45, status: "Due Service" },
    { id: "AST-103", name: "Keysight DSO Oscilloscope", category: "Lab Equipment", lab: "ECE Circuits Lab", qty: 12, status: "Healthy" },
    { id: "AST-104", name: "Network Cisco Switches 24P", category: "Networking", lab: "Server Room", qty: 8, status: "Healthy" }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: "PO-901", vendor: "Prime Computers Inc", items: "15x Core i7 Desktops", cost: "₹7.5L", status: "Pending approval" },
    { id: "PO-902", vendor: "Electronic Emporium", items: "20x VLSI Breadboards", cost: "₹45,000", status: "Pending approval" }
  ]);

  const handleApprovePO = (id: string, items: string) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    toast.success(`Purchase Order ${id} Approved: ${items}`);
  };

  const handleServiceAsset = (id: string, name: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: "Healthy" } : a));
    toast.success(`Asset marked as Healthy after servicing: ${name}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset &amp; Lab Inventory Control"
        desc="Supervise institutional assets, verify laboratory testing apparatuses, approve purchase orders, and track hardware maintenance logs."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Institutional Assets"
          value="1,842 items"
          change="Estimated valuation ₹1.24 Cr"
          icon={Database}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Lab Equipments Registered"
          value="842 devices"
          change="Across 18 academic labs"
          icon={Cpu}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Purchase Orders Pending"
          value={String(purchaseOrders.length)}
          change="Awaiting budgetary consent"
          icon={ClipboardList}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Maintenance Alarms"
          value="1 due service"
          change="CSE Lab 3 Desktops"
          icon={AlertTriangle}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Assets Roster */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Asset Stock Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Asset ID</th>
                  <th className="text-left pb-2">Description</th>
                  <th className="text-left pb-2">Asset Class</th>
                  <th className="text-left pb-2">Assigned Room</th>
                  <th className="text-center pb-2">Quantity</th>
                  <th className="text-right pb-2">Operational State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-indigo-700">{a.id}</td>
                    <td className="py-2.5 font-bold text-slate-800">{a.name}</td>
                    <td className="py-2.5 text-slate-500 font-medium">{a.category}</td>
                    <td className="py-2.5 font-medium">{a.lab}</td>
                    <td className="py-2.5 text-center font-bold text-slate-800">{a.qty}</td>
                    <td className="py-2.5 text-right">
                      {a.status === "Due Service" ? (
                        <button
                          onClick={() => handleServiceAsset(a.id, a.name)}
                          className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold hover:bg-amber-100 transition text-[10px] cursor-pointer"
                        >
                          Mark Serviced
                        </button>
                      ) : (
                        <Badge tone="success">{a.status}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Purchase Orders Checklist */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Purchase Orders (PO)</h3>
            <Badge tone="warn">{purchaseOrders.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {purchaseOrders.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">All pending orders dispatched!</div>
            ) : (
              purchaseOrders.map(row => (
                <div key={row.id} className="p-3 border rounded-xl space-y-2 text-xs hover:bg-slate-50 transition">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{row.vendor}</span>
                    <span className="font-mono text-indigo-600">{row.cost}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">{row.items}</p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleApprovePO(row.id, row.items)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition cursor-pointer"
                    >
                      Authorize Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AdminInventory;
