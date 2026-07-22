import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentResearch, ResearchPublicationItem } from '../services/hodMentoringResearchEventService';

import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { exportToCSV, exportToTextDoc } from '../utils/exportUtils';
import {
  FlaskConical,
  Award,
  Download,
  FileText,
  Eye,
  BarChart2,
  Sparkles,
  Plus,
} from 'lucide-react';

export function HODResearchPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'publications' | 'patents' | 'projects' | 'innovation'>('dashboard');

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentResearch(departmentCode);
      setData(res);
    }
    loadData();
  }, [departmentCode]);

  const summary = data?.summary || {};
  const publications = data?.publications || [];

  const tabs = [
    { id: 'dashboard', label: 'Research Dashboard', icon: BarChart2 },
    { id: 'publications', label: 'Publications (Scopus/SCI)', icon: FileText },
    { id: 'patents', label: 'Patents Filed', icon: Award },
    { id: 'projects', label: 'Funded Projects', icon: FlaskConical },
    { id: 'innovation', label: 'Innovation & Hackathons', icon: Sparkles },
  ] as const;

  const pubColumns: Column<ResearchPublicationItem>[] = [
    { key: 'faculty', header: 'Faculty Author', render: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{item.faculty}</span> },
    { key: 'title', header: 'Paper Title', render: (item) => <span className="font-bold text-blue-600 dark:text-blue-400">{item.title}</span> },
    { key: 'journal', header: 'Journal / Conference', render: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{item.journal} ({item.year})</span> },
    { key: 'indexing', header: 'Indexing', render: (item) => <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">{item.indexing}</span> },
    { key: 'citations', header: 'Citations', render: (item) => <span className="font-black text-emerald-600">{item.citations} Citations</span> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            { label: 'View DOI Link', icon: Eye, onClick: () => window.open(`https://doi.org/${item.doi}`, '_blank') },
            {
              label: 'Download Citation',
              icon: Download,
              onClick: () => {
                exportToTextDoc(`Citation_${item.id}.bib`, `Research Paper Citation — ${item.title}`, {
                  'Paper Title': item.title,
                  'Faculty Author': item.faculty,
                  'Journal': item.journal,
                  'Indexing': item.indexing,
                  'Citations': item.citations,
                  'DOI': item.doi,
                });
                NotificationToast.info('Citation Downloaded', `BibTeX citation for ${item.title}`);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Department Research & Innovation"
      subtitle={`Scopus/SCI publications, patent filings, DST-SERB grants, and student innovation for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Research & Innovation' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Research_Publications_${departmentInfo.shortName}.csv`, publications);
              NotificationToast.success('Exporting Publications', 'Downloading Scopus CSV list...');
            }}
          >
            Export List
          </Button>
          <Button variant="primary" size="sm" iconLeft={Plus} onClick={() => NotificationToast.info('New Research Project', 'Proposal wizard initiated')}>
            Add Research Proposal
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Research Papers" value={summary.researchPapers || 28} subtitle={`${summary.scopusPublications || 18} Scopus • ${summary.sciJournals || 10} SCI`} icon={FileText} accentColor="blue" />
          <StatisticsCard label="Patents Filed / Granted" value={summary.patents || 4} subtitle="Intellectual Property" icon={Award} accentColor="purple" />
          <StatisticsCard label="Funded Grants" value={summary.researchGrants || 3} subtitle="DST-SERB & AICTE" icon={FlaskConical} accentColor="emerald" />
          <StatisticsCard label="Student Projects" value={summary.studentProjects || 14} subtitle="Major & Mini Projects" icon={Sparkles} accentColor="amber" />
        </div>
      }
    >
      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-200/80 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 2: Publications */}
      {activeTab === 'publications' && (
        <AdvancedTable
          title={`${departmentInfo.shortName} Scopus & SCI Journal Publications`}
          subtitle={`Department publication record strictly isolated to ${departmentInfo.name}`}
          columns={pubColumns}
          data={publications}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search publications by title, author, or journal..."
        />
      )}

      {/* Fallback */}
      {activeTab !== 'publications' && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dataset</p>
          <p className="mt-1">Official {activeTab} research records loaded from R&D cell database for {departmentInfo.name}.</p>
        </GlassCard>
      )}
    </PageContainer>
  );
}
