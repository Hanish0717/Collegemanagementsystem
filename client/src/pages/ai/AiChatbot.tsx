import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  User,
  Bot,
  Paperclip,
  Mic,
  Smile,
  X,
  Plus,
  MoreVertical,
  Clock,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Sparkles,
  Volume2,
  VolumeX,
  CreditCard,
  BookOpen,
  Award,
  CheckCircle,
} from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterText } from "@/components/dashboard/TypewriterText";

// Custom type representing the message with optional UI rendering metadata
interface CustomMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
  ui?: {
    type: string;
    data: any;
  } | null;
  animate?: boolean;
}

export function AiChatbot() {
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Advanced UX states
  const [isListening, setIsListening] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [dynamicFollowups, setDynamicFollowups] = useState<string[]>([
    "Show Attendance",
    "Upcoming Exams",
    "Fee Details",
    "Library Books",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const suggestedPrompts = [
    "Show Attendance",
    "Upcoming Exams",
    "Fee Details",
    "Library Books",
    "Timetable",
    "Academic Performance",
  ];

  const recentQueries = [
    { query: "Attendance status", time: "10:30 AM" },
    { query: "Exam schedule", time: "09:15 AM" },
    { query: "Fee payment", time: "Yesterday" },
  ];

  const slashCommands = [
    { cmd: "/attendance", desc: "Get your attendance percentage" },
    { cmd: "/fees", desc: "View pending fees invoice detail" },
    { cmd: "/exams", desc: "Show upcoming examinations" },
    { cmd: "/library", desc: "Show issued library books" },
    { cmd: "/timetable", desc: "View today's lecture schedule" },
    { cmd: "/clear", desc: "Clear conversation history" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice Typing Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputValue((prev) => (prev ? prev + " " + text : text));
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      speechRecognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      speechRecognitionRef.current.start();
    }
  };

  // Handle Slash commands detection
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.startsWith("/")) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const selectSlashCommand = (cmd: string) => {
    if (cmd === "/clear") {
      clearChat();
      setInputValue("");
      setShowSlashMenu(false);
      return;
    }
    setInputValue(cmd);
    setShowSlashMenu(false);
  };

  const handleSendMessage = (textToSend?: string) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim()) return;

    const userMessage: CustomMessage = {
      role: "user",
      content: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowSlashMenu(false);
    setIsTyping(true);

    import("@/services/aiService").then(({ sendChatMessage }) => {
      sendChatMessage(queryText, conversationId)
        .then((res) => {
          const botResponse: CustomMessage = {
            role: "assistant",
            content: res.response,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            ui: res.ui,
            animate: true,
          };
          setMessages((prev) => [...prev, botResponse]);
          if (res.conversationId) {
            setConversationId(res.conversationId);
          }
          if (res.suggestedFollowups && res.suggestedFollowups.length > 0) {
            setDynamicFollowups(res.suggestedFollowups);
          }
          setIsTyping(false);
        })
        .catch((err) => {
          console.error("AI chat failed:", err);
          const errorResponse: CustomMessage = {
            role: "assistant",
            content:
              "Sorry, I encountered an error connecting to the campus network. Please check that the server is active.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errorResponse]);
          setIsTyping(false);
        });
    });
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setDynamicFollowups(["Show Attendance", "Upcoming Exams", "Fee Details", "Library Books"]);
  };

  // Inline Rich UI Render engine
  const renderRichUI = (ui: { type: string; data: any }) => {
    if (!ui || !ui.type) return null;

    switch (ui.type) {
      case "attendance-ring": {
        const pct = ui.data.percentage || 100;
        const color = pct >= 80 ? "stroke-emerald-500" : pct >= 75 ? "stroke-amber-500" : "stroke-rose-500";
        const bgColor = pct >= 80 ? "text-emerald-500" : pct >= 75 ? "text-amber-500" : "text-rose-500";
        
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="mt-3 p-4 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm flex items-center gap-5 max-w-sm"
          >
            <div className="relative size-16 flex-shrink-0">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-100" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  className={color} 
                  strokeWidth="3.2" 
                  strokeDasharray="100"
                  strokeDashoffset={100 - pct} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                {pct}%
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">Attendance Summary</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Classes attended: <strong className={bgColor}>{ui.data.present}</strong> out of {ui.data.total}.
              </p>
              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full inline-block mt-2 ${
                pct >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {pct >= 75 ? "Exam Eligible" : "Critical Attendance Alert"}
              </span>
            </div>
          </motion.div>
        );
      }

      case "fee-card": {
        const count = ui.data.pendingCount || 0;
        const amt = ui.data.totalPendingAmount || 0;
        
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="mt-3 p-4 bg-gradient-to-br from-rose-50 to-white dark:from-zinc-950 dark:to-zinc-900 border border-rose-100 dark:border-rose-950 rounded-2xl shadow-sm max-w-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <Badge tone="danger">Fee Payment Pending</Badge>
                <div className="font-extrabold text-2xl text-rose-600 mt-2">
                  ₹{amt.toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  You have {count} outstanding ERP invoice(s).
                </p>
              </div>
              <div className="p-2.5 bg-rose-100/50 dark:bg-rose-950/30 text-rose-500 rounded-xl">
                <CreditCard className="size-5" />
              </div>
            </div>
            <button 
              onClick={() => alert("Simulating secure payment gateway transfer... Fee Paid successfully.")}
              className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="size-3.5" />
              Pay Balance Online
            </button>
          </motion.div>
        );
      }

      case "book-list": {
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="mt-3 p-4 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm max-w-sm"
          >
            <div className="flex items-center gap-3 border-b pb-2 mb-2">
              <BookOpen className="size-4.5 text-indigo-500" />
              <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">Issued Books Checklist ({ui.data.count})</h4>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: ui.data.count }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <CheckCircle className="size-3 text-emerald-500 flex-shrink-0" />
                  <span>Library Book Loan #{i + 1} checked out</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      }

      case "results-chart": {
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="mt-3 p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-950 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-950 rounded-2xl shadow-sm max-w-sm flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-100/50 dark:bg-indigo-950/30 text-indigo-600 rounded-2xl">
              <Award className="size-7 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">ERP Cumulative CGPA</div>
              <div className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-0.5">
                {ui.data.cgpa || '8.5'}<span className="text-xs text-zinc-400 font-medium"> / 10</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Audited across {ui.data.count || 4} graded semesters.
              </p>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col relative">
      <div className="flex-1 grid lg:grid-cols-4 gap-4 min-h-0">
        
        {/* Left Sidebar Panel */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto hidden lg:block">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="size-5 text-indigo" />
                <h3 className="font-semibold text-sm">Search Conversations</h3>
              </div>
            </div>
            <input
              placeholder="Search history..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs"
            />
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-indigo" />
              <h3 className="font-semibold text-sm">Recent Queries</h3>
            </div>
            <div className="space-y-2">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  onClick={() => setInputValue(query.query)}
                  className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{query.query}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{query.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Window Panel */}
        <div className="lg:col-span-3 flex flex-col min-h-0 relative">
          <Card className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-soft">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-gradient-primary text-white grid place-items-center relative">
                  <Bot className="size-5" />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI CSM Companion</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  className="p-2 rounded-lg hover:bg-accent transition" 
                  title="Clear chat"
                  onClick={clearChat}
                >
                  <X className="size-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-5">
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="size-16 rounded-2xl bg-gradient-primary text-white grid place-items-center mb-5 shadow-lg glow-primary"
                  >
                    <Sparkles className="size-8" />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-1.5">Your Campus AI Agent</h2>
                  <p className="text-xs text-zinc-400 max-w-sm mb-6">
                    Ask me anything about attendance ratios, exam dates, fee due balances, or placement details.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 max-w-md w-full">
                    {suggestedPrompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="p-2.5 rounded-xl border hover:bg-indigo-50/50 hover:border-indigo-200 dark:hover:bg-zinc-800/50 text-[11px] font-medium text-left transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center flex-shrink-0 shadow-sm">
                          <Bot className="size-4" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[78%]">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                            message.role === "user"
                              ? "bg-gradient-primary text-white rounded-br-none"
                              : "bg-white border rounded-bl-none text-zinc-800 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {message.role === "assistant" && message.animate ? (
                            <TypewriterText 
                              text={message.content} 
                              onComplete={() => {
                                message.animate = false;
                              }}
                            />
                          ) : (
                            <div className="whitespace-pre-line leading-relaxed">{message.content}</div>
                          )}
                          {message.role === "assistant" && message.ui && renderRichUI(message.ui)}
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 ml-1">
                          {message.time}
                        </span>
                      </div>
                      {message.role === "user" && (
                        <div className="size-8 rounded-lg bg-gradient-violet text-white grid place-items-center flex-shrink-0 shadow-sm">
                          <User className="size-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center flex-shrink-0">
                          <Bot className="size-4" />
                        </div>
                        <div className="bg-white border dark:bg-zinc-950 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-2.5">
                          <div className="flex gap-1.5 py-1">
                            <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
                            <span
                              className="size-1.5 rounded-full bg-zinc-400 animate-pulse"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="size-1.5 rounded-full bg-zinc-400 animate-pulse"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input & Footer actions bar */}
            <div className="p-3 border-t bg-gradient-soft relative">
              
              {/* Dynamic Follow-up Questions */}
              {messages.length > 0 && (
                <div className="mb-2.5 overflow-x-auto flex gap-1.5 pb-1 scrollbar-none">
                  {dynamicFollowups.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="px-3 py-1 rounded-full border bg-white dark:bg-zinc-900 hover:bg-zinc-50 hover:border-indigo-200 dark:hover:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 transition whitespace-nowrap flex-shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Slash commands autocomplete dropdown */}
              <AnimatePresence>
                {showSlashMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 left-3 right-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-2 border-b bg-zinc-50 dark:bg-zinc-950 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Quick System Slash Commands
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {slashCommands.map((command) => (
                        <div
                          key={command.cmd}
                          onClick={() => selectSlashCommand(command.cmd)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-indigo-50 dark:hover:bg-zinc-850 cursor-pointer transition text-xs"
                        >
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{command.cmd}</span>
                          <span className="text-[10px] text-zinc-400">{command.desc}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text Input Block */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition relative flex items-center justify-center ${
                    isListening 
                      ? "bg-rose-50 border-rose-300 text-rose-500 shadow-inner" 
                      : "bg-white dark:bg-zinc-900 hover:bg-accent"
                  }`}
                  title={isListening ? "Listening... Click to stop" : "Voice typing"}
                >
                  <Mic className={`size-4 ${isListening ? "animate-pulse" : "text-zinc-500"}`} />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>
                
                <input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a query or / for commands..."
                  className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                
                <button
                  onClick={() => handleSendMessage()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs glow-primary flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}

