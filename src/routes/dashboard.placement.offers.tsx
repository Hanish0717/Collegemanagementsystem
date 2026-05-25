import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { offers } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/placement/offers")({
  component: OfferManagement,
});

function OfferManagement() {
  const accepted = offers.filter(o => o.status === "Accepted");
  const pending = offers.filter(o => o.status === "Pending");

  const offerStats = [
    { label: "Total Offers", value: offers.length, color: "bg-blue-500" },
    { label: "Accepted", value: accepted.length, color: "bg-emerald-500" },
    { label: "Pending", value: pending.length, color: "bg-amber-500" },
    { label: "Acceptance Rate", value: `${Math.round((accepted.length / offers.length) * 100)}%`, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer Management"
        desc="Manage job offers, packages and student acceptances."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Generate Offer
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {offerStats.map(stat => (
          <Card key={stat.label} className="text-center">
            <div className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map(offer => (
          <Card key={offer.id} className="hover:-translate-y-1 transition flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">{offer.studentName}</h3>
                <p className="text-xs text-muted-foreground mt-1">{offer.company}</p>
              </div>
              <Badge tone={offer.status === "Accepted" ? "success" : "warn"}>
                {offer.status}
              </Badge>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="p-3 rounded-lg bg-gradient-soft">
                <div className="text-xs text-muted-foreground mb-1">Position</div>
                <div className="font-semibold text-sm">{offer.role}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-muted-foreground mb-1">Package</div>
                <div className="font-bold text-lg text-emerald-600">{offer.package}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-gradient-soft text-center">
                  <div className="text-xs text-muted-foreground">Joining Date</div>
                  <div className="text-sm font-medium">{offer.joiningDate}</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-soft text-center">
                  <div className="text-xs text-muted-foreground">Offer Date</div>
                  <div className="text-sm font-medium">{new Date(offer.offerDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                <FileText className="size-3 inline mr-1" /> View
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                <Download className="size-3 inline mr-1" /> Download
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Offers Table */}
      <Card>
        <h3 className="font-semibold mb-4">All Offers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Package</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Joining Date</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Offer Date</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {offers.map(offer => (
                <tr key={offer.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{offer.studentName}</td>
                  <td className="py-3 px-4">{offer.company}</td>
                  <td className="py-3 px-4">{offer.role}</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600">{offer.package}</td>
                  <td className="py-3 px-4 text-center text-sm">{offer.joiningDate}</td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    {new Date(offer.offerDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone={offer.status === "Accepted" ? "success" : "warn"}>
                      {offer.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-xs text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Accepted vs Pending */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Accepted Offers */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-emerald-600" />
            <h3 className="font-semibold">Accepted Offers ({accepted.length})</h3>
          </div>
          <div className="space-y-2">
            {accepted.map(offer => (
              <div key={offer.id} className="p-3 rounded-lg border hover:bg-accent/50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{offer.studentName}</div>
                    <div className="text-xs text-muted-foreground">{offer.company}</div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1">{offer.package}</div>
                  </div>
                  <Badge tone="success">✓</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Offers */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-amber-600" />
            <h3 className="font-semibold">Pending Acceptances ({pending.length})</h3>
          </div>
          <div className="space-y-2">
            {pending.map(offer => (
              <div key={offer.id} className="p-3 rounded-lg border hover:bg-accent/50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{offer.studentName}</div>
                    <div className="text-xs text-muted-foreground">{offer.company}</div>
                    <div className="text-xs font-semibold text-amber-600 mt-1">{offer.package}</div>
                  </div>
                  <Badge tone="warn">⏱</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Package Comparison */}
      <Card>
        <h3 className="font-semibold mb-4">Package Comparison</h3>
        <div className="space-y-3">
          {offers
            .sort((a, b) => parseFloat(b.package) - parseFloat(a.package))
            .map(offer => {
              const pkg = parseFloat(offer.package);
              const maxPkg = parseFloat(offers.reduce((max, o) => {
                const p = parseFloat(o.package);
                return p > parseFloat(max.package) ? o : max;
              }).package);
              const percentage = (pkg / maxPkg) * 100;

              return (
                <div key={offer.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{offer.studentName}</span>
                      <span className="text-muted-foreground ml-2">• {offer.company}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{offer.package}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-cyan-500 h-full rounded-full transition"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Offer Generation Template */}
      <Card>
        <h3 className="font-semibold mb-4">Generate New Offer Letter</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-gradient-soft">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Student Name</label>
              <input placeholder="Select student" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Company</label>
              <input placeholder="Select company" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Position</label>
              <input placeholder="Job title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Package (LPA)</label>
              <input placeholder="Enter package" type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Joining Date</label>
              <input type="date" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Location</label>
              <input placeholder="Office location" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Additional Terms</label>
            <textarea placeholder="Enter any special conditions or terms" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Generate & Send
            </button>
            <button className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
              Preview
            </button>
          </div>
        </div>
      </Card>

      {/* Offer Letter Template */}
      <Card>
        <h3 className="font-semibold mb-4">Letter Templates</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: "Standard Offer Letter", uses: "Regular job offers" },
            { name: "Internship Offer", uses: "Summer/winter internships" },
            { name: "Contract Offer", uses: "Contract-based positions" },
            { name: "Conditional Offer", uses: "Offers with conditions" },
          ].map(template => (
            <div key={template.name} className="p-3 border rounded-lg hover:border-primary transition">
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{template.uses}</div>
              <button className="text-xs text-blue-600 hover:underline mt-2">Use Template</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
