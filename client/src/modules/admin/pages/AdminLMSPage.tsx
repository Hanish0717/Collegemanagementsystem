import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  Download,
  Calendar,
  MessageSquare,
  Send,
  ExternalLink,
  ClipboardList,
  GraduationCap,
  ChevronRight,
  Clock,
  ArrowLeft,
  Award
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { getStoredUser } from "@/services/authService";
import { toast } from "sonner";

// Type definitions
interface SyllabusItem {
  code: string;
  subject: string;
  curriculum: string;
  semester: number;
  completion: number;
}

interface ResourceItem {
  id: string;
  title: string;
  type: "PDF Document" | "Video Lecture" | "Assignment Sheet";
  subject: string;
  size: string;
  url?: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  description: string;
  grade?: string;
  submittedFile?: string;
  feedback?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  questions: QuizQuestion[];
  completed?: boolean;
  score?: number;
}

interface ForumPost {
  id: string;
  title: string;
  category: "General" | "Doubts" | "Announcements";
  author: string;
  role: string;
  date: string;
  content: string;
  comments: { author: string; role: string; content: string; date: string }[];
}

interface ClassItem {
  id: string;
  subject: string;
  topic: string;
  instructor: string;
  date: string;
  time: string;
  link: string;
  status: "Upcoming" | "Live" | "Completed";
}

