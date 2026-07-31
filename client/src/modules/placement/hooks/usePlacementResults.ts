import { useState, useCallback } from 'react';
import {
  fetchSubmittedResultsForReview,
  updateResultReviewStatus,
  overrideCandidateDecision,
  fetchResultOverrides,
  lockAndShareResults,
} from '../services/placementService';
import type { SubmittedResultReviewItem, DecisionOverridePayload } from '../types';

export function usePlacementResults() {
  const [results, setResults] = useState<SubmittedResultReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubmittedResultsForReview();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load result submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (
      id: string,
      status: 'Approved' | 'Rejected' | 'Correction Requested',
      remarks?: string,
    ) => {
      const updated = await updateResultReviewStatus(id, status, remarks);
      setResults(prev => prev.map(r => (r.id === id ? updated : r)));
      return updated;
    },
    [],
  );

  const override = useCallback(async (id: string, payload: DecisionOverridePayload) => {
    return overrideCandidateDecision(id, payload);
  }, []);

  const getOverrides = useCallback(async (id: string) => {
    return fetchResultOverrides(id);
  }, []);

  const lockAndShare = useCallback(async (id: string) => {
    const result = await lockAndShareResults(id);
    await load();
    return result;
  }, [load]);

  return { results, loading, error, load, updateStatus, override, getOverrides, lockAndShare };
}
