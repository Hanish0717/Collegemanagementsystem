import React, { createContext, useContext, useState, useEffect } from 'react';
import { Assessment, AssessmentStatus, CreateAssessmentDTO } from '@/types/assessment';
import {
  fetchAssessments,
  createAssessment,
  updateAssessment,
  updateAssessmentStatus,
  deleteAssessment,
  fetchPlacementDrives
} from '@/services/assessmentService';

interface AssessmentContextType {
  assessments: Assessment[];
  drives: any[];
  loading: boolean;
  error: string | null;
  refreshAssessments: () => Promise<void>;
  createNewAssessment: (dto: CreateAssessmentDTO) => Promise<Assessment | null>;
  changeAssessmentStatus: (id: string, status: AssessmentStatus, comments?: string) => Promise<boolean>;
  updateAssessmentData: (id: string, data: Partial<CreateAssessmentDTO>) => Promise<boolean>;
  deleteAssessmentItem: (id: string) => Promise<boolean>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode; userRole?: string }> = ({
  children,
  userRole
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, driveList] = await Promise.all([
        fetchAssessments({ role: userRole }),
        fetchPlacementDrives()
      ]);
      setAssessments(list);
      setDrives(driveList);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssessments();
  }, [userRole]);

  const createNewAssessment = async (dto: CreateAssessmentDTO) => {
    try {
      setError(null);
      const created = await createAssessment(dto);
      await refreshAssessments();
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to create assessment');
      throw err;
    }
  };

  const changeAssessmentStatus = async (id: string, status: AssessmentStatus, comments?: string) => {
    try {
      setError(null);
      await updateAssessmentStatus(id, status, comments);
      await refreshAssessments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      throw err;
    }
  };

  const updateAssessmentData = async (id: string, data: Partial<CreateAssessmentDTO>) => {
    try {
      setError(null);
      await updateAssessment(id, data);
      await refreshAssessments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update assessment');
      throw err;
    }
  };

  const deleteAssessmentItem = async (id: string) => {
    try {
      setError(null);
      await deleteAssessment(id);
      await refreshAssessments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete assessment');
      throw err;
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        drives,
        loading,
        error,
        refreshAssessments,
        createNewAssessment,
        changeAssessmentStatus,
        updateAssessmentData,
        deleteAssessmentItem
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
