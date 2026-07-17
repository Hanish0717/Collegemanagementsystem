import React, { useState } from "react";
import { GlassCard } from "./components/CardElements";
import { Search, Send, Paperclip, Smile, Image as ImageIcon, Phone, Video, MoreVertical, Check, CheckCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function MessagingPage() {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [messageText, setMessageText] = useState("");

  const contacts = [
    { id: 1, name: "David Chen", title: "Engineering Manager", lastMessage: "Let's schedule a mock interview for Friday.", time: "10:30 AM", unread: 2, online: true, image: "https://api.dicebear.com/7.x/initials/svg?seed=DC" },
    { id: 2, name: "Sarah Connor", title: "AI Researcher", lastMessage: "Thanks for the resources!", time: "Yesterday", unread: 0, online: false, image: "https://api.dicebear.com/7.x/initials/svg?seed=SC" },
    { id: 3, name: "Alumni Batch '20", title: "Group • 145 members", lastMessage: "John: Who is attending the reunion?", time: "Tuesday", unread: 0, online: false, isGroup: true, image: "https://api.dicebear.com/7.x/initials/svg?seed=B20" }
  ];

  const messages = [
    { id: 1, senderId: 1, text: "Hi! I saw your request for mentorship.", time: "10:15 AM", isMe: false },
    { id: 2, senderId: 'me', text: "Yes, I'm preparing for senior roles and would love some system design guidance.", time: "10:20 AM", isMe: true, status: 'read' },
    { id: 3, senderId: 1, text: "I can definitely help with that. I've conducted over 50 interviews at Stripe.", time: "10:25 AM", isMe: false },
    { id: 4, senderId: 1, text: "Let's schedule a mock interview for Friday.", time: "10:30 AM", isMe: false }
  ];

  const activeContact = contacts.find(c => c.id === activeChat);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col pb-24">
      <GlassCard className="flex-1 flex overflow-hidden border-border/50">
        
        {/* Left Pane - Contact List */}
        <div className={cn("w-full md:w-80 lg:w-96 flex flex-col border-r border-border/50", activeChat ? "hidden md:flex" : "flex")}>
          <div className="p-4 border-b border-border/50">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9 rounded-xl bg-background/50 border-muted"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => setActiveChat(contact.id)}
                className={cn(
                  "p-4 flex items-start gap-3 cursor-pointer transition-colors border-b border-border/20 last:border-0",
                  activeChat === contact.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30 border-l-4 border-l-transparent"
                )}
              >
                <div className="relative">
                  <img src={contact.image} alt={contact.name} className={cn("w-12 h-12 rounded-full bg-muted object-cover", contact.isGroup && "rounded-2xl")} />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-sm truncate">{contact.name}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{contact.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={cn("text-xs truncate", contact.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className={cn("flex-1 flex flex-col bg-background/20 relative", !activeChat ? "hidden md:flex" : "flex")}>
          {activeChat && activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveChat(null)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </Button>
                  <div className="relative">
                    <img src={activeContact.image} alt={activeContact.name} className={cn("w-10 h-10 rounded-full bg-muted", activeContact.isGroup && "rounded-xl")} />
                    {activeContact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{activeContact.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeContact.online ? "Active now" : activeContact.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-muted-foreground"><Phone className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-muted-foreground"><Video className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground"><MoreVertical className="w-4 h-4"/></Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="text-center my-4">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 px-3 py-1 rounded-full">Today</span>
                </div>
                
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full", msg.isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("flex max-w-[85%] md:max-w-[70%] gap-3", msg.isMe ? "flex-row-reverse" : "flex-row")}>
                      {!msg.isMe && (
                        <img src={activeContact.image} className="w-8 h-8 rounded-full hidden sm:block shrink-0 mt-auto" />
                      )}
                      
                      <div className={cn(
                        "p-3 rounded-2xl relative group", 
                        msg.isMe 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-card border shadow-sm rounded-bl-sm"
                      )}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        
                        <div className={cn(
                          "flex items-center gap-1 mt-1", 
                          msg.isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
                        )}>
                          <span className="text-[9px] font-medium">{msg.time}</span>
                          {msg.isMe && (
                            msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card/50 backdrop-blur-md border-t border-border/50">
                <div className="flex items-end gap-2 bg-background border rounded-2xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary shrink-0"><Paperclip className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary shrink-0 hidden sm:flex"><ImageIcon className="w-5 h-5"/></Button>
                  </div>
                  
                  <Textarea 
                    value={messageText}
                    onChange={(e: any) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent p-2 text-sm"
                    rows={1}
                  />
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary shrink-0 hidden sm:flex"><Smile className="w-5 h-5"/></Button>
                    <Button size="icon" className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shrink-0" disabled={!messageText.trim()}>
                      <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 opacity-50 ml-1" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Your Messages</h3>
              <p className="max-w-xs">Select a conversation from the sidebar or start a new one to begin networking.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
