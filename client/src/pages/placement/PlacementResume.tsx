import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Eye, Check, X, Upload } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { resumes } from "@/mock/mockData";

export function PlacementResume() {
  const [selectedTab, setSelectedTab] = useState<"all" | "approved" | "pending" | "rejected">(
    "all",
  );

  const approved = resumes.filter((r) => r.status === "Approved");
  const pending = resumes.filter((r) => r.status === "Pending Review");
  const rejected = resumes.filter((r) => r.status === "Rejected");

  const getFilteredResumes = () => {
    switch (selectedTab) {
      case "approved":
        return approved;
      case "pending":
        return pending;
      case "rejected":
        return rejected;
      default:
        return resumes;
    }
  };

  const filteredResumes = getFilteredResumes();

  const resumeStats = [
    { label: "Total Resumes", value: resumes.length, color: "bg-blue-500" },
    { label: "Approved", value: approved.length, color: "bg-emerald-500" },
    { label: "Pending", value: pending.length, color: "bg-amber-500" },
    { label: "Rejected", value: rejected.length, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Management"
        desc="Verify resumes, check ATS scores and manage approvals."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Upload className="size-4" /> Upload Resumes
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resumeStats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div
              className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setSelectedTab("all")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "all"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({resumes.length})
        </button>
        <button
          onClick={() => setSelectedTab("approved")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "approved"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Approved ({approved.length})
        </button>
        <button
          onClick={() => setSelectedTab("pending")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "pending"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setSelectedTab("rejected")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "rejected"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Rejected ({rejected.length})
        </button>
      </div>

      {/* Resumes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResumes.map((resume) => (
          <Card key={resume.id} className="hover:-translate-y-1 transition flex flex-col">
            {/* Resume Preview */}
            <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed mb-4 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 grid-bg" />
              <div className="relative text-center">
                <div className="text-3xl mb-2">📄</div>
                <div className="text-xs font-medium text-muted-foreground truncate">
                  {resume.fileName}
                </div>
              </div>
            </div>

            {/* Resume Info */}
            <div className="flex-1">
              <div className="font-semibold text-sm">{resume.studentName}</div>
              <div className="text-xs text-muted-foreground">{resume.studentId}</div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between p-2 bg-gradient-soft rounded-lg">
                  <span className="text-xs text-muted-foreground">ATS Score</span>
                  {resume.status === "Approved" ? (
                    <span className="text-sm font-bold text-emerald-600">{resume.atsScore}%</span>
                  ) : resume.status === "Rejected" ? (
                    <span className="text-sm font-bold text-rose-600">{resume.atsScore}%</span>
                  ) : (
                    <span className="text-sm font-bold text-amber-600">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-gradient-soft rounded-lg">
                  <span className="text-xs text-muted-foreground">Upload Date</span>
                  <span className="text-xs font-medium">
                    {new Date(resume.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <Badge
                  tone={
                    resume.status === "Approved"
                      ? "success"
                      : resume.status === "Rejected"
                        ? "danger"
                        : "warn"
                  }
                  className="w-full text-center block"
                >
                  {resume.status}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                <Eye className="size-3.5" /> View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                <Download className="size-3.5" /> Download
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Resume Verification Details */}
      <Card>
        <h3 className="font-semibold mb-4">Detailed Resume Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  ATS Score
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Format Check
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Content Check
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Grammar
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredResumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{resume.studentName}</div>
                    <div className="text-xs text-muted-foreground">{resume.studentId}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {resume.status === "Approved" ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-emerald-600">{resume.atsScore}%</div>
                        <div className="w-full bg-muted rounded h-1.5">
                          <div
                            className="bg-emerald-500 h-full rounded"
                            style={{ width: `${resume.atsScore}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="size-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="size-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="size-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        resume.status === "Approved"
                          ? "success"
                          : resume.status === "Rejected"
                            ? "danger"
                            : "warn"
                      }
                    >
                      {resume.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-1 justify-center">
                      {resume.status === "Pending Review" && (
                        <>
                          <button className="px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 transition">
                            Approve
                          </button>
                          <button className="px-2 py-1 rounded text-xs text-rose-600 hover:bg-rose-50 transition">
                            Reject
                          </button>
                        </>
                      )}
                      {resume.status !== "Pending Review" && (
                        <button className="px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 transition">
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resume Templates */}
      <Card>
        <h3 className="font-semibold mb-4">Resume Templates & Guidelines</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Standard Template", desc: "Professional format for all roles" },
            { name: "Tech Focus", desc: "For engineering and IT positions" },
            { name: "Business Template", desc: "For business and management roles" },
            { name: "Creative Template", desc: "For design and creative positions" },
            { name: "Graduate Template", desc: "For freshers and new graduates" },
            { name: "Executive Template", desc: "For senior and leadership roles" },
          ].map((template) => (
            <div
              key={template.name}
              className="p-4 border rounded-lg hover:border-primary transition"
            >
              <div className="font-medium text-sm mb-1">{template.name}</div>
              <div className="text-xs text-muted-foreground mb-3">{template.desc}</div>
              <button className="text-xs text-blue-600 hover:underline">Download</button>
            </div>
          ))}
        </div>
      </Card>

      {/* ATS Score Guidelines */}
      <Card>
        <h3 className="font-semibold mb-4">ATS Score Ranges</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <Check className="size-5 text-emerald-600" />
            <div>
              <div className="font-medium text-sm">80-100%: Excellent</div>
              <div className="text-xs text-muted-foreground">
                Automatically approved - High chances of selection
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="size-5 rounded-lg bg-amber-600 text-white grid place-items-center text-xs font-bold">
              !
            </div>
            <div>
              <div className="font-medium text-sm">60-79%: Acceptable</div>
              <div className="text-xs text-muted-foreground">
                Manual review required - May need adjustments
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
            <X className="size-5 text-rose-600" />
            <div>
              <div className="font-medium text-sm">Below 60%: Needs Improvement</div>
              <div className="text-xs text-muted-foreground">
                Auto-rejected - Student advised to update
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