export function AdminLMS() {
  const user = getStoredUser();
  const userRole = user?.role || "student";
  const userName = user?.fullName || "Demo User";
  const isStudent = userRole === "student";
  const isInstructor = userRole === "faculty" || userRole === "admin" || userRole === "super_admin" || userRole === "super-admin" || userRole === "lms";

  const [activeTab, setActiveTab] = useState<
    "curriculum" | "notes" | "videos" | "assignments" | "quizzes" | "forum" | "classes"
  >("curriculum");

  // --- 1. Syllabus States ---
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([
    { code: "ML-502", subject: "Machine Learning Foundations", curriculum: "R23", semester: 5, completion: 82 },
    { code: "CD-504", subject: "Compiler Design", curriculum: "R23", semester: 5, completion: 74 },
    { code: "VL-701", subject: "VLSI System Architectures", curriculum: "R20", semester: 7, completion: 91 },
    { code: "DA-506", subject: "Design & Analysis of Algorithms", curriculum: "R23", semester: 5, completion: 85 }
  ]);

  // --- 2. Notes / Catalog States ---
  const [resources, setResources] = useState<ResourceItem[]>([
    { id: "RES-101", title: "Syllabus Plan & Course Outcomes", type: "PDF Document", subject: "Machine Learning Foundations", size: "1.2 MB" },
    { id: "RES-102", title: "Neural Networks Backpropagation Guide", type: "PDF Document", subject: "Machine Learning Foundations", size: "3.4 MB" },
    { id: "RES-103", title: "Lexical Analyzer Code Templates", type: "PDF Document", subject: "Compiler Design", size: "820 KB" }
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Machine Learning Foundations");

  // --- 3. Video Lecture States ---
  const [videos, setVideos] = useState<ResourceItem[]>([
    { id: "VID-01", title: "Introduction to Artificial Neural Networks", type: "Video Lecture", subject: "Machine Learning Foundations", size: "45 Mins", url: "https://www.youtube.com/embed/aircAruvnKk" },
    { id: "VID-02", title: "LL(1) Parser Table Construction Tutorial", type: "Video Lecture", subject: "Compiler Design", size: "32 Mins", url: "https://www.youtube.com/embed/smnL5M-nNlo" }
  ]);
  const [activeVideo, setActiveVideo] = useState<ResourceItem | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoSubject, setNewVideoSubject] = useState("Machine Learning Foundations");

  // --- 4. Assignments States ---
  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    { id: "ASG-01", title: "Gradient Descent Implementation in Python", subject: "Machine Learning Foundations", dueDate: "2026-07-20", status: "Pending", description: "Implement batch, stochastic, and mini-batch gradient descent algorithms from scratch and compare their convergence curves on the housing price dataset." },
    { id: "ASG-02", title: "Recursive Descent Parser for Arithmetic Expressions", subject: "Compiler Design", dueDate: "2026-07-24", status: "Submitted", description: "Build a parser in C++/Java that parses custom grammar for mathematical operators accounting for parenthesis, operator priority, and associativity.", submittedFile: "https://example.com/recursive-descent-parser.pdf" },
    { id: "ASG-03", title: "Dynamic Programming Memoization vs Tabulation", subject: "Design & Analysis of Algorithms", dueDate: "2026-07-15", status: "Graded", description: "Write comparative notes on matrix chain multiplication and find the optimal parenthesis order using both bottom-up and top-down DP paradigms.", grade: "A+", feedback: "Excellent documentation and trace tables!", submittedFile: "https://example.com/dp-assignment.pdf" }
  ]);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submitFileLink, setSubmitFileLink] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");

  const [newAsgTitle, setNewAsgTitle] = useState("");
  const [newAsgSubject, setNewAsgSubject] = useState("Machine Learning Foundations");
  const [newAsgDeadline, setNewAsgDeadline] = useState("");
  const [newAsgDesc, setNewAsgDesc] = useState("");

  // For faculty: viewing student submissions
  const [viewingSubmissionsAsgId, setViewingSubmissionsAsgId] = useState<string | null>(null);
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  // --- 5. Quiz States ---
  const [quizzes, setQuizzes] = useState<QuizItem[]>([
    {
      id: "QZ-01",
      title: "Quiz 1: Neural Nets Parameters",
      subject: "Machine Learning Foundations",
      date: "July 24",
      questions: [
        { question: "Which activation function is widely used to prevent vanishing gradient in deep nets?", options: ["Sigmoid", "Tanh", "ReLU", "Linear"], correct: 2 },
        { question: "What is the primary function of learning rate in gradient descent?", options: ["Determines the batch sizing", "Controls the step size in update iterations", "Configures layer nodes", "Applies L2 regularization"], correct: 1 }
      ]
    },
    {
      id: "QZ-02",
      title: "Quiz 2: Bottom-Up Parser Trees",
      subject: "Compiler Design",
      date: "July 29",
      questions: [
        { question: "An LR parser stands for:", options: ["Left-to-right, Rightmost derivation in reverse", "Leftmost derivation, Recursive descent", "Lexical parsing, Regular parsing", "Linear resolution, Right parsing"], correct: 0 }
      ]
    }
  ]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizSubject, setNewQuizSubject] = useState("Machine Learning Foundations");
  const [quizQuestionsForm, setQuizQuestionsForm] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correct: 0 }
  ]);

  // --- 6. Discussion Forum States ---
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: "POST-01",
      title: "How to tune hyperparameters for Random Forest?",
      category: "Doubts",
      author: "Hanish Kumar",
      role: "Student",
      date: "1 day ago",
      content: "Hi all, I am building a predictor model but keep overfitting. Does max_depth or min_samples_split help more with regularization in sklearn's RandomForestClassifier?",
      comments: [
        { author: "Dr. Srinivas Rao", role: "Faculty", content: "Reducing max_depth and increasing min_samples_leaf will both regularize effectively by limiting split depth.", date: "12 hours ago" }
      ]
    },
    {
      id: "POST-02",
      title: "Announcement: Syllabus coverage and Midterms scope",
      category: "Announcements",
      author: "Dr. Srinivas Rao",
      role: "Faculty",
      date: "2 days ago",
      content: "The syllabus scope for Compiler Design midterms next week will cover lexical analysis and LL(1)/LR(0) parsing. Please review resources RES-103.",
      comments: []
    }
  ]);
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<"General" | "Doubts" | "Announcements">("Doubts");
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // --- 7. Online Classes States ---
  const [classesList, setClassesList] = useState<ClassItem[]>([
    { id: "CLS-01", subject: "Machine Learning Foundations", topic: "Regularization Techniques & L1/L2 Norms", instructor: "Dr. Srinivas Rao", date: "Today", time: "02:00 PM - 03:00 PM", link: "https://meet.google.com/abc-defg-hij", status: "Live" },
    { id: "CLS-02", subject: "Compiler Design", topic: "Syntax-Directed Translation Schemes", instructor: "Prof. Anjali Sharma", date: "Tomorrow", time: "10:30 AM - 11:30 AM", link: "https://meet.google.com/xyz-pqrs-tuv", status: "Upcoming" },
    { id: "CLS-03", subject: "Design & Analysis of Algorithms", topic: "Network Flow & Ford-Fulkerson Algorithm", instructor: "Dr. Srinivas Rao", date: "July 20", time: "01:00 PM - 02:00 PM", link: "https://meet.google.com/mnp-qrst-uvw", status: "Upcoming" }
  ]);
  const [newClassSubject, setNewClassSubject] = useState("Machine Learning Foundations");
  const [newClassTopic, setNewClassTopic] = useState("");
  const [newClassDate, setNewClassDate] = useState("");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassLink, setNewClassLink] = useState("");

  // --- Add Handlers ---
  const handlePublishNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a note title!");
      return;
    }
    const newRes: ResourceItem = {
      id: `RES-${100 + resources.length + 1}`,
      title: newTitle,
      type: "PDF Document",
      subject: newSubject,
      size: "1.5 MB"
    };
    setResources([newRes, ...resources]);
    toast.success(`Published Note: "${newTitle}"`);
    setNewTitle("");
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      toast.error("Please fill in both video title and URL!");
      return;
    }
    // Clean embed URL format if normal link
    let finalUrl = newVideoUrl;
    if (newVideoUrl.includes("watch?v=")) {
      finalUrl = `https://www.youtube.com/embed/${newVideoUrl.split("v=")[1].split("&")[0]}`;
    }
    const newVid: ResourceItem = {
      id: `VID-${100 + videos.length + 1}`,
      title: newVideoTitle,
      type: "Video Lecture",
      subject: newVideoSubject,
      size: "25 Mins",
      url: finalUrl
    };
    setVideos([...videos, newVid]);
    toast.success(`Lecture video: "${newVideoTitle}" registry added!`);
    setNewVideoTitle("");
    setNewVideoUrl("");
  };

  const handlePublishAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgDeadline || !newAsgDesc.trim()) {
      toast.error("Please fill in all fields to launch the assignment!");
      return;
    }
    const newAsg: AssignmentItem = {
      id: `ASG-${100 + assignments.length + 1}`,
      title: newAsgTitle,
      subject: newAsgSubject,
      dueDate: newAsgDeadline,
      status: "Pending",
      description: newAsgDesc
    };
    setAssignments([newAsg, ...assignments]);
    toast.success(`Launched assignment: "${newAsgTitle}"`);
    setNewAsgTitle("");
    setNewAsgDeadline("");
    setNewAsgDesc("");
  };

  const handlePublishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || quizQuestionsForm.some(q => !q.question.trim())) {
      toast.error("Please complete the quiz structure with title & questions!");
      return;
    }
    const newQ: QuizItem = {
      id: `QZ-${100 + quizzes.length + 1}`,
      title: newQuizTitle,
      subject: newQuizSubject,
      date: "Today",
      questions: quizQuestionsForm
    };
    setQuizzes([newQ, ...quizzes]);
    toast.success(`Published Quiz: "${newQuizTitle}"`);
    setNewQuizTitle("");
    setQuizQuestionsForm([{ question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const handleCreateForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Discussion title and content are required!");
      return;
    }
    const newPost: ForumPost = {
      id: `POST-${Date.now()}`,
      title: newPostTitle,
      category: newPostCategory,
      author: userName,
      role: isStudent ? "Student" : "Faculty",
      date: "Just now",
      content: newPostContent,
      comments: []
    };
    setForumPosts([newPost, ...forumPosts]);
    toast.success(`Thread "${newPostTitle}" created!`);
    setNewPostTitle("");
    setNewPostContent("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activePost) return;

    const newComment = {
      author: userName,
      role: isStudent ? "Student" : "Faculty",
      content: newCommentText,
      date: "Just now"
    };

    const updatedPosts = forumPosts.map(p => {
      if (p.id === activePost.id) {
        const updated = { ...p, comments: [...p.comments, newComment] };
        setActivePost(updated);
        return updated;
      }
      return p;
    });

    setForumPosts(updatedPosts);
    setNewCommentText("");
    toast.success("Comment posted!");
  };

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTopic.trim() || !newClassDate || !newClassTime || !newClassLink.trim()) {
      toast.error("Please fill in all virtual lecture details!");
      return;
    }
    const newCls: ClassItem = {
      id: `CLS-${Date.now()}`,
      subject: newClassSubject,
      topic: newClassTopic,
      instructor: userName,
      date: newClassDate === new Date().toISOString().split('T')[0] ? "Today" : newClassDate,
      time: newClassTime,
      link: newClassLink,
      status: "Upcoming"
    };
    setClassesList([newCls, ...classesList]);
    toast.success(`Scheduled Online Class: "${newClassTopic}"`);
    setNewClassTopic("");
    setNewClassDate("");
    setNewClassTime("");
    setNewClassLink("");
  };

  // --- Student Assignment Submission Handlers ---
  const handleStudentSubmitAsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId) return;

    setAssignments(prev =>
      prev.map(a =>
        a.id === submittingAssignmentId
          ? { ...a, status: "Submitted", submittedFile: submitFileLink || "https://example.com/submitted-notes.pdf" }
          : a
      )
    );
    toast.success("Assignment submitted successfully!");
    setSubmittingAssignmentId(null);
    setSubmitFileLink("");
    setSubmitNotes("");
  };

  // --- Faculty Submission Grading ---
  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubId) return;

    setAssignments(prev =>
      prev.map(a =>
        a.id === gradingSubId
          ? { ...a, status: "Graded", grade: gradeInput || "A", feedback: feedbackInput || "Good effort!" }
          : a
      )
    );
    toast.success("Student submission graded!");
    setGradingSubId(null);
    setGradeInput("");
    setFeedbackInput("");
  };

  // --- Student Quiz Taking Handlers ---
  const handleAnswerSelect = (qIdx: number, optionIdx: number) => {
    setQuizAnswers({ ...quizAnswers, [qIdx]: optionIdx });
  };

  const handleQuizSubmit = () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        score++;
      }
    });

    const finalPercentage = Math.round((score / activeQuiz.questions.length) * 100);
    setQuizScore(finalPercentage);

    setQuizzes(prev =>
      prev.map(q =>
        q.id === activeQuiz.id
          ? { ...q, completed: true, score: finalPercentage }
          : q
      )
    );
    toast.success(`Quiz completed! You scored ${finalPercentage}%`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Management System (LMS)"
        desc={
          isStudent
            ? "Your central digital classroom. Access subject notes, watch online class lectures, submit assessments, and chat in the discussion board."
            : "Administer curriculum schemas, upload digital syllabus documents, manage video lectures registry, grade student assignments, and launch quizzes."
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Notes &amp; PDF Guides"
          value={`${resources.length} resources`}
          change="Syllabus curriculum guides"
          icon={FileText}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Video Lectures"
          value={`${videos.length} lectures`}
          change="Available 24/7 online"
          icon={Video}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Discussion Posts"
          value={`${forumPosts.length} threads`}
          change="Real-time peer doubt clearance"
          icon={MessageSquare}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Virtual Classes"
          value={`${classesList.filter(c => c.status === "Live" || c.status === "Upcoming").length} schedules`}
          change="Join live video streams"
          icon={Calendar}
          gradient="bg-gradient-primary"
        />
      </div>

      {/* Dynamic Tab Navigation */}
      <div className="flex border-b overflow-x-auto scrollbar-none gap-2">
        {[
          { id: "curriculum", label: "Curriculum Syllabus", icon: BookOpen },
          { id: "notes", label: "Study Notes", icon: FileText },
          { id: "videos", label: "Video Lectures", icon: Video },
          { id: "assignments", label: "Assignments Hub", icon: ClipboardList },
          { id: "quizzes", label: "Quizzes", icon: HelpCircle },
          { id: "forum", label: "Discussion Forum", icon: MessageSquare },
          { id: "classes", label: "Online Classes", icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setActiveVideo(null);
              setActiveQuiz(null);
              setActivePost(null);
              setViewingSubmissionsAsgId(null);
            }}
            className={`px-4 py-3 font-semibold text-xs border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: CURRICULUM SYLLABUS --- */}
      {activeTab === "curriculum" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold mb-3">Syllabus Completion &amp; Course Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Subject Code</th>
                    <th className="text-left pb-2">Subject Title</th>
                    <th className="text-center pb-2">Scheme</th>
                    <th className="text-center pb-2">Sem</th>
                    <th className="text-right pb-2">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syllabusList.map(row => (
                    <tr key={row.code}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{row.code}</td>
                      <td className="py-3 font-bold text-slate-800">{row.subject}</td>
                      <td className="py-3 text-center font-bold text-slate-500">{row.curriculum}</td>
                      <td className="py-3 text-center font-semibold text-slate-600">Sem {row.semester}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-bold text-slate-700">{row.completion}%</span>
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${row.completion}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Classroom Guidelines</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Welcome to the CMS Integrated LMS. Follow these steps to navigate course resources:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 mt-3 list-disc pl-4 leading-relaxed">
              <li><strong>Study Notes</strong> tab contains official PDFs uploaded by HODs and faculty.</li>
              <li><strong>Video Lectures</strong> features interactive classroom lecture records.</li>
              <li>Always check the <strong>Assignments Hub</strong> to submit outstanding worksheets before due dates.</li>
              <li>Post your queries on the <strong>Discussion Forum</strong> to get peer answers.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* --- TAB 2: STUDY NOTES --- */}
      {activeTab === "notes" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold mb-3">Active Notes Catalog</h3>
            <div className="space-y-3">
              {resources.filter(r => r.type === "PDF Document").map(row => (
                <div key={row.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <div className="font-bold text-slate-800">{row.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Course: {row.subject} • PDF Document</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{row.size}</span>
                    <button
                      onClick={() => toast.success(`Downloaded: ${row.title}`)}
                      className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition cursor-pointer border border-indigo-100 flex items-center gap-1.5"
                    >
                      <Download className="size-3.5" /> Download
                    </button>
                    {isInstructor && (
                      <button
                        onClick={() => {
                          setResources(resources.filter(res => res.id !== row.id));
                          toast.warning("Resource removed.");
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                        title="Remove Note"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {isInstructor && (
            <Card>
              <h3 className="font-semibold mb-2">Upload Course Notes</h3>
              <form onSubmit={handlePublishNote} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3: Context-Free Grammars"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    {syllabusList.map(s => (
                      <option key={s.code} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Publish Note Resource
                </button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB 3: VIDEO LECTURES --- */}
      {activeTab === "videos" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold">Interactive Video Lectures</h3>
            {activeVideo ? (
              <div className="space-y-3">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                >
                  <ArrowLeft className="size-3.5" /> Back to lectures list
                </button>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={activeVideo.url}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2">{activeVideo.title}</h4>
                <p className="text-xs text-muted-foreground">Subject: {activeVideo.subject} • Duration: {activeVideo.size}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {videos.map(vid => (
                  <div key={vid.id} className="border rounded-2xl overflow-hidden hover:shadow-md transition bg-white flex flex-col justify-between">
                    <div className="aspect-video w-full bg-slate-950 flex items-center justify-center relative cursor-pointer group" onClick={() => setActiveVideo(vid)}>
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition"></div>
                      <div className="size-12 rounded-full bg-white/90 shadow-md flex items-center justify-center text-indigo-600 group-hover:scale-110 transition relative z-10">
                        <Play className="size-5 fill-indigo-600 translate-x-0.5" />
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{vid.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{vid.subject}</span>
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{vid.size}</span>
                      </div>
                      {isInstructor && (
                        <button
                          onClick={() => setVideos(videos.filter(v => v.id !== vid.id))}
                          className="text-[10px] font-semibold text-rose-600 hover:underline pt-2 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="size-3" /> Remove Lecture
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          {isInstructor && (
            <Card>
              <h3 className="font-semibold mb-2">Publish Video Lecture</h3>
              <form onSubmit={handleAddVideo} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Video Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 2: Backpropagation Proof"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">YouTube/Vimeo Embed URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <select
                    value={newVideoSubject}
                    onChange={(e) => setNewVideoSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    {syllabusList.map(s => (
                      <option key={s.code} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Add Video to Portal
                </button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB 4: ASSIGNMENTS HUB --- */}
      {activeTab === "assignments" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            {viewingSubmissionsAsgId ? (
              <div className="space-y-4">
                <button
                  onClick={() => setViewingSubmissionsAsgId(null)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  <ArrowLeft className="size-3.5" /> Back to assignments roster
                </button>
                <h3 className="font-bold text-slate-800 text-sm">
                  Submissions for: {assignments.find(a => a.id === viewingSubmissionsAsgId)?.title}
                </h3>
                
                {/* Mock student submissions */}
                <div className="space-y-3 mt-3">
                  {[
                    { student: "Hanish Kumar", file: "https://example.com/hanish-ml.pdf", submittedAt: "July 15, 2026", status: assignments.find(a => a.id === viewingSubmissionsAsgId)?.status === "Graded" ? "Graded" : "Submitted", grade: assignments.find(a => a.id === viewingSubmissionsAsgId)?.grade, feedback: assignments.find(a => a.id === viewingSubmissionsAsgId)?.feedback },
                    { student: "Aarav Sharma", file: "https://example.com/aarav-ml.pdf", submittedAt: "July 14, 2026", status: "Submitted" }
                  ].map((sub, idx) => (
                    <div key={idx} className="p-4 border rounded-2xl text-xs space-y-2 bg-slate-50/50">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800">{sub.student}</span>
                        <Badge tone={sub.status === "Graded" ? "success" : "info"}>{sub.status}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-400">Submitted at: {sub.submittedAt}</div>
                      <div className="flex items-center gap-2 pt-1">
                        <a href={sub.file} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                          <Download className="size-3.5" /> View Submitted File
                        </a>
                      </div>

                      {sub.status === "Graded" ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2 text-[11px] text-slate-800 space-y-1">
                          <div><strong>Grade:</strong> <span className="font-bold text-emerald-700">{sub.grade}</span></div>
                          <div><strong>Feedback:</strong> {sub.feedback}</div>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setGradingSubId(viewingSubmissionsAsgId);
                              setGradeInput("");
                              setFeedbackInput("");
                            }}
                            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-indigo-700 transition cursor-pointer"
                          >
                            Grade &amp; Provide Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Active Assignments</h3>
                <div className="space-y-3">
                  {assignments.map(asg => (
                    <div key={asg.id} className="p-4 border rounded-2xl text-xs space-y-3 hover:shadow-xs transition bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-800">{asg.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Subject: {asg.subject}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge tone={asg.status === "Graded" ? "success" : asg.status === "Submitted" ? "info" : "warn"}>
                            {asg.status}
                          </Badge>
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="size-3" /> Due: {asg.dueDate}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{asg.description}</p>

                      {asg.status === "Graded" && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-slate-800 space-y-1">
                          <div className="font-semibold text-emerald-800">Grade Report:</div>
                          <div>Grade Score: <span className="font-bold">{asg.grade}</span></div>
                          <div>Instructor Remarks: "{asg.feedback}"</div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-1">
                        {isStudent && asg.status === "Pending" && (
                          <button
                            onClick={() => {
                              setSubmittingAssignmentId(asg.id);
                              setSubmitFileLink("");
                              setSubmitNotes("");
                            }}
                            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                          >
                            Submit Assignment
                          </button>
                        )}
                        {isStudent && asg.status !== "Pending" && (
                          <a
                            href={asg.submittedFile}
                            target="_blank"
                            rel="noreferrer"
                            className="border border-slate-200 text-slate-600 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-50 transition inline-flex items-center gap-1"
                          >
                            <Download className="size-3.5" /> View Submission
                          </a>
                        )}
                        {isInstructor && (
                          <button
                            onClick={() => setViewingSubmissionsAsgId(asg.id)}
                            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1"
                          >
                            View Submissions <ChevronRight className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          {isInstructor ? (
            <Card>
              <h3 className="font-semibold mb-2">Launch New Assignment</h3>
              <form onSubmit={handlePublishAssignment} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Recursion Analysis Sheet"
                    value={newAsgTitle}
                    onChange={(e) => setNewAsgTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <select
                    value={newAsgSubject}
                    onChange={(e) => setNewAsgSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    {syllabusList.map(s => (
                      <option key={s.code} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={newAsgDeadline}
                    onChange={(e) => setNewAsgDeadline(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Description / Outline *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific guidelines, topics, formatting criteria..."
                    value={newAsgDesc}
                    onChange={(e) => setNewAsgDesc(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Launch Assignment
                </button>
              </form>
            </Card>
          ) : (
            <Card>
              <h3 className="font-semibold mb-2">Submissions Status</h3>
              <div className="space-y-3 mt-3 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Graded Assignments</span>
                  <span className="font-bold text-indigo-600">
                    {assignments.filter(a => a.status === "Graded").length}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Pending Submissions</span>
                  <span className="font-bold text-amber-500">
                    {assignments.filter(a => a.status === "Pending").length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span>Total Submitted</span>
                  <span className="font-bold text-emerald-500">
                    {assignments.filter(a => a.status === "Submitted" || a.status === "Graded").length}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB 5: QUIZZES --- */}
      {activeTab === "quizzes" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            {activeQuiz ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                >
                  <ArrowLeft className="size-3.5" /> Back to Quizzes
                </button>
                <div className="p-4 border rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{activeQuiz.title}</h4>
                  <p className="text-xs text-slate-400">Subject: {activeQuiz.subject} • {activeQuiz.questions.length} questions</p>
                </div>

                {quizScore !== null ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-3">
                    <div className="inline-flex size-16 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center">
                      <Award className="size-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Quiz Completed!</h4>
                    <p className="text-xs text-slate-500">Your score represents correctness of all choices selected.</p>
                    <div className="text-3xl font-black text-indigo-600">{quizScore}%</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeQuiz.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 border rounded-2xl bg-white space-y-3">
                        <div className="font-semibold text-xs text-slate-800">Q{qIdx + 1}. {q.question}</div>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-left font-medium transition ${
                                quizAnswers[qIdx] === optIdx
                                  ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-3xs"
                                  : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50 cursor-pointer text-xs"
                    >
                      Submit Quiz &amp; Auto-Grade
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Upcoming &amp; Active Quizzes</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quizzes.map(qz => (
                    <div key={qz.id} className="p-4 border rounded-2xl hover:shadow-xs transition bg-white flex flex-col justify-between gap-4">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{qz.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Subject: {qz.subject}</div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-50">
                        <span>{qz.questions.length} MCQ Questions</span>
                        {qz.completed ? (
                          <Badge tone="success">Completed ({qz.score}%)</Badge>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveQuiz(qz);
                              setQuizAnswers({});
                              setQuizScore(null);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1 rounded-lg transition cursor-pointer"
                          >
                            Start Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          {isInstructor && (
            <Card>
              <h3 className="font-semibold mb-2">Build New Quiz</h3>
              <form onSubmit={handlePublishQuiz} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3: Automata &amp; Grammar"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <select
                    value={newQuizSubject}
                    onChange={(e) => setNewQuizSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    {syllabusList.map(s => (
                      <option key={s.code} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2 border-t space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Question Structure</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter question text..."
                    value={quizQuestionsForm[0].question}
                    onChange={(e) => {
                      const updated = [...quizQuestionsForm];
                      updated[0].question = e.target.value;
                      setQuizQuestionsForm(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {quizQuestionsForm[0].options.map((opt, oIdx) => (
                      <input
                        key={oIdx}
                        type="text"
                        required
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...quizQuestionsForm];
                          updated[0].options[oIdx] = e.target.value;
                          setQuizQuestionsForm(updated);
                        }}
                        className="px-3 py-1.5 rounded-lg border bg-background text-[11px] focus:border-indigo-500 outline-none"
                      />
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Correct Option Index</label>
                    <select
                      value={quizQuestionsForm[0].correct}
                      onChange={(e) => {
                        const updated = [...quizQuestionsForm];
                        updated[0].correct = parseInt(e.target.value, 10);
                        setQuizQuestionsForm(updated);
                      }}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs focus:border-indigo-500 outline-none"
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Publish Quiz
                </button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB 6: DISCUSSION FORUM --- */}
      {activeTab === "forum" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            {activePost ? (
              <div className="space-y-4">
                <button
                  onClick={() => setActivePost(null)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                >
                  <ArrowLeft className="size-3.5" /> Back to discussion threads
                </button>
                <div className="p-4 border rounded-2xl bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {activePost.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{activePost.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{activePost.title}</h4>
                  <div className="text-[10px] text-slate-500">
                    Posted by: <strong>{activePost.author}</strong> ({activePost.role})
                  </div>
                  <p className="text-xs text-slate-600 pt-2 border-t leading-relaxed whitespace-pre-line">{activePost.content}</p>
                </div>

                {/* Comments / Replies */}
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="font-bold text-xs text-slate-700">Replies ({activePost.comments.length})</h5>
                  {activePost.comments.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No replies yet. Be the first to answer!</div>
                  ) : (
                    activePost.comments.map((c, idx) => (
                      <div key={idx} className="p-3 border rounded-xl text-xs space-y-1.5 bg-white">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{c.author} <span className="text-[10px] text-slate-400 font-normal">({c.role})</span></span>
                          <span className="text-[10px] text-slate-400">{c.date}</span>
                        </div>
                        <p className="text-slate-600">{c.content}</p>
                      </div>
                    ))
                  )}

                  {/* Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      required
                      placeholder="Write your answer or response..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                    >
                      <Send className="size-3.5" /> Reply
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Discussion Forums</h3>
                <div className="space-y-3">
                  {forumPosts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setActivePost(p)}
                      className="p-4 border rounded-2xl hover:shadow-xs transition bg-white cursor-pointer space-y-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.date}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 hover:text-indigo-600 transition">{p.title}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{p.content}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                        <span>By: {p.author} ({p.role})</span>
                        <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                          <MessageSquare className="size-3.5" /> {p.comments.length} Replies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Create New Discussion</h3>
            <form onSubmit={handleCreateForumPost} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your doubt or announcement..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                >
                  <option value="Doubts">Doubt / Question</option>
                  <option value="General">General / Talk</option>
                  {isInstructor && <option value="Announcements">Instructor Announcement</option>}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your issue, paste stack trace/proof tables..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Create Thread
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* --- TAB 7: ONLINE CLASSES --- */}
      {activeTab === "classes" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold mb-3">Live &amp; Scheduled Classes</h3>
            <div className="space-y-4">
              {classesList.map(cls => (
                <div key={cls.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white hover:shadow-xs transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{cls.subject}</span>
                      <Badge tone={cls.status === "Live" ? "success" : "info"}>{cls.status}</Badge>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">{cls.topic}</div>
                    <div className="text-[10px] text-slate-400">
                      Instructor: {cls.instructor} • Date: {cls.date} • Time: {cls.time}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:self-center shrink-0">
                    <a
                      href={cls.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Join Class <ExternalLink className="size-3.5" />
                    </a>
                    {isInstructor && (
                      <button
                        onClick={() => setClassesList(classesList.filter(c => c.id !== cls.id))}
                        className="border border-slate-100 hover:bg-rose-50 text-rose-600 rounded-xl p-2 transition cursor-pointer"
                        title="Cancel Class"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {isInstructor && (
            <Card>
              <h3 className="font-semibold mb-2">Schedule Virtual Lecture</h3>
              <form onSubmit={handleCreateForumPost} className="space-y-3">
                {/* Note: scheduling link using scheduleClass handler */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <select
                    value={newClassSubject}
                    onChange={(e) => setNewClassSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    {syllabusList.map(s => (
                      <option key={s.code} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Lecture Topic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backpropagation Proof &amp; Derivatives"
                    value={newClassTopic}
                    onChange={(e) => setNewClassTopic(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Date *</label>
                    <input
                      type="date"
                      required
                      value={newClassDate}
                      onChange={(e) => setNewClassDate(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Time (e.g. 10 AM - 11 AM) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 02:00 PM - 03:00 PM"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Meeting Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://meet.google.com/..."
                    value={newClassLink}
                    onChange={(e) => setNewClassLink(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleScheduleClass}
                  className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Schedule Online Class
                </button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* SUBMIT ASSIGNMENT MODAL (For Students) */}
      <AnimatePresence>
        {submittingAssignmentId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <h4 className="font-bold text-slate-800 text-sm mb-1">Submit Assignment Work</h4>
              <p className="text-xs text-slate-400 mb-4">
                Attach submission document links or upload your finalized notes/code files.
              </p>
              <form onSubmit={handleStudentSubmitAsg} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Document Link / PDF URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/your-submission.pdf"
                    value={submitFileLink}
                    onChange={(e) => setSubmitFileLink(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Additional Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Write details, comments, or references for the reviewer..."
                    value={submitNotes}
                    onChange={(e) => setSubmitNotes(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignmentId(null)}
                    className="border border-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Confirm Submission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRADING SUBMISSION MODAL (For Instructors) */}
      <AnimatePresence>
        {gradingSubId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <h4 className="font-bold text-slate-800 text-sm mb-1">Grade Submission</h4>
              <p className="text-xs text-slate-400 mb-4">Provide a grade score and feedback remarks for the student's submission.</p>
              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Grade (e.g. A+, B, C) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A+"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Review Feedback Remarks *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Outstanding execution! Excellent code formatting..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setGradingSubId(null)}
                    className="border border-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Save Grade Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminLMS;
