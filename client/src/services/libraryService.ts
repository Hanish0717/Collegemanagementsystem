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
  categoryAnalytics: Array<{ _id: string; count: number }>;
  mostIssuedBooks: Array<{ title: string; author: string; issueCount: number }>;
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
