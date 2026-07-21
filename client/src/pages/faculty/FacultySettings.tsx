import { useState } from 'react';
import { X, Save, Pencil, Camera, Mail, Phone, MapPin, Award, BookOpen, Calendar, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredFacultyProfile, setStoredFacultyProfile, FacultyProfile } from '@/services/facultyProfileService';

export function FacultySettings() {
  const [profile, setProfile] = useState<FacultyProfile>(() => getStoredFacultyProfile());
  const [isEditing, setIsEditing] = useState(false);

  // Form edit states
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [officeLocation, setOfficeLocation] = useState(profile.officeLocation);
  const [researchInterests, setResearchInterests] = useState(profile.researchInterests);
  const [avatar, setAvatar] = useState(profile.avatar);

  const handleSaveProfile = () => {
    const updated: FacultyProfile = {
      ...profile,
      phone,
      email,
      officeLocation,
      researchInterests,
      avatar,
    };
    setProfile(updated);
    setStoredFacultyProfile(updated);
    toast.success('Faculty profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPhone(profile.phone);
    setEmail(profile.email);
    setOfficeLocation(profile.officeLocation);
    setResearchInterests(profile.researchInterests);
    setAvatar(profile.avatar);
    setIsEditing(false);
    toast.info('Edits discarded.');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Faculty Profile & Settings"
        desc="View and update your official academic credentials and contact information."
        actions={
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-soft"
            >
              <Pencil className="size-3.5" /> Edit Profile Contact Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="size-3.5" /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-soft"
              >
                <Save className="size-3.5" /> Save Changes
              </button>
            </div>
          )
        }
      />

      {/* Profile Header Banner */}
      <Card className="relative overflow-hidden p-6 md:p-8 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/60 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative group">
            <img
              src={avatar}
              alt={profile.name}
              className="size-28 md:size-32 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-slate-900/50 rounded-3xl flex items-center justify-center cursor-pointer">
                <Camera className="size-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge tone="purple">{profile.department}</Badge>
              <Badge tone="info">{profile.category} Faculty</Badge>
              <Badge tone="success">{profile.status}</Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Prof. {profile.name}
            </h2>

            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {profile.designation} — {profile.departmentFullName}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 font-medium">
              <span className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                <UserCheck className="size-3.5 text-indigo-500" /> ID: {profile.employeeId}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="size-3.5 text-indigo-500" /> {email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="size-3.5 text-indigo-500" /> {phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-indigo-500" /> {officeLocation}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Official Academic Details */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Award className="size-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Official Faculty Credentials</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Employee ID</span>
              <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">{profile.employeeId}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.departmentFullName} ({profile.department})</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Designation</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.designation}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="font-semibold text-purple-600">{profile.category} Staff</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Total Teaching Experience</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.experience} Years</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Date of Joining</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.joiningDate}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Highest Qualification</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">{profile.qualification}</span>
            </div>
          </div>
        </Card>

        {/* Contact & Research Settings (Editable) */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <BookOpen className="size-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Specialization & Contact Information</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Specialization</label>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                {profile.specialization}
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Research Interests</label>
              {isEditing ? (
                <textarea
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  {researchInterests}
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Official Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  {email}
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Mobile Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  {phone}
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Office Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  {officeLocation}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
