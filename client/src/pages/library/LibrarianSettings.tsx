import { useState, useEffect } from 'react';
import { X, Save, Github, Linkedin, Twitter, Globe, Pencil } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function LibrarianSettings() {
  const { user } = useAuth();

  const fullName = user?.fullName || 'Librarian Member';
  const email = user?.email || '';

  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [aboutMe, setAboutMe] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const role = 'librarian';

    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(
      storedAbout ||
        'Experienced librarian with years of service. Specializing in digital library management and cataloging.',
    );

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    if (storedSocials) {
      setSocialLinks(JSON.parse(storedSocials));
    } else {
      setSocialLinks({ github: '', linkedin: '', twitter: '', website: '' });
    }
  }, []);

  const handleSave = () => {
    const role = 'librarian';
    localStorage.setItem(`cms_${role}_about`, aboutMe);
    localStorage.setItem(`cms_${role}_socials`, JSON.stringify(socialLinks));
    toast.success('Profile changes saved successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    const role = 'librarian';

    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(
      storedAbout ||
        'Experienced librarian with years of service. Specializing in digital library management and cataloging.',
    );

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    setSocialLinks(
      storedSocials
        ? JSON.parse(storedSocials)
        : { github: '', linkedin: '', twitter: '', website: '' },
    );

    toast.info('Changes discarded.');
    setIsEditing(false);
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB')
    : '19/05/2026';
  const librarianIdVal = user?.employeeId || 'LIB-0001';

  return (
    <div className="space-y-6">
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
                {initials || 'LB'}
              </div>
            </div>
            <div className="mt-4 font-bold text-lg">{fullName}</div>
            <div className="text-xs text-muted-foreground tracking-wider uppercase font-semibold mt-1">
              LIBRARIAN
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
                  const hrefVal = isLinked
                    ? item.value.startsWith('http')
                      ? item.value
                      : `https://${item.value}`
                    : undefined;

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
                          <span className="text-sm text-muted-foreground/60 italic">
                            Not linked
                          </span>
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
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {aboutMe}
                  </p>
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
                  Librarian ID
                </label>
                <div className="text-sm font-semibold mt-1 font-mono">{librarianIdVal}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
