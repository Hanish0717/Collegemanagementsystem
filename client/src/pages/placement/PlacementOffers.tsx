import { useState, useEffect } from "react";
import { Plus, Download, FileText, CheckCircle, Clock, Loader2, X } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementData } from "@/services/placementService";
import { offers as mockOffers } from "@/mock/mockData";
import { toast } from "sonner";

interface OfferItem {
  id: string;
  studentName: string;
  company: string;
  role: string;
  package: string;
  joiningDate: string;
  status: string;
  offerDate: string;
}

const mergeOffers = (serverOffers: OfferItem[]): OfferItem[] => {
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
    } catch (e) {
      console.error("Error parsing placement_edited_offers:", e);
    }
  }

  const customStr = localStorage.getItem("placement_custom_offers");
  if (customStr) {
    try {
      const customList = JSON.parse(customStr);
      const existingIds = new Set(list.map(i => i.id));
      const filteredCustom = customList.filter((i: OfferItem) => !existingIds.has(i.id));
      list = [...filteredCustom, ...list];
    } catch (e) {
      console.error("Error parsing placement_custom_offers:", e);
    }
  }
  
  return list;
};

export function PlacementOffers() {
  const [offers, setOffers] = useState<OfferItem[]>(() => mergeOffers(mockOffers));
  const [loading, setLoading] = useState(true);

  // Modals Control
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);

  // Form Fields States
  const [formStudent, setFormStudent] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formPackage, setFormPackage] = useState("");
  const [formJoiningDate, setFormJoiningDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formTerms, setFormTerms] = useState("");

  // Inline Bottom Form States
  const [bottomStudent, setBottomStudent] = useState("");
  const [bottomCompany, setBottomCompany] = useState("");
  const [bottomPosition, setBottomPosition] = useState("");
  const [bottomPackage, setBottomPackage] = useState("");
  const [bottomJoiningDate, setBottomJoiningDate] = useState("");
  const [bottomLocation, setBottomLocation] = useState("");
  const [bottomTerms, setBottomTerms] = useState("");

  const handleGenerateOffer = (
    studentName: string, 
    company: string, 
    role: string, 
    pkg: string, 
    joining: string, 
    loc: string, 
    terms: string,
    isModal: boolean
  ) => {
    if (!studentName.trim() || !company.trim() || !role.trim() || !pkg.trim() || !joining.trim()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const newOffer: OfferItem = {
      id: `OFF_${Date.now()}`,
      studentName: studentName.trim(),
      company: company.trim(),
      role: role.trim(),
      package: pkg.includes("LPA") ? pkg.trim() : `${pkg.trim()} LPA`,
      joiningDate: joining,
      status: "Pending",
      offerDate: new Date().toISOString().split("T")[0]
    };

    setOffers(prev => {
      const updated = [newOffer, ...prev];
      if (typeof window !== "undefined") {
        const customStr = localStorage.getItem("placement_custom_offers");
        let customList: OfferItem[] = [];
        if (customStr) {
          try {
            customList = JSON.parse(customStr);
          } catch (e) {
            console.error(e);
          }
        }
        customList.unshift(newOffer);
        localStorage.setItem("placement_custom_offers", JSON.stringify(customList));
      }
      return updated;
    });
    toast.success(`Successfully generated and sent offer letter to ${newOffer.studentName}!`);

    if (isModal) {
      setIsGenerateModalOpen(false);
      setFormStudent("");
      setFormCompany("");
      setFormPosition("");
      setFormPackage("");
      setFormJoiningDate("");
      setFormLocation("");
      setFormTerms("");
    } else {
      setBottomStudent("");
      setBottomCompany("");
      setBottomPosition("");
      setBottomPackage("");
      setBottomJoiningDate("");
      setBottomLocation("");
      setBottomTerms("");
    }
  };

  const handleDownloadOffer = (offer: OfferItem) => {
    toast.info(`Preparing official offer letter PDF for ${offer.studentName}...`);
    setTimeout(() => {
      toast.success(`Offer letter for ${offer.studentName} has been downloaded successfully!`);
    }, 1200);
  };

  const handleAcceptOffer = (id: string) => {
    let updatedOffer: OfferItem | null = null;
    
    setOffers(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          updatedOffer = { ...item, status: "Accepted" };
          return updatedOffer;
        }
        return item;
      });

      if (updatedOffer && typeof window !== "undefined") {
        const customStr = localStorage.getItem("placement_custom_offers");
        let isCustom = false;
        if (customStr) {
          try {
            let customList: OfferItem[] = JSON.parse(customStr);
            const idx = customList.findIndex(o => o.id === id);
            if (idx !== -1) {
              customList[idx] = updatedOffer;
              localStorage.setItem("placement_custom_offers", JSON.stringify(customList));
              isCustom = true;
            }
          } catch (e) {
            console.error(e);
          }
        }

        if (!isCustom) {
          const editedStr = localStorage.getItem("placement_edited_offers");
          let editedMap: Record<string, OfferItem> = {};
          if (editedStr) {
            try {
              editedMap = JSON.parse(editedStr);
            } catch (e) {
              console.error(e);
            }
          }
          editedMap[id] = updatedOffer;
          localStorage.setItem("placement_edited_offers", JSON.stringify(editedMap));
        }
      }

      return updated;
    });

    if (selectedOffer && selectedOffer.id === id) {
      setSelectedOffer(prev => prev ? { ...prev, status: "Accepted" } : null);
    }
    toast.success("Student offer status has been officially updated to Accepted!");
  };

  const handlePreviewBottom = () => {
    if (!bottomStudent.trim() || !bottomCompany.trim() || !bottomPosition.trim() || !bottomPackage.trim()) {
      toast.error("Please fill in basic details (Student, Company, Position, Package) to preview!");
      return;
    }
    const tempOffer: OfferItem = {
      id: "PREVIEW",
      studentName: bottomStudent.trim(),
      company: bottomCompany.trim(),
      role: bottomPosition.trim(),
      package: bottomPackage.includes("LPA") ? bottomPackage.trim() : `${bottomPackage.trim()} LPA`,
      joiningDate: bottomJoiningDate || new Date().toISOString().split("T")[0],
      status: "Pending",
      offerDate: new Date().toISOString().split("T")[0]
    };
    setSelectedOffer(tempOffer);
    setIsViewModalOpen(true);
    toast.success("Opening preview of generated offer letter!");
  };

  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        if (res.offers && res.offers.length > 0) {
          setOffers(mergeOffers(res.offers));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch live offers list, using fallback mock data:", err);
        setOffers(mergeOffers(mockOffers));
        setLoading(false);
      });
  }, []);

  const accepted = offers.filter((o) => o.status.toLowerCase() === "accepted");
  const pending = offers.filter((o) => o.status.toLowerCase() === "pending");

  const offerStats = [
    { label: "Total Offers", value: offers.length, color: "bg-blue-500" },
    { label: "Accepted", value: accepted.length, color: "bg-emerald-500" },
    { label: "Pending", value: pending.length, color: "bg-amber-500" },
    {
      label: "Acceptance Rate",
      value: `${offers.length > 0 ? Math.round((accepted.length / offers.length) * 100) : 0}%`,
      color: "bg-purple-500",
    },
  ];

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        title="Offer Management"
        desc="Manage job offers, packages and student acceptances."
        actions={
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Generate Offer
          </button>
        }
      />

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading student placement offers...</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offerStats.map((stat) => (
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
      )}

      {/* Offers Grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:-translate-y-1 transition flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{offer.studentName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{offer.company}</p>
                </div>
                <Badge tone={offer.status.toLowerCase() === "accepted" ? "success" : "warn"}>{offer.status}</Badge>
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
                    <div className="text-sm font-medium">
                      {new Date(offer.offerDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => {
                    setSelectedOffer(offer);
                    setIsViewModalOpen(true);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <FileText className="size-3" /> View
                </button>
                <button 
                  onClick={() => handleDownloadOffer(offer)}
                  className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <Download className="size-3" /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Offers Table */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">All Offers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Package
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Joining Date
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Offer Date
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{offer.studentName}</td>
                    <td className="py-3 px-4">{offer.company}</td>
                    <td className="py-3 px-4">{offer.role}</td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                      {offer.package}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">{offer.joiningDate}</td>
                    <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                      {new Date(offer.offerDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone={offer.status.toLowerCase() === "accepted" ? "success" : "warn"}>
                        {offer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedOffer(offer);
                          setIsViewModalOpen(true);
                        }}
                        className="text-xs text-blue-600 hover:underline cursor-pointer font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Accepted vs Pending */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Accepted Offers */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="size-5 text-emerald-600" />
              <h3 className="font-semibold">Accepted Offers ({accepted.length})</h3>
            </div>
            <div className="space-y-2">
              {accepted.map((offer) => (
                <div key={offer.id} className="p-3 rounded-lg border hover:bg-accent/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{offer.studentName}</div>
                      <div className="text-xs text-muted-foreground">{offer.company}</div>
                      <div className="text-xs font-semibold text-emerald-600 mt-1">
                        {offer.package}
                      </div>
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
              {pending.map((offer) => (
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
      )}

      {/* Package Comparison */}
      {!loading && offers.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Package Comparison</h3>
          <div className="space-y-3">
            {[...offers]
              .sort((a, b) => parseFloat(b.package) - parseFloat(a.package))
              .map((offer) => {
                const pkg = parseFloat(offer.package);
                const maxPkg = parseFloat(
                  offers.reduce((max, o) => {
                    const p = parseFloat(o.package);
                    return p > parseFloat(max.package) ? o : max;
                  }).package,
                );
                const percentage = maxPkg > 0 ? (pkg / maxPkg) * 100 : 0;

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
      )}

      {/* Offer Generation Template */}
      <Card>
        <h3 className="font-semibold mb-4 text-left">Generate New Offer Letter</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleGenerateOffer(bottomStudent, bottomCompany, bottomPosition, bottomPackage, bottomJoiningDate, bottomLocation, bottomTerms, false);
        }} className="space-y-4 p-4 border rounded-xl bg-gradient-soft text-left">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Student Name *</label>
              <input
                required
                placeholder="e.g. Liam Chen"
                value={bottomStudent}
                onChange={(e) => setBottomStudent(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Company *</label>
              <select
                required
                value={bottomCompany}
                onChange={(e) => setBottomCompany(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Select Company</option>
                <option value="Google India">Google India</option>
                <option value="Microsoft India">Microsoft India</option>
                <option value="Amazon India">Amazon India</option>
                <option value="Goldman Sachs">Goldman Sachs</option>
                <option value="Accenture">Accenture</option>
                <option value="TCS">TCS</option>
                <option value="Infosys">Infosys</option>
                <option value="Oracle">Oracle</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Position *</label>
              <input
                required
                placeholder="e.g. Systems Analyst"
                value={bottomPosition}
                onChange={(e) => setBottomPosition(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Package (LPA) *</label>
              <input
                required
                placeholder="e.g. 14.5"
                type="number"
                step="0.1"
                value={bottomPackage}
                onChange={(e) => setBottomPackage(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Joining Date *</label>
              <input
                required
                type="date"
                value={bottomJoiningDate}
                onChange={(e) => setBottomJoiningDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Location</label>
              <input
                placeholder="Office location"
                value={bottomLocation}
                onChange={(e) => setBottomLocation(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Additional Terms</label>
            <textarea
              placeholder="Enter any special conditions or terms"
              value={bottomTerms}
              onChange={(e) => setBottomTerms(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium cursor-pointer hover:opacity-95 transition">
              Generate & Send
            </button>
            <button 
              type="button" 
              onClick={handlePreviewBottom}
              className="w-full px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent cursor-pointer transition"
            >
              Preview
            </button>
          </div>
        </form>
      </Card>

      {/* Offer Letter Template */}
      <Card>
        <h3 className="font-semibold mb-4 text-left">Letter Templates</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: "Standard Offer Letter", uses: "Regular job offers" },
            { name: "Internship Offer", uses: "Summer/winter internships" },
            { name: "Contract Offer", uses: "Contract-based positions" },
            { name: "Conditional Offer", uses: "Offers with conditions" },
          ].map((template) => (
            <div
              key={template.name}
              className="p-3 border rounded-lg hover:border-primary transition text-left cursor-pointer hover:bg-accent/10"
              onClick={() => {
                setBottomTerms(`Subject to ${template.uses.toLowerCase()}.\nStandard working hours and NDA policies apply.`);
                toast.success(`Applying ${template.name} template terms!`);
              }}
            >
              <div className="font-medium text-sm text-slate-800">{template.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{template.uses}</div>
              <button className="text-xs text-blue-600 hover:underline mt-2 font-semibold cursor-pointer">Use Template</button>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Generate Offer Modal */}
    {isGenerateModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative text-left">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Generate Placement Offer</h3>
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleGenerateOffer(formStudent, formCompany, formPosition, formPackage, formJoiningDate, formLocation, formTerms, true);
          }} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Chen"
                value={formStudent}
                onChange={(e) => setFormStudent(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                <select
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  required
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Company</option>
                  <option value="Google India">Google India</option>
                  <option value="Microsoft India">Microsoft India</option>
                  <option value="Amazon India">Amazon India</option>
                  <option value="Goldman Sachs">Goldman Sachs</option>
                  <option value="Accenture">Accenture</option>
                  <option value="TCS">TCS</option>
                  <option value="Infosys">Infosys</option>
                  <option value="Oracle">Oracle</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Position Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Package (LPA) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 18.5"
                  value={formPackage}
                  onChange={(e) => setFormPackage(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formJoiningDate}
                  onChange={(e) => setFormJoiningDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Office Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, India"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Additional Terms</label>
              <textarea
                placeholder="Enter special terms or instructions..."
                value={formTerms}
                onChange={(e) => setFormTerms(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Generate Offer
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Offer Modal / Letter Preview */}
    {isViewModalOpen && selectedOffer && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white border text-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200 text-left">
          {/* Close button */}
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>

          {/* Letterhead */}
          <div className="border-b-2 border-indigo-600 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-extrabold text-2xl tracking-tight text-indigo-900 uppercase">
                  {selectedOffer.company}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  Talent Acquisition & Global Recruitment Division
                </p>
              </div>
              <Badge tone={selectedOffer.status.toLowerCase() === "accepted" ? "success" : "warn"}>
                {selectedOffer.status}
              </Badge>
            </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-serif">
            <div className="flex justify-between items-center text-xs text-slate-500 font-sans mb-2">
              <span>Ref ID: {selectedOffer.id}</span>
              <span>Date: {new Date(selectedOffer.offerDate).toLocaleDateString()}</span>
            </div>

            <p className="font-bold text-slate-900 font-sans">
              To, <br />
              {selectedOffer.studentName} <br />
              Student Placement Roster
            </p>

            <h3 className="font-bold text-slate-900 border-b pb-1 font-sans text-base">
              Subject: Letter of Intent & Employment Offer for "{selectedOffer.role}"
            </h3>

            <p>Dear {selectedOffer.studentName},</p>

            <p>
              Following your successful participation and outstanding reviews across all rounds of our campus recruitment drive, we are delighted to offer you employment at <strong>{selectedOffer.company}</strong> in the position of <strong>{selectedOffer.role}</strong>.
            </p>

            <p>
              We are confident that your technical skills, leadership values, and academic achievements will make you a vital contributor to our product engineering squads.
            </p>

            {/* Offer Parameters Grid */}
            <div className="border border-indigo-100 rounded-xl overflow-hidden font-sans my-4">
              <div className="grid grid-cols-2 bg-indigo-50/50 border-b border-indigo-100 text-xs font-bold text-indigo-900">
                <div className="p-3 border-r border-indigo-100">Offer Parameter</div>
                <div className="p-3">Terms / Allocation Details</div>
              </div>
              <div className="divide-y divide-indigo-100 text-xs">
                <div className="grid grid-cols-2">
                  <div className="p-2.5 border-r border-indigo-100 font-semibold bg-slate-50/20 text-slate-800">Job Designation</div>
                  <div className="p-2.5 text-slate-900 font-bold">{selectedOffer.role}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-2.5 border-r border-indigo-100 font-semibold bg-slate-50/20 text-slate-800">Annual CTC Compensation</div>
                  <div className="p-2.5 text-emerald-700 font-extrabold text-sm">{selectedOffer.package}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-2.5 border-r border-indigo-100 font-semibold bg-slate-50/20 text-slate-800">Official Joining Date</div>
                  <div className="p-2.5 text-slate-900 font-bold">{selectedOffer.joiningDate}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-2.5 border-r border-indigo-100 font-semibold bg-slate-50/20 text-slate-800">Assigned Work Location</div>
                  <div className="p-2.5 text-slate-700">Bengaluru Corporate Campus</div>
                </div>
              </div>
            </div>

            <p>
              Please accept our congratulations on your selection. We look forward to welcome you into our organization as we build the next generation of scalable products.
            </p>

            {/* Signature Area */}
            <div className="flex justify-between items-end pt-6 font-sans">
              <div>
                <p className="text-xs text-slate-500">Authorized Human Capital Seal</p>
                <div className="size-16 border border-slate-100 bg-slate-50 rounded-lg flex items-center justify-center mt-1 text-[10px] text-slate-400 font-bold select-none border-dashed uppercase text-center p-1 leading-tight">
                  Talent Acquisition
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs italic text-indigo-700 font-semibold mb-1">Global Recruitment Team</p>
                <p className="text-xs font-bold text-slate-900 border-t pt-1 border-slate-200">{selectedOffer.company} HR</p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-3 mt-8 pt-4 border-t font-sans">
            <button
              onClick={() => handleDownloadOffer(selectedOffer)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="size-4" /> Download Official PDF
            </button>
            {selectedOffer.status.toLowerCase() === "pending" && selectedOffer.id !== "PREVIEW" && (
              <button
                onClick={() => handleAcceptOffer(selectedOffer.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                ✓ Accept & Register Offer
              </button>
            )}
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
