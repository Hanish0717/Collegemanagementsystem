import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Search, Video } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { studyMaterials } from "@/mock/studentData";
import api from "@/lib/api";

export function StudentMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [typeFilter, setTypeFilter] = useState("All Types");
 
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get("/api/student-module/materials");
        if (res.data?.success && res.data?.data) {
          const dbMaterials = res.data.data.map((m: any) => ({
            id: m._id || m.id,
            title: m.title,
            subject: m.subject,
            type: m.type,
            uploaded: new Date(m.created_at || m.createdAt || Date.now()).toISOString().split('T')[0],
            downloads: m.downloads || 0,
            fileUrl: m.fileUrl
          }));
          setMaterials(dbMaterials);
        }
      } catch (err) {
        console.error("Error loading study materials:", err);
      }
    };
    fetchMaterials();
  }, []);

  const handleDownload = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      alert("No download file link available");
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "All Subjects" || m.subject === subjectFilter;
    const matchesType = typeFilter === "All Types" || m.type === typeFilter;
    return matchesSearch && matchesSubject && matchesType;
  });

  const subjects = ["All Subjects", ...Array.from(new Set(materials.map(m => m.subject)))];
  const types = ["All Types", "PDF", "Video", "Document"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        desc="Access study materials, lecture notes, video tutorials, and resources for your subjects."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Materials", value: materials.length.toString(), tone: "info" as const },
          { label: "PDF Documents", value: materials.filter(m => m.type === "PDF").length.toString(), tone: "info" as const },
          { label: "Videos", value: materials.filter(m => m.type === "Video").length.toString(), tone: "info" as const },
          { label: "Total Downloads", value: materials.reduce((sum, m) => sum + m.downloads, 0).toLocaleString(), tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm"
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Material Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map(material => (
              <Card key={material.id} className="hover:-translate-y-1 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-gradient-violet text-white grid place-items-center">
                    {material.type === "Video" ? <Video className="size-5" /> : <FileText className="size-5" />}
                  </div>
                  <Badge tone="info">{material.type}</Badge>
                </div>
                <h3 className="font-semibold text-sm">{material.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{material.subject}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span className="font-medium">{material.uploaded}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Downloads</span>
                    <span className="font-medium">{material.downloads}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(material.fileUrl)}
                  className="mt-4 w-full px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1"
                >
                  <Download className="size-3" /> Download
                </button>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              No study materials found matching your criteria.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Recent Downloads</h3>
        <div className="space-y-2">
          {materials.slice(0, 4).map(material => (
            <div key={material.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                {material.type === "Video" ? (
                  <Video className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{material.title}</div>
                <div className="text-xs text-muted-foreground">
                  {material.subject} • {material.uploaded}
                </div>
              </div>
              <Badge tone="info">{material.downloads} downloads</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
