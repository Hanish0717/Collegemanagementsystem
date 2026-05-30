import { useState, useEffect } from "react";
import { X, Save, Github, Linkedin, Twitter, Globe, Pencil, Plus } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const getSubHeadline = (role: string) => {
  switch (role) {
    case "student": return "Learn, submit, and grow";
    case "parent": return "Track, support, and guide";
    case "faculty": return "Teach, evaluate, inspire";
    case "admin": return "Administer, coordinate, and organize";
    case "super_admin": return "System control and security";
    default: return "Manage your campus profile and settings";
  }
};

export function SettingsPage() {
  const { user } = useAuth();
  
  const role = user?.role;

  // Get student profile if stored and role is student
  const profileStr = role === "student" ? localStorage.getItem("cms_student_profile") : null;
  const studentProfile = profileStr ? JSON.parse(profileStr) : null;

  const fullName = (role === "student" ? studentProfile?.fullName : null) || user?.fullName || "User";
  const email = (role === "student" ? studentProfile?.email : null) || user?.email || "";
  const department = (role === "student" ? studentProfile?.department : null) || "N/A";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const formattedRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("-", " ")
    : "Member";

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [aboutMe, setAboutMe] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  // Load state from localStorage on mount
  useEffect(() => {
    if (!user) return;
    const role = user.role;
    
    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(storedAbout || "");

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    if (storedSocials) {
      setSocialLinks(JSON.parse(storedSocials));
    } else {
      setSocialLinks({ github: "", linkedin: "", twitter: "", website: "" });
    }

    const storedSkills = localStorage.getItem(`cms_${role}_skills`);
    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    } else {
      setSkills(role === "student" ? ["React", "TypeScript", "Node.js", "Python"] : []);
    }
  }, [user]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
  };

  const handleSave = () => {
    if (!user) return;
    const role = user.role;
    localStorage.setItem(`cms_${role}_about`, aboutMe);
    localStorage.setItem(`cms_${role}_socials`, JSON.stringify(socialLinks));
    if (role === "student") {
      localStorage.setItem(`cms_${role}_skills`, JSON.stringify(skills));
    }
    toast.success("Profile changes saved successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!user) return;
    const role = user.role;
    
    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(storedAbout || "");

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    setSocialLinks(storedSocials ? JSON.parse(storedSocials) : { github: "", linkedin: "", twitter: "", website: "" });

    const storedSkills = localStorage.getItem(`cms_${role}_skills`);
    setSkills(storedSkills ? JSON.parse(storedSkills) : (role === "student" ? ["React", "TypeScript", "Node.js", "Python"] : []));
    
    toast.info("Changes discarded.");
    setIsEditing(false);
  };

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "19/05/2026";
  
  let idLabel = "User ID";
  let idValue = user?._id ? `#${user._id.slice(-6).toUpperCase()}` : "#3";

  if (role === "student" || role === "parent") {
    idLabel = "Roll Number";
    idValue = user?.rollNumber || studentProfile?.rollNumber || studentProfile?.roll_number || "N/A";
    if (role === "parent" && idValue === "N/A") {
      const parentChildStr = localStorage.getItem("cms_parent_child_data");
      const parentChildData = parentChildStr ? JSON.parse(parentChildStr) : null;
      idValue = parentChildData?.rollNumber || parentChildData?.roll_number || "N/A";
    }
  } else if (role === "admin" || role === "faculty" || role === "librarian" || role === "placement-officer" || role === "hostel-warden" || role === "transport-manager") {
    idLabel = "Employee ID";
    idValue = user?.employeeId || (user?._id ? `#${user._id.slice(-6).toUpperCase()}` : "#3");
  }

  const showSkills = user?.role === "student";


  return (
    <div className="space-y-6">
      <div className="mb-2">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {formattedRole} Settings
        </span>
        <h2 className="text-sm font-medium text-muted-foreground">
          {getSubHeadline(user?.role || "")}
        </h2>
      </div>

      <PageHeader
        title="Profile"
        desc="Manage your identity and public presence."
        actions={
          isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 border rounded-xl hover:bg-accent text-sm transition cursor-pointer font-medium"
              >
                <X className="size-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm hover:opacity-90 transition cursor-pointer font-medium animate-in fade-in zoom-in-95 duration-150"
              >
                <Save className="size-4" /> Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm hover:opacity-90 transition cursor-pointer font-medium"
            >
              <Pencil className="size-4" /> Edit Profile
            </button>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            <div className="mx-auto size-32">
              <div className="size-full rounded-3xl bg-gradient-primary grid place-items-center text-white text-4xl font-bold shadow-soft">
                {initials || "US"}
              </div>
            </div>
            <div className="mt-4 font-bold text-lg">{fullName}</div>
            <div className="text-xs text-muted-foreground tracking-wider uppercase font-semibold mt-1">
              {user?.role || "Member"} {department !== "N/A" && `· ${department}`}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase text-muted-foreground">
              Social Links
            </h3>
            {isEditing ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <Github className="size-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="size-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Twitter className="size-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Twitter URL"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Website URL"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {[
                  { icon: Github, value: socialLinks.github },
                  { icon: Linkedin, value: socialLinks.linkedin },
                  { icon: Twitter, value: socialLinks.twitter },
                  { icon: Globe, value: socialLinks.website },
                ].map((item, idx) => {
                  const isLinked = !!item.value;
                  const hrefVal = isLinked ? (item.value.startsWith("http") ? item.value : `https://${item.value}`) : undefined;
                  
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      {isLinked ? (
                        <a
                          href={hrefVal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 transition"
                        >
                          <item.icon className="size-5 shrink-0" />
                          <span className="text-sm hover:underline break-all">{item.value}</span>
                        </a>
                      ) : (
                        <>
                          <item.icon className="size-5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground/60 italic">Not linked</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-semibold mb-3 text-sm tracking-wider uppercase text-muted-foreground">
              About Me
            </h3>
            {isEditing ? (
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary animate-in fade-in duration-200"
              />
            ) : (
              <div className="min-h-16 py-1">
                {aboutMe ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{aboutMe}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    No bio provided yet. Add one to let people know who you are!
                  </p>
                )}
              </div>
            )}
          </Card>

          {showSkills && (
            <Card>
              <h3 className="font-semibold mb-3 text-sm tracking-wider uppercase text-muted-foreground">
                Skills & Expertise
              </h3>
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. React, Python)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="size-4" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <Badge key={skill} tone="info" className="flex items-center gap-1.5 px-3 py-1 rounded-xl">
                          <span>{skill}</span>
                          <button onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-500 cursor-pointer">
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground/60">No skills added yet.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 py-1">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill} tone="info" className="px-3 py-1 rounded-xl">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground/60 italic">No skills added yet.</span>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase text-muted-foreground">
              Account Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 border rounded-xl bg-gradient-soft">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="text-sm font-semibold mt-1 truncate">{email}</div>
              </div>
              <div className="p-3.5 border rounded-xl bg-gradient-soft">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Account Status
                </label>
                <div className="text-sm font-semibold mt-1 text-emerald-600 flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  Verified
                </div>
              </div>
              <div className="p-3.5 border rounded-xl bg-gradient-soft">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Joined On
                </label>
                <div className="text-sm font-semibold mt-1">{joinedDate}</div>
              </div>
              <div className="p-3.5 border rounded-xl bg-gradient-soft">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {idLabel}
                </label>
                <div className="text-sm font-semibold mt-1 font-mono">{idValue}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
