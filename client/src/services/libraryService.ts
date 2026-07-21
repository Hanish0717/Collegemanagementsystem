import api from '../lib/api';

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
  status: 'issued' | 'returned' | 'overdue';
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
    '/api/library/books',
    { params },
  );
  return data.data.books;
}

export async function createBook(payload: Partial<BookItem>): Promise<BookItem> {
  const { data } = await api.post<{ success: boolean; data: BookItem }>(
    '/api/library/books',
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
    '/api/library/issue',
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
    '/api/library/issued',
    { params },
  );
  return data.data;
}

export async function fetchLibraryReport(): Promise<LibraryReportData> {
  const { data } = await api.get<{ success: boolean; data: LibraryReportData }>(
    '/api/library/report',
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
    '/api/library/ebooks',
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
    '/api/library/ebooks',
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
  urgency: 'high' | 'medium' | 'low';
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
    '/api/library/notifications',
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
    '/api/library/notifications',
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
    '/api/library/settings',
  );
  return data.data;
}

export async function updateLibrarySettings(settings: LibrarySetting[]): Promise<LibrarySetting[]> {
  const { data } = await api.put<{ success: boolean; data: LibrarySetting[] }>(
    '/api/library/settings',
    { settings },
  );
  return data.data;
}

// ==========================================
// STUDENT ID CARD MANAGEMENT API SERVICES
// ==========================================

export interface IDCardStats {
  stats: {
    totalStudents: number;
    totalIssued: number;
    pendingCards: number;
    lostCards: number;
    duplicateIssued: number;
    expiredCards: number;
    todayRequests: number;
    todayPrinted: number;
    totalAmountCollected: number;
    pendingPayments: number;
  };
  charts: {
    monthlyIssued: Array<{ month: string; count: number }>;
    pendingVsIssued: Array<{ name: string; value: number }>;
    departmentWise: Array<{ department: string; count: number }>;
    paymentCollection: Array<{ date: string; amount: number }>;
  };
}

export async function fetchIDCardStats(): Promise<IDCardStats> {
  const { data } = await api.get<{ success: boolean; data: IDCardStats }>(
    '/api/library/id-cards/stats',
  );
  return data.data;
}

export async function searchIDCardStudents(q: string): Promise<any[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>(
    '/api/library/id-cards/students/search',
    { params: { q } }
  );
  return data.data;
}

export async function fetchIDCardStudentProfile(studentId: string): Promise<any> {
  const { data } = await api.get<{ success: boolean; data: any }>(
    `/api/library/id-cards/students/${studentId}`
  );
  return data.data;
}

export async function createIDCardRequest(payload: {
  studentId: string;
  requestType: string;
  reason?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    '/api/library/id-cards/requests',
    payload
  );
  return data.data;
}

export async function approveRejectIDCardRequest(requestId: string, payload: {
  status: 'Approved' | 'Rejected';
  rejectionReason?: string;
}): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/library/id-cards/requests/${requestId}/status`,
    payload
  );
  return data.data;
}

export async function collectIDCardPayment(payload: {
  requestId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    '/api/library/id-cards/payments',
    payload
  );
  return data.data;
}

export async function reprintIDCard(payload: {
  cardId: string;
  remarks?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    '/api/library/id-cards/reprint',
    payload
  );
  return data.data;
}

export async function updateIDCardStatus(cardId: string, payload: {
  status: 'Active' | 'Blocked' | 'Lost';
  remarks?: string;
}): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/library/id-cards/cards/${cardId}/status`,
    payload
  );
  return data.data;
}

export async function reportMissingIDCard(payload: {
  studentId: string;
  cardId: string;
  remarks?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    '/api/library/id-cards/missing',
    payload
  );
  return data.data;
}

export async function fetchIDCardHistory(): Promise<any[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>(
    '/api/library/id-cards/history'
  );
  return data.data;
}

export async function fetchIDCardPaymentHistory(): Promise<any[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>(
    '/api/library/id-cards/payments/history'
  );
  return data.data;
}

export async function handoverIDCard(cardId: string): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/library/id-cards/cards/${cardId}/handover`
  );
  return data.data;
}
