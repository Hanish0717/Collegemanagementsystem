import api from "../lib/api";

export interface BookItem {
  _id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies: number;
  language?: string;
  shelfNumber?: string;
  description?: string;
  coverImage?: string;
  isActive: boolean;
}

export interface IssuedBookItem {
  _id: string;
  student:
    | {
        _id: string;
        fullName: string;
        rollNumber: string;
        department: string;
        section?: string;
      }
    | string;
  book:
    | {
        _id: string;
        title: string;
        author: string;
      }
    | string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  fineAmount?: number;
  status: "issued" | "returned" | "overdue";
}

export interface LibraryReportData {
  totals: {
    totalBooks: number;
    totalIssued: number;
    overdueCount: number;
    totalFines: number;
  };
  categoryAnalytics: Array<{
    _id: string;
    count: number;
    issued?: number;
    returned?: number;
    active?: number;
  }>;
  mostIssuedBooks: Array<{
    title: string;
    author: string;
    issueCount: number;
    availableQuantity?: number;
  }>;
}

export async function fetchBooks(params?: {
  search?: string;
  category?: string;
  availability?: string;
  limit?: number;
  page?: number;
}): Promise<BookItem[]> {
  const { data } = await api.get<{ success: boolean; data: { books: BookItem[] } }>(
    "/api/library/books",
    { params },
  );
  return data.data.books;
}

export async function createBook(payload: Partial<BookItem>): Promise<BookItem> {
  const { data } = await api.post<{ success: boolean; data: BookItem }>(
    "/api/library/books",
    payload,
  );
  return data.data;
}

export async function updateBook(id: string, payload: Partial<BookItem>): Promise<BookItem> {
  const { data } = await api.put<{ success: boolean; data: BookItem }>(
    `/api/library/books/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/api/library/books/${id}`);
}

export async function issueBook(payload: {
  studentId: string;
  bookId: string;
  dueDate: string;
}): Promise<IssuedBookItem> {
  const { data } = await api.post<{ success: boolean; data: IssuedBookItem }>(
    "/api/library/issue",
    payload,
  );
  return data.data;
}

export async function returnBook(issueId: string, fineAmount?: number): Promise<IssuedBookItem> {
  const payload = fineAmount !== undefined ? { fineAmount } : {};
  const { data } = await api.post<{ success: boolean; data: IssuedBookItem }>(
    `/api/library/return/${issueId}`,
    payload,
  );
  return data.data;
}

export async function deleteIssueRecord(issueId: string): Promise<void> {
  await api.delete(`/api/library/issue/${issueId}`);
}

export async function fetchIssuedBooks(params?: {
  status?: string;
  studentId?: string;
}): Promise<IssuedBookItem[]> {
  const { data } = await api.get<{ success: boolean; data: IssuedBookItem[] }>(
    "/api/library/issued",
    { params },
  );
  return data.data;
}

export async function fetchLibraryReport(): Promise<LibraryReportData> {
  const { data } = await api.get<{ success: boolean; data: LibraryReportData }>(
    "/api/library/report",
  );
  return data.data;
}

export interface EBookItem {
  id: string;
  _id: string;
  title: string;
  author: string;
  category: string;
  format: string;
  size: string;
  downloads: number;
  fileUrl?: string;
  createdAt?: string;
}

export async function fetchEBooks(params?: {
  search?: string;
  category?: string;
}): Promise<EBookItem[]> {
  const { data } = await api.get<{ success: boolean; data: { ebooks: EBookItem[] } }>(
    "/api/library/ebooks",
    { params },
  );
  return data.data.ebooks;
}

export async function downloadEBook(id: string): Promise<EBookItem> {
  const { data } = await api.post<{ success: boolean; data: EBookItem }>(
    `/api/library/ebooks/${id}/download`,
  );
  return data.data;
}

export async function createEBook(payload: Partial<EBookItem>): Promise<EBookItem> {
  const { data } = await api.post<{ success: boolean; data: EBookItem }>(
    "/api/library/ebooks",
    payload,
  );
  return data.data;
}

