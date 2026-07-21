import React, { useState } from "react";
import { GlassCard } from "./components/CardElements";
import { MessageSquare, Heart, Share2, Image as ImageIcon, Link, Send, MoreHorizontal, UserPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NetworkingPage() {
  const [postContent, setPostContent] = useState("");

  const feed = [
    {
      id: 1,
      author: { name: "Alex Johnson", title: "Senior Software Engineer at Google", image: "https://api.dicebear.com/7.x/initials/svg?seed=AJ" },
      time: "2 hours ago",
      content: "Just published a new article on advanced React patterns and performance optimization. Would love to hear thoughts from the alumni community!",
      likes: 124,
      comments: 18,
      liked: true
    },
    {
      id: 2,
      author: { name: "Samantha Lee", title: "Product Manager at Stripe", image: "https://api.dicebear.com/7.x/initials/svg?seed=SL" },
      time: "5 hours ago",
      content: "We are expanding our product team at Stripe! If any alumni are looking for roles in fintech, my DMs are open. #hiring #product",
      likes: 89,
      comments: 5,
      liked: false
    }
  ];

  const suggestions = [
    { name: "Michael Chen", title: "Data Scientist at Meta", mutual: 12, image: "https://api.dicebear.com/7.x/initials/svg?seed=MC" },
    { name: "Emma Watson", title: "UX Designer at Airbnb", mutual: 8, image: "https://api.dicebear.com/7.x/initials/svg?seed=EW" },
    { name: "James Wilson", title: "Founder at TechStartup", mutual: 24, image: "https://api.dicebear.com/7.x/initials/svg?seed=JW" }
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Profile Summary */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <GlassCard className="overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="px-6 pb-6 relative text-center">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-background bg-muted -mt-10 mb-3 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=Me" alt="My Profile" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg leading-tight">My Profile</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Class of 2020 • Software Engineer</p>
              
              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile views</span>
                  <span className="font-semibold text-blue-600">342</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-semibold text-blue-600">1,204</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-sm mb-4">Trending Topics</h3>
            <div className="space-y-3">
              {['#AI', '#Hiring', '#TechTrends', '#StartupLife', '#ReactJS'].map(tag => (
                <div key={tag} className="text-sm font-medium hover:text-blue-600 cursor-pointer transition-colors">{tag}</div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <GlassCard className="p-4 sm:p-6">
            <div className="flex gap-4">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Me" className="w-12 h-12 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-4">
                <Textarea 
                  placeholder="Share an update, article, or opportunity..." 
                  className="resize-none bg-muted/30 border-muted rounded-xl min-h-[80px]"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-600 rounded-lg"><ImageIcon className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Photo</span></Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-600 rounded-lg"><FileText className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Document</span></Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-600 rounded-lg"><Link className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Link</span></Button>
                  </div>
                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-700" disabled={!postContent.trim()}>
                    Post <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Feed Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort by: Top</span>
          </div>

          {/* Posts */}
          {feed.map(post => (
            <GlassCard key={post.id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <img src={post.author.image} alt={post.author.name} className="w-12 h-12 rounded-full bg-muted" />
                  <div>
                    <h4 className="font-bold text-foreground hover:text-blue-600 cursor-pointer transition-colors leading-tight">{post.author.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.author.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{post.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><MoreHorizontal className="w-4 h-4"/></Button>
              </div>
              
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-3 mb-3 px-1">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {post.likes}</span>
                <span>{post.comments} comments</span>
              </div>

              <div className="flex items-center justify-between gap-1 sm:gap-4 px-2">
                <Button variant="ghost" size="sm" className={`flex-1 rounded-lg ${post.liked ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                  <Heart className={`w-4 h-4 sm:mr-2 ${post.liked ? 'fill-current' : ''}`} /> <span className="hidden sm:inline">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <MessageSquare className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Comment</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <Share2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm mb-4">People you may know</h3>
            <div className="space-y-4">
              {suggestions.map((person, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl border bg-card/30 hover:bg-card transition-colors">
                  <img src={person.image} className="w-16 h-16 rounded-full mb-3 bg-muted" />
                  <h4 className="font-bold text-sm leading-tight hover:text-blue-600 cursor-pointer">{person.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2 min-h-[32px]">{person.title}</p>
                  <p className="text-[10px] text-muted-foreground mb-3">{person.mutual} mutual connections</p>
                  <Button variant="outline" size="sm" className="w-full rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50">
                    <UserPlus className="w-4 h-4 mr-1.5" /> Connect
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
