import type { StudentPlacementDossier } from "./placementService";

export function exportDossierCSV(dossier: StudentPlacementDossier) {
  const rows = [
    ["Student Dossier Report", dossier.studentName, dossier.studentId],
    ["Department", dossier.department],
    ["CGPA", dossier.cgpa.toString()],
    ["Career Status", dossier.careerStatus],
    ["Current Company", dossier.currentPlacement?.company || "N/A"],
    ["Package CTC", dossier.currentPlacement?.package || "N/A"],
    [],
    ["--- Application History ---"],
    ["Company", "Role", "Applied Date", "Status", "CTC"],
    ...dossier.applicationHistory.map((a) => [a.company, a.role, a.appliedDate, a.status, a.ctc]),
    [],
    ["--- Offer History ---"],
    ["Company", "Role", "Package", "Joining Date", "Status"],
    ...dossier.offerHistory.map((o) => [o.company, o.role, o.package, o.joiningDate, o.status]),
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Placement_Dossier_${dossier.studentId}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printDossierReport() {
  window.print();
}
