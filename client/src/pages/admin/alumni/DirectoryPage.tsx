import React, { useState } from "react";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { AdvancedTableToolbar, StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { Users, Mail, MapPin, Briefcase, Eye, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DirectoryPage() { console.log("DirectoryPage Rendered");
  const { directoryList, dirLoading } = useAlumni();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  if (dirLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="h-96 bg-muted rounded-3xl w-full" />
      </div>
    );
  }

  // Filter and pagination logic mock
  const filtered = (directoryList || []).filter((a: any) => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.company?.toLowerCase().includes(search.toLowerCase())
  );
  
  const limit = 10;
  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Alumni Directory" 
        description="Search, filter, and connect with your global alumni network."
        icon={Users}
        color="from-blue-600 to-cyan-600"
      />

      <GlassCard className="p-6">
        <AdvancedTableToolbar 
          onSearch={(val) => { setSearch(val); setPage(1); }}
          onFilter={() => console.log('Open filters')}
          onExport={() => console.log('Export CSV')}
          searchPlaceholder="Search by name, company, or batch..."
        />

        <StyledTable headers={["Alumni", "Batch / Dept", "Current Role", "Location", "Status", "Actions"]}>
          {paginated.length > 0 ? paginated.map((alumni: any, i: number) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img 
                    src={alumni.image || `https://api.dicebear.com/7.x/initials/svg?seed=${alumni.name}`} 
                    alt={alumni.name} 
                    className="w-10 h-10 rounded-full bg-muted"
                  />
                  <div>
                    <p className="font-semibold">{alumni.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {alumni.email || "N/A"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">{alumni.batch || "2024"}</p>
                <p className="text-xs text-muted-foreground">{alumni.department || "Computer Science"}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{alumni.designation || "Engineer"}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5.5">{alumni.company || "Tech Inc"}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {alumni.location || "Global"}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={alumni.status === 'Verified' ? 'default' : 'secondary'} className="rounded-xl">
                  {alumni.status || 'Verified'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-emerald-50 hover:text-emerald-600">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p>No alumni found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </StyledTable>

        <TablePagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </GlassCard>
    </div>
  );
}
