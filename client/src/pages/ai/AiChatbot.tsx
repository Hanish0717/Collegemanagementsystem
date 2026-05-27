import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Search, User, Bot, Paperclip, Mic, Smile, X, Plus, MoreVertical, Clock, Lightbulb, AlertCircle, TrendingUp, Calendar, FileText, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import { motion, AnimatePresence } from "framer-motion";



export function AiChatbot() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; time: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Show Attendance",
    "Upcoming Exams",
    "Fee Details",
    "Placement Updates",
    "Timetable",
    "Academic Performance",
    "Leave Status",
    "Notifications",
  ];

  const recentQueries = [
    { query: "Attendance status", time: "10:30 AM" },
    { query: "Exam schedule", time: "09:15 AM" },
    { query: "Fee payment", time: "Yesterday" },
  ];

  const smartSuggestions = [
    { title: "Check attendance trends", icon: TrendingUp },
    { title: "Review exam schedule", icon: Calendar },
    { title: "View fee status", icon: FileText },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    const userMessage = { role: "user" as const, content: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    import("@/services/aiService").then(({ sendChatMessage }) => {
      sendChatMessage(messageText, conversationId)
        .then(res => {
          const botResponse = { 
            role: "assistant" as const, 
            content: res.response, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          };
          setMessages(prev => [...prev, botResponse]);
          if (res.conversationId) {
            setConversationId(res.conversationId);
          }
          setIsTyping(false);
        })
        .catch(err => {
          console.error("AI chat failed:", err);
          const errorResponse = { 
            role: "assistant" as const, 
            content: "Sorry, I encountered an error connecting to the campus network. Please check that the server is active.", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          };
          setMessages(prev => [...prev, errorResponse]);
          setIsTyping(false);
        });
    });
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };


  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-1 grid lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-1 space-y-4 overflow-y-auto hidden lg:block">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="size-5 text-indigo" />
                <h3 className="font-semibold">Search</h3>
              </div>
            </div>
            <input
              placeholder="Search conversations..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-indigo" />
              <h3 className="font-semibold">Recent Queries</h3>
            </div>
            <div className="space-y-2">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="text-sm font-medium">{query.query}</div>
                  <div className="text-xs text-muted-foreground">{query.time}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="size-5 text-indigo" />
              <h3 className="font-semibold">Smart Suggestions</h3>
            </div>
            <div className="space-y-2">
              {smartSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="text-sm font-medium flex items-center gap-2">
                    <suggestion.icon className="size-4 text-indigo" />
                    {suggestion.title}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="size-5 text-indigo" />
              <h3 className="font-semibold">Student Alerts</h3>
            </div>
            <div className="space-y-2">
              {[
                { alert: "Attendance below 75%", type: "Warning" },
                { alert: "Fee due in 5 days", type: "Reminder" },
              ].map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${alert.type === "Warning" ? "bg-amber-50 border-amber-200" : ""}`}
                >
                  <div className="text-sm font-medium">{alert.alert}</div>
                  <Badge tone={alert.type === "Warning" ? "warn" : "info"} className="mt-1">{alert.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-soft">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-gradient-primary text-white grid place-items-center">
                  <Bot className="size-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI Assistant</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-accent transition" title="New chat">
                  <Plus className="size-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-accent transition" title="Search">
                  <Search className="size-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-accent transition" title="Clear chat" onClick={clearChat}>
                  <X className="size-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-accent transition lg:hidden" title="Menu">
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="size-20 rounded-2xl bg-gradient-primary text-white grid place-items-center mb-6">
                    <Sparkles className="size-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Hello! I'm your College ERP Assistant</h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    Ask me about attendance, exams, fees, placements, or academic information.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
                    {suggestedPrompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="p-3 rounded-xl border hover:bg-accent/50 transition text-sm text-left"
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
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center flex-shrink-0">
                          <Bot className="size-4" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[75%]">
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === "user"
                              ? "bg-gradient-primary text-white rounded-br-md"
                              : "bg-white border shadow-sm rounded-bl-md"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 ml-1">{message.time}</span>
                      </div>
                      {message.role === "user" && (
                        <div className="size-8 rounded-lg bg-gradient-violet text-white grid place-items-center flex-shrink-0">
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
                        <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="size-2 rounded-full bg-muted-foreground animate-pulse" />
                              <span className="size-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
                              <span className="size-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t bg-gradient-soft">
              {messages.length === 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="px-3 py-1.5 rounded-lg border hover:bg-accent/50 transition text-xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-lg border hover:bg-accent transition" title="Attach file">
                  <Paperclip className="size-4 text-muted-foreground" />
                </button>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything about attendance, exams, fees..."
                  className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="p-2.5 rounded-lg border hover:bg-accent transition lg:hidden" title="Voice input">
                  <Mic className="size-4 text-muted-foreground" />
                </button>
                <button className="p-2.5 rounded-lg border hover:bg-accent transition lg:hidden" title="Emoji">
                  <Smile className="size-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 hover:opacity-90 transition"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
