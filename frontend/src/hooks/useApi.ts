import { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardMetricPoint, Campaign } from '../types/api';
import { mockDashboardMetrics, mockCampaigns } from '../data/mockDashboard';

export const useMetrics = (filters?: {
  startDate?: string;
  endDate?: string;
  platform?: string;
}) => {
  const [metrics, setMetrics] = useState<DashboardMetricPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  const fetchMetrics = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(mockDashboardMetrics);
    } catch (err: any) {
      setError(err?.message || 'Failed to load mock metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, filtersKey]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

export const useCampaigns = (platform?: string) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const filtered = platform ? mockCampaigns.filter((c) => c.platform.toLowerCase() === platform.toLowerCase()) : mockCampaigns;
      setCampaigns(filtered);
    } catch (err: any) {
      setError(err?.message || 'Failed to load mock campaigns');
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
};
