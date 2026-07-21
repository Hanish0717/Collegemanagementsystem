import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, Loader2, Search, UserCheck, Trash2 } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import {
  fetchBooks,
  issueBook,
  fetchIssuedBooks,
  deleteIssueRecord,
  type BookItem,
  type IssuedBookItem,
} from '@/services/libraryService';
import api from '@/lib/api';
import { toast } from 'sonner';

interface StudentListItem {
  _id: string;
  fullName: string;
  rollNumber: string;
  department: string;
  section?: string;
}

export function LibrarianIssueBooks() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [issuedHistory, setIssuedHistory] = useState<IssuedBookItem[]>([]);
  const [returnedHistory, setReturnedHistory] = useState<IssuedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    return fourteenDaysLater.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sections = Array.from(
    new Set(students.map((student) => student.section).filter(Boolean)),
  ) as string[];
  const tags = Array.from(new Set(books.map((book) => book.category).filter(Boolean))) as string[];

  const selectedStudentData = students.find((student) => student._id === selectedStudent);
  const selectedBookData = books.find((book) => book._id === selectedBook);

  const filteredStudents = studentSearch.trim()
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()),
      )
    : students;

  const handleStudentInputChange = (val: string) => {
    setStudentSearch(val);
    setShowStudentDropdown(true);

    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setSelectedStudent('');
      return;
    }

    const exactMatch = students.find(
      (s) => s.rollNumber.toLowerCase() === trimmed || s.fullName.toLowerCase() === trimmed,
    );
    if (exactMatch) {
      setSelectedStudent(exactMatch._id);
    } else if (selectedStudentData && `${selectedStudentData.fullName} (${selectedStudentData.rollNumber})` !== val) {
      setSelectedStudent('');
    }
  };

  const handleSelectStudent = (student: StudentListItem) => {
    setSelectedStudent(student._id);
    setStudentSearch(`${student.fullName} (${student.rollNumber})`);
    setShowStudentDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, historyData, studentsRes] = await Promise.all([
        fetchBooks({ limit: 1000 }),
        fetchIssuedBooks(),
        api.get<{ success: boolean; data: { students: StudentListItem[] } }>('/api/students', {
          params: { limit: 1000 },
        }),
      ]);
      setBooks(booksData);
      setIssuedHistory(
        historyData.filter((issue) => issue.status === 'issued' || issue.status === 'overdue'),
      );
      setReturnedHistory(historyData.filter((issue) => issue.status === 'returned'));
      setStudents(studentsRes.data.data.students);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data from live database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await issueBook({
        studentId: selectedStudent,
        bookId: selectedBook,
        dueDate,
      });
      toast.success('Book successfully issued and recorded in database!');
      setSelectedStudent('');
      setStudentSearch('');
      setSelectedBook('');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to issue book';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedStudent('');
    setStudentSearch('');
    setShowStudentDropdown(false);
    setSelectedBook('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    setDueDate(fourteenDaysLater.toISOString().split('T')[0]);
    toast.info('Issue form reset.');
  };

  const handleDeleteReturnedRecord = async (issueId: string) => {
    if (!confirm('Delete this returned record from history?')) return;
    try {
      await deleteIssueRecord(issueId);
      toast.success('Returned record deleted.');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete record');
    }
  };

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Book 📖"
        desc="Allocate books to students and track issue dates (Live Database Connected)."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Synchronizing database assets...</p>
        </div>
      ) : (
        <>
          {/* Issue Form */}
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">New Book Issue</h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Student *
                  </label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter ID or Name"
                      value={studentSearch}
                      onChange={(e) => handleStudentInputChange(e.target.value)}
                      onFocus={() => setShowStudentDropdown(true)}
                      required={!selectedStudent}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSearch('');
                          setSelectedStudent('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Suggestions dropdown list */}
                  {showStudentDropdown && filteredStudents.length > 0 && !selectedStudentData && (
                    <div className="absolute z-20 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl border bg-background shadow-xl py-1 divide-y divide-border/40">
                      {filteredStudents.map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => handleSelectStudent(s)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gradient-soft text-sm flex items-center justify-between cursor-pointer transition"
                        >
                          <div>
                            <span className="font-medium">{s.fullName}</span>
                            <span className="text-xs text-muted-foreground ml-2">({s.rollNumber})</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono bg-accent/40 px-2 py-0.5 rounded-md">
                            {s.department}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Student Details Card */}
                  {selectedStudentData && (
                    <div className="mt-3 p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <UserCheck className="size-4 text-emerald-500" />
                          Student Details Active
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent('');
                            setStudentSearch('');
                            setShowStudentDropdown(true);
                          }}
                          className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer font-medium"
                        >
                          Change Student
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-foreground">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Name</span>
                          <span className="font-medium text-sm">{selectedStudentData.fullName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">ID / Roll No</span>
                          <span className="font-medium text-sm">{selectedStudentData.rollNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Department</span>
                          <span className="font-medium">{selectedStudentData.department}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Section</span>
                          <span className="font-medium">{selectedStudentData.section || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Book *
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    required
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    <option value="">Choose book...</option>
                    {availableBooks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title} (ISBN: {b.isbn}){b.category ? ` - ${b.category}` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedBookData && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Category: {selectedBookData.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Available: {selectedBookData.availableCopies}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-gradient-soft">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    All Sections
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sections.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No section data loaded</span>
                    ) : (
                      sections.map((section) => (
                        <span
                          key={section}
                          className="px-2.5 py-1 rounded-full bg-background border text-xs"
                        >
                          {section}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-gradient-soft">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Book Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No book tags loaded</span>
                    ) : (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-background border text-xs"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Issue Date</label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={issueDate}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Due Date *</label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Issue Book
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>
          </Card>

          {/* Recently Issued & Summary */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-4">Recently Issued Books</h3>
              {issuedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No active book loans currently.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {issuedHistory.slice(0, 10).map((issue) => {
                    const studentName =
                      typeof issue.student === 'object' ? issue.student?.fullName : 'Student';
                    const roll = typeof issue.student === 'object' ? issue.student?.rollNumber : '';
                    const title = typeof issue.book === 'object' ? issue.book?.title : 'Book';
                    return (
                      <div key={issue._id} className="p-3 rounded-xl border bg-gradient-soft">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="font-medium text-sm">{title}</div>
                            <div className="text-xs text-muted-foreground">
                              {studentName} ({roll})
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone={issue.status === 'returned' ? 'success' : 'danger'}>
                              {issue.status}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => handleDeleteReturnedRecord(issue._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-[11px] font-medium cursor-pointer"
                              title="Delete this issued record"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] mb-2">
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Books taken: 1
                          </span>
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Deadline: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Section:{' '}
                            {typeof issue.student === 'object'
                              ? issue.student?.section || 'N/A'
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Issued: {new Date(issue.issueDate).toLocaleDateString()}</span>
                          <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold mb-4">Issue Summary</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Total Active Loans</div>
                  <div className="text-3xl font-bold">
                    {
                      issuedHistory.filter((i) => i.status === 'issued' || i.status === 'overdue')
                        .length
                    }
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Books currently in circulation
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Overdue Books</div>
                  <div className="text-3xl font-bold text-rose-600">
                    {issuedHistory.filter((i) => i.status === 'overdue').length}
                  </div>
                  <div className="text-xs text-rose-600 mt-1">⚠ Require follow-up</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold mb-4">Returned Records</h3>
            {returnedHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No returned records yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {returnedHistory.map((issue) => {
                  const studentName =
                    typeof issue.student === 'object' ? issue.student?.fullName : 'Student';
                  const roll = typeof issue.student === 'object' ? issue.student?.rollNumber : '';
                  const title = typeof issue.book === 'object' ? issue.book?.title : 'Book';

                  return (
                    <div key={issue._id} className="p-3 rounded-xl border bg-gradient-soft">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="font-medium text-sm">{title}</div>
                          <div className="text-xs text-muted-foreground">
                            {studentName} ({roll})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteReturnedRecord(issue._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-xs font-medium cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Delete Record
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                          Returned:{' '}
                          {issue.returnDate
                            ? new Date(issue.returnDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                          Deadline: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Issue Guidelines */}
          <Card>
            <h3 className="font-semibold mb-4">Issue Guidelines</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">📅 Standard Duration</div>
                <div className="text-xs text-muted-foreground">
                  14 days from issue date. Can be extended by 7 more days.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">💰 Fine Rate</div>
                <div className="text-xs text-muted-foreground">
                  ₹5 per day for overdue books. Maximum ₹500 per book.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">📚 Limit</div>
                <div className="text-xs text-muted-foreground">
                  Max 5 books per student at a time. No more if fines pending.
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
