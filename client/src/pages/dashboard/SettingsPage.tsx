import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Pencil,
  Plus,
  User,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const getSubHeadline = (role: string) => {
  switch (role) {
    case 'student':
      return 'Learn, submit, and grow';
    case 'parent':
      return 'Track, support, and guide';
    case 'faculty':
      return 'Teach, evaluate, inspire';
    case 'admin':
      return 'Administer, coordinate, and organize';
    case 'super_admin':
      return 'System control and security';
    default:
      return 'Manage your campus profile and settings';
  }
};

export function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role;

  // Get student profile if stored and role is student
  const profileStr = role === 'student' ? localStorage.getItem('cms_student_profile') : null;
  const studentProfile = profileStr ? JSON.parse(profileStr) : null;

  const defaultName =
    (role === 'student' ? studentProfile?.fullName : null) || user?.fullName || 'User';
  const defaultEmail = (role === 'student' ? studentProfile?.email : null) || user?.email || '';
  const defaultDept =
    (role === 'student' ? studentProfile?.department : null) || 'Computer Science';

  // Editable Profile States
  const [fullNameVal, setFullNameVal] = useState(defaultName);
  const [emailVal, setEmailVal] = useState(defaultEmail);
  const [phoneVal, setPhoneVal] = useState('9876543210');
  const [deptVal, setDeptVal] = useState(defaultDept);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [aboutMe, setAboutMe] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  });

  // Load state from localStorage on mount and sync with user context
  useEffect(() => {
    if (!user) return;
    const role = user.role;

    const storedName = localStorage.getItem(`cms_${role}_name`);
    setFullNameVal(storedName || defaultName);

    const storedEmail = localStorage.getItem(`cms_${role}_email`);
    setEmailVal(storedEmail || defaultEmail);

    const storedPhone = localStorage.getItem(`cms_${role}_phone`);
    setPhoneVal(storedPhone || user?.phoneNumber || studentProfile?.phoneNumber || '9876543210');

    const storedDept = localStorage.getItem(`cms_${role}_dept`);
    setDeptVal(storedDept || defaultDept);

    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(storedAbout || '');

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    if (storedSocials) {
      setSocialLinks(JSON.parse(storedSocials));
    } else {
      setSocialLinks({ github: '', linkedin: '', twitter: '', website: '' });
    }

    const storedSkills = localStorage.getItem(`cms_${role}_skills`);
    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    } else {
      setSkills(role === 'student' ? ['React', 'TypeScript', 'Node.js', 'Python'] : []);
    }
  }, [user, defaultName, defaultEmail, defaultDept]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
  };

  const handleSave = () => {
    if (!user) return;
    const role = user.role;

    // Save details to localStorage
    localStorage.setItem(`cms_${role}_name`, fullNameVal);
    localStorage.setItem(`cms_${role}_email`, emailVal);
    localStorage.setItem(`cms_${role}_phone`, phoneVal);
    localStorage.setItem(`cms_${role}_dept`, deptVal);
    localStorage.setItem(`cms_${role}_about`, aboutMe);
    localStorage.setItem(`cms_${role}_socials`, JSON.stringify(socialLinks));

    if (role === 'student') {
      localStorage.setItem(`cms_${role}_skills`, JSON.stringify(skills));

      // Update primary student profile object for consistency in dashboard
      const updatedProfile = {
        ...(studentProfile || {}),
        fullName: fullNameVal,
        email: emailVal,
        phoneNumber: phoneVal,
        department: deptVal,
      };
      localStorage.setItem('cms_student_profile', JSON.stringify(updatedProfile));
    }

    toast.success('Profile details saved successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!user) return;
    const role = user.role;

    const storedName = localStorage.getItem(`cms_${role}_name`);
    setFullNameVal(storedName || defaultName);

    const storedEmail = localStorage.getItem(`cms_${role}_email`);
    setEmailVal(storedEmail || defaultEmail);

    const storedPhone = localStorage.getItem(`cms_${role}_phone`);
    setPhoneVal(storedPhone || user?.phoneNumber || studentProfile?.phoneNumber || '9876543210');

    const storedDept = localStorage.getItem(`cms_${role}_dept`);
    setDeptVal(storedDept || defaultDept);

    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(storedAbout || '');

    const storedSocials = localStorage.getItem(`cms_${role}_socials`);
    setSocialLinks(
      storedSocials
        ? JSON.parse(storedSocials)
        : { github: '', linkedin: '', twitter: '', website: '' },
    );

    const storedSkills = localStorage.getItem(`cms_${role}_skills`);
    setSkills(
      storedSkills
        ? JSON.parse(storedSkills)
        : role === 'student'
          ? ['React', 'TypeScript', 'Node.js', 'Python']
          : [],
    );

    toast.info('Changes discarded.');
    setIsEditing(false);
  };

  const initials = fullNameVal
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')
    : 'Member';

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB')
    : '19/05/2026';

  let idLabel = 'User ID';
  let idValue = user?._id ? `#${user._id.slice(-6).toUpperCase()}` : '#3';

  if (role === 'student' || role === 'parent') {
    idLabel = 'Roll Number';
    idValue =
      user?.rollNumber || studentProfile?.rollNumber || studentProfile?.roll_number || 'N/A';
    if (role === 'parent' && idValue === 'N/A') {
      const parentChildStr = localStorage.getItem('cms_parent_child_data');
      const parentChildData = parentChildStr ? JSON.parse(parentChildStr) : null;
      idValue = parentChildData?.rollNumber || parentChildData?.roll_number || 'N/A';
    }
  } else if (
    role === 'admin' ||
    role === 'faculty' ||
    role === 'librarian' ||
    role === 'placement-officer' ||
    role === 'hostel-warden' ||
    role === 'transport-manager'
  ) {
    idLabel = 'Employee ID';
    idValue = user?.employeeId || (user?._id ? `#${user._id.slice(-6).toUpperCase()}` : '#3');
  }

  const showSkills = user?.role === 'student';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="mb-2">
        <span className="text-xs font-semibold tracking-wider text-indigo uppercase">
          {formattedRole} Settings
        </span>
        <h2 className="text-sm font-medium text-slate-500 mt-0.5">
          {getSubHeadline(user?.role || '')}
        </h2>
      </div>

      <PageHeader
        title="Settings & Profile Details"
        desc="Manage your dynamic system identities, editable profile details, social handles, and preferences."
        actions={
          isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs transition cursor-pointer font-bold text-slate-650 bg-white"
              >
                <X className="size-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-xs hover:opacity-90 transition cursor-pointer font-bold shadow-md glow-primary animate-fade-in"
              >
                <Save className="size-4" /> Save Details
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-xs hover:opacity-90 transition cursor-pointer font-bold shadow-md glow-primary"
            >
              <Pencil className="size-4" /> Edit Profile Details
            </button>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card left */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6 border border-slate-100 bg-white shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 size-28 bg-indigo-50/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-105" />
            <div className="mx-auto size-28 relative">
              <div className="size-full rounded-2xl bg-gradient-primary grid place-items-center text-white text-3xl font-bold shadow-md">
                {initials || 'US'}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block text-left">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullNameVal}
                      onChange={(e) => setFullNameVal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block text-left">
                    Department
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Department"
                      value={deptVal}
                      onChange={(e) => setDeptVal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 font-bold text-slate-800 text-base">{fullNameVal}</div>
                <div className="text-xs text-slate-400 tracking-wider uppercase font-semibold mt-1">
                  {user?.role || 'Member'} {deptVal !== 'N/A' && `· ${deptVal}`}
                </div>
              </>
            )}
          </Card>

          {/* Social Links card */}
          <Card className="p-6 border border-slate-100 bg-white shadow-sm">
            <h3 className="font-bold mb-4 text-xs tracking-wider uppercase text-slate-400">
              Social Handles
            </h3>
            {isEditing ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Github className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Twitter URL"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Website URL"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
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
                          className="flex items-center gap-2.5 text-indigo hover:opacity-90 transition"
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="text-xs hover:underline break-all">{item.value}</span>
                        </a>
                      ) : (
                        <>
                          <item.icon className="size-4 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-400 italic">Not linked</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right editable profile cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-slate-100 bg-white shadow-sm">
            <h3 className="font-bold mb-3 text-xs tracking-wider uppercase text-slate-400">
              Biography & Mandate
            </h3>
            {isEditing ? (
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-indigo-500 animate-fade-in"
              />
            ) : (
              <div className="min-h-16 py-1">
                {aboutMe ? (
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {aboutMe}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No bio provided yet. Add one to let people know who you are!
                  </p>
                )}
              </div>
            )}
          </Card>

          {showSkills && (
            <Card className="p-6 border border-slate-100 bg-white shadow-sm">
              <h3 className="font-bold mb-3 text-xs tracking-wider uppercase text-slate-400">
                Skills & Expertise
              </h3>
              {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. React, Python)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 rounded-lg bg-indigo text-white text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="size-4" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <Badge
                          key={skill}
                          tone="info"
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-500 cursor-pointer"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">No skills added yet.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 py-1">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill} tone="info" className="px-2.5 py-0.5 rounded-lg">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Account details card */}
          <Card className="p-6 border border-slate-100 bg-white shadow-sm">
            <h3 className="font-bold mb-4 text-xs tracking-wider uppercase text-slate-400">
              Account Metadata
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </label>
                {isEditing ? (
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-450" />
                    <input
                      type="email"
                      value={emailVal}
                      onChange={(e) => setEmailVal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 py-1 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-700 mt-1 truncate">{emailVal}</div>
                )}
              </div>

              {/* Phone */}
              <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contact Number
                </label>
                {isEditing ? (
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-450" />
                    <input
                      type="text"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 py-1 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-700 mt-1">{phoneVal}</div>
                )}
              </div>

              <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Joined On
                </label>
                <div className="text-xs font-bold text-slate-700 mt-1">{joinedDate}</div>
              </div>

              <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {idLabel}
                </label>
                <div className="text-xs font-bold text-slate-700 mt-1 font-mono">{idValue}</div>
              </div>

              {role === "student" && (
                <>
                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Academic Year
                    </label>
                    <div className="text-xs font-bold text-slate-700 mt-1">Year {studentProfile?.year || "N/A"}</div>
                  </div>

                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Semester
                    </label>
                    <div className="text-xs font-bold text-slate-700 mt-1">Semester {studentProfile?.semester || "N/A"}</div>
                  </div>

                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Branch / Department
                    </label>
                    <div className="text-xs font-bold text-slate-700 mt-1">{studentProfile?.department || "N/A"}</div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
