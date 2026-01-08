import { useState, useEffect, useMemo } from 'react';
import {
    OverviewDashboardData,
    OverviewRealtimeMetric,
    AiSummaryMetric,
    FinancialOverviewData,
    ActiveCampaignMetric,
    ConversionPlatformMetric,
    LtvCacData
} from '../types/dashboard';
import {
    mockOverviewRealtime,
    mockFinancialOverview,
    mockConversionFunnel,
    mockActiveCampaignMonitor,
    mockCampaignSourceInsights,
    mockLtvTrend,
    mockPlatformShare
} from '../data/mockDashboard';

// Mock data might need some adjustments to match the strict interfaces exactly
// This hook acts as an adapter/transformer

export const useOverviewData = (
    dateRange: string,
    compareMode: string,
    conversionConnectionStatus: any
) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<OverviewDashboardData | null>(null);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        const timer = setTimeout(() => {

            // --- TRANSFORMATION LOGIC START ---

            // 1. Realtime Metrics
            const rawRealtime = (mockOverviewRealtime as any)[dateRange === '30D' ? '30D' : dateRange === '7D' ? '7D' : 'Today'] || mockOverviewRealtime['Today'];

            const realtimeMessages: OverviewRealtimeMetric[] = rawRealtime.map((item: any) => ({
                id: item.id,
                label: item.label,
                value: item.value,
                delta: compareMode === 'previous' ? item.delta : item.deltaTarget || item.delta,
                deltaTarget: item.deltaTarget,
                positive: item.positive
            }));

            // 2. AI Summaries (CPM, CTR, etc.)
            const aiSummaries: AiSummaryMetric[] = [
                { id: 'cpm', label: 'CPM', value: '$3.80', delta: '-3.2%', positive: true, periodLabel: 'From last period', accentColor: 'blue' },
                { id: 'ctr', label: 'CTR', value: '2.4%', delta: '+0.6%', positive: true, periodLabel: 'From last period', accentColor: 'emerald' },
                { id: 'roas', label: 'ROAS', value: '4.2x', delta: '+4.1%', positive: true, periodLabel: 'From last period', accentColor: 'purple' },
                { id: 'roi', label: 'ROI', value: '128%', delta: '+2.1%', positive: true, periodLabel: 'From last period', accentColor: 'orange' },
            ];

            // 3. Financial Overview
            const financial: FinancialOverviewData = {
                revenue: mockFinancialOverview.revenue,
                revenueChange: mockFinancialOverview.revenueChange,
                profit: mockFinancialOverview.profit,
                profitChange: mockFinancialOverview.profitChange,
                cost: mockFinancialOverview.cost,
                costChange: mockFinancialOverview.costChange,
                roi: mockFinancialOverview.roi,
                roiChange: mockFinancialOverview.roiChange,
                breakdown: mockFinancialOverview.breakdown.map((item: any) => ({
                    name: item.label, // Map label to name for chart compatibility
                    value: item.value,
                    color: item.color
                })),
                details: [
                    { label: 'Total Revenue', value: mockFinancialOverview.revenue, delta: mockFinancialOverview.revenueChange, accent: 'rgba(16,185,129,0.7)' },
                    { label: 'Total Profit', value: mockFinancialOverview.profit, delta: mockFinancialOverview.profitChange, accent: 'rgba(96,165,250,0.7)' },
                    { label: 'Total Cost', value: mockFinancialOverview.cost, delta: mockFinancialOverview.costChange, accent: 'rgba(248,113,113,0.7)' },
                ]
            };

            // 4. Active Campaign Monitor
            // Use mockActiveCampaignMonitor directly as it matches the need, or derived from mockCampaignSourceInsights if dynamic behavior is needed.
            // For now, let's use the static list + derived for better "simulation" if needed, but mockActiveCampaignMonitor is fine.
            // But wait, the original code used a "campaignMonitorRows" which seemed to be derived.
            // Let's stick to mockActiveCampaignMonitor as requested by the fix plan.
            const activeCampaigns: ActiveCampaignMetric[] = mockActiveCampaignMonitor.slice(0, 5).map((camp: any) => ({
                id: camp.campaignName, // mock doesn't have ID? Use name.
                campaignName: camp.campaignName,
                platform: camp.platform,
                conversions: camp.conversions,
                cpa: camp.cpa,
                budget: camp.budget
            }));

            // 5. Conversion Platforms
            const conversionPlatforms: ConversionPlatformMetric[] = mockPlatformShare
                .map(p => {
                    const statusMap = (conversionConnectionStatus || {}) as Record<string, string>;
                    const key = Object.keys(statusMap).find(
                        k => k.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(k.toLowerCase())
                    );
                    const isConnected = key ? statusMap[key] === 'connected' : false;

                    return {
                        id: p.name,
                        platform: p.name,
                        value: p.value,
                        color: (mockCampaignSourceInsights.find((s: any) => s.label.includes(p.name)) as any)?.accent || '#ccc',
                        connectionStatus: isConnected ? 'connected' : 'disconnected'
                    } as ConversionPlatformMetric;
                })
                .filter(p => p.connectionStatus === 'connected');

            // 6. LTV:CAC
            const ltvCac: LtvCacData = {
                currentRatio: 3.4,
                movement: '+0.2',
                movementLabel: 'vs last month',
                avgLtv: 520,
                avgCac: 150,
                trend: mockLtvTrend.map((item: any) => ({
                    name: item.week, // Map week to name
                    ltv: item.ltv,
                    cac: item.cac
                }))
            };

            // --- TRANSFORMATION LOGIC END ---

            setData({
                realtimeMessages,
                aiSummaries,
                financial,
                conversionFunnel: mockConversionFunnel,
                activeCampaigns,
                conversionPlatforms,
                ltvCac
            });
            setLoading(false);
        }, 800); // 800ms simulation

        return () => clearTimeout(timer);
    }, [dateRange, compareMode, conversionConnectionStatus]);

    return { data, loading };
};
