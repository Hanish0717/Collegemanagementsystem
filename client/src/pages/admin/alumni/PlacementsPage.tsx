import React, { useState } from "react";
import { GradientHeader, StatCard, GlassCard } from "./components/CardElements";
import { StyledTable, TableRow, TableCell, AdvancedTableToolbar } from "./components/TableElements";
import { Target, Building2, Users, FileCheck, Calendar, ArrowRight, Eye, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PlacementsPage() {
  const [activeTab, setActiveTab] = useState<'drives' | 'companies' | 'results'>('drives');

  const upcomingDrives = [
    { id: 1, company: "Microsoft", role: "Software Engineer", date: "2024-06-10", eligible: 120, status: "Registration Open", package: "44 LPA" },
    { id: 2, company: "Deloitte", role: "Business Analyst", date: "2024-06-15", eligible: 200, status: "Upcoming", package: "12 LPA" },
    { id: 3, company: "TCS", role: "System Engineer", date: "2024-06-20", eligible: 450, status: "Upcoming", package: "7 LPA" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Placement Portal" 
        description="Manage campus placement drives, company visits, and student recruitment."
        icon={Target}
        color="from-cyan-600 to-blue-700"
      >
        <Button className="rounded-xl bg-white text-blue-700 hover:bg-white/90">Add New Drive</Button>
      </GradientHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Upcoming Drives" value={upcomingDrives.length} icon={Calendar} color="blue" />
        <StatCard title="Companies Visited" value="42" icon={Building2} color="indigo" trend={{ value: 15, isPositive: true }} />
        <StatCard title="Overall Placement Rate" value="94%" icon={CheckCircle} color="green" trend={{ value: 4, isPositive: true }} />
        <StatCard title="Highest Package" value="44 LPA" icon={Target} color="purple" />
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
            {['drives', 'companies', 'results'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto rounded-xl">Generate Report</Button>
        </div>

        {activeTab === 'drives' && (
          <div className="space-y-6 animate-in fade-in">
            <AdvancedTableToolbar searchPlaceholder="Search placement drives..." onFilter={() => {}} />
            
            <StyledTable headers={["Company", "Role", "Date", "Eligibility", "Package", "Status", "Action"]}>
              {upcomingDrives.map((drive) => (
                <TableRow key={drive.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {drive.company.charAt(0)}
                      </div>
                      <span className="font-semibold text-base">{drive.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{drive.role}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" /> {new Date(drive.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" /> {drive.eligible} Students
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">{drive.package}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={drive.status.includes('Open') ? 'default' : 'secondary'} className="rounded-xl">
                      {drive.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="rounded-xl font-medium text-primary hover:bg-primary/5">
                      Manage <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </StyledTable>
          </div>
        )}

        {activeTab !== 'drives' && (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl animate-in fade-in">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-foreground mb-2">View not fully mocked</h3>
            <p>This tab is prepared for Supabase data integration.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
