import api from "@/lib/api";

export async function resolveStudentProfile() {
  const cachedProfile = localStorage.getItem("cms_student_profile");

  if (cachedProfile) {
    try {
      const parsedProfile = JSON.parse(cachedProfile);
      if (parsedProfile?.id || parsedProfile?._id) {
        return parsedProfile;
      }
    } catch {
      localStorage.removeItem("cms_student_profile");
    }
  }

  try {
    const response = await api.get("/api/student-module/dashboard");
    const profile = response.data?.data?.profile;

    if (profile) {
      localStorage.setItem("cms_student_profile", JSON.stringify(profile));
      return profile;
    }
  } catch (error) {
    console.error("Error resolving student profile:", error);
  }

  return null;
}