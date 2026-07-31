import { useState, useEffect, useRef } from "react";
import {
  Search,
  FileText,
  Download,
  Eye,
  Plus,
  Trash2,
  Mic,
  MicOff,
  SlidersHorizontal,
  BookOpen,
  Heart,
  Bookmark,
  Share2,
  AlertTriangle,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  Moon,
  Sun,
  Printer,
  Sparkles,
  Send,
  Bell,
  Trash,
  Edit,
  RefreshCw,
  BarChart2,
  List,
  Grid,
  Check,
  X,
  FileUp,
  DownloadCloud,
  CheckCircle,
  ChevronRight,
  BookMarked,
  Clock,
  History,
  FileSpreadsheet,
  HelpCircle,
  Volume2,
  Settings
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEBooks, downloadEBook, createEBook, deleteEBook, updateEBook, EBookItem } from "@/services/libraryService";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveRole } from "@/lib/roles";

// Extends EBookItem for UI enrichment
interface RichBook extends EBookItem {
  rating: number;
  ratingCount: number;
  department: string;
  subject: string;
  semester: string;
  isbn: string;
  pages: number;
  language: string;
  description: string;
  uploadDate: string;
  keywords: string[];
  reviews: { id: string; studentName: string; rating: number; comment: string; date: string }[];
  featured?: boolean;
  free?: boolean;
}

// Simulated book pages content for the PDF Reader
const BOOK_PAGES_CONTENT: Record<string, string[]> = {
  default: [
    "Cover Page - Document Title & Author. Digital Edition, Campus Library System.",
    "Table of Contents - Chapter 1: Introduction, Chapter 2: Theoretical Background, Chapter 3: Methodology, Chapter 4: Case Study, Chapter 5: Conclusion & Reference Index.",
    "Chapter 1: Overview - This document outlines the fundamental principles and concepts. It aims to serve as a guide for engineering and business students in their academic coursework.",
    "Section 1.2: Importance of Structured Learning - Studies show that structured learning paths improve student retention by 35%. Academic library digital systems help streamline textbook access.",
    "Chapter 2: Core Concepts - Explaining the technical model, parameters, and theoretical background of the subject. Formulas and methodologies should be cross-referenced with practical labs.",
    "Chapter 3: Methodology & Operations - Detailing step-by-step execution. Refer to figure 3.1 for system architecture flow. Data collections were gathered across five departments.",
    "Chapter 4: Practical Applications & Case Study - Empirical analysis of current trends in universities showing high digital adoption rates. Success criteria depend on accessibility of resources.",
    "Chapter 5: Summary & Best Practices - In conclusion, maintaining continuous study records and accessing top-rated references remains key. Bibliography references are listed in the appendix."
  ],
  algorithms: [
    "Introduction to Algorithms - 4th Edition. Cormen, Leiserson, Rivest, Stein. MIT Press.",
    "Brief Contents: 1. Foundations, 2. Sorting and Order Statistics, 3. Data Structures, 4. Advanced Design and Analysis Techniques, 5. Graph Algorithms, 6. Selected Topics.",
    "Chapter 1: The Role of Algorithms in Computing - An algorithm is any well-defined computational procedure that takes some value as input and produces some value as output.",
    "Section 2.1: Insertion Sort - A simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than quicksort or heapsort.",
    "Section 3.2: Big-O Notation - Describes the limiting behavior of a function when the argument tends towards a particular value or infinity. Used to classify algorithms by run-time complexity.",
    "Chapter 12: Binary Search Trees - A node-based binary tree data structure which has the properties: left subtree contains nodes with keys less than parent; right subtree contains keys greater.",
    "Chapter 22: Elementary Graph Algorithms - Graph representation using adjacency lists or matrices. Breadth-First Search (BFS) and Depth-First Search (DFS) are fundamental traversal methods.",
    "Chapter 34: NP-Completeness - Class of decision problems for which no efficient solution is known, but if a solution is provided, it can be verified in polynomial time."
  ],
  networks: [
    "Computer Networking: A Top-Down Approach. Kurose & Ross. Pearson Education.",
    "Table of Contents: 1. Computer Networks and the Internet, 2. Application Layer, 3. Transport Layer, 4. Network Layer, 5. Link Layer, 6. Wireless and Mobile Networks.",
    "Chapter 1: What is the Internet? - A global computer network providing a variety of information and communication facilities, consisting of interconnected networks using standardized communication protocols.",
    "Section 2.2: The Web and HTTP - Hypertext Transfer Protocol is the foundation of data communication for the World Wide Web. It is a stateless request-response protocol running over TCP.",
    "Section 3.4: Principles of Congestion Control - Congestion occurs when too many packets are sent into the network, causing buffers to overflow and packet drops. TCP handles this via slow start and congestion avoidance.",
    "Chapter 4: The Network Layer - Responsible for packet forwarding and routing. IP addressing (IPv4 and IPv6) uniquely identifies nodes, and routing algorithms like OSPF and BGP build forwarding tables.",
    "Chapter 5: The Link Layer & Ethernet - Deals with node-to-node communication. MAC addresses identify interfaces, and Ethernet uses CSMA/CD to manage channel access in shared mediums.",
    "Chapter 8: Network Security - Security goals: Confidentiality, Integrity, Authentication, and Operational security. Cryptographic primitives like RSA, AES, and SSL/TLS secure network channels."
  ]
};

// Mock Books Database (merged with fetched books)
const MOCK_BOOKS: RichBook[] = [
  {
    id: "mb-1",
    _id: "mb-1",
    title: "Introduction to Algorithms (4th Edition)",
    author: "Thomas H. Cormen",
    category: "Computer Science",
    format: "PDF",
    size: "12.4 MB",
    downloads: 1240,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.8,
    ratingCount: 185,
    department: "CSE",
    subject: "Data Structures & Algorithms",
    semester: "Sem 3",
    isbn: "9780262046304",
    pages: 1312,
    language: "English",
    description: "The bible of algorithms. Detailed, comprehensive guide to analysis, design, and implementation of algorithms with pseudo-code examples.",
    uploadDate: "2026-01-10",
    keywords: ["algorithms", "sorting", "graphs", "dynamic programming", "data structures"],
    featured: true,
    free: true,
    reviews: [
      { id: "r1", studentName: "Rahul Kumar", rating: 5, comment: "Absolutely essential for engineering interviews.", date: "2026-05-12" },
      { id: "r2", studentName: "Neha Gupta", rating: 4, comment: "Very detailed, sometimes a bit mathematically heavy.", date: "2026-06-01" }
    ]
  },
  {
    id: "mb-2",
    _id: "mb-2",
    title: "Computer Networking: A Top-Down Approach",
    author: "James Kurose",
    category: "Computer Science",
    format: "PDF",
    size: "8.7 MB",
    downloads: 850,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.6,
    ratingCount: 124,
    department: "CSE",
    subject: "Computer Networks",
    semester: "Sem 5",
    isbn: "9780133594140",
    pages: 864,
    language: "English",
    description: "A top-down approach focusing on the application layer first. Great explanations of TCP/IP, routing, and sockets programming.",
    uploadDate: "2026-02-15",
    keywords: ["networking", "tcp/ip", "http", "routing", "security", "dns"],
    featured: true,
    free: true,
    reviews: [
      { id: "r3", studentName: "Vikram Sen", rating: 5, comment: "Best explanation of TCP handshake I've ever read.", date: "2026-05-20" }
    ]
  },
  {
    id: "mb-3",
    _id: "mb-3",
    title: "Database System Concepts (7th Edition)",
    author: "Abraham Silberschatz",
    category: "Computer Science",
    format: "PDF",
    size: "15.2 MB",
    downloads: 920,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.5,
    ratingCount: 98,
    department: "CSE",
    subject: "Database Management Systems",
    semester: "Sem 4",
    isbn: "9780073523323",
    pages: 1376,
    language: "English",
    description: "Covers all key aspects of relational database systems including SQL, indexing, transaction management, and query optimization.",
    uploadDate: "2026-03-01",
    keywords: ["databases", "sql", "transactions", "indexing", "nosql"],
    featured: false,
    free: true,
    reviews: []
  },
  {
    id: "mb-4",
    _id: "mb-4",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell",
    category: "Computer Science",
    format: "PDF",
    size: "22.1 MB",
    downloads: 1100,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.7,
    ratingCount: 145,
    department: "CSE",
    subject: "Artificial Intelligence",
    semester: "Sem 7",
    isbn: "9780136086208",
    pages: 1152,
    language: "English",
    description: "The standard textbook for AI courses. Covers search, machine learning, logic, neural networks, and robotics.",
    uploadDate: "2026-01-20",
    keywords: ["ai", "machine learning", "heuristics", "deep learning", "neural networks"],
    featured: true,
    free: false,
    reviews: []
  },
  {
    id: "mb-5",
    _id: "mb-5",
    title: "Principles of Electromagnetics",
    author: "Matthew N.O. Sadiku",
    category: "Science",
    format: "PDF",
    size: "18.3 MB",
    downloads: 450,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.3,
    ratingCount: 52,
    department: "ECE",
    subject: "Electromagnetic Fields",
    semester: "Sem 4",
    isbn: "9780199461851",
    pages: 850,
    language: "English",
    description: "Focuses on static and time-varying electromagnetic fields, waves, and transmission lines for ECE students.",
    uploadDate: "2026-04-12",
    keywords: ["electromagnetics", "maxwell equations", "waves", "transmission lines"],
    featured: false,
    free: true,
    reviews: []
  },
  {
    id: "mb-6",
    _id: "mb-6",
    title: "Signals and Systems (2nd Edition)",
    author: "Alan V. Oppenheim",
    category: "Mathematics",
    format: "PDF",
    size: "11.2 MB",
    downloads: 620,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.4,
    ratingCount: 76,
    department: "ECE",
    subject: "Signals & Systems",
    semester: "Sem 3",
    isbn: "9780138147570",
    pages: 950,
    language: "English",
    description: "A textbook on mathematical modeling of signals and physical systems, transform domains (Fourier, Laplace, Z-transforms).",
    uploadDate: "2025-11-30",
    keywords: ["signals", "fourier", "laplace", "transforms", "systems"],
    featured: false,
    free: true,
    reviews: []
  },
  {
    id: "mb-7",
    _id: "mb-7",
    title: "Financial Management: Theory & Practice",
    author: "Eugene F. Brigham",
    category: "Business",
    format: "PDF",
    size: "14.1 MB",
    downloads: 380,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.2,
    ratingCount: 41,
    department: "Business",
    subject: "Financial Analysis",
    semester: "Sem 2",
    isbn: "9781305632295",
    pages: 1216,
    language: "English",
    description: "An in-depth guide to corporate finance concepts, asset valuations, and capital budgeting for MBA candidates.",
    uploadDate: "2026-03-25",
    keywords: ["finance", "valuation", "capital", "stocks", "assets"],
    featured: false,
    free: false,
    reviews: []
  },
  {
    id: "mb-8",
    _id: "mb-8",
    title: "Thomas' Calculus (14th Edition)",
    author: "George B. Thomas",
    category: "Mathematics",
    format: "PDF",
    size: "28.5 MB",
    downloads: 1540,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.7,
    ratingCount: 210,
    department: "Basic Sciences",
    subject: "Engineering Mathematics",
    semester: "Sem 1",
    isbn: "9780321878960",
    pages: 1184,
    language: "English",
    description: "Fundamental calculus training. Covers single-variable and multi-variable integration, differentiation, and infinite series.",
    uploadDate: "2025-08-15",
    keywords: ["calculus", "limits", "derivatives", "integrals", "vectors"],
    featured: true,
    free: true,
    reviews: []
  },
  {
    id: "mb-9",
    _id: "mb-9",
    title: "Concepts of Modern Physics",
    author: "Arthur Beiser",
    category: "Science",
    format: "PDF",
    size: "9.6 MB",
    downloads: 780,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rating: 4.5,
    ratingCount: 88,
    department: "Basic Sciences",
    subject: "Engineering Physics",
    semester: "Sem 1",
    isbn: "9780070495531",
    pages: 640,
    language: "English",
    description: "Clear and accessible introduction to relativity, quantum theory, atomic and solid-state physics.",
    uploadDate: "2025-09-10",
    keywords: ["physics", "relativity", "quantum", "atoms", "solid-state"],
    featured: false,
    free: true,
    reviews: []
  }
];

