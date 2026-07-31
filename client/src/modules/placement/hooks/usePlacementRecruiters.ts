import { useState, useCallback } from 'react';
import {
  fetchRecruiters,
  createCompanyRecruiter,
  updateCompanyRecruiter,
  toggleRecruiterStatus,
  resetRecruiterPassword,
  assignDrivesToRecruiter,
} from '../services/placementService';
import type { CompanyRecruiterItem, CreateRecruiterPayload } from '../types';

export function usePlacementRecruiters() {
  const [recruiters, setRecruiters] = useState<CompanyRecruiterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecruiters();
      setRecruiters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateRecruiterPayload) => {
    const result = await createCompanyRecruiter(payload);
    setRecruiters(prev => [result.data, ...prev]);
    return result;
  }, []);

  const update = useCallback(async (id: string, payload: Partial<CreateRecruiterPayload>) => {
    const updated = await updateCompanyRecruiter(id, payload);
    setRecruiters(prev => prev.map(r => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const toggleStatus = useCallback(async (id: string, status: 'active' | 'disabled') => {
    const updated = await toggleRecruiterStatus(id, status);
    setRecruiters(prev => prev.map(r => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const resetPassword = useCallback(async (id: string) => {
    return resetRecruiterPassword(id);
  }, []);

  const assignDrives = useCallback(async (id: string, driveIds: string[]) => {
    await assignDrivesToRecruiter(id, driveIds);
    setRecruiters(prev =>
      prev.map(r => (r.id === id ? { ...r, assigned_drive_ids: driveIds } : r)),
    );
  }, []);

  return { recruiters, loading, error, load, create, update, toggleStatus, resetPassword, assignDrives };
}
