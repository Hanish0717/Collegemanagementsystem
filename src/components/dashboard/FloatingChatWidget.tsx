import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, X, Send, Bot, User, Paperclip, Smile, Sparkles, Minus, Calendar, BookOpen, DollarSign, Briefcase, Clock, Search } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; time: string }>>([
    { role: "assistant", content: "Hello! I'm your College ERP Assistant. How can I help you today?", time: "Now" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const suggestedActions = [
    { label: "Attendance", icon: Calendar },
    { label: "Fees", icon: DollarSign },
    { label: "Exams", icon: Clock },
    { label: "Library", icon: BookOpen },
    { label: "Placements", icon: Briefcase },
    { label: "Timetable", icon: Search },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: "user" as const, content: inputValue, time: "Now" };
    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = { role: "assistant" as const, content: "I'm processing your request. This is a demo response.", time: "Now" };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedAction = (label: string) => {
    setInputValue(label);
  };

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isMounted) return null;

  return createPortal(
    <>
      <div style={{ direction: 'ltr', position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="size-14 rounded-full bg-gradient-primary text-white shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center glow-primary relative pointer-events-auto"
        style={{ position: 'fixed', bottom: '16px', right: '16px', left: 'auto' }}
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
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="h-[500px] flex flex-col lg:max-w-[380px] pointer-events-auto" style={{ position: 'fixed', bottom: '80px', right: '16px', left: 'auto', width: 'calc(100vw - 32px)', maxWidth: '340px', zIndex: 50 }}>
          <Card className="flex-1 flex flex-col shadow-2xl overflow-hidden">
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
                    <div className="font-semibold text-sm">ERP Assistant</div>
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
                              : "bg-white border shadow-sm rounded-bl-sm"
                          }`}
                        >
                          <div className="whitespace-pre-line">{message.content}</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">{message.time}</span>
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
                      <div className="bg-white border shadow-sm rounded-xl rounded-bl-sm px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" />
                            <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
                            <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-3 py-2.5 border-t bg-gradient-soft">
              <div className="mb-2">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {suggestedActions.map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestedAction(action.label)}
                      className="px-2.5 py-1 rounded-full border hover:bg-accent/50 transition text-[10px] flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                    >
                      <action.icon className="size-3" />
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg border hover:bg-accent transition" title="Attach file">
                  <Paperclip className="size-3.5 text-muted-foreground" />
                </button>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Need help?"
                  className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="p-1.5 rounded-lg border hover:bg-accent transition" title="Emoji">
                  <Smile className="size-3.5 text-muted-foreground" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
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
    </>
  , document.body);
}
