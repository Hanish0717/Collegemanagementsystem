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
  ClipboardList,
  TrendingDown,
  LogOut
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminInventory() {
  const [activeTab, setActiveTab] = useState<"assets" | "depreciation" | "gatepasses">("assets");

  const [depreciationLedger, setDepreciationLedger] = useState([
    { id: "AST-101", name: "AIML Supercomputing Node", cost: 1200000, purchaseDate: "2024-03-10", currentVal: 960000, rate: "10% WDV" },
    { id: "AST-102", name: "Dell OptiPlex 7090 Desktop", cost: 45000, purchaseDate: "2023-08-15", currentVal: 31500, rate: "15% WDV" }
  ]);

  const [gatePasses, setGatePasses] = useState([
    { id: "GP-001", item: "Dell OptiPlex 7090 Desktop", qty: 2, sentTo: "Dell Service Center, Hyd", status: "Outbound", date: "2026-07-16" },
    { id: "GP-002", item: "Keysight DSO Oscilloscope", qty: 1, sentTo: "Keysight Lab Instruments", status: "Returned", date: "2026-07-10" }
  ]);
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
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4">
        {[
          { id: "assets", label: "Asset Register & POs", icon: Database },
          { id: "depreciation", label: "Depreciation Ledger", icon: TrendingDown },
          { id: "gatepasses", label: "Repair Gate Passes", icon: LogOut }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "assets" && (
        <>
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
        </>
      )}

      {/* DEPRECIATION AUDIT LEDGER */}
      {activeTab === "depreciation" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Asset Depreciation Ledger &amp; WDV Valuation</h3>
            <Badge tone="info">FY 2026-27 Book Value Audit</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Asset ID</th>
                  <th className="text-left pb-2">Asset Description</th>
                  <th className="text-center pb-2">Purchase Cost</th>
                  <th className="text-left pb-2">Purchase Date</th>
                  <th className="text-center pb-2">Depreciation Rate</th>
                  <th className="text-right pb-2">Written Down Value (WDV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depreciationLedger.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-mono font-bold text-slate-400">{item.id}</td>
                    <td className="py-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 text-center font-mono font-semibold text-slate-500">₹{item.cost.toLocaleString()}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{item.purchaseDate}</td>
                    <td className="py-3 text-center"><Badge tone="warn">{item.rate}</Badge></td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600">₹{item.currentVal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPAIR GATE PASSES */}
      {activeTab === "gatepasses" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Outward Gate Passes (Hardware Repair/Calibration)</h3>
              <Badge tone="success">Gate Security Logs</Badge>
            </div>
            <div className="space-y-3">
              {gatePasses.map(pass => (
                <div key={pass.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600">{pass.id}</span>
                      <span className="font-bold text-slate-800">{pass.item}</span>
                      <span className="text-slate-400 font-semibold">(Qty: {pass.qty})</span>
                    </div>
                    <div className="text-slate-500 font-semibold">Sent To: {pass.sentTo} | Date: {pass.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={pass.status === "Returned" ? "success" : "warn"}>{pass.status}</Badge>
                    {pass.status !== "Returned" && (
                      <button
                        onClick={() => {
                          setGatePasses(prev => prev.map(p => p.id === pass.id ? { ...p, status: "Returned" } : p));
                          toast.success(`${pass.item} marked as Returned & restocked!`);
                        }}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                      >
                        Log Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Generate Gate Pass</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const item = (form.elements.namedItem("item") as HTMLInputElement).value;
                const qty = Number((form.elements.namedItem("qty") as HTMLInputElement).value);
                const sentTo = (form.elements.namedItem("sentTo") as HTMLInputElement).value;

                if (!item.trim() || qty <= 0 || !sentTo.trim()) {
                  toast.error("Please fill in all details!");
                  return;
                }

                const newPass = {
                  id: `GP-0${gatePasses.length + 1}`,
                  item,
                  qty,
                  sentTo,
                  status: "Outbound",
                  date: new Date().toISOString().substring(0, 10)
                };
                setGatePasses([...gatePasses, newPass]);
                toast.success(`Gate Pass ${newPass.id} printed & logged!`);
                form.reset();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Item Description</label>
                <input
                  name="item"
                  type="text"
                  required
                  placeholder="e.g. HP LaserJet Pro M404"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                <input
                  name="qty"
                  type="number"
                  min="1"
                  required
                  placeholder="1"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Service Vendor / Destination</label>
                <input
                  name="sentTo"
                  type="text"
                  required
                  placeholder="e.g. HP Service Hub"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Issue Pass &amp; Open Gate
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
export default AdminInventory;
