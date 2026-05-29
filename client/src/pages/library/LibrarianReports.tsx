import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { libraryReports, bookInventory } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianReports() {
  const [timeRange, setTimeRange] = useState(5); // months count
  const [isExporting, setIsExporting] = useState(false);

  const mostBorrowedBooks = bookInventory
    .slice()
    .sort((a, b) => b.issued - a.issued)
    .slice(0, 5);

  const categoryWise = [
    { category: "Computer Science", issued: 3280, returned: 3210, active: 70, percentage: 38.8 },
    { category: "Engineering", issued: 2150, returned: 2098, active: 52, percentage: 25.4 },
    { category: "Business", issued: 1680, returned: 1645, active: 35, percentage: 19.8 },
    { category: "General Knowledge", issued: 1520, returned: 1487, active: 33, percentage: 18.0 },
  ];

  // Slice reports based on simulated timeRange
  const currentReportsData = libraryReports.slice(0, timeRange);

  const handleExport = () => {
    setIsExporting(true);
    toast.loading("Compiling library analytics document...");

    setTimeout(() => {
      toast.dismiss();
      setIsExporting(false);
      toast.success("Successfully generated and downloaded library-report.pdf!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Reports"
        desc="Analytics, statistics and performance reports."
        actions={
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl border text-muted-foreground text-sm glow-primary flex items-center gap-2 cursor-pointer hover:bg-gradient-soft disabled:opacity-50 transition"
          >
            <Download className="size-4" />
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
        }
      />

      {/* Time Range Selector */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Select Timescale Range</h3>
          <p className="text-xs text-muted-foreground">Adjust range to sync circulation datasets</p>
        </div>
        <div className="flex items-center gap-2 border p-1 rounded-xl bg-background">
          {[
            { label: "3 Months", value: 3 },
            { label: "5 Months", value: 5 },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setTimeRange(range.value);
                toast.success(`Charts updated to show past ${range.label}`);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeRange === range.value
                  ? "bg-gradient-primary text-white"
                  : "text-muted-foreground hover:bg-gradient-soft"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Total Books Issued</div>
            <div className="text-3xl font-bold mt-2">7,180</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" /> +8.2% vs last month
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Total Books Returned</div>
            <div className="text-3xl font-bold mt-2">7,003</div>
            <div className="text-xs text-muted-foreground mt-1">Return rate: 97.5%</div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Active Members</div>
            <div className="text-3xl font-bold mt-2">518</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" /> +3.6% growth
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Fine Revenue</div>
            <div className="text-3xl font-bold mt-2">₹17,420</div>
            <div className="text-xs text-muted-foreground mt-1">Collection rate: 82.4%</div>
          </div>
        </Card>
      </div>

      {/* Monthly Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Monthly Book Circulation</h3>
              <p className="text-xs text-muted-foreground">Issues and returns trend</p>
            </div>
            <Badge tone="info">{timeRange} months</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={currentReportsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="issued"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  name="Issued"
                />
                <Line
                  type="monotone"
                  dataKey="returned"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  name="Returned"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Fine Collection Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue from fines</p>
            </div>
            <Badge tone="success">Increasing</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={currentReportsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar
                  dataKey="fineCollected"
                  fill="#7C3AED"
                  radius={[8, 8, 0, 0]}
                  name="Fine Collection"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Most Borrowed Books */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Most Borrowed Books</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  Book Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Author</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Times Issued
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Available
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Popularity
                </th>
              </tr>
            </thead>
            <tbody>
              {mostBorrowedBooks.map((book, idx) => (
                <tr key={book.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-gradient-primary text-white text-xs font-bold mx-auto">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{book.title.substring(0, 40)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{book.author}</td>
                  <td className="px-4 py-3 text-center font-bold">{book.issued}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={book.available > 0 ? "success" : "danger"}>{book.available}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(book.issued / mostBorrowedBooks[0].issued) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category-wise Analysis */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Category-wise Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Total Issued
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Returned
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Active Issues
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryWise.map((cat, idx) => (
                <tr key={idx} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3 font-medium">{cat.category}</td>
                  <td className="px-4 py-3 text-center font-bold">{cat.issued}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-semibold">
                    {cat.returned}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone="info">{cat.active}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{cat.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold mb-2">📊 Key Metric</h3>
          <div className="text-sm text-muted-foreground mb-3 font-medium">Avg Books per Member</div>
          <div className="text-4xl font-bold">3.2</div>
          <div className="text-xs text-emerald-600 mt-2">↑ 0.5 increase YoY</div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">📈 Key Metric</h3>
          <div className="text-sm text-muted-foreground mb-3 font-medium">Return Rate</div>
          <div className="text-4xl font-bold">97.5%</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">Excellent compliance</div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">💰 Key Metric</h3>
          <div className="text-sm text-muted-foreground mb-3 font-medium">Avg Fine Amount</div>
          <div className="text-4xl font-bold">₹142</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">Per incident</div>
        </Card>
      </div>
    </div>
  );
}
