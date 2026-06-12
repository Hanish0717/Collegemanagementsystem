import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Paperclip,
  Smile,
  Sparkles,
  Minus,
  Calendar,
  BookOpen,
  DollarSign,
  Briefcase,
  Search,
  Award,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterText } from "@/components/dashboard/TypewriterText";

interface ChatWidgetMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
  ui?: {
    type: string;
    data: any;
  } | null;
  animate?: boolean;
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatWidgetMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your College CSM Assistant. How can I help you today?",
      time: "Now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // New states for advanced UX features
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [dynamicFollowups, setDynamicFollowups] = useState<string[]>([
    "Attendance",
    "Fees Balance",
    "Exams Scheduled",
    "Library Loans",
  ]);

  const slashCommands = [
    { cmd: "/attendance", desc: "Show attendance summary" },
    { cmd: "/fees", desc: "View due invoice details" },
    { cmd: "/exams", desc: "Show exam dates" },
    { cmd: "/library", desc: "Show borrowed book loans" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.startsWith("/")) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const selectSlashCommand = (cmd: string) => {
    setInputValue(cmd);
    setShowSlashMenu(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim()) return;

    const userText = queryText;
    const userMessage: ChatWidgetMessage = { role: "user", content: userText, time: "Now" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowSlashMenu(false);
    setIsTyping(true);

    try {
      const { sendChatMessage } = await import("@/services/aiService");
      const res = await sendChatMessage(userText, conversationId);
      if (res.conversationId) {
        setConversationId(res.conversationId);
      }
      
      const botResponse: ChatWidgetMessage = {
        role: "assistant",
        content: res.response,
        time: "Now",
        ui: res.ui,
        animate: true,
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
      if (res.suggestedFollowups && res.suggestedFollowups.length > 0) {
        // Map 6 words followup down to short tags
        setDynamicFollowups(res.suggestedFollowups.map(q => q.replace("Show my ", "").substring(0, 18)));
      }
    } catch (err) {
      console.error("AI chat failed:", err);
      const botResponse: ChatWidgetMessage = {
        role: "assistant",
        content:
          "Sorry, I am having trouble connecting to the campus network. Please check that the server is active.",
        time: "Now",
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedAction = (label: string) => {
    handleSendMessage(label);
  };

  const [isMinimized, setIsMinimized] = useState(false);

  // Render Rich UI in Widget Bubble
  const renderRichUI = (ui: { type: string; data: any }) => {
    if (!ui || !ui.type) return null;

    switch (ui.type) {
      case "attendance-ring": {
        const pct = ui.data.percentage || 100;
        return (
          <div className="mt-2 p-3 bg-zinc-50 border rounded-xl flex items-center gap-3">
            <div className="relative size-11 flex-shrink-0">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-200" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  className={pct >= 75 ? "stroke-emerald-500" : "stroke-rose-500"} 
                  strokeWidth="3.2" 
                  strokeDasharray="100"
                  strokeDashoffset={100 - pct} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">
                {pct}%
              </div>
            </div>
            <div className="text-[10px]">
              <span className="font-semibold block text-zinc-700">Attendance Meter</span>
              <span className="text-zinc-500">Classes: {ui.data.present} / {ui.data.total}</span>
            </div>
          </div>
        );
      }

      case "fee-card": {
        const amt = ui.data.totalPendingAmount || 0;
        return (
          <div className="mt-2 p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500">Fee Balance Pending:</span>
              <strong className="text-xs text-rose-600">₹{amt.toLocaleString()}</strong>
            </div>
            <button 
              onClick={() => alert("Payment complete!")}
              className="py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-semibold transition"
            >
              Pay Balance Online
            </button>
          </div>
        );
      }

      case "book-list": {
        return (
          <div className="mt-2 p-2 bg-zinc-50 border rounded-xl text-[10px] space-y-1">
            <div className="font-semibold text-zinc-700 flex items-center gap-1">
              <BookOpen className="size-3 text-indigo-500" />
              <span>Library Checked Out ({ui.data.count})</span>
            </div>
            <div className="text-[9px] text-zinc-500 flex items-center gap-1">
              <CheckCircle className="size-2.5 text-emerald-500" />
              <span>Active book loans detailed above</span>
            </div>
          </div>
        );
      }

      case "results-chart": {
        return (
          <div className="mt-2 p-2.5 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl flex items-center gap-2.5">
            <Award className="size-5 text-indigo-600" />
            <div className="text-[10px]">
              <span className="text-zinc-500 block">Cumulative Grade Index:</span>
              <strong className="text-zinc-800 text-sm">{ui.data.cgpa || '8.5'} / 10</strong>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <>
      <div
        style={{ direction: "ltr", position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="size-14 rounded-full bg-gradient-primary text-white shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center glow-primary relative pointer-events-auto"
          style={{ position: "fixed", bottom: "16px", right: "16px", left: "auto" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare className="size-6" />
          <span className="absolute top-0 right-0 size-3 rounded-full bg-red-500 border-2 border-white" />
          <motion.span
            className="absolute inset-0 rounded-full bg-gradient-primary opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>

        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {isOpen && (
          <div
            className="h-[500px] flex flex-col lg:max-w-[380px] pointer-events-auto"
            style={{
              position: "fixed",
              bottom: "80px",
              right: "16px",
              left: "auto",
              width: "calc(100vw - 32px)",
              maxWidth: "340px",
              zIndex: 50,
            }}
          >
            <Card className="flex-1 flex flex-col shadow-2xl overflow-hidden relative">
              
              {/* Widget Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-soft">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center">
                      <Bot className="size-4" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="font-semibold text-sm">CSM Assistant</div>
                      <motion.span
                        className="px-1.5 py-0.5 rounded-full bg-gradient-primary text-white text-[8px] font-medium"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        AI
                      </motion.span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 rounded-lg hover:bg-accent transition"
                  >
                    <Minus className="size-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-accent transition"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <AnimatePresence mode="wait">
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-y-auto p-3 space-y-3"
                  >
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <div className="size-7 rounded-lg bg-gradient-primary text-white grid place-items-center flex-shrink-0">
                            <Bot className="size-3.5" />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[85%]">
                          <div
                            className={`px-3 py-2 rounded-xl text-xs ${
                              message.role === "user"
                                ? "bg-gradient-primary text-white rounded-br-sm"
                                : "bg-white border shadow-sm rounded-bl-sm text-zinc-800 dark:bg-zinc-950 dark:border-zinc-850 dark:text-zinc-200"
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
                          <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                            {message.time}
                          </span>
                        </div>
                        {message.role === "user" && (
                          <div className="size-7 rounded-lg bg-gradient-violet text-white grid place-items-center flex-shrink-0">
                            <User className="size-3.5" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 justify-start"
                      >
                        <div className="size-7 rounded-lg bg-gradient-primary text-white grid place-items-center flex-shrink-0">
                          <Bot className="size-3.5" />
                        </div>
                        <div className="bg-white border dark:bg-zinc-950 dark:border-zinc-850 rounded-xl rounded-bl-sm px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-1">
                              <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" />
                              <span
                                className="size-1.5 rounded-full bg-muted-foreground animate-pulse"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="size-1.5 rounded-full bg-muted-foreground animate-pulse"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Actions input */}
              <div className="px-3 py-2.5 border-t bg-gradient-soft relative">
                
                {/* Autocomplete Slash Dropdown */}
                <AnimatePresence>
                  {showSlashMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-16 left-3 right-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      {slashCommands.map((command) => (
                        <div
                          key={command.cmd}
                          onClick={() => selectSlashCommand(command.cmd)}
                          className="flex items-center justify-between px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-zinc-800 cursor-pointer transition text-[10px]"
                        >
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{command.cmd}</span>
                          <span className="text-zinc-400">{command.desc}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggested actions dynamic chips */}
                <div className="mb-2">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {dynamicFollowups.map((action) => (
                      <motion.button
                        key={action}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestedAction(action)}
                        className="px-2.5 py-1 rounded-full border bg-white dark:bg-zinc-900 hover:bg-accent/50 transition text-[10px] flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Text entry field */}
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1.5 rounded-lg border bg-white dark:bg-zinc-900 hover:bg-accent transition"
                    title="Attach file"
                  >
                    <Paperclip className="size-3.5 text-muted-foreground" />
                  </button>
                  
                  <input
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask or type / for shortcuts..."
                    className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendMessage()}
                    className="p-1.5 rounded-lg bg-gradient-primary text-white glow-primary flex items-center justify-center hover:opacity-90 transition"
                  >
                    <Send className="size-3.5" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
