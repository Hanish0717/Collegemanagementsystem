import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { CompanyRecruiterItem, SubmittedResultReviewItem } from '../types';

interface PlacementModuleState {
  selectedDriveId: string | null;
  selectedRecruiterId: string | null;
  selectedSubmissionId: string | null;
  activeTab: string;
}

interface PlacementModuleContextType extends PlacementModuleState {
  setSelectedDriveId: (id: string | null) => void;
  setSelectedRecruiterId: (id: string | null) => void;
  setSelectedSubmissionId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  // Shared data cache
  cachedRecruiters: CompanyRecruiterItem[];
  setCachedRecruiters: (list: CompanyRecruiterItem[]) => void;
  cachedSubmissions: SubmittedResultReviewItem[];
  setCachedSubmissions: (list: SubmittedResultReviewItem[]) => void;
}

const PlacementModuleContext = createContext<PlacementModuleContextType | undefined>(undefined);

export const PlacementModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cachedRecruiters, setCachedRecruiters] = useState<CompanyRecruiterItem[]>([]);
  const [cachedSubmissions, setCachedSubmissions] = useState<SubmittedResultReviewItem[]>([]);

  return (
    <PlacementModuleContext.Provider
      value={{
        selectedDriveId,
        selectedRecruiterId,
        selectedSubmissionId,
        activeTab,
        setSelectedDriveId: useCallback((id) => setSelectedDriveId(id), []),
        setSelectedRecruiterId: useCallback((id) => setSelectedRecruiterId(id), []),
        setSelectedSubmissionId: useCallback((id) => setSelectedSubmissionId(id), []),
        setActiveTab: useCallback((tab) => setActiveTab(tab), []),
        cachedRecruiters,
        setCachedRecruiters: useCallback((list) => setCachedRecruiters(list), []),
        cachedSubmissions,
        setCachedSubmissions: useCallback((list) => setCachedSubmissions(list), []),
      }}
    >
      {children}
    </PlacementModuleContext.Provider>
  );
};

export function usePlacementModule() {
  const ctx = useContext(PlacementModuleContext);
  if (!ctx) {
    throw new Error('usePlacementModule must be used within PlacementModuleProvider');
  }
  return ctx;
}
