import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { books } from "@/lib/mock-data";
import { Search, BookOpen } from "lucide-react";

export const Route = createFileRoute("/dashboard/library")({ component: LibraryPage });

function LibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Library" desc="Browse the catalog, issue and return books." />

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by title, author, or category…" className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary">Search</button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(b=>(
          <Card key={b.id} className="hover:-translate-y-1 transition">
            <div className="aspect-[3/2] rounded-xl bg-gradient-primary text-white grid place-items-center mb-4 relative overflow-hidden">
              <BookOpen className="size-12 opacity-80" />
              <div className="absolute inset-0 grid-bg opacity-30" />
            </div>
            <div className="font-semibold">{b.title}</div>
            <div className="text-xs text-muted-foreground">{b.author}</div>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="info">{b.category}</Badge>
              <Badge tone={b.available>0?"success":"danger"}>{b.available>0?`${b.available} available`:"Unavailable"}</Badge>
            </div>
            <button disabled={b.available===0} className="mt-4 w-full rounded-xl bg-gradient-primary text-white text-sm py-2 disabled:opacity-50 glow-primary">
              {b.available>0 ? "Issue" : "Reserve"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
