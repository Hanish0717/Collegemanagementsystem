import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { fees } from "@/lib/mock-data";
import { Wallet, AlertCircle, CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/fees")({ component: FeesPage });

function FeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fees" desc="Track collections, dues and invoices." />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Collected" value="$1.24M" change="+12.5%" icon={Wallet} gradient="bg-gradient-primary" />
        <StatCard label="Pending" value="$184K" icon={AlertCircle} gradient="bg-gradient-violet" />
        <StatCard label="Paid Invoices" value="3,240" change="+8%" icon={CheckCircle2} gradient="bg-gradient-cyan" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {fees.slice(0,3).map(f=>(
          <Card key={f.id} className="gradient-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-mono">{f.id}</div>
                <div className="font-semibold mt-1">{f.student}</div>
                <div className="text-xs text-muted-foreground">{f.date}</div>
              </div>
              <Badge tone={f.status==="Paid"?"success":f.status==="Pending"?"warn":"danger"}>{f.status}</Badge>
            </div>
            <div className="mt-4 text-2xl font-bold text-gradient">${f.amount.toLocaleString()}</div>
            <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-white text-sm py-2 glow-primary">
              {f.status==="Paid" ? <><Download className="size-4" /> Invoice</> : "Pay Now"}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b font-semibold">Payment History</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>{["Invoice","Student","Amount","Date","Status",""].map(h=><th key={h} className="px-5 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {fees.map(f=>(
              <tr key={f.id} className="border-t hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{f.id}</td>
                <td className="px-5 py-3 font-medium">{f.student}</td>
                <td className="px-5 py-3 font-semibold">${f.amount.toLocaleString()}</td>
                <td className="px-5 py-3 text-muted-foreground">{f.date}</td>
                <td className="px-5 py-3"><Badge tone={f.status==="Paid"?"success":f.status==="Pending"?"warn":"danger"}>{f.status}</Badge></td>
                <td className="px-5 py-3 text-right"><button className="text-indigo text-xs font-medium hover:underline">Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
