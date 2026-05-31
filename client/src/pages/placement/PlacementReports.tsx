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
  Legend,
} from "recharts";
import { Download, TrendingUp, Users, Briefcase, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementData } from "@/services/placementService";
import {
  placementReports as mockPlacementReports,
  departmentPlacementData as mockDepartmentPlacementData,
  packageAnalyticsData as mockPackageAnalyticsData,
  companies as mockCompanies,
  drives as mockDrives,
  applications as mockApplications,
  offers as mockOffers,
  interviews as mockInterviews,
} from "@/mock/mockData";
import { toast } from "sonner";

interface ReportItem {
  month: string;
  placed: number;
  percentage: number;
  avgPackage: number;
  highestPackage: number;
  companyCount: number;
}

// Data aggregation and merge helpers to ensure full offline-resilience and support for custom items
const getMergedCompanies = (liveCompanies: any[] | undefined) => {
  return liveCompanies || mockCompanies;
};

const getMergedDrives = (liveDrives: any[] | undefined) => {
  const serverDrives = liveDrives || mockDrives;
  if (typeof window === "undefined") return serverDrives;
  let list = [...serverDrives];
  
  const editedStr = localStorage.getItem("placement_edited_drives");
  if (editedStr) {
    try {
      const editedMap = JSON.parse(editedStr);
      list = list.map(item => {
        if (editedMap[item.id]) {
          return { ...item, ...editedMap[item.id] };
        }
        return item;
      });
    } catch (e) {}
  }

  const customStr = localStorage.getItem("placement_custom_drives");
  if (customStr) {
    try {
      const customList = JSON.parse(customStr);
      const existingIds = new Set(list.map(i => i.id));
      const filteredCustom = customList.filter((i: any) => !existingIds.has(i.id));
      list = [...filteredCustom, ...list];
    } catch (e) {}
  }
  return list;
};

const getMergedApplications = (liveApps: any[] | undefined) => {
  const serverApps = liveApps || mockApplications;
  if (typeof window === "undefined") return serverApps;
  let list = [...serverApps];
  
  const customStr = localStorage.getItem("placement_custom_applications");
  if (customStr) {
    try {
      const customList = JSON.parse(customStr);
      const existingIds = new Set(list.map(i => i.id));
      const filteredCustom = customList.filter((i: any) => !existingIds.has(i.id));
      list = [...filteredCustom, ...list];
    } catch (e) {}
  }
  return list;
};

const getMergedOffers = (liveOffers: any[] | undefined) => {
  const serverOffers = liveOffers || mockOffers;
  if (typeof window === "undefined") return serverOffers;
  let list = [...serverOffers];
  
  const editedStr = localStorage.getItem("placement_edited_offers");
  if (editedStr) {
    try {
      const editedMap = JSON.parse(editedStr);
      list = list.map(item => {
        if (editedMap[item.id]) {
          return { ...item, ...editedMap[item.id] };
        }
        return item;
      });
    } catch (e) {}
  }

  const customStr = localStorage.getItem("placement_custom_offers");
  if (customStr) {
    try {
      const customList = JSON.parse(customStr);
      const existingIds = new Set(list.map(i => i.id));
      const filteredCustom = customList.filter((i: any) => !existingIds.has(i.id));
      list = [...filteredCustom, ...list];
    } catch (e) {}
  }
  return list;
};

const getMergedInterviews = (liveInterviews: any[] | undefined) => {
  const serverInterviews = liveInterviews || mockInterviews;
  if (typeof window === "undefined") return serverInterviews;
  let list = [...serverInterviews];
  
  const editedStr = localStorage.getItem("placement_edited_interviews");
  if (editedStr) {
    try {
      const editedMap = JSON.parse(editedStr);
      list = list.map(item => {
        if (editedMap[item.id]) {
          return { ...item, ...editedMap[item.id] };
        }
        return item;
      });
    } catch (e) {}
  }

  const customStr = localStorage.getItem("placement_custom_interviews");
  if (customStr) {
    try {
      const customList = JSON.parse(customStr);
      const existingIds = new Set(list.map(i => i.id));
      const filteredCustom = customList.filter((i: any) => !existingIds.has(i.id));
      list = [...filteredCustom, ...list];
    } catch (e) {}
  }
  return list;
};

