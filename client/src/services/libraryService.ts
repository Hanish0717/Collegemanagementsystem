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

export async function returnBook(issueId: string): Promise<IssuedBookItem> {
  const { data } = await api.post<{ success: boolean; data: IssuedBookItem }>(
    `/api/library/return/${issueId}`,
  );
  return data.data;
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

