import api from "@/lib/api";

export interface StudentDetail {
  id: string;
  _id: string;
  fullName: string;
  rollNumber: string;
  department: string;
  semester: number;
  section: string;
}

export interface FeeRecord {
  id: string;
  _id: string;
  student: string | StudentDetail;
  academicYear: string;
  semester: number;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  paymentStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeesPagination {
  totalFees: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface FeesListResponse {
  fees: FeeRecord[];
  pagination: FeesPagination;
}

export interface FeesReportTotals {
  totalRevenue: number;
  collectedFees: number;
  pendingFees: number;
  overdueFees: number;
}

export interface MonthlyAnalyticsItem {
  month: string;
  enrolled: number;
  attendance: number;
  fees: number;
}

export interface DueCounts {
  "Tuition Fee": number;
  "Hostel Fee": number;
  "Lab Fee": number;
}

export interface FeesReportData {
  totals: FeesReportTotals;
  departmentWise: Array<{
    department: string;
    total: number;
    collected: number;
    pending: number;
  }>;
  feeTypeWise: Array<{
    feeType: string;
    total: number;
    collected: number;
    pending: number;
  }>;
  monthlyAnalytics: MonthlyAnalyticsItem[];
  dueCounts: DueCounts;
}

export interface PayFeePayload {
  payAmount: number;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
}

// Fetch all fee records with parameters
export async function fetchFees(params: {
  search?: string;
  status?: string;
  feeType?: string;
  page?: number;
  limit?: number;
}): Promise<FeesListResponse> {
  const { data } = await api.get<{ success: boolean; data: FeesListResponse }>(
    "/api/fees",
    { params }
  );
  return data.data;
}

// Fetch general fees report
export async function fetchFeesReport(): Promise<FeesReportData> {
  const { data } = await api.get<{ success: boolean; data: FeesReportData }>(
    "/api/fees/report"
  );
  return data.data;
}

// Fetch student specific fees
export async function fetchStudentFees(studentId: string): Promise<FeeRecord[]> {
  const { data } = await api.get<{ success: boolean; data: FeeRecord[] }>(
    `/api/fees/student/${studentId}`
  );
  return data.data;
}

// Process record payment
export async function recordFeePayment(
  feeId: string,
  payload: PayFeePayload
): Promise<FeeRecord> {
  const { data } = await api.post<{ success: boolean; data: FeeRecord }>(
    `/api/fees/pay/${feeId}`,
    payload
  );
  return data.data;
}

// Send fee reminder to students
export async function sendFeeReminder(feeType: string): Promise<{ message: string; count: number }> {
  const { data } = await api.post<{ success: boolean; message: string; count: number }>(
    "/api/fees/remind",
    { feeType }
  );
  return { message: data.message, count: data.count };
}

// Create a new fee record
export async function createFee(payload: {
  student: string;
  academicYear: string;
  semester: number;
  feeType: string;
  totalAmount: number;
  dueDate: string;
  remarks?: string;
}): Promise<FeeRecord> {
  const { data } = await api.post<{ success: boolean; data: FeeRecord }>(
    "/api/fees",
    payload
  );
  return data.data;
}