export function PlacementReports() {
  const [placementReports, setPlacementReports] = useState<ReportItem[]>(mockPlacementReports);
  const [departmentPlacementData, setDepartmentPlacementData] = useState<any[]>(mockDepartmentPlacementData);
  const [packageAnalyticsData, setPackageAnalyticsData] = useState<any[]>(mockPackageAnalyticsData);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleExportReport = (reportName: string = "Comprehensive Placement Report", format: string = "TXT") => {
    toast.info(`Generating ${reportName} from live campus metrics...`);

    // Retrieve merged lists
    const companiesList = getMergedCompanies(liveData?.companies);
    const drivesList = getMergedDrives(liveData?.drives);
    const appsList = getMergedApplications(liveData?.applications);
    const offersList = getMergedOffers(liveData?.offers);
    const interviewsList = getMergedInterviews(liveData?.interviews);

    let feedbackList: any[] = [];
    try {
      const recentFeedbacks = localStorage.getItem("placement_recent_feedbacks");
      if (recentFeedbacks) {
        feedbackList = JSON.parse(recentFeedbacks);
      }
    } catch (e) {}

    let content = "";
    const cleanReportName = reportName.trim().toLowerCase();

    if (cleanReportName.includes("monthly report")) {
      content = `========================================================================
             CAMPUS PLACEMENT MONTHLY ANALYTICS REPORT
========================================================================
Generated On     : ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}
Reporting Period : Year-To-Date (YTD) 2026
Target Role      : Placement Officer / Academic Director

------------------------------------------------------------------------
YTD MONTH-BY-MONTH TREND SUMMARY
------------------------------------------------------------------------
This section aggregates the performance metrics across all completed
recruitment blocks from January to the current active month.
${placementReports.map((report, idx) => `
[${idx + 1}] Month: ${report.month}
  * Students Placed       : ${report.placed} students
  * Placement Ratio       : ${report.percentage}%
  * Average CTC Compensation: ${report.avgPackage} LPA
  * Highest CTC Offered   : ${report.highestPackage} LPA
  * Active Companies Visited: ${report.companyCount}
`).join("\n")}

------------------------------------------------------------------------
EXECUTIVE TREND INSIGHTS
------------------------------------------------------------------------
* Total Cumulative Placements : ${placementReports.reduce((sum, r) => sum + r.placed, 0)} students
* Overall Average CTC Package : ${(placementReports.reduce((sum, r) => sum + r.avgPackage, 0) / (placementReports.length || 1)).toFixed(1)} LPA
* Peak Historical Offer     : ${Math.max(...placementReports.map((r) => r.highestPackage), 0)} LPA
* Total Partner Connections   : ${Math.max(...placementReports.map((r) => r.companyCount), 0)} corporate entities

========================================================================
            CONFIDENTIAL - FOR CMS INTERNAL ACADEMIC ARCHIVES
========================================================================`;
    } else if (cleanReportName.includes("stats")) {
      // CSV format
      const header = `"Month","Placed Students","Placement %","Avg Package (LPA)","Highest Package (LPA)","Active Companies"`;
      const rows = placementReports.map(r => `"${r.month}","${r.placed}","${r.percentage}%","${r.avgPackage}","${r.highestPackage}","${r.companyCount}"`);
      
      const totalPlaced = placementReports.reduce((sum, r) => sum + r.placed, 0);
      const avgPct = Math.round(placementReports.reduce((sum, r) => sum + r.percentage, 0) / (placementReports.length || 1));
      const avgPackage = (placementReports.reduce((sum, r) => sum + r.avgPackage, 0) / (placementReports.length || 1)).toFixed(1);
      const maxPkg = Math.max(...placementReports.map(r => r.highestPackage), 0);
      const maxCompanies = Math.max(...placementReports.map(r => r.companyCount), 0);

      const totalRow = `"Total/Average","${totalPlaced}","${avgPct}%","${avgPackage}","${maxPkg}","${maxCompanies}"`;
      
      content = `${header}\n${rows.join("\n")}\n${totalRow}`;
    } else if (cleanReportName.includes("student data")) {
      // CSV format
      const header = `"Application/Offer ID","Student Name","Student ID","Company","Job Role","Status","Test Score %","Round/Stage","Salary Package"`;
      
      // Combine appsList and offersList
      const appRows = appsList.map(a => {
        const offer = offersList.find(o => o.studentName.toLowerCase() === a.studentName.toLowerCase() && o.company.toLowerCase() === a.company.toLowerCase());
        const pkgVal = offer ? offer.package : "";
        return `"${a.id}","${a.studentName}","${a.studentId}","${a.company}","${a.role}","${a.status}","${a.score}%","Round ${a.round}","${pkgVal}"`;
      });

      const offerRows = offersList.filter(o => !appsList.some(a => a.studentName.toLowerCase() === o.studentName.toLowerCase() && a.company.toLowerCase() === o.company.toLowerCase())).map(o => {
        return `"${o.id}","${o.studentName}","","${o.company}","${o.role}","${o.status}","","","${o.package}"`;
      });

      content = `${header}\n${appRows.join("\n")}\n${offerRows.join("\n")}`;
    } else if (cleanReportName.includes("company analytics")) {
      content = `========================================================================
             CORPORATE RELATIONS & COMPANY ANALYTICS REPORT
========================================================================
Generated On     : ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}
Reporting Period : Academic Year 2025 - 2026
Target Role      : Corporate Relations Head / Placement Officer

------------------------------------------------------------------------
ACTIVE CORPORATE PARTNERS PROFILES (${companiesList.length})
------------------------------------------------------------------------
${companiesList.map((c, idx) => `
[${idx + 1}] ${c.name}
  * Industry Sector      : ${c.industry}
  * Primary HR Contact   : ${c.hrContact}
  * Communication Email  : ${c.email}
  * Communication Phone  : ${c.phone}
  * CTC Package Standard : ${c.package}
  * Active Hiring Status : ${c.hiringStatus}
  * Prev Year Hire Count : ${c.previousYearHires} students
`).join("\n")}

------------------------------------------------------------------------
ACTIVE RECRUITMENT DRIVES ENGAGEMENT (${drivesList.length})
------------------------------------------------------------------------
${drivesList.map((d, idx) => `
[${idx + 1}] ${d.company} - ${d.role}
  * Scheduled Date       : ${d.date}
  * Assessment Venue     : ${d.venue}
  * Application Status   : ${d.status}
  * Student Registrants  : ${d.studentCount} candidates
  * Selection Rounds     : ${d.rounds} assessment phases
`).join("\n")}

========================================================================
            CONFIDENTIAL - FOR CMS INTERNAL ACADEMIC ARCHIVES
========================================================================`;
    } else {
      // Default: Comprehensive report
      const customDrivesCount = drivesList.filter(d => d.id.startsWith("DRV_") || parseInt(d.id) > 1000).length;
      const customAppsCount = appsList.filter(a => a.id.startsWith("APP_") || parseInt(a.id) > 1000).length;
      const customOffersCount = offersList.filter(o => o.id.startsWith("OFF_") || parseInt(o.id) > 1000).length;
      const acceptedOffersCount = offersList.filter(o => o.status === "Accepted").length;

      if (format === "CSV") {
        content = `"Placement Analytics & Performance Report"
"Generated On", "${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}"
"Reporting Period", "Year-To-Date (YTD) 2026"

"Placement Module Statistics"
"Metric", "Custom/Active Records Count", "Total Baseline"
"Recruitment Drives Managed", "${customDrivesCount}", "${drivesList.length}"
"Student Applications Tracked", "${customAppsCount}", "${appsList.length}"
"Interview Schedules Registered", "${interviewsList.length}", "${interviewsList.length}"
"Placement Offer Letters Generated", "${customOffersCount}", "${offersList.length}"
"Student Offer Acceptances Registered", "${acceptedOffersCount}", "${acceptedOffersCount}"

"Executive Analysis Summary"
"Average CTC package", "${(placementReports.reduce((sum, r) => sum + r.avgPackage, 0) / (placementReports.length || 1)).toFixed(1)} LPA"
"Active Placement Ratio", "${(placementReports.reduce((sum, r) => sum + r.percentage, 0) / (placementReports.length || 1)).toFixed(0)}%"
"Overall Campus Acceptance Rate", "80%"

"Detailed Log - Recruitment Drives"
"ID", "Company", "Job Role", "Drive Date", "Venue", "Status", "Student Count"
${drivesList.map((d) => `"${d.id}", "${d.company}", "${d.role}", "${d.date}", "${d.venue}", "${d.status}", "${d.studentCount}"`).join("\n")}

"Detailed Log - Student Applications"
"ID", "Student Name", "Student ID", "Company", "Job Role", "Hiring Status", "Score", "Round"
${appsList.map((a) => `"${a.id}", "${a.studentName}", "${a.studentId}", "${a.company}", "${a.role}", "${a.status}", "${a.score}%", "Round ${a.round}"`).join("\n")}

"Detailed Log - Interview Feedback Entries"
"ID", "Student Name", "Rating", "Outcome", "Comments", "Date"
${feedbackList.map((f) => `"${f.id}", "${f.studentName}", "${f.rating}", "${f.outcome}", "${f.comments}", "${f.date}"`).join("\n") || '"No feedbacks submitted yet."'}

"Detailed Log - Offer Letters Generated"
"ID", "Student Name", "Company", "Job Designation", "Annual CTC Package", "Official Joining Date", "Offer Date", "Status"
${offersList.map((o) => `"${o.id}", "${o.studentName}", "${o.company}", "${o.role}", "${o.package}", "${o.joiningDate}", "${o.offerDate}", "${o.status}"`).join("\n")}`;
      } else {
        content = `========================================================================
         CAMPUS PLACEMENT COMPREHENSIVE PERFORMANCE REPORT
========================================================================
Generated On: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}
Reporting Period: Year-To-Date (YTD) 2026
Target Role: Placement Officer

------------------------------------------------------------------------
1. EXECUTIVE PLACEMENT SUMMARY
------------------------------------------------------------------------
* Active Campus Placement Ratio : ${(placementReports.reduce((sum, r) => sum + r.percentage, 0) / (placementReports.length || 1)).toFixed(1)}%
* Average CTC Compensation      : ${(placementReports.reduce((sum, r) => sum + r.avgPackage, 0) / (placementReports.length || 1)).toFixed(1)} LPA
* Peak Historical Offer         : ${Math.max(...placementReports.map((r) => r.highestPackage), 0)} LPA
* Overall Offer Acceptance Rate: ${offersList.length > 0 ? Math.round((acceptedOffersCount / offersList.length) * 100) : 0}%

------------------------------------------------------------------------
2. SYSTEM TELEMETRY & DATA AGGREGATION
------------------------------------------------------------------------
Below are active records parsed in real-time from your placement dashboard:

* RECRUITING DRIVES:
  - Custom drives created: ${customDrivesCount}
  - Total active drives  : ${drivesList.length} drives

* STUDENT APPLICATIONS:
  - Custom applications imported: ${customAppsCount}
  - Total student applications   : ${appsList.length} records tracked

* INTERVIEWS & PANEL DETAILS:
  - Scheduled interviews      : ${interviewsList.length}
  - Feedback entries submitted: ${feedbackList.length}

* PLACEMENT OFFER LETTERS:
  - Custom offer drafts generated: ${customOffersCount}
  - Total offers registered      : ${offersList.length} offers
  - Student acceptances registered: ${acceptedOffersCount} (Status: Accepted)

------------------------------------------------------------------------
3. ACTIVE RECRUITMENT DRIVES LOG
------------------------------------------------------------------------
${drivesList.map((d, i) => `  ${i+1}. [${d.status}] ${d.company} - ${d.role} (Date: ${d.date}, Venue: ${d.venue}, Registrants: ${d.studentCount})`).join("\n") || "  No recruitment drives found."}

------------------------------------------------------------------------
4. DETAILED APPLICANT TRACKING
------------------------------------------------------------------------
${appsList.map((a, i) => `  ${i+1}. [${a.status}] ${a.studentName} (${a.studentId}) for ${a.company} - Role: ${a.role} (Score: ${a.score}%)`).join("\n") || "  No applicant tracking records found."}

------------------------------------------------------------------------
5. FEEDBACK & INTERVIEWS BRIEF
------------------------------------------------------------------------
${feedbackList.map((f, i) => `  ${i+1}. [Rating: ${f.rating}/5 - ${f.outcome}] ${f.studentName}: "${f.comments}" (${f.date})`).join("\n") || "  No feedbacks submitted yet."}

------------------------------------------------------------------------
6. RECENT OFFER LETTERS LOG
------------------------------------------------------------------------
${offersList.map((o, i) => `  ${i+1}. [Status: ${o.status}] Sent to ${o.studentName} for ${o.company} (${o.role}) at ${o.package} - Joining: ${o.joiningDate}`).join("\n") || "  No offer letters generated yet."}

------------------------------------------------------------------------
7. RECOMMENDATIONS & STRATEGIC INSIGHTS
------------------------------------------------------------------------
* Drive Acceleration: Increase registration deadline extensions for ongoing drives to support high-interest candidates.
* Salary Distribution: Ensure packages above 12.0 LPA are prioritized in the upcoming software engineer interviews.
* Ready Score: Boost mock tests to increase current student readiness metrics before upcoming online assessment blocks.

========================================================================
            CONFIDENTIAL - FOR CMS INTERNAL ACADEMIC ARCHIVES
========================================================================`;
      }
    }

    setTimeout(() => {
      const filename = `${reportName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${format.toLowerCase()}`;
      const blob = new Blob([content], { type: format === "CSV" ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${reportName} downloaded successfully as ${filename}!`);
    }, 1200);
  };

  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        setLiveData(res);
        if (res.placementTrendData && res.placementTrendData.length > 0) {
          const mappedTrends = res.placementTrendData.map((t) => {
            const mockMatch = mockPlacementReports.find(
              (m) => m.month.toLowerCase().startsWith(t.month.toLowerCase())
            );
            return {
              month: mockMatch ? mockMatch.month : t.month,
              placed: t.placed || (mockMatch ? mockMatch.placed : 0),
              percentage: mockMatch ? Math.round((t.placed / (t.applied || 1)) * 100) || mockMatch.percentage : 50,
              avgPackage: mockMatch ? mockMatch.avgPackage : 8.2,
              highestPackage: mockMatch ? mockMatch.highestPackage : 24.5,
              companyCount: mockMatch ? mockMatch.companyCount : res.companies.length,
            };
          });
          setPlacementReports(mappedTrends);
        }
        if (res.departmentPlacementData && res.departmentPlacementData.length > 0) {
          setDepartmentPlacementData(res.departmentPlacementData);
        }
        if (res.packageAnalyticsData && res.packageAnalyticsData.length > 0) {
          setPackageAnalyticsData(res.packageAnalyticsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch live reports, using fallback mock data:", err);
        setLoading(false);
      });
  }, []);

  const latestMonth = placementReports[placementReports.length - 1] || {
    placed: 287,
    percentage: 52,
    avgPackage: 8.2,
    companyCount: 48,
  };

  const stats = [
    { label: "Total Placed", value: latestMonth.placed, change: "+8.2%", icon: "👥" },
    { label: "Placement %", value: `${latestMonth.percentage}%`, change: "+3.5%", icon: "📊" },
    { label: "Avg Package", value: `${latestMonth.avgPackage} LPA`, change: "+2.1%", icon: "💰" },
    { label: "Active Companies", value: latestMonth.companyCount, change: "+2", icon: "🏢" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        desc="Comprehensive placement analytics and performance reports."
        actions={
          <button 
            onClick={() => handleExportReport("Comprehensive Placement Report", "TXT")}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Download className="size-4" /> Export Report
          </button>
        }
      />

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading reports and analytics charts...</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              <Badge tone="success" className="mt-2">
                {stat.change}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Monthly Placement Trend</h3>
                <p className="text-xs text-muted-foreground">Year-to-date performance</p>
              </div>
              <Badge tone="info">YTD Trend</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={placementReports}>
                  <defs>
                    <linearGradient id="grad-trend" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#9333EA" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#9333EA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="placed"
                    stroke="#9333EA"
                    strokeWidth={2.5}
                    name="Placed Students"
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    name="Placement %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Department-wise Placement</h3>
                <p className="text-xs text-muted-foreground">Placement by department</p>
              </div>
              <Badge tone="success">Live</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={departmentPlacementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentPlacementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Package Analytics */}
      {!loading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Package Distribution</h3>
              <p className="text-xs text-muted-foreground">Students by salary range</p>
            </div>
            <Badge tone="success">Live</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={packageAnalyticsData}>
                <defs>
                  <linearGradient id="grad-pkg-chart" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="range" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="url(#grad-pkg-chart)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Monthly Report Table */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">Monthly Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Month</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Placed
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Placement %
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Avg Package
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Highest
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Companies
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {placementReports.map((report) => (
                  <tr key={report.month} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{report.month}</td>
                    <td className="py-3 px-4 text-center font-bold">{report.placed}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold ${report.percentage >= 50 ? "text-emerald-600" : report.percentage >= 40 ? "text-amber-600" : "text-rose-600"}`}
                      >
                        {report.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">
                      {report.avgPackage} LPA
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-purple-600">
                      {report.highestPackage} LPA
                    </td>
                    <td className="py-3 px-4 text-center">{report.companyCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Cumulative Placed</div>
                <div className="text-2xl font-bold mt-1">
                  {placementReports.reduce((sum, r) => sum + r.placed, 0)}
                </div>
              </div>
              <Users className="size-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Overall Avg Package</div>
                <div className="text-2xl font-bold mt-1">
                  {(
                    placementReports.reduce((sum, r) => sum + r.avgPackage, 0) /
                    (placementReports.length || 1)
                  ).toFixed(1)}{" "}
                  LPA
                </div>
              </div>
              <TrendingUp className="size-8 text-emerald-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Highest Package</div>
                <div className="text-2xl font-bold mt-1">
                  {Math.max(...placementReports.map((r) => r.highestPackage), 0)} LPA
                </div>
              </div>
              <TrendingUp className="size-8 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Total Companies</div>
                <div className="text-2xl font-bold mt-1">
                  {Math.max(...placementReports.map((r) => r.companyCount), 0)}
                </div>
              </div>
              <Briefcase className="size-8 text-amber-500 opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Download Reports */}
      <Card>
        <h3 className="font-semibold mb-4">Download Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Monthly Report", format: "PDF", size: "2.4 MB", ext: "TXT" },
            { name: "Placement Stats", format: "Excel", size: "1.8 MB", ext: "CSV" },
            { name: "Student Data", format: "CSV", size: "892 KB", ext: "CSV" },
            { name: "Company Analytics", format: "PDF", size: "3.1 MB", ext: "TXT" },
          ].map((report) => (
            <button
              key={report.name}
              onClick={() => handleExportReport(report.name, report.ext)}
              className="p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-800">{report.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {report.format} • {report.size}
                  </div>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Top Recruiters */}
      <Card>
        <h3 className="font-semibold mb-4">Top Recruiting Companies</h3>
        <div className="space-y-2">
          {[
            { company: "Google India", placements: 12, avgPackage: 22.5 },
            { company: "Microsoft India", placements: 10, avgPackage: 20.0 },
            { company: "Amazon India", placements: 15, avgPackage: 18.5 },
            { company: "Goldman Sachs", placements: 8, avgPackage: 24.0 },
            { company: "Infosys", placements: 18, avgPackage: 10.5 },
          ].map((rec, idx) => (
            <div
              key={rec.company}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{rec.company}</div>
                  <div className="text-xs text-muted-foreground">{rec.placements} placements</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">{rec.avgPackage} LPA</div>
                <div className="text-xs text-muted-foreground">Avg package</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <h3 className="font-semibold mb-4">Performance Indicators</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { metric: "Placement Success Rate", value: "52%", target: "60%", status: "warning" },
            { metric: "Average Package Growth", value: "+8.2%", target: "+10%", status: "success" },
            {
              metric: "Company Partnership Growth",
              value: "+16.7%",
              target: "+15%",
              status: "success",
            },
            { metric: "Student Readiness Score", value: "78%", target: "85%", status: "warning" },
          ].map((indicator) => (
            <div key={indicator.metric} className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-2">{indicator.metric}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold">{indicator.value}</div>
                  <div className="text-xs text-muted-foreground">Target: {indicator.target}</div>
                </div>
                <Badge tone={indicator.status as any}>
                  {indicator.status === "success" ? "success" : "warn"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
