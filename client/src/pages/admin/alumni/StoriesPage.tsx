import React, { useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { Award, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoriesPage() {
  const { successStories } = useAlumni();

  const stories = useMemo(() => {
    return (successStories && successStories.length > 0)
      ? successStories.map((s: any) => ({
          id: s.id,
          title: s.title,
          name: s.alumniName || "Anonymous Alumni",
          batch: s.graduationYear || "2020",
          excerpt: s.content || s.excerpt || "An inspiring career trajectory post graduation.",
          image: s.image_url || "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80"
        }))
      : [
          { id: 1, title: "From Campus to Y Combinator", name: "David Chen", batch: "2018", excerpt: "How our alumni network helped secure initial funding...", image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80" },
          { id: 2, title: "Pioneering Green Tech", name: "Sarah Connor", batch: "2015", excerpt: "Building sustainable solutions for the future of urban transport...", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" }
        ];
  }, [successStories]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader 
        title="Success Stories" 
        description="Celebrate the outstanding achievements of our alumni community."
        icon={Award}
        color="from-amber-500 to-orange-500"
      >
        <Button className="rounded-xl bg-white text-orange-600 hover:bg-white/90">Submit Story</Button>
      </GradientHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stories.map((story: any) => (
          <GlassCard key={story.id} className="overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img src={story.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <h3 className="font-bold text-2xl mb-1">{story.title}</h3>
                <p className="text-sm text-white/80 font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {story.name} • Class of {story.batch}
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-muted-foreground flex-1 mb-4">{story.excerpt}</p>
              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="ghost" size="sm" className="rounded-xl">Read Full Story</Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground"><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