export function LibrarianDigital() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentRole = getActiveRole();
  const isAdmin = ["librarian", "admin", "super_admin"].includes(currentRole.id) || (typeof window !== "undefined" && window.location.pathname.includes("/librarian"));

  // Tabs navigation inside the Digital Library
  const [activeTab, setActiveTab] = useState<"catalog" | "my-library" | "analytics" | "notifications" | "admin">("catalog");

  // Layout View: Grid or List
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [searchCriteria, setSearchCriteria] = useState({
    title: true,
    author: true,
    subject: true,
    department: true,
    semester: true,
    isbn: true,
    keywords: true
  });
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("library_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [aiSemanticSearch, setAiSemanticSearch] = useState(false);
  const [isAiSearchingState, setIsAiSearchingState] = useState(false);

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Advanced Filters (Drawer) States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterDept, setFilterDept] = useState("All");
  const [filterSem, setFilterSem] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterLanguage, setFilterLanguage] = useState("All");
  const [filterFileType, setFilterFileType] = useState("All");
  const [filterFileSize, setFilterFileSize] = useState("All");
  const [filterToggles, setFilterToggles] = useState({
    recentlyAdded: false,
    mostDownloaded: false,
    highestRated: false,
    freeResources: false,
    featuredBooks: false,
    availableOffline: false
  });

  // Selected book for details modal / reader
  const [selectedBook, setSelectedBook] = useState<RichBook | null>(null);
  const [activeReaderBook, setActiveReaderBook] = useState<RichBook | null>(null);

  // Online PDF Reader States
  const [readerZoom, setReaderZoom] = useState(100);
  const [readerPage, setReaderPage] = useState(1);
  const [readerNightMode, setReaderNightMode] = useState<"light" | "dark" | "sepia">("light");
  const [readerBookmarks, setReaderBookmarks] = useState<number[]>([]);
  const [readerNotes, setReaderNotes] = useState<Record<number, string>>({});
  const [readerNoteInput, setReaderNoteInput] = useState("");
  const [readerSearchTerm, setReaderSearchTerm] = useState("");
  const [readerHighlights, setReaderHighlights] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reading Timer (tracks seconds read)
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [activeReadingTime, setActiveReadingTime] = useState(0);

  // AI Assistant states
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: "user" | "ai"; text: string; id: string }[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // My Library states
  const [myFavorites, setMyFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("library_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [myBookmarks, setMyBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("library_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [myDownloads, setMyDownloads] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("library_downloads");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [readingHistory, setReadingHistory] = useState<{ id: string; bookId: string; bookTitle: string; date: string; timeSpent: number; progress: number }[]>(() => {
    try {
      const saved = localStorage.getItem("library_reading_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [continueReading, setContinueReading] = useState<Record<string, { page: number; progress: number; lastRead: string }>>(() => {
    try {
      const saved = localStorage.getItem("library_continue_reading");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Admin and Upload States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localAddedBooks, setLocalAddedBooks] = useState<RichBook[]>(() => {
    try {
      const saved = localStorage.getItem("library_local_added_books");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("library_local_added_books", JSON.stringify(localAddedBooks));
  }, [localAddedBooks]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [adminEditingBookId, setAdminEditingBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [format, setFormat] = useState("PDF");
  const [size, setSize] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminPages, setAdminPages] = useState("350");
  const [adminIsbn, setAdminIsbn] = useState("");
  const [adminDept, setAdminDept] = useState("CSE");
  const [adminSem, setAdminSem] = useState("Sem 1");
  const [adminSubject, setAdminSubject] = useState("General");
  const [adminKeywords, setAdminKeywords] = useState("");

  // Bulk Upload states
  const [bulkFiles, setBulkFiles] = useState<{ name: string; size: string; progress: number; status: "pending" | "uploading" | "done" }[]>([]);

  // Pending Uploads Approval Queue
  const [pendingUploads, setPendingUploads] = useState<RichBook[]>([
    {
      id: "pending-1",
      _id: "pending-1",
      title: "Design Patterns in C++",
      author: "Erich Gamma",
      category: "Computer Science",
      format: "PDF",
      size: "6.8 MB",
      downloads: 0,
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      rating: 4.5,
      ratingCount: 0,
      department: "CSE",
      subject: "Object Oriented Design",
      semester: "Sem 4",
      isbn: "9780201633610",
      pages: 416,
      language: "English",
      description: "A textbook introducing patterns of design for object-oriented programming.",
      uploadDate: "2026-07-15",
      keywords: ["C++", "design patterns", "OOP"],
      reviews: []
    }
  ]);

  // Bulk downloads Selection
  const [selectedBulkDownloadIds, setSelectedBulkDownloadIds] = useState<string[]>([]);

  // Reviews entry
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts if typing in input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        const searchInput = document.getElementById("main-library-search");
        if (searchInput) searchInput.focus();
      } else if (e.key === "Escape") {
        setIsFilterDrawerOpen(false);
        setSelectedBook(null);
        setActiveReaderBook(null);
      } else if (e.key === "m" || e.key === "M") {
        if (activeReaderBook) {
          setReaderNightMode(prev => prev === "light" ? "dark" : prev === "dark" ? "sepia" : "light");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReaderBook]);

  // Active Timer for Reading History tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeReaderBook) {
      interval = setInterval(() => {
        setReadingSeconds(prev => prev + 1);
        setActiveReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeReaderBook]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("library_favorites", JSON.stringify(myFavorites));
  }, [myFavorites]);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("library_bookmarks", JSON.stringify(myBookmarks));
  }, [myBookmarks]);

  // Save downloads to localStorage
  useEffect(() => {
    localStorage.setItem("library_downloads", JSON.stringify(myDownloads));
  }, [myDownloads]);

  // Save reading progress to localStorage
  useEffect(() => {
    localStorage.setItem("library_continue_reading", JSON.stringify(continueReading));
  }, [continueReading]);

  // Save reading history
  useEffect(() => {
    localStorage.setItem("library_reading_history", JSON.stringify(readingHistory));
  }, [readingHistory]);

  // Fetch ebooks from backend
  const { data: dbEbooks = [], isLoading } = useQuery({
    queryKey: ["ebooks", searchVal, selectedCategory],
    queryFn: () =>
      fetchEBooks({
        search: searchVal || undefined,
        category: selectedCategory === "All" ? undefined : selectedCategory,
      }),
  });

  // Enrich fetched books with extra properties
  const enrichedEBooks: RichBook[] = dbEbooks.map((b, idx) => {
    // Generate deterministic values based on book ID/Title
    const hash = b.title.length + idx;
    const rating = parseFloat((4.0 + (hash % 10) / 10).toFixed(1));
    const ratingCount = 10 + (hash * 3) % 150;
    const pages = 150 + (hash * 12) % 600;
    const isbns = ["978013", "978007", "978026", "978130"];
    const isbn = isbns[hash % 4] + String(1000000 + (hash * 97) % 8999999);
    const sem = `Sem ${(hash % 8) + 1}`;
    const depts = ["CSE", "ECE", "EEE", "ME", "Civil", "Basic Sciences"];
    const dept = depts[hash % 6];
    const languages = ["English", "Spanish", "German", "French"];
    const lang = languages[hash % 4];

    return {
      ...b,
      rating,
      ratingCount,
      department: dept,
      subject: b.category + " Concepts",
      semester: sem,
      isbn,
      pages,
      language: lang,
      description: b.title + " is a comprehensive educational resource designed for technical fields. This ebook provides detailed explanations, practical code/mathematical walkthroughs, and visual aids to help students digest concepts quickly.",
      uploadDate: b.createdAt ? b.createdAt.split("T")[0] : "2026-04-10",
      keywords: [b.category.toLowerCase(), "study guide", "reference"],
      reviews: [
        { id: `r-${hash}`, studentName: "Student " + (hash % 10 + 1), rating: Math.round(rating), comment: "Very helpful for semester preparation.", date: "2026-07-01" }
      ]
    };
  });

  // Merge database enriched books with local mock catalog
  const catalogBooks = [
    ...localAddedBooks,
    ...enrichedEBooks,
    ...MOCK_BOOKS.filter(mb => 
      !enrichedEBooks.some(eb => eb.title.toLowerCase() === mb.title.toLowerCase()) &&
      !localAddedBooks.some(lab => lab.title.toLowerCase() === mb.title.toLowerCase())
    )
  ];

  // Infinite Scroll simulator
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm, selectedCategory, filterCategory, filterDept, filterSem, filterFileSize, filterFileType]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      if (visibleCount < filteredBooks.length) {
        setIsAiSearchingState(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 3);
          setIsAiSearchingState(false);
        }, 600);
      }
    }
  };

  // Search input typing handler + suggestions
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);

    // Compute simple autocomplete suggestions
    if (!val) {
      setSearchSuggestions([]);
      return;
    }
    const query = val.toLowerCase();
    const suggestionsSet = new Set<string>();

    catalogBooks.forEach(b => {
      if (b.title.toLowerCase().includes(query)) suggestionsSet.add(b.title);
      if (b.author.toLowerCase().includes(query)) suggestionsSet.add(b.author);
      if (b.category.toLowerCase().includes(query)) suggestionsSet.add(b.category);
    });

    setSearchSuggestions(Array.from(suggestionsSet).slice(0, 5));
  };

  const executeSearch = (query: string) => {
    setSearchVal(query);
    if (query && !recentSearches.includes(query)) {
      const list = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(list);
      localStorage.setItem("library_recent_searches", JSON.stringify(list));
    }
    setSearchSuggestions([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiSemanticSearch) {
      setIsAiSearchingState(true);
      setTimeout(() => {
        executeSearch(searchTerm);
        setIsAiSearchingState(false);
        toast.success("AI Semantic search completed using embeddings simulation.");
      }, 1200);
    } else {
      executeSearch(searchTerm);
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support Voice Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceSearching(true);
      toast.info("Listening for ebook title or author...");
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsVoiceSearching(false);
      toast.error("Voice search failed or was blocked.");
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      executeSearch(transcript);
      toast.success(`Searching for: "${transcript}"`);
    };

    recognition.start();
  };

  // Clear search filters
  const resetFilters = () => {
    setFilterDept("All");
    setFilterSem("All");
    setFilterSubject("All");
    setFilterCategory("All");
    setFilterYear("All");
    setFilterLanguage("All");
    setFilterFileType("All");
    setFilterFileSize("All");
    setFilterToggles({
      recentlyAdded: false,
      mostDownloaded: false,
      highestRated: false,
      freeResources: false,
      featuredBooks: false,
      availableOffline: false
    });
    setSelectedCategory("All");
    setSearchTerm("");
    setSearchVal("");
    toast.success("Filters reset successfully.");
  };

  // Main Filtering Logic
  const filteredBooks = catalogBooks.filter(book => {
    // 1. Search term query matching criteria
    if (searchVal) {
      const term = searchVal.toLowerCase();
      let match = false;

      if (searchCriteria.title && book.title.toLowerCase().includes(term)) match = true;
      if (searchCriteria.author && book.author.toLowerCase().includes(term)) match = true;
      if (searchCriteria.subject && book.subject.toLowerCase().includes(term)) match = true;
      if (searchCriteria.department && book.department.toLowerCase().includes(term)) match = true;
      if (searchCriteria.semester && book.semester.toLowerCase().includes(term)) match = true;
      if (searchCriteria.isbn && book.isbn.toLowerCase().includes(term)) match = true;
      if (searchCriteria.keywords && book.keywords.some(k => k.toLowerCase().includes(term))) match = true;

      // Simple AI semantic search fallback matches description too
      if (aiSemanticSearch && book.description.toLowerCase().includes(term)) match = true;

      if (!match) return false;
    }

    // 2. Category Buttons Filter
    if (selectedCategory !== "All" && book.category !== selectedCategory) return false;

    // 3. Advanced Drawer Filters
    if (filterDept !== "All" && book.department !== filterDept) return false;
    if (filterSem !== "All" && book.semester !== filterSem) return false;
    if (filterCategory !== "All" && book.category !== filterCategory) return false;
    if (filterLanguage !== "All" && book.language !== filterLanguage) return false;
    if (filterFileType !== "All" && book.format !== filterFileType) return false;

    if (filterFileSize !== "All") {
      const sizeMb = parseFloat(book.size);
      if (filterFileSize === "<5MB" && sizeMb >= 5) return false;
      if (filterFileSize === "5-20MB" && (sizeMb < 5 || sizeMb > 20)) return false;
      if (filterFileSize === "20-50MB" && (sizeMb < 20 || sizeMb > 50)) return false;
      if (filterFileSize === ">50MB" && sizeMb <= 50) return false;
    }

    // 4. Quick Toggles
    if (filterToggles.recentlyAdded) {
      // Mock condition: uploaded in 2026
      if (!book.uploadDate.startsWith("2026")) return false;
    }
    if (filterToggles.mostDownloaded && book.downloads < 700) return false;
    if (filterToggles.highestRated && book.rating < 4.5) return false;
    if (filterToggles.freeResources && book.free === false) return false;
    if (filterToggles.featuredBooks && !book.featured) return false;
    if (filterToggles.availableOffline && book.format !== "PDF") return false;

    return true;
  });

  // Mutate endpoints triggers
  const downloadMutation = useMutation({
    mutationFn: (bookId: string) => downloadEBook(bookId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      queryClient.invalidateQueries({ queryKey: ["allEbooks"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (payload: any) => createEBook(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      queryClient.invalidateQueries({ queryKey: ["allEbooks"] });
      
      const newId = data?.id || data?._id || `local-${Date.now()}`;
      const enrichedNewBook: RichBook = {
        id: newId,
        _id: newId,
        title: variables.title,
        author: variables.author,
        category: variables.category,
        format: variables.format || "PDF",
        size: variables.size,
        downloads: 0,
        fileUrl: variables.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        rating: 4.8,
        ratingCount: 1,
        department: adminDept || "CSE",
        subject: adminSubject || "General",
        semester: adminSem || "Sem 1",
        isbn: adminIsbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        pages: Number(adminPages) || 350,
        language: "English",
        description: adminDescription || "Custom uploaded library ebook.",
        uploadDate: new Date().toISOString().split("T")[0],
        keywords: adminKeywords ? adminKeywords.split(",").map(k => k.trim()) : ["custom", "resource"],
        reviews: []
      };

      setLocalAddedBooks(prev => [enrichedNewBook, ...prev]);
      toast.success("Digital resource cataloged successfully!");
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err, variables) => {
      // Offline fallback: save locally so it works even if server is down!
      const newId = `local-${Date.now()}`;
      const enrichedNewBook: RichBook = {
        id: newId,
        _id: newId,
        title: variables.title,
        author: variables.author,
        category: variables.category,
        format: variables.format || "PDF",
        size: variables.size,
        downloads: 0,
        fileUrl: variables.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        rating: 4.8,
        ratingCount: 1,
        department: adminDept || "CSE",
        subject: adminSubject || "General",
        semester: adminSem || "Sem 1",
        isbn: adminIsbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        pages: Number(adminPages) || 350,
        language: "English",
        description: adminDescription || "Custom uploaded library ebook.",
        uploadDate: new Date().toISOString().split("T")[0],
        keywords: adminKeywords ? adminKeywords.split(",").map(k => k.trim()) : ["custom", "resource"],
        reviews: []
      };

      setLocalAddedBooks(prev => [enrichedNewBook, ...prev]);
      toast.success("Digital resource saved locally.");
      setIsAddModalOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateEBook(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      queryClient.invalidateQueries({ queryKey: ["allEbooks"] });
      
      setLocalAddedBooks(prev => 
        prev.map(book => book.id === variables.id ? { ...book, ...data } : book)
      );
      toast.success("EBook details updated successfully!");
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: (err, variables) => {
      // Local fallback edit
      setLocalAddedBooks(prev => 
        prev.map(book => 
          book.id === variables.id 
            ? {
                ...book,
                title: variables.payload.title,
                author: variables.payload.author,
                category: variables.payload.category,
                format: variables.payload.format,
                size: variables.payload.size,
                fileUrl: variables.payload.fileUrl
              }
            : book
        )
      );
      toast.success("EBook details updated locally.");
      setIsEditModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEBook(id),
    onSuccess: (data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      queryClient.invalidateQueries({ queryKey: ["allEbooks"] });
      setLocalAddedBooks(prev => prev.filter(x => x.id !== deletedId));
      toast.success("Digital resource deleted successfully.");
    },
    onError: (err, deletedId) => {
      setLocalAddedBooks(prev => prev.filter(x => x.id !== deletedId));
      toast.success("Digital resource deleted locally.");
    }
  });

  // Download Trigger
  const handleDownload = (bookId: string, bookTitle: string, fileUrlStr?: string) => {
    toast.loading(`Preparing files for "${bookTitle}"...`);

    downloadMutation.mutate(bookId, {
      onSuccess: () => {
        toast.dismiss();
        toast.success(`Successfully downloaded "${bookTitle}"!`);

        // Record download history
        if (!myDownloads.includes(bookId)) {
          setMyDownloads(prev => [...prev, bookId]);
        }

        // Open download link in new window
        const urlToOpen = fileUrlStr || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        window.open(urlToOpen, "_blank");
      },
      onError: (err) => {
        toast.dismiss();
        toast.error("Could not register download logs. Proceeding anyway.");
        window.open(fileUrlStr || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
      },
    });
  };

  // Bulk Download simulation
  const handleBulkDownload = () => {
    if (selectedBulkDownloadIds.length === 0) {
      toast.info("Please select resources by toggling checkmarks first.");
      return;
    }

    toast.loading(`Packaging ${selectedBulkDownloadIds.length} books...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Downloaded ${selectedBulkDownloadIds.length} books package (Zip Format).`);
      setSelectedBulkDownloadIds([]);
    }, 2000);
  };

  // Bookmark Toggle
  const toggleBookmark = (id: string) => {
    setMyBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      toast.success(prev.includes(id) ? "Removed from bookmarks." : "Added to bookmarks.");
      return next;
    });
  };

  // Favorite Toggle
  const toggleFavorite = (id: string) => {
    setMyFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      toast.success(prev.includes(id) ? "Removed from favorites." : "Added to favorites.");
      return next;
    });
  };

  // Copy shareable link
  const handleCopyLink = (book: RichBook) => {
    const url = `${window.location.origin}/librarian/digital?bookId=${book.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Shareable resource link copied to clipboard!");
  };

  // Quick View details
  const handleQuickView = (book: RichBook) => {
    setSelectedBook(book);
  };

  // Write new review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    if (selectedBook) {
      const newReview = {
        id: `r-new-${Date.now()}`,
        studentName: user?.fullName || "Anonymous Student",
        rating: newReviewRating,
        comment: newReviewComment,
        date: new Date().toISOString().split("T")[0]
      };

      const updated = {
        ...selectedBook,
        reviews: [newReview, ...selectedBook.reviews],
        rating: parseFloat(((selectedBook.rating * selectedBook.ratingCount + newReviewRating) / (selectedBook.ratingCount + 1)).toFixed(1)),
        ratingCount: selectedBook.ratingCount + 1
      };

      setSelectedBook(updated);
      setNewReviewComment("");
      toast.success("Review submitted for approval!");
    }
  };

  // Trigger Online PDF Reader
  const handleStartReading = (book: RichBook) => {
    setSelectedBook(null);
    setActiveReaderBook(book);

    // Register recently viewed in state and storage
    const viewedId = book.id;
    setReadingHistory(prev => {
      const filtered = prev.filter(x => x.bookId !== viewedId);
      return [
        {
          id: `history-${Date.now()}`,
          bookId: viewedId,
          bookTitle: book.title,
          date: new Date().toLocaleDateString(),
          timeSpent: 0,
          progress: continueReading[viewedId]?.progress || 0
        },
        ...filtered
      ];
    });

    // Check if session resume is available
    const resumeInfo = continueReading[viewedId];
    if (resumeInfo && resumeInfo.page > 1) {
      setTimeout(() => {
        const conf = window.confirm(`Resume reading "${book.title}" from page ${resumeInfo.page}?`);
        if (conf) {
          setReaderPage(resumeInfo.page);
        } else {
          setReaderPage(1);
        }
      }, 300);
    } else {
      setReaderPage(1);
    }

    setReaderBookmarks([]);
    setReaderNotes({});
    setReaderSearchTerm("");
    setReaderHighlights([]);
    toast.success(`Opening reader for: ${book.title}`);
  };

  // Exit Reader
  const handleExitReader = () => {
    if (activeReaderBook) {
      // Save progress
      const totalPages = activeReaderBook.pages;
      const progressPct = Math.min(100, Math.round((readerPage / totalPages) * 100));

      setContinueReading(prev => ({
        ...prev,
        [activeReaderBook.id]: {
          page: readerPage,
          progress: progressPct,
          lastRead: new Date().toISOString()
        }
      }));

      // Update reading history log
      setReadingHistory(prev =>
        prev.map(item =>
          item.bookId === activeReaderBook.id
            ? { ...item, timeSpent: item.timeSpent + activeReadingTime, progress: progressPct }
            : item
        )
      );

      toast.info(`Progress saved at ${progressPct}%.`);
      setActiveReaderBook(null);
      setActiveReadingTime(0);
    }
  };

  // Text highlighting simulator in PDF reader
  const handleHighlightSelection = (color: string) => {
    if (!readerSearchTerm) {
      toast.info("Please enter a term in search input to highlight matches.");
      return;
    }
    if (!readerHighlights.includes(readerSearchTerm.toLowerCase())) {
      setReaderHighlights(prev => [...prev, readerSearchTerm.toLowerCase()]);
      toast.success(`Highlighted all matches of "${readerSearchTerm}"`);
    }
  };

  // Add notes in PDF reader
  const handleAddPageNote = () => {
    if (!readerNoteInput.trim()) return;
    setReaderNotes(prev => ({
      ...prev,
      [readerPage]: readerNoteInput
    }));
    setReaderNoteInput("");
    toast.success(`Saved note on page ${readerPage}`);
  };

  // PDF Print simulator
  const handlePrint = () => {
    window.print();
  };

  // AI Chat simulation
  const handleSendAiMessage = () => {
    if (!aiChatInput.trim()) return;
    const text = aiChatInput;
    const userMsg = { sender: "user" as const, text, id: `msg-${Date.now()}` };
    setAiChatMessages(prev => [...prev, userMsg]);
    setAiChatInput("");
    setAiLoading(true);

    setTimeout(() => {
      let replyText = "I'm analyzing the document content. Ask me to generate study summaries or test questions!";
      const q = text.toLowerCase();
      const title = activeReaderBook?.title || "this book";

      if (q.includes("summary") || q.includes("summarize")) {
        replyText = `### Executive Summary of ${title}\n\nThis textbook provides critical training across major topics, addressing design methods, system equations, and standard principles.\n\n* **Key Area 1**: Core concepts and foundation definitions.\n* **Key Area 2**: Methodologies, implementations, and operational steps.\n* **Key Area 3**: Practical case-study outcomes and optimizations.`;
      } else if (q.includes("notes") || q.includes("study notes")) {
        replyText = `### Study Notes: page ${readerPage}\n\n1. **Important Terminology**: Make sure to remember key definitions.\n2. **Conceptual Equations**: Focus on solving structural operations.\n3. **Exam Focus**: Professors often ask about sections covered in Chapter 2.`;
      } else if (q.includes("mcq") || q.includes("question") || q.includes("quiz")) {
        replyText = `### Interactive Quiz Generated from Page ${readerPage}\n\nI have generated a quick multiple choice test for you. Please use the 'AI Interactive Quiz' panel above to submit answers!`;
        // Open quiz view
        setQuizScore(null);
        setQuizAnswers({});
      } else {
        replyText = `According to the resource details for *${title}*, the content explains key terms, formulas, and diagrams related to "${text}". Let me know if you would like me to summarize page ${readerPage} or translate the text!`;
      }

      setAiChatMessages(prev => [...prev, { sender: "ai" as const, text: replyText, id: `msg-ai-${Date.now()}` }]);
      setAiLoading(false);
    }, 1200);
  };

  // Quick Action AI features
  const handleAiQuickFeature = (feature: string) => {
    setAiLoading(true);
    setIsAiSidebarOpen(true);

    setTimeout(() => {
      let replyText = "";
      const bookTitleVal = activeReaderBook?.title || selectedBook?.title || "e-Book Resource";

      if (feature === "summarize") {
        replyText = `### AI Summary of *${bookTitleVal}*\n\n**Introduction**: The resource outlines foundational principles, definitions, and operational setups required for coursework.\n\n**Key Takeaways**:\n* Core frameworks are structured step-by-step.\n* Practical case studies validate real-world usage.\n* Multi-department projects frequently reference these algorithms.`;
      } else if (feature === "explain") {
        replyText = `### AI Explanation: Chapter 2\n\nChapter 2 focuses on structural definitions, parameters, and theoretical background.\n\n* It outlines equations for measuring operational capacities.\n* Relies on standard metrics for error rates.\n* Recommends practicing sandbox assignments before exams.`;
      } else if (feature === "notes") {
        replyText = `### AI Study Notes (High-Yield)\n\n* **Core Concept**: System capacity increases as latency decreases.\n* **Crucial Formulas**: Review integration metrics on Chapter 4.\n* **Exam Hint**: Faculty recommended focus on sections 1.2 and 3.4.`;
      } else if (feature === "mcq") {
        replyText = `### MCQ Practice (5 Questions generated)\n\nI have generated interactive multiple-choice questions for you. You can take the quiz in the side panel below!`;
        setQuizScore(null);
        setQuizAnswers({});
      } else if (feature === "flashcards") {
        replyText = "Interactive Flashcards are now loaded. Click the flip card to review term definitions!";
        setFlashcardIndex(0);
        setFlashcardFlipped(false);
      } else if (feature === "questions") {
        replyText = `### Important Exam Questions (From *${bookTitleVal}*)\n\n1. Explain the primary architecture and advantages of this model. (10 Marks)\n2. Differentiate between method A and method B with numerical examples. (5 Marks)\n3. Solve the parameters given in Case Study 3. (8 Marks)`;
      } else if (feature === "keywords") {
        replyText = `### Extracted Keywords:\n\n* **Framework**: A structured support matrix.\n* **Protocol**: Standard rules for data transmissions.\n* **Optimization**: Enhancing systems efficiency.\n* **Heuristics**: Trial and error discovery approaches.`;
      }

      setAiChatMessages(prev => [
        ...prev,
        { sender: "ai", text: `Triggered feature: **${feature.toUpperCase()}**`, id: `feat-t-${Date.now()}` },
        { sender: "ai", text: replyText, id: `feat-r-${Date.now()}` }
      ]);
      setAiLoading(false);
    }, 1500);
  };

  // Translation simulator
  const handleTranslate = (lang: string) => {
    setAiLoading(true);
    setTimeout(() => {
      let translation = "";
      if (lang === "Hindi") translation = "यह पुस्तक शैक्षणिक पाठ्यक्रम के लिए महत्वपूर्ण विषयों और मुख्य सिद्धांतों की व्याख्या करती है।";
      else if (lang === "Spanish") translation = "Este libro proporciona pautas detalladas sobre los principios fundamentales del curso.";
      else if (lang === "French") translation = "Ce document décrit les concepts et principes essentiels pour les cours universitaires.";
      else translation = "Dieses Buch erklärt die Kernkonzepte und wichtigsten Studienrichtlinien.";

      setAiChatMessages(prev => [
        ...prev,
        { sender: "ai", text: `Sample translated to **${lang}**:\n\n*${translation}*`, id: `trans-${Date.now()}` }
      ]);
      setAiLoading(false);
    }, 1000);
  };

  // Mock quiz data
  const MOCK_QUIZ = [
    { q: "What is the primary worst-case run-time of insertion sort?", a: ["O(N)", "O(N log N)", "O(N^2)", "O(1)"], correct: 2 },
    { q: "Which TCP protocol handshake prevents connection hijack?", a: ["2-way handshake", "3-way handshake", "4-way handshake", "Stateless sync"], correct: 1 },
    { q: "In databases, what does ACID durability guarantee?", a: ["Fast query execution", "Data survives crashes", "No duplicate values", "High concurrency levels"], correct: 1 }
  ];

  // Submit quiz answer
  const submitQuiz = () => {
    let score = 0;
    MOCK_QUIZ.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
    toast.success(`Quiz completed! You scored ${score}/${MOCK_QUIZ.length}`);
  };

  // Admin Upload form Reset
  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("Computer Science");
    setFormat("PDF");
    setSize("");
    setFileUrl("");
    setAdminDescription("");
    setAdminPages("350");
    setAdminIsbn("");
    setAdminDept("CSE");
    setAdminSem("Sem 1");
    setAdminSubject("General");
    setAdminKeywords("");
    setAdminEditingBookId(null);
  };

  // Add/Edit Submit (mutates cloud + handles mock fallback)
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !size) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title,
      author,
      category,
      format,
      size,
      fileUrl: fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    };

    if (adminEditingBookId) {
      updateMutation.mutate({ id: adminEditingBookId, payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  // Edit book trigger
  const handleEditBook = (book: RichBook) => {
    setAdminEditingBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setFormat(book.format);
    setSize(book.size);
    setFileUrl(book.fileUrl || "");
    setAdminDescription(book.description);
    setAdminPages(String(book.pages));
    setAdminIsbn(book.isbn);
    setAdminDept(book.department);
    setAdminSem(book.semester);
    setAdminSubject(book.subject);
    setAdminKeywords(book.keywords.join(", "));
    setIsEditModalOpen(true);
  };

  // Delete Resource
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Drag & drop file upload simulator
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileList = Array.from(files).map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
        progress: 0,
        status: "pending" as const
      }));
      setBulkFiles(prev => [...prev, ...fileList]);
      toast.success(`Dropped ${files.length} documents. Ready for upload.`);
    }
  };

  // Trigger simulated bulk upload
  const triggerBulkUpload = () => {
    if (bulkFiles.length === 0) {
      toast.info("No files dropped yet.");
      return;
    }

    setBulkFiles(prev => prev.map(f => ({ ...f, status: "uploading" })));
    toast.loading("Simulating high-speed cloud upload...");

    let counter = 0;
    const interval = setInterval(() => {
      counter += 10;
      setBulkFiles(prev =>
        prev.map(f => {
          if (f.status === "uploading") {
            const nextProgress = Math.min(100, f.progress + 25);
            return {
              ...f,
              progress: nextProgress,
              status: nextProgress === 100 ? "done" : "uploading"
            };
          }
          return f;
        })
      );

      if (counter >= 100) {
        clearInterval(interval);
        toast.dismiss();
        toast.success("All bulk PDFs cataloged to cloud successfully.");
        // Add pending uploads
        setBulkFiles([]);
      }
    }, 400);
  };

  // Approve student upload
  const handleApprovePending = (book: RichBook) => {
    setPendingUploads(prev => prev.filter(x => x.id !== book.id));
    MOCK_BOOKS.push({
      ...book,
      id: `approved-${Date.now()}`,
      rating: 4.0,
      ratingCount: 1,
      downloads: 0
    });
    toast.success(`Approved "${book.title}". Added to public catalog.`);
  };

  // Export metadata
  const exportLibraryMetadata = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catalogBooks, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "digital_library_catalog.json");
    dlAnchorElem.click();
    toast.success("EBook Catalog JSON Metadata exported.");
  };

  // Text-To-Speech simulation for accessible reading
  const handleSpeakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text to speech not supported in your browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    toast.success("Playing audio narration...");
  };

  // Generate visual colors for book spine / cover gradient
  const getBookSpineColor = (categoryStr: string) => {
    switch (categoryStr) {
      case "Computer Science": return "from-violet-600 to-blue-800";
      case "Mathematics": return "from-emerald-600 to-teal-800";
      case "Business": return "from-amber-600 to-rose-700";
      case "Science": return "from-cyan-600 to-indigo-800";
      default: return "from-slate-600 to-slate-800";
    }
  };

  // Related books lookup
  const getRelatedBooks = (book: RichBook) => {
    return catalogBooks.filter(x => x.id !== book.id && x.category === book.category).slice(0, 3);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" onScroll={handleScroll}>
      {/* 1. Main Page Header */}
      <PageHeader
        title="Digital Library 📖"
        desc="Access high-fidelity academic textbooks, notes, and research materials instantly."
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportLibraryMetadata}
              className="px-3.5 py-2 rounded-xl border text-sm font-semibold hover:bg-gradient-soft transition flex items-center gap-1.5 cursor-pointer"
              title="Export database inventory to JSON file"
            >
              <FileSpreadsheet className="size-4" /> Export Metadata
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
              >
                <Plus className="size-4" /> Add E-Resource
              </button>
            )}
          </div>
        }
      />

      {/* 2. Top Tabs Menu */}
      <div className="flex gap-2 border-b pb-3 overflow-x-auto">
        {[
          { id: "catalog", label: "Explore Library", icon: BookOpen },
          { id: "my-library", label: `My Library (${myBookmarks.length + myFavorites.length})`, icon: Bookmark },
          { id: "analytics", label: "Usage Analytics", icon: BarChart2 },
          { id: "notifications", label: "Library Feed", icon: Bell },
          ...(isAdmin ? [{ id: "admin", label: "Librarian Console", icon: Settings }] : [])
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-primary text-white glow-primary"
                  : "bg-gradient-soft border text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <TabIcon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Catalog Tab Content */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Search section bar */}
          <Card>
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="main-library-search"
                    placeholder={
                      aiSemanticSearch
                        ? "AI Semantic: Describe topic like 'Graph theory and BFS search algorithms'..."
                        : "Search textbooks, PDFs, ISBNs, authors..."
                    }
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 pl-10 pr-12 py-2.5 text-sm outline-none focus:border-primary transition"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        className="p-1 hover:bg-gradient-soft rounded-lg text-muted-foreground cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isVoiceSearching ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-gradient-soft text-muted-foreground"
                      }`}
                      title="Search by voice speaking"
                    >
                      {isVoiceSearching ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal className="size-4" /> Filters
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary cursor-pointer hover:opacity-90 transition whitespace-nowrap flex items-center gap-1.5"
                >
                  {aiSemanticSearch && <Sparkles className="size-4" />}
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 max-w-xl mx-4 bg-background border rounded-xl shadow-lg z-30 p-2 space-y-1">
                  {searchSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSearchTerm(s);
                        executeSearch(s);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gradient-soft transition flex items-center gap-2 cursor-pointer"
                    >
                      <Search className="size-3 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Advanced search checklist */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Search in:</span>
                  {Object.keys(searchCriteria).map((key) => (
                    <label key={key} className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={(searchCriteria as any)[key]}
                        onChange={(e) =>
                          setSearchCriteria((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="rounded accent-primary size-3.5"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSemanticSearch}
                      onChange={(e) => setAiSemanticSearch(e.target.checked)}
                      className="rounded accent-indigo-600 size-3.5"
                    />
                    <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                      <Sparkles className="size-3" /> AI Semantic Search
                    </span>
                  </label>

                  <div className="flex items-center border rounded-lg p-0.5 bg-gradient-soft">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1 rounded-md transition ${viewMode === "grid" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"}`}
                      title="Grid view"
                    >
                      <Grid className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1 rounded-md transition ${viewMode === "list" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"}`}
                      title="List view"
                    >
                      <List className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent & Popular searches tags */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground flex items-center gap-1"><History className="size-3" /> Recents:</span>
                    {recentSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchTerm(tag);
                          executeSearch(tag);
                        }}
                        className="px-2 py-1 rounded-lg bg-gradient-soft hover:bg-background border cursor-pointer transition text-muted-foreground"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Popular:</span>
                  {["React", "Algorithms", "Calculus", "Physics", "DBMS"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchTerm(tag);
                        executeSearch(tag);
                      }}
                      className="px-2 py-1 rounded-lg bg-gradient-soft hover:bg-background border cursor-pointer transition text-muted-foreground"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Category Filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {["All", "Computer Science", "Business", "Mathematics", "Science"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gradient-primary text-white glow-primary"
                    : "bg-background border text-muted-foreground hover:border-primary hover:bg-background/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bulk Action Panel (If checked items exist) */}
          {selectedBulkDownloadIds.length > 0 && (
            <div className="p-3 bg-gradient-soft border border-indigo-200 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-200">
              <span className="text-sm font-semibold text-indigo-700">
                Selected {selectedBulkDownloadIds.length} books for batch actions
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBulkDownloadIds([])}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-background transition"
                >
                  Cancel Selection
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold glow-indigo flex items-center gap-1 cursor-pointer"
                >
                  <Download className="size-3.5" /> Download ZIP Pack
                </button>
              </div>
            </div>
          )}

          {/* Ebooks List render */}
          {isLoading || isAiSearchingState ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-80 bg-muted animate-pulse rounded-2xl border" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <Card className="text-center py-16">
              <FileText className="size-16 text-muted-foreground/45 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-gradient">No Ebooks Found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
                No resources match your query. Try broadening your keywords or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gradient-soft transition cursor-pointer"
              >
                Reset Search Filters
              </button>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
              {filteredBooks.slice(0, visibleCount).map((book) => {
                const isBookmarked = myBookmarks.includes(book.id);
                const isFavorited = myFavorites.includes(book.id);
                const isChecked = selectedBulkDownloadIds.includes(book.id);

                return viewMode === "grid" ? (
                  /* Grid Book Card */
                  <Card
                    key={book.id}
                    className="hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-md hover:shadow-lg border bg-background/50 backdrop-blur-xs"
                  >
                    <div>
                      {/* Checkbox for batch downloads */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedBulkDownloadIds(prev =>
                            prev.includes(book.id) ? prev.filter(x => x !== book.id) : [...prev, book.id]
                          )
                        }
                        className="absolute top-3 left-3 size-4.5 accent-primary z-20 cursor-pointer rounded border"
                      />

                      {/* Bookmark & Favorite floating widgets */}
                      <div className="absolute top-3 right-3 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => toggleBookmark(book.id)}
                          className={`p-1.5 rounded-lg border bg-background shadow-xs hover:scale-105 transition cursor-pointer ${
                            isBookmarked ? "text-amber-500" : "text-muted-foreground"
                          }`}
                        >
                          <Bookmark className="size-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(book.id)}
                          className={`p-1.5 rounded-lg border bg-background shadow-xs hover:scale-105 transition cursor-pointer ${
                            isFavorited ? "text-rose-500" : "text-muted-foreground"
                          }`}
                        >
                          <Heart className="size-3.5 fill-current" />
                        </button>
                      </div>

                      {/* 3D-effect book spine rendering */}
                      <div
                        onClick={() => handleQuickView(book)}
                        className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative cursor-pointer group-hover:shadow-indigo-100 shadow-sm transition"
                      >
                        <div className={`w-full h-full bg-gradient-to-br ${getBookSpineColor(book.category)} relative flex flex-col justify-between p-4 text-white shadow-inner`}>
                          {/* Book spine line shadow */}
                          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/15 shadow-[inset_-1px_0_0_rgba(255,255,255,0.1)]" />
                          <div className="absolute left-3 top-0 bottom-0 w-1 bg-white/10" />

                          <div className="flex justify-between items-start pl-3 w-full">
                            <span className="text-[10px] uppercase font-mono tracking-wider opacity-85">
                              {book.department}
                            </span>
                            <Badge tone="info" className="text-[10px] bg-white/20 text-white border-0">
                              {book.format}
                            </Badge>
                          </div>

                          <div className="pl-3 mt-2 pr-2">
                            <h4 className="font-serif font-bold text-sm tracking-tight line-clamp-2 leading-tight">
                              {book.title}
                            </h4>
                            <p className="text-[10px] opacity-75 mt-1 font-sans italic">
                              {book.author}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pl-3 pt-4 w-full border-t border-white/10">
                            <span className="text-[9px] font-mono text-white/70">
                              ISBN: {book.isbn.substring(0, 6)}...
                            </span>
                            <span className="text-[9px] font-semibold bg-black/30 px-1.5 py-0.5 rounded">
                              {book.pages} Pages
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ebook details content */}
                      <div className="px-1">
                        <div className="flex items-center gap-1 justify-between mb-1.5">
                          <span
                            onClick={() => setSelectedCategory(book.category)}
                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            {book.category}
                          </span>
                          {/* Rating display */}
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                            ★ <span className="text-foreground">{book.rating}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({book.ratingCount})
                            </span>
                          </div>
                        </div>

                        <h3
                          onClick={() => handleQuickView(book)}
                          className="font-bold text-sm line-clamp-1 hover:text-primary cursor-pointer transition"
                        >
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">by {book.author}</p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] bg-gradient-soft p-2 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Subject & Sem</span>
                            <span className="font-semibold line-clamp-1">{book.subject} ({book.semester})</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-muted-foreground">Size & Downloads</span>
                            <span className="font-semibold text-emerald-600">
                              {book.size} • {book.downloads}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 mt-5 border-t pt-3.5">
                      <button
                        onClick={() => handleStartReading(book)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-primary text-white text-xs font-bold glow-primary flex items-center justify-center gap-1 cursor-pointer transition hover:opacity-90"
                      >
                        <BookOpen className="size-3.5" /> Read Now
                      </button>
                      <button
                        onClick={() => handleQuickView(book)}
                        className="py-2 px-2.5 rounded-xl border text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer flex items-center justify-center"
                        title="View reviews and book description"
                      >
                        <Info className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(book.id, book.title, book.fileUrl)}
                        className="py-2 px-2.5 rounded-xl border hover:bg-gradient-soft transition cursor-pointer flex items-center justify-center text-primary"
                        title="Download PDF File"
                      >
                        <Download className="size-3.5" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEditBook(book)}
                            className="py-2 px-2.5 rounded-xl border hover:bg-gradient-soft transition cursor-pointer flex items-center justify-center text-indigo-600"
                            title="Edit Book Details"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                            className="py-2 px-2.5 rounded-xl border hover:bg-red-50 transition cursor-pointer flex items-center justify-center text-red-500"
                            title="Delete Book"
                          >
                            <Trash className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </Card>
                ) : (
                  /* List Book Card Row */
                  <Card key={book.id} className="p-3.5 hover:shadow-md transition flex items-center gap-4">
                    <div className={`w-14 h-18 shrink-0 bg-gradient-to-br ${getBookSpineColor(book.category)} rounded-lg flex flex-col justify-between p-2 text-white text-[8px] relative overflow-hidden shadow`}>
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/15" />
                      <div className="font-bold line-clamp-2 pl-1 leading-tight">{book.title}</div>
                      <div className="text-[7px] opacity-75 pl-1">{book.author}</div>
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-bold text-sm truncate hover:text-primary cursor-pointer" onClick={() => handleQuickView(book)}>
                          {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium block">{book.category}</span>
                        <span className="text-[10px] text-muted-foreground">{book.department} • {book.semester}</span>
                      </div>
                      <div>
                        <span className="text-xs block font-bold text-emerald-600">{book.downloads} downloads</span>
                        <span className="text-[10px] text-muted-foreground">Rating: ★ {book.rating}</span>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleStartReading(book)}
                          className="px-3 py-1.5 bg-gradient-primary text-white text-xs font-semibold rounded-lg glow-primary cursor-pointer transition"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => handleQuickView(book)}
                          className="px-2.5 py-1.5 border rounded-lg text-xs hover:bg-gradient-soft transition cursor-pointer"
                        >
                          Details
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditBook(book)}
                              className="px-2.5 py-1.5 border rounded-lg text-xs hover:bg-gradient-soft text-indigo-600 transition cursor-pointer"
                              title="Edit Book Details"
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(book.id, book.title)}
                              className="px-2.5 py-1.5 border rounded-lg text-xs hover:bg-red-50 text-red-500 transition cursor-pointer"
                              title="Delete Book"
                            >
                              <Trash className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Load More trigger */}
          {visibleCount < filteredBooks.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="px-6 py-2.5 border rounded-xl text-sm font-semibold hover:bg-gradient-soft transition cursor-pointer flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw className="size-4 animate-spin-slow" /> Load More Books
              </button>
            </div>
          )}

          {/* 4. Recommendation Engine Panels */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
            {/* Trending Panel */}
            <Card>
              <h3 className="font-bold text-sm mb-4 text-gradient flex items-center gap-1.5">
                🔥 Trending Books
              </h3>
              <div className="space-y-3.5">
                {catalogBooks
                  .sort((a, b) => b.downloads - a.downloads)
                  .slice(0, 3)
                  .map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleQuickView(book)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-soft transition cursor-pointer"
                    >
                      <div className={`w-8 h-11 bg-gradient-to-br ${getBookSpineColor(book.category)} rounded text-white flex items-center justify-center p-1`}>
                        <FileText className="size-4 opacity-80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">{book.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {book.author} • <span className="text-emerald-600 font-bold">{book.downloads} DLs</span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  ))}
              </div>
            </Card>

            {/* Recommended For You */}
            <Card>
              <h3 className="font-bold text-sm mb-4 text-gradient flex items-center gap-1.5">
                💡 Recommended For You
              </h3>
              <div className="space-y-3.5">
                {catalogBooks
                  .filter((b) => b.featured)
                  .slice(0, 3)
                  .map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleQuickView(book)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-soft transition cursor-pointer"
                    >
                      <div className={`w-8 h-11 bg-gradient-to-br ${getBookSpineColor(book.category)} rounded text-white flex items-center justify-center p-1`}>
                        <Sparkles className="size-4 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">{book.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {book.author} • <span className="text-primary font-bold">★ {book.rating}</span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. My Library Tab Content */}
      {activeTab === "my-library" && (
        <div className="space-y-6">
          {/* Top library statistics counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Bookmarked", count: myBookmarks.length, color: "border-l-amber-500", desc: "Saved to read later" },
              { label: "Favorites", count: myFavorites.length, color: "border-l-rose-500", desc: "Top rated books" },
              { label: "Downloaded", count: myDownloads.length, color: "border-l-emerald-500", desc: "Offline files" },
              { label: "Total Reading", count: `${Math.round(readingSeconds / 60)} Min`, color: "border-l-indigo-500", desc: "Portal active duration" }
            ].map((stat, i) => (
              <Card key={i} className={`border-l-4 ${stat.color} p-4`}>
                <span className="text-xs text-muted-foreground block font-medium">{stat.label}</span>
                <span className="text-2xl font-black mt-1 block">{stat.count}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">{stat.desc}</span>
              </Card>
            ))}
          </div>

          {/* Continue Reading Section */}
          {Object.keys(continueReading).length > 0 && (
            <Card>
              <h3 className="font-bold text-base text-gradient mb-4 flex items-center gap-1.5">
                📖 Continue Reading
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(continueReading).map(([bookId, info]) => {
                  const book = catalogBooks.find(b => b.id === bookId);
                  if (!book) return null;
                  return (
                    <div key={bookId} className="p-3.5 border rounded-xl flex items-center gap-4 bg-background/50">
                      <div className={`w-10 h-14 bg-gradient-to-br ${getBookSpineColor(book.category)} rounded text-white flex items-center justify-center shrink-0`}>
                        <BookOpen className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{book.title}</div>
                        <div className="text-xs text-muted-foreground truncate">Page {info.page} of {book.pages}</div>
                        {/* Progress bar */}
                        <div className="w-full bg-gradient-soft h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div className="bg-gradient-primary h-full rounded-full" style={{ width: `${info.progress}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartReading(book)}
                        className="px-3 py-1.5 bg-gradient-primary text-white text-xs font-semibold rounded-lg glow-primary cursor-pointer hover:opacity-90 transition whitespace-nowrap"
                      >
                        Resume
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Bookmarked / Saved Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-sm text-gradient mb-4 flex items-center gap-1.5">
                <Bookmark className="size-4 text-amber-500 fill-amber-500" /> Bookmarks ({myBookmarks.length})
              </h3>
              {myBookmarks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No bookmarks saved. Click the bookmark icon on catalog cards to save.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {catalogBooks
                    .filter(b => myBookmarks.includes(b.id))
                    .map(book => (
                      <div key={book.id} className="flex items-center justify-between p-2 border rounded-xl">
                        <span className="font-bold text-xs truncate max-w-xs">{book.title}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartReading(book)}
                            className="px-2 py-1 bg-gradient-primary text-white text-[10px] rounded font-semibold cursor-pointer"
                          >
                            Read
                          </button>
                          <button
                            onClick={() => toggleBookmark(book.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                          >
                            <Trash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-gradient mb-4 flex items-center gap-1.5">
                <Heart className="size-4 text-rose-500 fill-rose-500" /> Favorites ({myFavorites.length})
              </h3>
              {myFavorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No favorites marked. Click the heart icon on catalog cards to bookmark.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {catalogBooks
                    .filter(b => myFavorites.includes(b.id))
                    .map(book => (
                      <div key={book.id} className="flex items-center justify-between p-2 border rounded-xl">
                        <span className="font-bold text-xs truncate max-w-xs">{book.title}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartReading(book)}
                            className="px-2 py-1 bg-gradient-primary text-white text-[10px] rounded font-semibold cursor-pointer"
                          >
                            Read
                          </button>
                          <button
                            onClick={() => toggleFavorite(book.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                          >
                            <Trash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>

          {/* Reading Log History */}
          <Card>
            <h3 className="font-bold text-sm text-gradient mb-4 flex items-center gap-1.5">
              <History className="size-4" /> Reading Session History
            </h3>
            {readingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No active reading history. Start reading textbooks online.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-gradient-soft">
                      <th className="p-3 font-semibold text-muted-foreground">Resource Title</th>
                      <th className="p-3 font-semibold text-muted-foreground">Accessed Date</th>
                      <th className="p-3 font-semibold text-muted-foreground">Active Duration</th>
                      <th className="p-3 font-semibold text-muted-foreground">Current Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readingHistory.map((h) => (
                      <tr key={h.id} className="border-b hover:bg-gradient-soft/50">
                        <td className="p-3 font-bold">{h.bookTitle}</td>
                        <td className="p-3 text-muted-foreground">{h.date}</td>
                        <td className="p-3 font-semibold text-indigo-600">
                          {Math.round(h.timeSpent / 60)} Mins
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">{h.progress}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 5. Analytics Tab Content */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <span className="text-xs text-muted-foreground block font-semibold">Total Downloads Today</span>
              <span className="text-4xl font-black mt-2 text-indigo-600 block">42</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">▲ 15% from yesterday</span>
            </Card>
            <Card className="text-center p-6">
              <span className="text-xs text-muted-foreground block font-semibold">Most Viewed Ebook</span>
              <span className="text-sm font-bold mt-3 block truncate">Introduction to Algorithms</span>
              <span className="text-xs font-semibold text-muted-foreground mt-1 block">1.2K Total Views</span>
            </Card>
            <Card className="text-center p-6">
              <span className="text-xs text-muted-foreground block font-semibold">Active Reader Hours</span>
              <span className="text-4xl font-black mt-2 text-purple-600 block">128 hrs</span>
              <span className="text-[10px] text-muted-foreground block mt-1">Combined student logs</span>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SVG Department bar chart */}
            <Card>
              <h3 className="font-bold text-sm text-gradient mb-5">Department-Wise Resource Usage</h3>
              <div className="space-y-4">
                {[
                  { dept: "CSE", count: 850, pct: 85, color: "bg-indigo-600" },
                  { dept: "ECE", count: 420, pct: 42, color: "bg-blue-500" },
                  { dept: "EEE", count: 280, pct: 28, color: "bg-teal-500" },
                  { dept: "ME", count: 180, pct: 18, color: "bg-amber-500" },
                  { dept: "Civil", count: 120, pct: 12, color: "bg-red-400" }
                ].map((item) => (
                  <div key={item.dept} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>{item.dept} Department</span>
                      <span className="text-muted-foreground">{item.count} checkouts</span>
                    </div>
                    <div className="w-full bg-gradient-soft h-3 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SVG Categories Donut chart representation */}
            <Card>
              <h3 className="font-bold text-sm text-gradient mb-5">Top Catalog Categories</h3>
              <div className="flex items-center gap-6">
                {/* SVG Donut */}
                <div className="relative size-36 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#4f46e5" strokeWidth="3.2" strokeDasharray="45 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray="25 100" strokeDashoffset="-45" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray="20 100" strokeDashoffset="-70" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="3.2" strokeDasharray="10 100" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-black leading-none">128</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">Total Ebooks</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs w-full">
                  {[
                    { label: "Computer Science", pct: 45, color: "bg-indigo-600" },
                    { label: "Mathematics", pct: 25, color: "bg-emerald-500" },
                    { label: "Business", pct: 20, color: "bg-amber-500" },
                    { label: "Science", pct: 10, color: "bg-blue-500" }
                  ].map((x) => (
                    <div key={x.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`size-2.5 rounded-full ${x.color}`} />
                        <span className="font-medium text-muted-foreground">{x.label}</span>
                      </div>
                      <span className="font-bold">{x.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 6. Notifications Tab Content */}
      {activeTab === "notifications" && (
        <Card className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b pb-3.5 mb-4">
            <h3 className="font-bold text-base text-gradient flex items-center gap-1.5">
              <Bell className="size-5" /> Library Notifications Feed
            </h3>
            <span className="text-xs text-muted-foreground">Updated real-time</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "New Resource Cataloged", desc: "'Introduction to Algorithms 4th Ed' is now available in CSE department.", time: "1 hour ago", icon: BookOpen, color: "bg-indigo-50 border-indigo-200 text-indigo-600" },
              { title: "Question Paper Added", desc: "'Data Structures End-Sem 2025' uploaded by HOD CSE Prof. Ramesh.", time: "4 hours ago", icon: FileText, color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
              { title: "Study Notes Updated", desc: "Notes updated for 'Operating Systems Chapter 3' by Dept Coordinator.", time: "1 day ago", icon: Edit, color: "bg-blue-50 border-blue-200 text-blue-600" },
              { title: "Faculty Recommendation", desc: "Dean Academics recommended reading 'Thomas' Calculus' for Sem 1 students.", time: "2 days ago", icon: Sparkles, color: "bg-amber-50 border-amber-200 text-amber-600" }
            ].map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className={`p-4 border rounded-xl flex gap-3.5 bg-background/50 ${n.color.split(" ")[0]} border-l-4`}>
                  <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 7. Librarian Console Tab Content */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Drag & Drop Bulk Upload */}
            <Card>
              <h3 className="font-bold text-sm text-gradient mb-3 flex items-center gap-1">
                <FileUp className="size-4" /> Bulk Ebook Cataloging
              </h3>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center bg-gradient-soft hover:bg-background transition cursor-pointer"
              >
                <DownloadCloud className="size-10 text-indigo-500 mx-auto mb-2 animate-bounce-slow" />
                <span className="font-bold text-sm block">Drag & Drop Ebooks / PDFs Here</span>
                <span className="text-xs text-muted-foreground mt-1 block">Supports multiple files up to 50MB</span>
                <input
                  type="file"
                  multiple
                  id="bulk-file-picker"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      const fileList = Array.from(e.target.files).map(f => ({
                        name: f.name,
                        size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
                        progress: 0,
                        status: "pending" as const
                      }));
                      setBulkFiles(prev => [...prev, ...fileList]);
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById("bulk-file-picker")?.click()}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold glow-indigo cursor-pointer hover:bg-indigo-700 transition"
                >
                  Choose Local Files
                </button>
              </div>

              {/* Upload queue */}
              {bulkFiles.length > 0 && (
                <div className="mt-5 space-y-3">
                  {bulkFiles.map((f, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-background/50 text-xs space-y-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="truncate max-w-xs">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">{f.size}</span>
                      </div>
                      <div className="w-full bg-gradient-soft h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={triggerBulkUpload}
                    className="w-full py-2 bg-gradient-primary text-white text-xs font-semibold rounded-xl glow-primary cursor-pointer hover:opacity-90 transition"
                  >
                    Start Processing Files
                  </button>
                </div>
              )}
            </Card>

            {/* Approval Queue */}
            <Card>
              <h3 className="font-bold text-sm text-gradient mb-3 flex items-center gap-1">
                <CheckCircle className="size-4" /> Pending Student Uploads ({pendingUploads.length})
              </h3>
              {pendingUploads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No pending student digital uploads requiring approval.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUploads.map((b) => (
                    <div key={b.id} className="p-3.5 border rounded-xl bg-background/50 flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-sm">{b.title}</div>
                        <div className="text-muted-foreground mt-0.5">Uploaded by Student • Dept: {b.department}</div>
                        <div className="mt-2 text-muted-foreground leading-relaxed italic">{b.description}</div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setPendingUploads(prev => prev.filter(x => x.id !== b.id))}
                          className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovePending(b)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold glow-indigo transition cursor-pointer"
                        >
                          Approve Upload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Manage Inventory Grid */}
          <Card>
            <h3 className="font-bold text-sm text-gradient mb-4">Total Library Inventory catalog</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-gradient-soft">
                    <th className="p-3 font-semibold text-muted-foreground">Title</th>
                    <th className="p-3 font-semibold text-muted-foreground">Author</th>
                    <th className="p-3 font-semibold text-muted-foreground">Category</th>
                    <th className="p-3 font-semibold text-muted-foreground">Size</th>
                    <th className="p-3 font-semibold text-muted-foreground">Downloads</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogBooks.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-gradient-soft/50">
                      <td className="p-3 font-bold">{book.title}</td>
                      <td className="p-3 text-muted-foreground">{book.author}</td>
                      <td className="p-3 font-semibold">{book.category}</td>
                      <td className="p-3 font-mono">{book.size}</td>
                      <td className="p-3 font-bold text-emerald-600">{book.downloads}</td>
                      <td className="p-3 text-right flex gap-1 justify-end">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="p-1 hover:bg-gradient-soft text-indigo-600 rounded cursor-pointer"
                          title="Edit Book Details"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                          title="Delete Book"
                        >
                          <Trash className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 8. Advanced Filters sliding drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md h-full bg-background border-l shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="font-bold text-lg text-gradient flex items-center gap-1.5">
                  <SlidersHorizontal className="size-5" /> Advanced Library Filters
                </h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 hover:bg-gradient-soft rounded-lg text-muted-foreground cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Department filter */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  >
                    <option value="All">All Departments</option>
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics)</option>
                    <option value="EEE">EEE (Electrical)</option>
                    <option value="ME">ME (Mechanical)</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Basic Sciences">Basic Sciences</option>
                  </select>
                </div>

                {/* Semester filter */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                  <select
                    value={filterSem}
                    onChange={(e) => setFilterSem(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  >
                    <option value="All">All Semesters</option>
                    {[...Array(8)].map((_, i) => (
                      <option key={i} value={`Sem ${i + 1}`}>Semester {i + 1}</option>
                    ))}
                  </select>
                </div>

                {/* File size & format */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">File Type</label>
                    <select
                      value={filterFileType}
                      onChange={(e) => setFilterFileType(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                    >
                      <option value="All">All formats</option>
                      <option value="PDF">PDF File</option>
                      <option value="EPUB">EPUB Ebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">File Size</label>
                    <select
                      value={filterFileSize}
                      onChange={(e) => setFilterFileSize(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                    >
                      <option value="All">All sizes</option>
                      <option value="<5MB">Under 5 MB</option>
                      <option value="5-20MB">5 to 20 MB</option>
                      <option value="20-50MB">20 to 50 MB</option>
                      <option value=">50MB">Over 50 MB</option>
                    </select>
                  </div>
                </div>

                {/* Language selection */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Language</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  >
                    <option value="All">All Languages</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </select>
                </div>

                {/* Quick Checkbox list */}
                <div className="pt-3 border-t space-y-2.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Sort & Filter Preferences</span>
                  {[
                    { key: "recentlyAdded", label: "Recently Added (2026 releases)" },
                    { key: "mostDownloaded", label: "Most Downloaded (>700 DLs)" },
                    { key: "highestRated", label: "Highest Rated (★ 4.5+)" },
                    { key: "freeResources", label: "Free Resources" },
                    { key: "featuredBooks", label: "Faculty Choice (Featured)" },
                    { key: "availableOffline", label: "Offline Reading Format (PDF)" }
                  ].map((tg) => (
                    <label key={tg.key} className="flex items-center gap-2 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={(filterToggles as any)[tg.key]}
                        onChange={(e) =>
                          setFilterToggles(prev => ({ ...prev, [tg.key]: e.target.checked }))
                        }
                        className="rounded accent-primary size-4"
                      />
                      <span>{tg.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t mt-8">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 border rounded-xl font-semibold hover:bg-gradient-soft transition cursor-pointer text-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-gradient-primary text-white font-semibold glow-primary rounded-xl transition cursor-pointer text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Resource details modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer text-lg"
            >
              ✕ Close
            </button>

            <div className="grid md:grid-cols-3 gap-6 mb-6 pt-4">
              {/* Virtual Cover card render */}
              <div className="md:col-span-1">
                <div className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${getBookSpineColor(selectedBook.category)} text-white flex flex-col justify-between p-4 shadow-xl relative overflow-hidden`}>
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20" />
                  <div className="absolute left-3.5 top-0 bottom-0 w-1 bg-white/10" />
                  <div className="pl-3 w-full flex justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/80">{selectedBook.department}</span>
                    <Badge tone="info" className="text-[10px] bg-white/20 text-white border-0">{selectedBook.format}</Badge>
                  </div>
                  <div className="pl-3 mt-4">
                    <h3 className="font-serif font-black text-sm leading-snug line-clamp-4 pr-1">{selectedBook.title}</h3>
                    <p className="text-[10px] opacity-75 mt-1 font-sans italic">by {selectedBook.author}</p>
                  </div>
                  <div className="pl-3 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/80">
                    <span>{selectedBook.pages} Pages</span>
                    <span>ISBN: {selectedBook.isbn.substring(0, 5)}</span>
                  </div>
                </div>

                {/* QR Code / Share links */}
                <div className="mt-4 p-3 bg-gradient-soft border rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground block">Quick Mobile Sync</span>
                  {/* SVG Mock QR Code */}
                  <svg className="size-20 mx-auto bg-white p-1 rounded border" viewBox="0 0 25 25">
                    <path d="M1,1 h7 v7 h-7 z M1,2 v5 h5 v-5 z M2,2 h3 v3 h-3 z" fill="black" />
                    <path d="M17,1 h7 v7 h-7 z M17,2 v5 h5 v-5 z M18,2 h3 v3 h-3 z" fill="black" />
                    <path d="M1,17 h7 v7 h-7 z M1,18 v5 h5 v-5 z M2,18 h3 v3 h-3 z" fill="black" />
                    <path d="M10,1 h2 v2 h-2 z M13,2 h2 v2 h-2 z M10,5 h4 v2 h-4 z M22,10 h2 v2 h-2 z M12,22 h3 v2 h-3 z" fill="black" />
                  </svg>
                  <button
                    onClick={() => handleCopyLink(selectedBook)}
                    className="w-full py-1 bg-background hover:bg-gradient-soft border rounded text-[10px] font-semibold cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <Share2 className="size-3" /> Copy Share Link
                  </button>
                </div>
              </div>

              {/* Book Details metadata */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Badge tone="info" className="mb-1.5">{selectedBook.category}</Badge>
                  <h2 className="text-xl font-bold text-gradient leading-tight">{selectedBook.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Written by {selectedBook.author} • Publisher: Academic Press</p>
                </div>

                {/* Rating & stats grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 border rounded-xl bg-gradient-soft">
                    <span className="text-[9px] text-muted-foreground block">RATING</span>
                    <span className="text-xs font-bold text-amber-500">★ {selectedBook.rating}</span>
                  </div>
                  <div className="p-2 border rounded-xl bg-gradient-soft">
                    <span className="text-[9px] text-muted-foreground block">DOWNLOADS</span>
                    <span className="text-xs font-bold text-emerald-600">{selectedBook.downloads}</span>
                  </div>
                  <div className="p-2 border rounded-xl bg-gradient-soft">
                    <span className="text-[9px] text-muted-foreground block">FILE SIZE</span>
                    <span className="text-xs font-bold text-indigo-600">{selectedBook.size}</span>
                  </div>
                  <div className="p-2 border rounded-xl bg-gradient-soft">
                    <span className="text-[9px] text-muted-foreground block">SEMESTER</span>
                    <span className="text-xs font-bold">{selectedBook.semester}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground">Book Description</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{selectedBook.description}</p>
                </div>

                {/* Keywords Tags */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground">Indexing Tags</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedBook.keywords.map((tg) => (
                      <span key={tg} className="px-2 py-0.5 rounded-lg bg-gradient-soft text-[10px] text-muted-foreground border">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleStartReading(selectedBook)}
                    className="flex-1 py-2.5 bg-gradient-primary text-white text-xs font-bold glow-primary rounded-xl cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="size-4" /> Read Online
                  </button>
                  <button
                    onClick={() => handleDownload(selectedBook.id, selectedBook.title, selectedBook.fileUrl)}
                    className="px-4 py-2.5 border rounded-xl text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer flex items-center gap-1"
                  >
                    <Download className="size-4" /> Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Related books list */}
            <div className="border-t pt-4 mb-6">
              <h4 className="text-xs font-bold text-muted-foreground mb-3">Recommended Related E-Books</h4>
              <div className="grid grid-cols-3 gap-3">
                {getRelatedBooks(selectedBook).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBook(b)}
                    className="p-2 border rounded-xl hover:bg-gradient-soft transition cursor-pointer text-center"
                  >
                    <div className="font-bold text-[10px] line-clamp-1">{b.title}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{b.author}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1">
                Student Feedback Reviews ({selectedBook.reviews.length})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1">
                {selectedBook.reviews.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No feedback reviews posted yet.</p>
                ) : (
                  selectedBook.reviews.map((r) => (
                    <div key={r.id} className="p-2.5 border rounded-xl bg-gradient-soft text-xs">
                      <div className="flex justify-between items-center font-semibold mb-1">
                        <span>{r.studentName}</span>
                        <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add review form */}
              <form onSubmit={handleAddReview} className="space-y-3 bg-gradient-soft p-3 rounded-xl border">
                <span className="text-[10px] font-bold text-muted-foreground block">Post Ebook Feedback Review</span>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <textarea
                      placeholder="Type your review comment..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs outline-none focus:border-primary transition min-h-12"
                    />
                  </div>
                  <div className="w-24 space-y-2 shrink-0">
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border bg-background text-xs cursor-pointer outline-none"
                    >
                      {[5, 4, 3, 2, 1].map(x => (
                        <option key={x} value={x}>{x} Stars</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg glow-indigo cursor-pointer transition hover:opacity-90"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* 10. Add New Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer text-lg"
            >
              ✕
            </button>
            <h3 className="font-semibold text-lg mb-4 text-gradient">Add New Digital Resource</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Guide Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robin Wieruch"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition cursor-pointer"
                  >
                    {["Computer Science", "Business", "Mathematics", "Science"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">File Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition cursor-pointer"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EPUB">EPUB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground">File Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 MB"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">PDF Link / URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/book.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || !title.trim() || !author.trim() || !size.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMutation.isPending ? "Saving..." : "Save Resource"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 11. Edit Resource Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer text-lg"
            >
              ✕
            </button>
            <h3 className="font-semibold text-lg mb-4 text-gradient">Edit Digital Resource Details</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground">Author Name *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition cursor-pointer"
                  >
                    {["Computer Science", "Business", "Mathematics", "Science"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">File Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition cursor-pointer"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EPUB">EPUB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground">File Size *</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">PDF Link / URL</label>
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 12. Full-Screen Interactive Online PDF Reader */}
      {activeReaderBook && (
        <div className={`fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-md overflow-hidden ${readerNightMode === "dark" ? "dark bg-slate-950 text-slate-100" : readerNightMode === "sepia" ? "bg-amber-50/95 text-amber-950" : "bg-white text-slate-900"}`}>
          {/* Top reader navigation bar */}
          <div className="h-16 px-4 border-b flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm z-30">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleExitReader}
                className="p-2 rounded-xl border hover:bg-gradient-soft shrink-0 cursor-pointer"
                title="Save and exit reader"
              >
                ✕ Exit Reader
              </button>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">{activeReaderBook.title}</h3>
                <span className="text-[10px] text-muted-foreground truncate block">by {activeReaderBook.author}</span>
              </div>
            </div>

            {/* Page navigation controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setReaderPage(p => Math.max(1, p - 1))}
                disabled={readerPage === 1}
                className="px-2 py-1 border rounded-lg hover:bg-gradient-soft disabled:opacity-35 cursor-pointer font-semibold"
              >
                ◄ Prev
              </button>
              <div className="flex items-center gap-1">
                <span>Page</span>
                <input
                  type="number"
                  value={readerPage}
                  min={1}
                  max={activeReaderBook.pages}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= activeReaderBook.pages) setReaderPage(val);
                  }}
                  className="w-12 text-center px-1.5 py-0.5 border rounded bg-background font-bold text-xs"
                />
                <span>of {activeReaderBook.pages}</span>
              </div>
              <button
                onClick={() => setReaderPage(p => Math.min(activeReaderBook.pages, p + 1))}
                disabled={readerPage === activeReaderBook.pages}
                className="px-2 py-1 border rounded-lg hover:bg-gradient-soft disabled:opacity-35 cursor-pointer font-semibold"
              >
                Next ►
              </button>
            </div>

            {/* Reading progress metric */}
            <div className="hidden md:flex flex-col items-end text-[10px] text-muted-foreground w-36 shrink-0 pr-3">
              <div className="flex justify-between w-full font-bold">
                <span>Progress</span>
                <span>{Math.round((readerPage / activeReaderBook.pages) * 100)}%</span>
              </div>
              <div className="w-full bg-gradient-soft h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(readerPage / activeReaderBook.pages) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Reader toolbar options */}
          <div className="p-2 border-b bg-gradient-soft/50 flex flex-wrap gap-2 items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-3">
              {/* Zoom controls */}
              <div className="flex items-center border rounded-lg p-0.5 bg-background">
                <button
                  onClick={() => setReaderZoom(z => Math.max(50, z - 10))}
                  className="p-1 hover:bg-gradient-soft rounded text-muted-foreground cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="px-2 font-bold font-mono text-[10px] text-foreground">{readerZoom}%</span>
                <button
                  onClick={() => setReaderZoom(z => Math.min(200, z + 10))}
                  className="p-1 hover:bg-gradient-soft rounded text-muted-foreground cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>

              {/* Theme switch */}
              <div className="flex items-center border rounded-lg p-0.5 bg-background">
                {(["light", "dark", "sepia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReaderNightMode(t)}
                    className={`px-2 py-0.5 capitalize text-[10px] rounded-md transition ${readerNightMode === t ? "bg-gradient-primary text-white font-semibold" : "text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Narrate page content (Accessibility option) */}
              <button
                onClick={() => {
                  const content = BOOK_PAGES_CONTENT[activeReaderBook.id.includes("algorithms") ? "algorithms" : activeReaderBook.id.includes("networks") ? "networks" : "default"]?.[(readerPage - 1) % 8] || "Sample content page.";
                  handleSpeakText(content);
                }}
                className="p-1.5 border rounded-lg hover:bg-gradient-soft flex items-center gap-1.5 font-semibold text-indigo-600 bg-background"
                title="Narration reader"
              >
                <Volume2 className="size-3.5" /> Narrate Page
              </button>
            </div>

            {/* Search term matching */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <input
                  placeholder="Find text in book..."
                  value={readerSearchTerm}
                  onChange={(e) => setReaderSearchTerm(e.target.value)}
                  className="rounded-lg border bg-background pl-7 pr-3 py-1 text-xs outline-none focus:border-indigo-600"
                />
              </div>
              <button
                onClick={() => handleHighlightSelection("yellow")}
                className="p-1.5 border rounded-lg hover:bg-yellow-100 text-yellow-600 bg-background font-semibold"
                title="Highlight matches"
              >
                Highlight
              </button>

              <button
                onClick={() => {
                  setReaderBookmarks(prev =>
                    prev.includes(readerPage) ? prev.filter(x => x !== readerPage) : [...prev, readerPage]
                  );
                  toast.success(readerBookmarks.includes(readerPage) ? "Bookmark removed." : "Page bookmarked.");
                }}
                className="p-1.5 border rounded-lg hover:bg-gradient-soft bg-background"
                title="Bookmark current page"
              >
                <Bookmark className={`size-3.5 ${readerBookmarks.includes(readerPage) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
              </button>

              <button
                onClick={handlePrint}
                className="p-1.5 border rounded-lg hover:bg-gradient-soft bg-background"
                title="Print resource"
              >
                <Printer className="size-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => setIsAiSidebarOpen(prev => !prev)}
                className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold glow-indigo flex items-center gap-1 cursor-pointer"
                title="Toggle AI Assistant panel"
              >
                <Sparkles className="size-3.5" /> AI Assistant
              </button>
            </div>
          </div>

          {/* Main double panel container: Document content & AI sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left page viewer panel */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start" style={{ fontSize: `${readerZoom}%` }}>
              <Card className={`w-full max-w-2xl min-h-[70vh] p-8 shadow-lg border relative flex flex-col justify-between font-serif ${readerNightMode === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : readerNightMode === "sepia" ? "bg-amber-50 border-amber-200 text-amber-950" : "bg-white border-slate-200 text-slate-900"}`}>
                <div className="space-y-6">
                  {/* Page header title */}
                  <div className="flex justify-between items-center text-[10px] font-sans font-semibold tracking-wider text-muted-foreground uppercase border-b pb-2">
                    <span>{activeReaderBook.title}</span>
                    <span>Page {readerPage} of {activeReaderBook.pages}</span>
                  </div>

                  {/* Render simulated page content with highlight checks */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap py-4 font-sans">
                    {(() => {
                      const idKey = activeReaderBook.id.includes("algorithms") ? "algorithms" : activeReaderBook.id.includes("networks") ? "networks" : "default";
                      const contentText = BOOK_PAGES_CONTENT[idKey]?.[(readerPage - 1) % 8] || "Sample content page.";

                      // Highlights matching text
                      if (readerSearchTerm && readerHighlights.includes(readerSearchTerm.toLowerCase())) {
                        const regex = new RegExp(`(${readerSearchTerm})`, "gi");
                        const parts = contentText.split(regex);
                        return parts.map((part, i) =>
                          regex.test(part) ? (
                            <mark key={i} className="bg-yellow-200 text-slate-950 font-semibold px-0.5 rounded">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        );
                      }
                      return contentText;
                    })()}
                  </div>
                </div>

                {/* Page footer elements */}
                <div className="border-t pt-4 flex justify-between items-center text-[10px] text-muted-foreground font-sans font-semibold">
                  <span>Digital Library System</span>
                  <span>© Campus Management Start</span>
                </div>
              </Card>
            </div>

            {/* Right Side: Collapsible AI Assistant & Notes Side panel */}
            {isAiSidebarOpen && (
              <div className="w-80 border-l bg-background shrink-0 flex flex-col justify-between z-20 shadow-xl">
                {/* Side header */}
                <div className="p-3 border-b flex justify-between items-center bg-gradient-soft">
                  <span className="font-bold text-xs flex items-center gap-1 text-indigo-600">
                    <Sparkles className="size-4 animate-pulse" /> AI Study Assistant
                  </span>
                  <button onClick={() => setIsAiSidebarOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    ✕
                  </button>
                </div>

                {/* Sub tabs of AI tools */}
                <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-4">
                  {/* Quick AI tools shortcuts */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground block">Study tools shortcuts</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Summarize", key: "summarize" },
                        { label: "Explain Chap", key: "explain" },
                        { label: "Study Notes", key: "notes" },
                        { label: "Quiz Me", key: "mcq" },
                        { label: "Flashcards", key: "flashcards" },
                        { label: "Exam Questions", key: "questions" }
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          onClick={() => handleAiQuickFeature(btn.key)}
                          className="py-1 px-2 border hover:bg-indigo-50 hover:text-indigo-600 rounded text-[10px] font-semibold text-left transition cursor-pointer bg-background"
                        >
                          ✦ {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Translate Content Dropdown */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground block">Translate Selection</span>
                    <div className="flex gap-1">
                      {["Hindi", "Spanish", "French", "German"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleTranslate(lang)}
                          className="flex-1 py-1 border hover:bg-gradient-soft text-[9px] font-semibold rounded cursor-pointer bg-background"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MCQ quiz simulation panel */}
                  {quizScore === null && (
                    <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/50 text-xs space-y-2.5">
                      <span className="font-bold text-indigo-700 block">AI Generated Mini-Quiz</span>
                      {MOCK_QUIZ.map((q, qidx) => (
                        <div key={qidx} className="space-y-1.5">
                          <span className="font-semibold block">{qidx + 1}. {q.q}</span>
                          <div className="space-y-1">
                            {q.a.map((option, oidx) => (
                              <label key={oidx} className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="radio"
                                  name={`q-${qidx}`}
                                  checked={quizAnswers[qidx] === oidx}
                                  onChange={() => setQuizAnswers(prev => ({ ...prev, [qidx]: oidx }))}
                                  className="accent-indigo-600"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={submitQuiz}
                        className="w-full py-1.5 bg-indigo-600 text-white rounded-lg font-semibold glow-indigo cursor-pointer transition text-[11px]"
                      >
                        Submit Answers
                      </button>
                    </div>
                  )}

                  {quizScore !== null && (
                    <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50 text-center text-xs space-y-1">
                      <span className="font-bold text-emerald-800 block">Quiz Results</span>
                      <span className="text-lg font-black block text-emerald-700">
                        {quizScore} / {MOCK_QUIZ.length} Score
                      </span>
                      <button
                        onClick={() => setQuizScore(null)}
                        className="mt-2.5 py-1 px-3 border border-emerald-300 text-emerald-800 rounded bg-background hover:bg-emerald-100 font-semibold cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Flashcards simulator */}
                  <div className="border border-amber-100 rounded-xl p-3 bg-amber-50/30 text-xs space-y-3.5">
                    <span className="font-bold text-amber-800 block">Smart Study Flashcards</span>
                    {/* Flippable card */}
                    <div
                      onClick={() => setFlashcardFlipped(prev => !prev)}
                      className={`h-24 border-2 border-dashed border-amber-200 rounded-lg flex items-center justify-center p-3 text-center cursor-pointer transition-all duration-300 ${
                        flashcardFlipped ? "bg-amber-100/50 border-amber-300 scale-[1.02]" : "bg-background"
                      }`}
                    >
                      {flashcardFlipped ? (
                        <span className="font-semibold text-[11px] text-amber-900 leading-snug">
                          {
                            [
                              "A node-based binary tree data structure matching left < parent < right keys.",
                              "stateless request-response network layer protocol running over TCP ports.",
                              "Transaction changes must survive server crashes or restarts completely."
                            ][flashcardIndex]
                          }
                        </span>
                      ) : (
                        <span className="font-bold text-xs text-foreground">
                          {["Binary Search Trees?", "HTTP Protocol?", "ACID Durability?"][flashcardIndex]}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                      <span>Click to flip card</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlashcardIndex(idx => Math.max(0, idx - 1));
                            setFlashcardFlipped(false);
                          }}
                          className="px-2 py-0.5 border rounded cursor-pointer"
                        >
                          Prev
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlashcardIndex(idx => Math.min(2, idx + 1));
                            setFlashcardFlipped(false);
                          }}
                          className="px-2 py-0.5 border rounded cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Page Notes box */}
                  <div className="border rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground block flex items-center gap-1">
                      <BookMarked className="size-3.5" /> Notes on Page {readerPage}
                    </span>
                    {readerNotes[readerPage] ? (
                      <div className="p-2 border rounded-lg bg-gradient-soft text-xs relative group leading-relaxed">
                        <p>{readerNotes[readerPage]}</p>
                        <button
                          onClick={() => {
                            setReaderNotes(prev => {
                              const next = { ...prev };
                              delete next[readerPage];
                              return next;
                            });
                          }}
                          className="absolute right-1 top-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">No notes saved for this page.</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      <input
                        placeholder="Add notes for this page..."
                        value={readerNoteInput}
                        onChange={(e) => setReaderNoteInput(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-[11px] outline-none"
                      />
                      <button
                        onClick={handleAddPageNote}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Live AI chat thread */}
                  <div className="border rounded-xl p-3 flex-1 flex flex-col justify-between min-h-48">
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-56 text-xs pr-1">
                      {aiChatMessages.map((m) => (
                        <div key={m.id} className={`p-2 rounded-lg leading-relaxed ${m.sender === "user" ? "bg-indigo-50 border ml-6 text-slate-800" : "bg-gradient-soft border mr-6 text-foreground font-sans"}`}>
                          {m.text}
                        </div>
                      ))}
                      {aiLoading && <div className="text-[10px] text-muted-foreground animate-pulse">AI is typing replies...</div>}
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t mt-2">
                      <input
                        placeholder="Ask AI anything..."
                        value={aiChatInput}
                        onChange={(e) => setAiChatInput(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border text-xs outline-none focus:border-indigo-600"
                        onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                      />
                      <button
                        onClick={handleSendAiMessage}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                      >
                        <Send className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
