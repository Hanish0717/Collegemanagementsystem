import { useAlumni, RegistrationTab } from "../AdminAlumni";
import { useNavigate } from "@tanstack/react-router";

export function RegistrationPage() {
  const { queryClient } = useAlumni();
  const navigate = useNavigate();

  return (
    <RegistrationTab
      onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
        queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
        navigate({ to: "/dashboard/admin/alumni/directory" });
      }}
    />
  );
}
