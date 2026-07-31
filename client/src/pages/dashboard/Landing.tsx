import { Link } from "@tanstack/react-router";
import { EduSuiteLogoGraphic, EduSuiteLogo as Logo } from "@/components/ui/EduSuiteLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Star,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Cloud,
  Search,
  ChevronRight,
  Play,
  Plus,
  Trash2,
  Share2,
  WifiOff,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Send,
  Sparkles,
  Lock,
  Tag,
  FileText,
  Pin,
  CheckSquare,
  List,
  Code,
  Image as ImageIcon,
  ChevronDown,
  Clock
} from "lucide-react";

// Note interface for the interactive mockup
interface Note {
  id: string;
  title: string;
  category: "Work" | "Study" | "Ideas" | "Personal";
  date: string;
  snippet: string;
  pinned?: boolean;
  goals: { id: string; text: string; done: boolean }[];
}



export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // EduSuite Pro Interactive Mockup State
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Project Roadmap",
      category: "Work",
      date: "Today, 10:30 AM",
      snippet: "Q2 planning, features, timeline and milestones for the product launch...",
      pinned: true,
      goals: [
        { id: "g1", text: "Research & Discovery", done: true },
        { id: "g2", text: "Wireframes", done: true },
        { id: "g3", text: "Development", done: false },
        { id: "g4", text: "Testing", done: false },
        { id: "g5", text: "Launch 🚀", done: false }
      ]
    },
    {
      id: "2",
      title: "Design ideas",
      category: "Ideas",
      date: "Yesterday",
      snippet: "Ideas for landing page, animations and micro-interactions...",
      goals: [
        { id: "g6", text: "Landing page mockup iteration", done: false },
        { id: "g7", text: "Smooth page transition tests", done: true },
        { id: "g8", text: "Micro-animations for buttons", done: false }
      ]
    },
    {
      id: "3",
      title: "React Notes",
      category: "Study",
      date: "May 12",
      snippet: "useState, useEffect, custom hooks and performance optimization...",
      goals: [
        { id: "g9", text: "Check hook dependency arrays", done: true },
        { id: "g10", text: "Write custom useLocalStorage hook", done: false },
        { id: "g11", text: "Analyze bundle size with analyzer", done: false }
      ]
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Handler to toggle goals in interactive mockup
  const toggleGoal = (noteId: string, goalId: string) => {
    setNotes(
      notes.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            goals: n.goals.map((g) => (g.id === goalId ? { ...g, done: !g.done } : g))
          };
        }
        return n;
      })
    );
  };

  // Add note handler
  const handleAddNote = () => {
    const newId = (notes.length + 1).toString();
    const newNote: Note = {
      id: newId,
      title: "New Note Checklist",
      category: "Ideas",
      date: "Just now",
      snippet: "Start adding tasks and notes here...",
      goals: [
        { id: `g_new_1`, text: "Write down initial thoughts", done: false },
        { id: `g_new_2`, text: "Set priorities", done: false }
      ]
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newId);
  };

  // Delete note handler
  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) return;
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    setSelectedNoteId(remaining[0].id);
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category tags helper
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Work":
        return "bg-amber-100/60 text-amber-800 border-amber-200/40";
      case "Study":
        return "bg-emerald-100/60 text-emerald-800 border-emerald-200/40";
      case "Ideas":
        return "bg-purple-100/60 text-purple-800 border-purple-200/40";
      case "Personal":
        return "bg-rose-100/60 text-rose-800 border-rose-200/40";
      default:
        return "bg-slate-100/60 text-slate-800 border-slate-200/40";
    }
  };

  const getCategoryDotColor = (cat: string) => {
    switch (cat) {
      case "Work":
        return "bg-amber-500";
      case "Study":
        return "bg-emerald-500";
      case "Ideas":
        return "bg-purple-500";
      case "Personal":
        return "bg-rose-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFF] text-[#081A3A] font-sans selection:bg-[#EAF3FF] selection:text-[#0A5BFF] antialiased overflow-x-hidden">
      
      {/* Background glow decorations */}
      <div className="absolute top-0 left-0 w-full h-[900px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-10%] w-[65%] h-[65%] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute top-[15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-500/5 blur-[160px]" />
      </div>

      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/85 border-b border-[#E2EEFF]/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-95 transition">
            <Logo />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-[#4A5E80]">
            <a href="#features" className="hover:text-[#0A5BFF] transition">Features</a>
            <a href="#pricing" className="hover:text-[#0A5BFF] transition">Pricing</a>
            <a href="#download" className="hover:text-[#0A5BFF] transition">Download</a>
            <a href="#blog" className="hover:text-[#0A5BFF] transition">Blog</a>
            <a href="#about" className="hover:text-[#0A5BFF] transition">About</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-[15px] font-bold text-[#4A5E80] hover:text-[#0A5BFF] px-4 py-2 transition"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="bg-[#0A5BFF] hover:bg-[#0047D6] text-white text-sm font-bold px-5.5 py-2.5 rounded-full transition shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <svg
              className="size-6 text-[#081A3A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 mt-4 overflow-hidden bg-white"
            >
              <div className="flex flex-col gap-4 py-4 px-2 text-sm font-semibold text-[#4A5E80]">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#0A5BFF] py-2 transition">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#0A5BFF] py-2 transition">Pricing</a>
                <a href="#download" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#0A5BFF] py-2 transition">Download</a>
                <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#0A5BFF] py-2 transition">Blog</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#0A5BFF] py-2 transition">About</a>
                <hr className="border-slate-100" />
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center font-bold py-2.5 rounded-xl border border-slate-200 text-[#4A5E80] hover:bg-slate-50 transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-[#0A5BFF] hover:bg-[#0047D6] text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FF] border border-[#CDE1FF]/60 text-xs font-bold text-[#0A5BFF] shadow-sm select-none">
              <span className="text-[#0A5BFF]">⭐</span>
              <span>Your Campus. Always With You.</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#081A3A] tracking-tight leading-[1.08] font-sans">
              The Smartest Way <br />
              to Manage Campus
            </h1>

            <p className="text-[16px] text-slate-500 leading-relaxed max-w-lg">
              EduSuite Pro is a beautiful, fast, and secure college management and ERP platform for modern institutions. Streamline admissions, track attendance, manage grades, and connect classrooms.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/login"
                className="bg-[#0A5BFF] hover:bg-[#0047D6] text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition w-full sm:w-auto shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 hover:translate-y-[-1px]"
              >
                <span>Enter Campus Portal</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="bg-white border border-[#E2EEFF] text-[#081A3A] hover:bg-slate-50 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition w-full sm:w-auto shadow-sm hover:shadow-md"
              >
                <span>Live Demo</span>
                <div className="size-5 rounded-full bg-[#0A5BFF] flex items-center justify-center text-white shrink-0">
                  <Play className="size-2.5 fill-current ml-0.5" />
                </div>
              </Link>
            </div>

            {/* Horizontal Trust Highlights */}
            <div className="pt-8 border-t border-[#E2EEFF]/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-[#0A5BFF]" />
                <span>Private & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="size-4 text-[#0A5BFF]" />
                <span>Sync Everywhere</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-[#0A5BFF]" />
                <span>Works Offline</span>
              </div>
            </div>
          </div>

          {/* Right Mockup Column */}
          <div className="lg:col-span-7 relative w-full flex justify-center mt-8 lg:mt-0">
            {/* Soft decorative background glows */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 rounded-3xl blur-3xl opacity-50 pointer-events-none" />
            
            {/* Interactive Dashboard Mockup Device Frame */}
            <div className="w-full max-w-[660px] bg-slate-900/5 rounded-[22px] p-2.5 shadow-2xl relative border border-slate-200/40 backdrop-blur-md">
              <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-200/60 flex flex-col h-[400px] md:h-[450px]">
                
                {/* Mock Browser Title Bar */}
                <div className="h-9 bg-slate-50/80 border-b border-slate-200/50 flex items-center justify-between px-4 select-none shrink-0">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-400/80" />
                    <div className="size-2.5 rounded-full bg-yellow-400/80" />
                    <div className="size-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="bg-white border border-slate-100 text-[10px] text-slate-400 rounded-md py-0.5 px-16 max-w-[220px] w-full text-center truncate shadow-sm">
                    app.edusuite.com/all-notes
                  </div>
                  <div className="size-4" />
                </div>

                {/* Dashboard Core Content Workspace */}
                <div className="flex flex-1 overflow-hidden text-xs">
                  
                  {/* Column 1: Mock Sidebar */}
                  <div className="w-[150px] md:w-[170px] bg-slate-50/50 border-r border-slate-100 p-3 flex flex-col justify-between shrink-0 select-none">
                    <div className="space-y-4">
                      
                      {/* "+ New Note" Button */}
                      <button
                        onClick={handleAddNote}
                        className="w-full bg-[#0A5BFF] hover:bg-[#0047D6] text-white rounded-lg py-2 px-2.5 font-bold flex items-center justify-center gap-1.5 transition shadow-sm text-[11px]"
                      >
                        <Plus className="size-3.5" />
                        <span>New Note</span>
                      </button>

                      {/* Folder Routes List */}
                      <div className="space-y-0.5">
                        <div className="px-2 py-1.5 rounded-md bg-blue-50/80 text-[#0A5BFF] font-bold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="size-3.5" />
                            <span>All Notes</span>
                          </div>
                          <span className="text-[10px] bg-blue-100/50 px-1.5 py-0.5 rounded-full">{notes.length + 125}</span>
                        </div>

                        {[
                          { name: "Pinned", icon: Pin, count: 12 },
                          { name: "Recent", icon: Clock },
                          { name: "Favorites", icon: Star },
                          { name: "Trash", icon: Trash2 }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1.5 rounded-md hover:bg-slate-100/60 text-slate-600 font-medium flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="size-3.5" />
                              <span>{item.name}</span>
                            </div>
                            {item.count !== undefined && (
                              <span className="text-[10px] text-slate-400">{item.count}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Tag Categories */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Tags</p>
                        <div className="space-y-0.5">
                          {[
                            { name: "Work", count: 34 },
                            { name: "Study", count: 28 },
                            { name: "Ideas", count: 16 },
                            { name: "Personal", count: 20 }
                          ].map((tag, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 rounded-md hover:bg-slate-100/60 text-slate-600 flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`size-1.5 rounded-full ${getCategoryDotColor(tag.name)}`} />
                                <span>{tag.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{tag.count}</span>
                            </div>
                          ))}
                          <button
                            onClick={handleAddNote}
                            className="text-[10px] text-slate-400 font-semibold px-2 py-1 flex items-center gap-1 hover:text-[#0A5BFF] transition"
                          >
                            <Plus className="size-2.5" />
                            <span>New Tag</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Note List */}
                  <div className="w-[170px] md:w-[200px] border-r border-slate-100 p-2.5 flex flex-col gap-2 shrink-0 select-none bg-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-extrabold text-[#081A3A] text-sm">All Notes</span>
                      <button className="text-[10px] text-[#4A5E80] font-semibold flex items-center gap-0.5 hover:text-[#0A5BFF] transition">
                        <span>Recent</span>
                        <ChevronDown className="size-3 shrink-0" />
                      </button>
                    </div>

                    {/* Search box with shortcut badge */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 size-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-md py-1.5 pl-8 pr-10 text-[10px] focus:outline-none focus:border-blue-300 focus:bg-white"
                      />
                      <div className="absolute right-2 top-2 text-[8px] font-bold text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm select-none">
                        ⌘K
                      </div>
                    </div>

                    {/* Note cards */}
                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
                      {filteredNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setSelectedNoteId(note.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                            selectedNoteId === note.id
                              ? "bg-blue-50/70 border-blue-200/60 shadow-sm"
                              : "border-slate-100/50 hover:bg-slate-50/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-slate-800 text-[11px] truncate flex-1">{note.title}</span>
                            {note.pinned && <Pin className="size-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                            {note.snippet}
                          </p>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-semibold ${getCategoryColor(note.category)}`}>
                              {note.category}
                            </span>
                            <span className="text-[8px] text-slate-400 font-semibold">{note.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Note Editor Detail View */}
                  <div className="flex-1 p-3.5 bg-[#FAFDFE] flex flex-col gap-3 justify-between overflow-y-auto">
                    <div className="space-y-3.5">
                      {/* Note Title & Action Bar */}
                      <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-slate-200/50">
                        <div className="flex-1 truncate">
                          <h4 className="font-black text-[#081A3A] text-[14px] truncate">{selectedNote.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <button
                            onClick={() => handleDeleteNote(selectedNote.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition"
                            title="Delete Note"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 hover:text-slate-600 rounded transition" title="Share">
                            <Share2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mock Text Editor Toolbar */}
                      <div className="flex items-center gap-2 text-slate-400 py-1 border-b border-slate-100 select-none overflow-x-auto">
                        <span className="font-bold text-[11px] px-1 hover:text-slate-800 cursor-pointer">B</span>
                        <span className="italic text-[11px] px-1 hover:text-slate-800 cursor-pointer">I</span>
                        <span className="underline text-[11px] px-1 hover:text-slate-800 cursor-pointer">U</span>
                        <div className="w-px h-3.5 bg-slate-200 mx-1" />
                        <List className="size-3.5 cursor-pointer hover:text-slate-800" />
                        <CheckSquare className="size-3.5 cursor-pointer hover:text-slate-800" />
                        <Code className="size-3.5 cursor-pointer hover:text-slate-800" />
                        <ImageIcon className="size-3.5 cursor-pointer hover:text-slate-800" />
                      </div>

                      {/* Checklist Content */}
                      <div className="space-y-2 pt-1 text-slate-600">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goals</p>
                        <div className="space-y-1.5">
                          {selectedNote.goals.map((goal) => (
                            <div
                              key={goal.id}
                              onClick={() => toggleGoal(selectedNote.id, goal.id)}
                              className="flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div className="pt-0.5 shrink-0">
                                {goal.done ? (
                                  <div className="size-3.5 rounded bg-[#0A5BFF] text-white flex items-center justify-center">
                                    <Check className="size-2.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="size-3.5 rounded border border-slate-300 group-hover:border-blue-400 transition bg-white" />
                                )}
                              </div>
                              <span className={`text-[11px] leading-relaxed transition ${
                                goal.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"
                              }`}>
                                {goal.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sync Status Footer */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-3 border-t border-slate-100 select-none shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-green-500" />
                        <span>Saved 2 min ago</span>
                      </div>
                      <Cloud className="size-3 text-green-500" />
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Handwritten curved arrow pointing up-left */}
            <div className="absolute -bottom-12 right-[15%] hidden md:flex items-center gap-3 text-slate-500 select-none">
              <svg className="w-16 h-16 text-[#0A5BFF]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M75 75C60 75 40 65 30 45"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
                <path
                  d="M26 53L29 42L40 46"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-2xl text-[#081A3A] font-semibold rotate-[-5deg] tracking-wide" style={{ fontFamily: "'Caveat', cursive" }}>
                Clean. Focused. Distraction-free.
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* CORE MODULES SECTION */}
      <section id="features" className="py-24 px-6 relative bg-white border-t border-[#E2EEFF]/40">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0A5BFF]">
              Core Modules
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#081A3A] tracking-tight">
              Everything you need to stay{" "}
              <span className="text-[#0A5BFF] relative inline-block">
                organized
                <svg className="absolute -bottom-2 left-0 w-full h-[7px] text-[#0A5BFF]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M5 5 Q 50 12, 95 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h2>
          </div>

          {/* Grid of 6 modules - Centered icons & texts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Academics",
                desc: "Manage study plans, courses, curriculum, and class schedules.",
                icon: FileText,
                iconColor: "text-blue-500",
                iconBg: "bg-blue-50"
              },
              {
                title: "Attendance",
                desc: "Real-time attendance tracking with automated notification alerts.",
                icon: Tag,
                iconColor: "text-purple-500",
                iconBg: "bg-purple-50"
              },
              {
                title: "Exams & Grades",
                desc: "Seamless exam coordination, result publishing, and transcript generation.",
                icon: Search,
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-50"
              },
              {
                title: "Library",
                desc: "Digital library management, book cataloging, and circulation tracking.",
                icon: WifiOff,
                iconColor: "text-amber-500",
                iconBg: "bg-amber-50"
              },
              {
                title: "Hostel & Mess",
                desc: "Room allotment, warden dashboard, and daily mess menu scheduling.",
                icon: Cloud,
                iconColor: "text-sky-500",
                iconBg: "bg-sky-50"
              },
              {
                title: "Security & Fees",
                desc: "Role-based portals with secure fee payment gates and audit trails.",
                icon: Lock,
                iconColor: "text-rose-500",
                iconBg: "bg-rose-50"
              }
            ].map((mod, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 rounded-3xl border border-[#E2EEFF]/80 hover:border-blue-200 hover:bg-slate-50/10 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] flex flex-col items-center text-center space-y-5"
              >
                <div className={`size-14 rounded-full ${mod.iconBg} ${mod.iconColor} flex items-center justify-center transition-transform group-hover:scale-[1.05] shrink-0`}>
                  <mod.icon className="size-6 stroke-[2]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#081A3A] group-hover:text-[#0A5BFF] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">
                    {mod.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-slate-400 font-semibold">
              More coming soon: <span className="text-[#0A5BFF] hover:underline cursor-pointer">Reminders</span>, <span className="text-[#0A5BFF] hover:underline cursor-pointer">Collaboration</span>, <span className="text-[#0A5BFF] hover:underline cursor-pointer">Export</span> & more.
            </p>
          </div>

        </div>
      </section>

      {/* WHY EDUSUITE PRO SECTION */}
      <section className="py-24 px-6 bg-slate-50/40 border-t border-[#E2EEFF]/40">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0A5BFF]">
              Why EduSuite Pro?
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#081A3A] tracking-tight">
              Built for focus. Designed for productivity.
            </h2>
          </div>

          {/* 4 columns laid out horizontally (icon left, texts right) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Lightning-Fast",
                desc: "Real-time dashboard updates and quick academic record search.",
                icon: Zap,
                iconBg: "bg-blue-50 text-blue-500"
              },
              {
                title: "Sleek Portals",
                desc: "Clean role-based user interfaces tailored for students and staff.",
                icon: Sparkles,
                iconBg: "bg-blue-50 text-blue-500"
              },
              {
                title: "Cross-Device",
                desc: "Access schedules, grades, and resources from any phone or browser.",
                icon: Globe,
                iconBg: "bg-blue-50 text-blue-500"
              },
              {
                title: "Role-Based Access",
                desc: "Secure end-to-end encryption and custom administrative permissions.",
                icon: Shield,
                iconBg: "bg-blue-50 text-blue-500"
              }
            ].map((col, idx) => (
              <div key={idx} className="flex items-start gap-4 text-left">
                <div className={`size-12 rounded-full ${col.iconBg} flex items-center justify-center shrink-0`}>
                  <col.icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-[#081A3A] text-base leading-snug">
                    {col.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {col.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CALL TO ACTION (CTA) SECTION WITH GLOW & NOTEBOOK MOCKUP */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-[#00183F] to-[#01112D] rounded-[32px] p-8 md:p-16 text-white grid lg:grid-cols-12 gap-12 items-center relative overflow-hidden shadow-2xl">
            {/* Grid overlay pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(10,91,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(10,91,255,0.025)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
            
            {/* Decorative soft blue lights */}
            <div className="absolute -top-24 -left-24 size-96 bg-[#0A5BFF]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Left Column: Notebook illustration */}
            <div className="lg:col-span-5 flex justify-center relative z-10 select-none">
              <div className="relative group perspective">
                {/* 3D-ish Notebook shape */}
                <div className="w-[180px] h-[240px] bg-gradient-to-r from-[#0C3CB5] to-[#0A5BFF] rounded-r-[14px] rounded-l-[4px] shadow-2xl relative border-y border-r border-[#3070FF]/30 transform rotate-[-8deg] hover:rotate-0 transition-transform duration-500 flex flex-col justify-between p-5">
                  {/* Notebook Spine lines */}
                  <div className="absolute top-0 left-0 h-full w-[10px] bg-slate-900/35 rounded-l-[4px] border-r border-white/5" />
                  
                  {/* Embedded Custom Mini Logo */}
                  <div className="flex flex-col items-center gap-1.5 self-center mt-6">
                    <div className="size-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                      <EduSuiteLogoGraphic className="size-10" />
                    </div>
                    <span className="text-[12px] font-extrabold uppercase tracking-widest text-white mt-2">EduSuite Pro</span>
                  </div>

                  {/* Ribbon Bookmark */}
                  <div className="absolute top-0 right-5 w-4 h-16 bg-amber-400 rounded-b-md shadow-sm border-x border-b border-amber-500/20" />

                  {/* Horizontal gold debossing effect */}
                  <div className="w-16 h-1 bg-amber-400/20 rounded-full mx-auto mb-2" />
                </div>

                {/* Styled pen layout next to it */}
                <div className="absolute bottom-[-10px] right-[-25px] w-6 h-[180px] bg-gradient-to-b from-[#1C1F2B] via-[#2F3241] to-[#1C1F2B] rounded-full shadow-lg transform rotate-[25deg] border border-slate-700/20 flex flex-col justify-between py-8 items-center select-none pointer-events-none">
                  {/* Silver Clip */}
                  <div className="w-1.5 h-10 bg-slate-300 rounded-b-sm absolute top-4 left-1.5 shadow-sm" />
                  {/* Gold rings */}
                  <div className="w-full h-1 bg-amber-400/80 my-1" />
                  <div className="w-full h-1 bg-amber-400/80 my-1" />
                </div>
              </div>
            </div>

            {/* Right Column: CTA Texts and ratings */}
            <div className="lg:col-span-7 space-y-6 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Empower your institution <br />
                with EduSuite Pro.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Join modern academies and universities that trust EduSuite Pro to streamline campus administration and student workflows.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full">
                <Link
                  to="/login"
                  className="bg-white hover:bg-slate-50 text-[#081A3A] font-bold px-7 py-3.5 rounded-xl transition shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  <span>Enter Campus Portal</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/login"
                  className="border border-white/20 bg-transparent hover:bg-white/5 text-white font-bold px-7 py-3.5 rounded-xl transition w-full sm:w-auto text-center"
                >
                  Explore Features
                </Link>
              </div>

              {/* Ratings and user proofs */}
              <div className="pt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800/80 w-full justify-center lg:justify-start">
                {/* User avatars list stack */}
                <div className="flex -space-x-2.5">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  ].map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="User avatar"
                      className="size-8 rounded-full border border-[#081A3A] object-cover bg-slate-800"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center sm:items-start text-xs leading-none gap-1">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-400 font-bold">
                    4.9/5 from 2,500+ users
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2EEFF]/60 bg-[#030E21] text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/60">
            
            {/* Left Brand Column */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <EduSuiteLogoGraphic className="size-9" />
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
                    <span>EduSuite</span>
                    <span className="text-[#0A5BFF] ml-0.5">Pro</span>
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                    Empowering Digital Campus
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                A modern campus management and ERP application. Empower your institution. Streamline workflows. Achieve more.
              </p>

              {/* Social icons */}
              <div className="flex gap-4">
                {[
                  { icon: Github, link: "#" },
                  { icon: Twitter, link: "#" },
                  { icon: Linkedin, link: "#" },
                  { icon: Globe, link: "#" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    className="size-8 rounded-lg bg-slate-900 hover:bg-[#0A5BFF] hover:text-white flex items-center justify-center transition-colors text-slate-400"
                  >
                    <social.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Middle Sitemap Columns */}
            <div className="md:col-span-5 grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-white text-sm mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link to="/login" className="hover:text-white transition">Features</Link></li>
                  <li><Link to="/login" className="hover:text-white transition">Download</Link></li>
                  <li><Link to="/login" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link to="/login" className="hover:text-white transition">Roadmap</Link></li>
                  <li><Link to="/login" className="hover:text-white transition">Changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition">Guides</a></li>
                  <li><a href="#" className="hover:text-white transition">Templates</a></li>
                  <li><a href="#" className="hover:text-white transition">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter Column */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm">Stay in the loop</h4>
              <p className="text-slate-400 text-sm">
                Subscribe to get product updates and productivity tips.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0A5BFF] flex-1 max-w-[200px]"
                />
                <button className="bg-[#0A5BFF] hover:bg-[#0047D6] text-white p-2.5 rounded-xl transition flex items-center justify-center shrink-0">
                  <Send className="size-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Footer copyright */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4 select-none">
            <p>© 2026 EduSuite Pro. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
