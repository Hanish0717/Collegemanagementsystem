import { useState } from 'react';
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
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryReport, fetchIssuedBooks } from '@/services/libraryService';
import { toast } from 'sonner';

export function LibrarianReports() {
  const [timeRange, setTimeRange] = useState(5); // months count
  const [isExporting, setIsExporting] = useState(false);

  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ['libraryReport'],
    queryFn: fetchLibraryReport,
  });

  const { data: issuedBooks, isLoading: isIssuedLoading } = useQuery({
    queryKey: ['allIssuedBooks'],
    queryFn: () => fetchIssuedBooks(),
  });

  const totals = report?.totals || {
    totalBooks: 0,
    totalIssued: 0,
    overdueCount: 0,
    totalFines: 0,
  };

  // Aggregated dynamic stats
  const totalIssuedRecords = issuedBooks?.length || 0;
  const totalReturnedRecords = issuedBooks?.filter((i) => i.status === 'returned').length || 0;
  const returnRate = totalIssuedRecords > 0 ? (totalReturnedRecords / totalIssuedRecords) * 100 : 0;

  const activeMembersSet = new Set();
  issuedBooks?.forEach((i) => {
    if (typeof i.student === 'object' && i.student) {
      activeMembersSet.add(i.student.rollNumber);
    }
  });
  const activeMembersCount = activeMembersSet.size;

  const avgBooksPerMember = activeMembersCount > 0 ? totalIssuedRecords / activeMembersCount : 0;
  const fineIncidents = issuedBooks?.filter((i) => (i.fineAmount || 0) > 0) || [];
  const avgFineAmount =
    fineIncidents.length > 0
      ? Math.round(
          fineIncidents.reduce((sum, i) => sum + (i.fineAmount || 0), 0) / fineIncidents.length,
        )
      : 0;

  // Real growth and rate calculations
  const getIssuesGrowth = () => {
    if (!issuedBooks || issuedBooks.length === 0) return '+0.0%';
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthIssues = issuedBooks.filter((i) => {
      const d = new Date(i.issueDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthIssues = issuedBooks.filter((i) => {
      const d = new Date(i.issueDate);
      const lm = currentMonth === 0 ? 11 : currentMonth - 1;
      const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === lm && d.getFullYear() === ly;
    }).length;

    if (lastMonthIssues === 0) {
      return thisMonthIssues > 0 ? `+${thisMonthIssues * 100}%` : '+0.0%';
    }
    const diff = ((thisMonthIssues - lastMonthIssues) / lastMonthIssues) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };
  const issuesGrowth = getIssuesGrowth();

  const getMembersGrowth = () => {
    if (!issuedBooks || issuedBooks.length === 0) return '+0.0%';
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const getActiveMembersInPeriod = (m: number, y: number) => {
      const set = new Set();
      issuedBooks.forEach((i) => {
        const d = new Date(i.issueDate);
        if (
          d.getMonth() === m &&
          d.getFullYear() === y &&
          typeof i.student === 'object' &&
          i.student
        ) {
          set.add(i.student.rollNumber);
        }
      });
      return set.size;
    };

    const thisMonthMembers = getActiveMembersInPeriod(currentMonth, currentYear);
    const lm = currentMonth === 0 ? 11 : currentMonth - 1;
    const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthMembers = getActiveMembersInPeriod(lm, ly);

    if (lastMonthMembers === 0) {
      return thisMonthMembers > 0 ? `+${thisMonthMembers * 100}%` : '+0.0%';
    }
    const diff = ((thisMonthMembers - lastMonthMembers) / lastMonthMembers) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };
  const membersGrowth = getMembersGrowth();

  const totalFinesCalculated = issuedBooks
    ? issuedBooks.reduce((sum, i) => {
        if (i.status === 'returned') {
          return sum + (i.fineAmount || 0);
        }
        if (i.status === 'overdue') {
          const due = new Date(i.dueDate);
          const now = new Date();
          if (now > due) {
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays * 10;
          }
        }
        return sum;
      }, 0)
    : 0;

  const totalPaidFines = issuedBooks
    ? issuedBooks
        .filter((i) => i.status === 'returned')
        .reduce((sum, i) => sum + (i.fineAmount || 0), 0)
    : 0;

  const collectionRate =
    totalFinesCalculated > 0 ? (totalPaidFines / totalFinesCalculated) * 100 : 100;

  const handleExport = () => {
    setIsExporting(true);
    toast.loading('Compiling library analytics document...');

    try {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Books in Catalog', totals.totalBooks],
        ['Total Books Issued', totalIssuedRecords],
        ['Total Books Returned', totalReturnedRecords],
        ['Return Rate', `${returnRate.toFixed(1)}%`],
        ['Active Members', activeMembersCount],
        ['Fine Revenue', `INR ${totals.totalFines}`],
        ['Avg Books per Member', avgBooksPerMember.toFixed(1)],
        ['Avg Fine Amount', `INR ${avgFineAmount}`],
        ['Fine Collection Rate', `${collectionRate.toFixed(1)}%`],
      ];

      const csvContent = [headers, ...rows]
        .map((e) => e.map((val) => `"${val}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `library_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Successfully generated and downloaded library report CSV!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to generate report.');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isReportLoading || isIssuedLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader title="Library Reports" desc="Analytics, statistics and performance reports." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  // Monthly trends helper
  const getMonthlyTrends = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const startIndex = Math.max(0, currentMonthIdx - timeRange + 1);

    const rangeMonths = months.slice(startIndex, currentMonthIdx + 1);
    const trendMap = rangeMonths.map((monthName) => ({
      month: monthName,
      issued: 0,
      returned: 0,
      fineCollected: 0,
    }));

    if (issuedBooks) {
      issuedBooks.forEach((issue) => {
        const date = new Date(issue.issueDate);
        const issueMonthName = months[date.getMonth()];
        const idx = trendMap.findIndex((t) => t.month === issueMonthName);
        if (idx !== -1) {
          trendMap[idx].issued += 1;
          if (issue.status === 'returned') {
            trendMap[idx].returned += 1;
            if (issue.fineAmount) {
              trendMap[idx].fineCollected += issue.fineAmount;
            }
          }
        }
      });
    }

    return trendMap;
  };

  const currentReportsData = getMonthlyTrends();

  const getFineTrendStatus = () => {
    const trend = currentReportsData;
    if (trend.length < 2) return { text: 'Stable', tone: 'info' as const };
    const currentVal = trend[trend.length - 1].fineCollected;
    const prevVal = trend[trend.length - 2].fineCollected;
    if (currentVal > prevVal) return { text: 'Increasing', tone: 'success' as const };
    if (currentVal < prevVal) return { text: 'Decreasing', tone: 'danger' as const };
    return { text: 'Stable', tone: 'info' as const };
  };
  const fineTrendStatus = getFineTrendStatus();

  // Most Borrowed Books mapping
  const mostBorrowedBooks =
    report?.mostIssuedBooks && report.mostIssuedBooks.length > 0
      ? report.mostIssuedBooks.map((item, idx) => ({
          id: `mbb-${idx}`,
          title: item.title,
          author: item.author,
          issued: item.issueCount,
          available: item.availableQuantity ?? 0,
        }))
      : [];

  // Category wise mapping
  const categoryAnalytics = report?.categoryAnalytics || [];
  const categoryWise =
    categoryAnalytics.length > 0
      ? categoryAnalytics.map((item) => {
          const count = item.count;
          const total = totals.totalBooks || 1;
          return {
            category: item._id,
            issued: item.issued ?? 0,
            returned: item.returned ?? 0,
            active: item.active ?? 0,
            percentage: Number(((count / total) * 100).toFixed(1)),
          };
        })
      : [];

  const maxIssuedCount = mostBorrowedBooks[0]?.issued || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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
            {isExporting ? 'Exporting...' : 'Export Report'}
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
            { label: '3 Months', value: 3 },
            { label: '5 Months', value: 5 },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setTimeRange(range.value);
                toast.success(`Charts updated to show past ${range.label}`);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeRange === range.value
                  ? 'bg-gradient-primary text-white'
                  : 'text-muted-foreground hover:bg-gradient-soft'
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
            <div className="text-3xl font-bold mt-2">{totalIssuedRecords}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" /> {issuesGrowth} vs last month
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Total Books Returned</div>
            <div className="text-3xl font-bold mt-2">{totalReturnedRecords}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Return rate: {returnRate.toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Active Members</div>
            <div className="text-3xl font-bold mt-2">{activeMembersCount}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" /> {membersGrowth} growth
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Fine Revenue</div>
            <div className="text-3xl font-bold mt-2">
              ₹{totals.totalFines.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Collection rate: {collectionRate.toFixed(1)}%
            </div>
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
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
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
            <Badge tone={fineTrendStatus.tone}>{fineTrendStatus.text}</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={currentReportsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
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
                    <Badge tone={book.available > 0 ? 'success' : 'danger'}>{book.available}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(book.issued / maxIssuedCount) * 100}%` }}
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
          <div className="text-4xl font-bold">{avgBooksPerMember.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-2">Based on unique active members</div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">📈 Key Metric</h3>
          <div className="text-sm text-muted-foreground mb-3 font-medium">Return Rate</div>
          <div className="text-4xl font-bold">{returnRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            {returnRate >= 90
              ? 'Excellent compliance'
              : returnRate >= 70
                ? 'Good compliance'
                : returnRate >= 50
                  ? 'Moderate compliance'
                  : 'Needs attention'}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">💰 Key Metric</h3>
          <div className="text-sm text-muted-foreground mb-3 font-medium">Avg Fine Amount</div>
          <div className="text-4xl font-bold">₹{avgFineAmount}</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            Per late return incident
          </div>
        </Card>
      </div>
    </div>
  );
}
