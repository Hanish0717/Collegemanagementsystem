import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, Download, Search } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { finesData, libraryReports } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianFines() {
  const [fines, setFines] = useState(finesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [isConfirmCollectOpen, setIsConfirmCollectOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fineCollectionData = libraryReports.map((r) => ({
    month: r.month.substring(0, 3),
    collection: r.fineCollected,
  }));

  const filteredFines = fines.filter(
    (f) =>
      (filterStatus === "All" || f.status === filterStatus) &&
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPendingFines = fines
    .filter((f) => f.status === "Pending")
    .reduce((sum, f) => sum + f.amount, 0);
  const totalPaidFines = fines
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const openCollectConfirm = (fine: any) => {
    setSelectedFine(fine);
    setIsConfirmCollectOpen(true);
  };

  const handleCollectFineSubmit = () => {
    if (!selectedFine) return;

    setFines(
      fines.map((f) => {
        if (f.id === selectedFine.id) {
          return {
            ...f,
            status: "Paid",
          };
        }
        return f;
      }),
    );

    toast.success(
      `Successfully collected penalty of ₹${selectedFine.amount} from ${selectedFine.studentName}!`,
    );
    setIsConfirmCollectOpen(false);
    setSelectedFine(null);
  };

  const handleExportFines = () => {
    setIsExporting(true);
    toast.loading("Compiling fine audit sheets...");

    setTimeout(() => {
      toast.dismiss();
      setIsExporting(false);
      toast.success("Fine collection spreadsheet successfully compiled and downloaded!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fine Management"
        desc="Track and collect fines from overdue books."
        actions={
          <button
            onClick={handleExportFines}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl border text-muted-foreground text-sm glow-primary flex items-center gap-2 cursor-pointer hover:bg-gradient-soft disabled:opacity-50 transition"
          >
            <Download className="size-4" />
            {isExporting ? "Exporting..." : "Export Log"}
          </button>
        }
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
            <div className="text-3xl font-bold">
              {fines.filter((f) => f.status === "Pending").length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Outstanding Fines</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {fines.filter((f) => f.status === "Paid").length}
            </div>
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

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by student name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", "Pending", "Paid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  filterStatus === status
                    ? "bg-gradient-primary text-white"
                    : "bg-background border text-muted-foreground hover:border-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Fines Table */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Fines Collection Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fine ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reason</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((fine) => (
                <tr key={fine.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{fine.id}</td>
                  <td className="px-4 py-3 font-medium">{fine.studentName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fine.reason}</td>
                  <td className="px-4 py-3 text-center font-bold text-rose-600">₹{fine.amount}</td>
                  <td className="px-4 py-3 text-center text-xs">{fine.date}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={fine.status === "Paid" ? "success" : "danger"}>
                      {fine.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fine.status === "Pending" ? (
                      <button
                        onClick={() => openCollectConfirm(fine)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-gradient-primary text-white glow-primary cursor-pointer hover:opacity-90 transition font-semibold"
                      >
                        Collect
                      </button>
                    ) : (
                      <button
                        onClick={() => toast.success(`Receipt printed for reference ID ${fine.id}`)}
                        className="px-3 py-1.5 rounded-lg text-xs border text-muted-foreground hover:bg-background transition cursor-pointer"
                      >
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

      {/* Collect Fine Confirmation Modal */}
      {isConfirmCollectOpen && selectedFine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-semibold text-lg mb-3">Record Fine Collection</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Confirm you have collected the fine of **₹{selectedFine.amount}** from **
              {selectedFine.studentName}**?
            </p>
            <div className="bg-gradient-soft p-3 rounded-lg text-xs text-muted-foreground mb-5 space-y-1">
              <div>**Reason**: {selectedFine.reason}</div>
              <div>**Fine Ref**: {selectedFine.id}</div>
              <div>**Issue Date**: {selectedFine.date}</div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmCollectOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCollectFineSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
              >
                Confirm Payment
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
