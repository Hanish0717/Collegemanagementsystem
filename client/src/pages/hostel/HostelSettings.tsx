import { useState, useEffect } from "react";
import { X, Save, Github, Linkedin, Twitter, Globe, Pencil, Loader2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export function HostelSettings() {
  const { user, refreshUser } = useAuth();

  const fullName = user?.fullName || "Warden Member";
  const email = user?.email || "";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [aboutMe, setAboutMe] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  // Load state from Supabase on mount
  useEffect(() => {
    async function loadProfile() {
      if (!email) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("about, social_links, avatar_url")
          .eq("email", email)
          .single();

        if (error) throw error;

        if (data) {
          setAboutMe(data.about || "Responsible for hostel administration, resident safety, dining operations, and facility coordination.");
          setAvatarUrl(data.avatar_url || "");
          if (data.social_links) {
            setSocialLinks({
              github: data.social_links.github || "",
              linkedin: data.social_links.linkedin || "",
              twitter: data.social_links.twitter || "",
              website: data.social_links.website || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile from database, falling back:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [email]);

  const handleSave = async () => {
    if (!email) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("users")
        .update({
          about: aboutMe,
          social_links: socialLinks,
        })
        .eq("email", email);

      if (error) throw error;

      toast.success("Profile changes saved successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    // Reload original values
    if (email) {
      try {
        const { data } = await supabase
          .from("users")
          .select("about, social_links")
          .eq("email", email)
          .single();
        if (data) {
          setAboutMe(data.about || "");
          if (data.social_links) {
            setSocialLinks({
              github: data.social_links.github || "",
              linkedin: data.social_links.linkedin || "",
              twitter: data.social_links.twitter || "",
              website: data.social_links.website || "",
            });
          }
        }
      } catch (e) {}
    }
    toast.info("Changes discarded.");
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !email) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `warden-${email}-${Date.now()}.${fileExt}`;

    const loadingToast = toast.loading("Uploading avatar...");
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("email", email);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully!", { id: loadingToast });
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload avatar", { id: loadingToast });
    }
  };

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "19/05/2026";
  const employeeId = user?.employeeId || (user?._id ? `#${user._id.slice(-6).toUpperCase()}` : "#4");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground font-sans">Loading settings profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Hostel Warden Settings
        </span>
        <h2 className="text-sm font-medium text-muted-foreground">
          Hostel administration and safety
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
                disabled={saving}
              >
                <X className="size-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm hover:opacity-90 transition cursor-pointer font-medium animate-in fade-in zoom-in-95 duration-150"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Changes
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
          <Card className="text-center relative">
            <div className="mx-auto size-32 relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="size-full rounded-3xl object-cover shadow-soft"
                />
              ) : (
                <div className="size-full rounded-3xl bg-gradient-primary grid place-items-center text-white text-4xl font-bold shadow-soft">
                  {initials || "HW"}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 p-2 bg-indigo text-white rounded-xl cursor-pointer hover:scale-105 transition shadow-md grid place-items-center">
                <Pencil className="size-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-4 font-bold text-lg">{fullName}</div>
            <div className="text-xs text-muted-foreground tracking-wider uppercase font-semibold mt-1">
              HOSTEL WARDEN
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
                className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary animate-in fade-in duration-200 resize-none"
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
                  Employee ID
                </label>
                <div className="text-sm font-semibold mt-1 font-mono">{employeeId}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
