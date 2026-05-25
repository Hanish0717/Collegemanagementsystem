import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { finesData, libraryReports } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/librarian/fines")({
  component: FineManagementPage,
});

function FineManagementPage() {
  const fineCollectionData = libraryReports.map(r => ({
    month: r.month.substring(0, 3),
    collection: r.fineCollected,
  }));

  const totalPendingFines = finesData.filter(f => f.status === "Pending").reduce((sum, f) => sum + f.amount, 0);
  const totalPaidFines = finesData.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fine Management"
        desc="Track and collect fines from overdue books."
      />

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mx-auto mb-3">
              <DollarSign className="size-6" />
            </div>
            <div className="text-3xl font-bold text-rose-600">₹{totalPendingFines}</div>
            <div className="text-xs text-muted-foreground mt-2">Pending Fines</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-3">
              <TrendingUp className="size-6" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">₹{totalPaidFines}</div>
            <div className="text-xs text-muted-foreground mt-2">Collected This Month</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold">{finesData.filter(f => f.status === "Pending").length}</div>
            <div className="text-xs text-muted-foreground mt-2">Outstanding Fines</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{finesData.filter(f => f.status === "Paid").length}</div>
            <div className="text-xs text-muted-foreground mt-2">Resolved Fines</div>
          </div>
        </Card>
      </div>

      {/* Fine Collection Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Fine Collection Trend</h3>
            <p className="text-xs text-muted-foreground">Monthly fine collection analytics</p>
          </div>
          <Badge tone="info">This Year</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={fineCollectionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="collection" fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pending Fines */}
      <Card>
        <h3 className="font-semibold mb-4">Pending Fines</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fine ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Student Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reason</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {finesData.map(fine => (
                <tr key={fine.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{fine.id}</td>
                  <td className="px-4 py-3 font-medium">{fine.studentName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fine.reason}</td>
                  <td className="px-4 py-3 text-center font-bold">₹{fine.amount}</td>
                  <td className="px-4 py-3 text-center text-xs">{fine.date}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={fine.status === "Paid" ? "success" : "danger"}>{fine.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fine.status === "Pending" ? (
                      <button className="px-3 py-1.5 rounded-lg text-xs bg-gradient-primary text-white glow-primary">
                        Collect
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 rounded-lg text-xs border text-muted-foreground">
                        Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fine Details */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Fine Breakdown by Reason</h3>
          <div className="space-y-3">
            {[
              { reason: "Overdue Return", count: 3, amount: 285 },
              { reason: "Book Damage", count: 1, amount: 85 },
              { reason: "Lost Book", count: 1, amount: 200 },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl border bg-gradient-soft flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{item.reason}</div>
                  <div className="text-xs text-muted-foreground">{item.count} fines</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{item.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Collection Performance</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-200">
              <div className="text-xs text-emerald-700 font-medium mb-1">Collection Rate</div>
              <div className="text-2xl font-bold text-emerald-700">82.4%</div>
              <div className="text-xs text-emerald-600 mt-1">↑ 5.2% vs last month</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-100 border border-amber-200">
              <div className="text-xs text-amber-700 font-medium mb-1">Overdue Fines</div>
              <div className="text-2xl font-bold text-amber-700">₹485</div>
              <div className="text-xs text-amber-600 mt-1">2 fines overdue by 7+ days</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-100 border border-blue-200">
              <div className="text-xs text-blue-700 font-medium mb-1">Average Fine</div>
              <div className="text-2xl font-bold text-blue-700">₹142</div>
              <div className="text-xs text-blue-600 mt-1">Across all records</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Collection Policies */}
      <Card>
        <h3 className="font-semibold mb-4">Fine Policies</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-gradient-soft">
            <div className="text-sm font-semibold mb-2">📚 Overdue Books</div>
            <div className="text-xs text-muted-foreground">
              <ul className="space-y-1">
                <li>• ₹5 per day</li>
                <li>• Max ₹500 per book</li>
                <li>• Blocks new issues</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-gradient-soft">
            <div className="text-sm font-semibold mb-2">💔 Damaged Books</div>
            <div className="text-xs text-muted-foreground">
              <ul className="space-y-1">
                <li>• Minor: ₹100</li>
                <li>• Major: ₹500</li>
                <li>• Severe: Book price</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-gradient-soft">
            <div className="text-sm font-semibold mb-2">🚫 Lost Books</div>
            <div className="text-xs text-muted-foreground">
              <ul className="space-y-1">
                <li>• Fixed ₹2,000</li>
                <li>• Or book replacement</li>
                <li>• Blocks all issues</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
