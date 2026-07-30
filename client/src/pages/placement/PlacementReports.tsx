import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { Download, Printer, FileSpreadsheet, FileText, FileCode, Filter, Sparkles, Building2, GraduationCap, Target, Award, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementReportData, exportReportDataToExcel, type PlacementReportCategoryData } from "@/services/placementService";
import { toast } from "sonner";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export function PlacementReports() {
  const [selectedReportType, setSelectedReportType] = useState<string>("Batch Report");
  const [selectedBatch, setSelectedBatch] = useState<string>("2026 (Current)");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [reportData, setReportData] = useState<PlacementReportCategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchPlacementReportData(selectedReportType, selectedBatch, selectedDepartment);
      setReportData(data);
    } catch (err) {
      console.warn("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedReportType, selectedBatch, selectedDepartment]);

  const handleExportExcel = () => {
    if (!reportData) return;
    exportReportDataToExcel(reportData, `${selectedReportType.toLowerCase().replace(/\s+/g, "_")}_${selectedBatch.split(" ")[0]}.csv`);
    toast.success(`${selectedReportType} exported as Excel / CSV!`);
  };

  const handleExportCsv = () => {
    if (!reportData) return;
    exportReportDataToExcel(reportData, `${selectedReportType.toLowerCase().replace(/\s+/g, "_")}.csv`);
    toast.success(`${selectedReportType} CSV downloaded!`);
  };

  const handleExportPdf = () => {
    if (!reportData) return;
    toast.info("Generating Print-Ready PDF document...");
    window.print();
  };

  const reportCategories = [
    { id: "Batch Report", label: "Batch Report", icon: "🎓" },
    { id: "Company Report", label: "Company Report", icon: "🏢" },
    { id: "Department Report", label: "Department Report", icon: "🏫" },
    { id: "Package Report", label: "Package Report", icon: "💼" },
    { id: "Placement Report", label: "Placement Report", icon: "🎯" },
    { id: "Career Outcome Report", label: "Career Outcome Report", icon: "🚀" },
    { id: "Target Report", label: "Target Report", icon: "📊" },
    { id: "Referral Report", label: "Referral Report", icon: "🤝" },
    { id: "Student Report", label: "Student Report", icon: "👤" }
  ];

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      <div className="print:hidden">
        <PageHeader
          title="Enterprise Placement Reports & Analytics Engine 📊"
          desc="Generate, customize, visual charts, export (PDF, Excel, CSV) and print 9 comprehensive placement report categories."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                disabled={loading || !reportData}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                <FileSpreadsheet className="size-4" /> Export Excel
              </button>
              <button
                onClick={handleExportCsv}
                disabled={loading || !reportData}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                <FileCode className="size-4" /> Export CSV
              </button>
              <button
                onClick={handleExportPdf}
                disabled={loading || !reportData}
                className="px-3.5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary flex items-center gap-1.5 cursor-pointer hover:opacity-95 transition disabled:opacity-50"
              >
                <FileText className="size-4" /> Export PDF
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border bg-background text-foreground text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-accent transition"
              >
                <Printer className="size-4 text-primary" /> Print Ready
              </button>
            </div>
          }
        />
      </div>

      {/* 9 REPORT CATEGORY SELECTOR TABS */}
      <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {reportCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedReportType(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              selectedReportType === cat.id
                ? "bg-gradient-primary text-white shadow-sm"
                : "bg-background border hover:bg-accent text-foreground"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <Card className="print:hidden py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <span className="font-bold text-foreground">Report Filters:</span>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-muted-foreground mr-1.5 font-semibold">Batch Year:</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-xs font-bold focus:border-primary outline-none cursor-pointer"
              >
                <option value="2026 (Current)">2026 (Current Batch)</option>
                <option value="2025 (Previous)">2025 (Previous Batch)</option>
                <option value="2024 (Historical)">2024 (Historical Batch)</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground mr-1.5 font-semibold">Department:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-xs font-bold focus:border-primary outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Tech (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="MECH">Mechanical (MECH)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* REPORT CONTENT & PRINTABLE CONTAINER */}
      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">Generating {selectedReportType}...</span>
          </div>
        </Card>
      ) : reportData ? (
        <div className="space-y-6 print:space-y-4">
          {/* PRINT HEADER STAMP (Visible ONLY on print) */}
          <div className="hidden print:block border-b-2 border-primary pb-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-foreground">COLLEGE MANAGEMENT SYSTEM</h1>
                <p className="text-xs text-muted-foreground">OFFICIAL ENTERPRISE PLACEMENT REPORT</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold">{reportData.title}</div>
                <div className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* REPORT HEADER SUMMARY CARD */}
          <Card className="bg-gradient-soft border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="info" className="text-xs">{reportData.type}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{selectedBatch} • {selectedDepartment}</span>
                </div>
                <h2 className="text-lg font-extrabold text-foreground mt-1">{reportData.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{reportData.summary}</p>
              </div>

              <div className="hidden sm:block text-right">
                <Badge tone="success">Verified Audit Report</Badge>
              </div>
            </div>
          </Card>

          {/* DYNAMIC RECHARTS VISUALIZATION */}
          {reportData.chartData && reportData.chartData.length > 0 && (
            <Card className="print:break-inside-avoid">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Visual Analytics Chart ({reportData.type})
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" stroke="currentColor" className="text-[11px]" />
                    <YAxis stroke="currentColor" className="text-[11px]" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {Object.keys(reportData.chartData[0])
                      .filter((k) => k !== "name")
                      .map((key, index) => (
                        <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* TABULAR REPORT DATA TABLE (PRINT READY) */}
          <Card className="print:border-none print:shadow-none">
            <div className="flex items-center justify-between mb-4 pb-3 border-b print:pb-2">
              <h3 className="font-bold text-base">Detailed Tabular Report Data</h3>
              <span className="text-xs text-muted-foreground">{reportData.rows.length} Total Data Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs print:text-[10px]">
                <thead className="border-b bg-accent/30 print:bg-gray-100">
                  <tr>
                    {reportData.tableHeaders.map((h, i) => (
                      <th key={h} className={`py-3 px-4 font-bold text-foreground ${i === 0 ? "text-left" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-accent/40 transition">
                      {reportData.tableHeaders.map((_, i) => (
                        <td key={i} className={`py-3 px-4 ${i === 0 ? "text-left font-semibold text-foreground" : "text-right text-muted-foreground font-mono"}`}>
                          {row[`col${i}`] !== undefined ? row[`col${i}`] : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
