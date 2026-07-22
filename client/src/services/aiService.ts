import api from "../lib/api";

export interface ChatResponse {
  response: string;
  conversationId: string | null;
  ui?: { type: string; data: any } | null;
  suggestedFollowups?: string[];
}

export interface PerformanceResponse {
  prediction: string;
  gpaTrend: Array<{ sem: number; gpa: number }>;
}

export interface AttendanceRiskResponse {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  percentage: number;
  analysis: string;
}

export interface StudentRiskResponse {
  riskScore: number;
  details: string;
}

export interface ReportSummaryResponse {
  summary: string;
}

export async function sendChatMessage(
  message: string,
  conversationId?: string | null,
): Promise<ChatResponse> {
  const { data } = await api.post<{ success: boolean; data: ChatResponse }>("/api/ai/chat", {
    message,
    conversationId,
  });
  return data.data;
}

export async function getPerformancePrediction(): Promise<PerformanceResponse> {
  const { data } = await api.post<{ success: boolean; data: PerformanceResponse }>("/api/ai/performance");
  return data.data;
}

export async function getAttendanceRiskAnalysis(): Promise<AttendanceRiskResponse> {
  const { data } = await api.post<{ success: boolean; data: AttendanceRiskResponse }>("/api/ai/attendance-risk");
  return data.data;
}

export async function getStudentRiskAnalysis(targetStudentId: string): Promise<StudentRiskResponse> {
  const { data } = await api.post<{ success: boolean; data: StudentRiskResponse }>("/api/ai/student-risk", { targetStudentId });
  return data.data;
}

export async function getReportSummary(reportType: string): Promise<ReportSummaryResponse> {
  const { data } = await api.post<{ success: boolean; data: ReportSummaryResponse }>("/api/ai/report-summary", { reportType });
  return data.data;
}