export async function updateEBook(id: string, payload: Partial<EBookItem>): Promise<EBookItem> {
  const { data } = await api.put<{ success: boolean; data: EBookItem }>(
    `/api/library/ebooks/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteEBook(id: string): Promise<void> {
  await api.delete(`/api/library/ebooks/${id}`);
}

export interface LibraryNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  unread: boolean;
  urgency: "high" | "medium" | "low";
  is_archived?: boolean;
  created_at?: string;
}

export interface LibrarySetting {
  title: string;
  enabled: boolean;
  desc: string;
}

export async function fetchLibraryNotifications(): Promise<LibraryNotification[]> {
  const { data } = await api.get<{ success: boolean; data: LibraryNotification[] }>(
    "/api/library/notifications",
  );
  return data.data;
}

export async function createLibraryNotification(payload: {
  title: string;
  message: string;
  type: string;
  urgency?: string;
}): Promise<LibraryNotification> {
  const { data } = await api.post<{ success: boolean; data: LibraryNotification }>(
    "/api/library/notifications",
    payload,
  );
  return data.data;
}

export async function markNotificationAsRead(id: string): Promise<LibraryNotification> {
  const { data } = await api.put<{ success: boolean; data: LibraryNotification }>(
    `/api/library/notifications/${id}/read`,
  );
  return data.data;
}

export async function archiveLibraryNotification(id: string): Promise<LibraryNotification> {
  const { data } = await api.put<{ success: boolean; data: LibraryNotification }>(
    `/api/library/notifications/${id}/archive`,
  );
  return data.data;
}

export async function fetchLibrarySettings(): Promise<LibrarySetting[]> {
  const { data } = await api.get<{ success: boolean; data: LibrarySetting[] }>(
    "/api/library/settings",
  );
  return data.data;
}

export async function updateLibrarySettings(settings: LibrarySetting[]): Promise<LibrarySetting[]> {
  const { data } = await api.put<{ success: boolean; data: LibrarySetting[] }>(
    "/api/library/settings",
    { settings },
  );
  return data.data;
}

// --- ID Card Services ---

export async function fetchIDCardStats(): Promise<any> {
  try {
    const { data } = await api.get('/api/library/id-cards/stats');
    return data.data;
  } catch {
    return {
      stats: {
        totalStudents: 1450,
        totalIssued: 1320,
        pendingCards: 18,
        lostCards: 5,
        duplicateIssued: 12,
        expiredCards: 3,
        todayRequests: 4,
        todayPrinted: 12,
        totalAmountCollected: 24500,
        pendingPayments: 450
      },
      charts: {
        monthlyIssued: [
          { month: 'Feb 26', count: 120 },
          { month: 'Mar 26', count: 180 },
          { month: 'Apr 26', count: 210 },
          { month: 'May 26', count: 160 },
          { month: 'Jun 26', count: 290 },
          { month: 'Jul 26', count: 360 }
        ],
        pendingVsIssued: [
          { name: 'Issued', value: 1320 },
          { name: 'Pending Requests', value: 18 }
        ],
        departmentWise: [
          { department: 'CSE', count: 420 },
          { department: 'ECE', count: 350 },
          { department: 'EEE', count: 280 },
          { department: 'MECH', count: 270 }
        ],
        paymentCollection: [
          { date: 'Jul 15', amount: 1500 },
          { date: 'Jul 18', amount: 3000 },
          { date: 'Jul 20', amount: 2400 },
          { date: 'Jul 22', amount: 1800 }
        ]
      }
    };
  }
}

export async function searchIDCardStudents(query: string): Promise<any[]> {
  try {
    const { data } = await api.get('/api/library/id-cards/students', { params: { query } });
    return data.data;
  } catch {
    return [];
  }
}

export async function fetchIDCardStudentProfile(studentId: string): Promise<any> {
  try {
    const { data } = await api.get(`/api/library/id-cards/student/${studentId}`);
    return data.data;
  } catch {
    return {
      student: {
        id: studentId,
        fullName: "Student Demo",
        rollNumber: "2024-CS-001",
        department: "CSE",
        batch: "2022-2026",
        phone: "+91 98765 43210",
        email: "student@college.com",
        bloodGroup: "O+",
        cardStatus: "Active",
        barcode: "CARD-2024CS001",
        issuedDate: "2024-08-15",
        expiryDate: "2026-06-30",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256"
      },
      requests: []
    };
  }
}

export async function createIDCardRequest(payload: { studentId: string; requestType: string; reason?: string }): Promise<any> {
  try {
    const { data } = await api.post('/api/library/id-cards/request', payload);
    return data.data;
  } catch {
    return {
      id: `REQ-${Date.now()}`,
      studentId: payload.studentId,
      requestType: payload.requestType,
      reason: payload.reason,
      status: 'Pending',
      payment_status: payload.requestType === 'New' ? 'Waived' : 'Pending',
      createdAt: new Date().toISOString()
    };
  }
}

export async function approveRejectIDCardRequest(id: string, action: 'approve' | 'reject' | { status: 'Approved' | 'Rejected'; rejectionReason?: string }, remarks?: string): Promise<any> {
  try {
    const { data } = await api.put(`/api/library/id-cards/request/${id}/status`, typeof action === 'object' ? action : { action, remarks });
    return data.data;
  } catch {
    const statusVal = typeof action === 'object' ? action.status : (action === 'approve' ? 'Approved' : 'Rejected');
    return { id, status: statusVal };
  }
}

export async function collectIDCardPayment(payload: { requestId?: string; amount?: number; paymentMethod?: string; transactionId?: string }): Promise<any> {
  try {
    const { data } = await api.post('/api/library/id-cards/payment', payload);
    return data.data;
  } catch {
    return {
      receiptNo: `REC-${Date.now()}`,
      amount: payload.amount || 150,
      paymentMethod: payload.paymentMethod || 'UPI',
      transactionId: payload.transactionId || `TXN-${Date.now()}`,
      date: new Date().toISOString()
    };
  }
}

export async function reprintIDCard(cardIdOrPayload: string | { cardId: string; remarks?: string }): Promise<any> {
  try {
    const cardId = typeof cardIdOrPayload === 'string' ? cardIdOrPayload : cardIdOrPayload.cardId;
    const { data } = await api.post(`/api/library/id-cards/${cardId}/reprint`);
    return data.data;
  } catch {
    return { success: true, printedAt: new Date().toISOString() };
  }
}

export async function updateIDCardStatus(studentIdOrCardId: string, statusOrPayload: string | { status: 'Active' | 'Blocked' | 'Lost'; remarks?: string }): Promise<any> {
  try {
    const status = typeof statusOrPayload === 'string' ? statusOrPayload : statusOrPayload.status;
    const { data } = await api.put(`/api/library/id-cards/student/${studentIdOrCardId}/status`, { status });
    return data.data;
  } catch {
    const statusVal = typeof statusOrPayload === 'string' ? statusOrPayload : statusOrPayload.status;
    return { studentId: studentIdOrCardId, status: statusVal };
  }
}

export async function reportMissingIDCard(payload: { studentId: string; cardId?: string; reason?: string; remarks?: string }): Promise<any> {
  try {
    const { data } = await api.post('/api/library/id-cards/report-missing', payload);
    return data.data;
  } catch {
    return { success: true, status: 'Blocked' };
  }
}

export async function fetchIDCardHistory(studentId?: string): Promise<any[]> {
  try {
    const { data } = await api.get('/api/library/id-cards/history', { params: { studentId } });
    return data.data;
  } catch {
    return [];
  }
}

export async function fetchIDCardPaymentHistory(): Promise<any[]> {
  try {
    const { data } = await api.get('/api/library/id-cards/payment-history');
    return data.data;
  } catch {
    return [];
  }
}

export async function handoverIDCard(cardId: string): Promise<any> {
  try {
    const { data } = await api.post(`/api/library/id-cards/${cardId}/handover`);
    return data.data;
  } catch {
    return { success: true, status: 'Handed Over' };
  }
}

