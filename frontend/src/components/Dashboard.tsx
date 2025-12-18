import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMetrics, useCampaigns } from '../hooks/useApi';
import { getIntegrations, updateIntegration } from '../services/api';
import { useIntegrationNotifications } from '../hooks/useIntegrationNotifications';
import { Integration } from '../types/api';
import api from '../services/api';
import DashboardShell, { ThemeTokens } from './dashboard/DashboardShell';
import AI from './AI';
import { renderOverviewSection } from './dashboard/sections/overviewSection';
import { renderCampaignSection } from './dashboard/sections/campaignSection';
import { renderSeoSection } from './dashboard/sections/seoSection';
import { renderCommerceSection } from './dashboard/sections/commerceSection';
import { renderCrmSection } from './dashboard/sections/crmSection';
import { renderTrendSection } from './dashboard/sections/trendSection';
import { renderSettingsSection } from './dashboard/sections/settingsSection';
import { renderReportsSection } from './dashboard/sections/reportsSection';
import {
  LayoutDashboard,
  BarChart3,
  Search,
  ShoppingBag,
  Users,
  Target,
  Settings,
  FileText,
  TrendingUp,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  Share2,
  Bell,
  Calendar,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Facebook,
  MessageCircle,
  Music,
  Printer,
  Download,
} from 'lucide-react';
import { MetricsLineChart, MetricsBarChart, PlatformPieChart, ChartDatum } from './Charts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Area,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import {
  mockOverviewHighlights,
  mockPlatformShare,
  mockCampaignList,
  mockSeoSnapshots,
  mockSeoRealtimeStats,
  mockSeoTechnicalScores,
  mockSeoKeywordsDetailed,
  mockSeoCompetitors,
  mockSeoPositionDistribution,
  mockSeoCompetitiveMap,
  mockSeoConversionSummary,
  mockSeoIssues,
  mockSeoAuthorityScores,
  mockSeoBacklinkHighlights,
  mockSeoOrganicSearch,
  mockSeoAnchors,
  mockSeoReferringDomains,
  mockSeoRegionalPerformance,
  mockSeoRightRailStats,
  mockSeoUrlRatings,
  mockCommerceInsights,
  mockCommerceRealtime,
  mockCommerceProfitability,
  mockCommerceConversionFunnel,
  mockCommerceRevenueTrend,
  mockCommerceProductVideos,
  mockCommerceCreatives,
  mockOverviewRealtime,
  mockCrmPipeline,
  mockCrmRealtime,
  mockCrmStages,
  mockCrmAgeRange,
  mockCrmLeads,
  mockTrendInsights,
  mockTrendRealtime,
  mockTrendRevenueByChannel,
  mockTrendSalesFunnel,
  mockTrendRevenueTrend,
  mockTrendLeadSources,
  mockTrendSalesReps,
  mockSettingsShortcuts,
  mockSettingsKpis,
  mockSettingsBranding,
  mockSettingsRefresh,
  mockSettingsIntegrations,
  mockSettingsUsers,
  mockSettingsAlerts,
  mockReportAutomation,
  mockReportBuilders,
  mockReportStatus,
  mockRealtimeStats,
  mockFinancialOverview,
  mockConversionFunnel,
  mockLtvTrend,
  mockConversionPlatforms,
  ltvCacData,
  ltvCacColors,
  currentGoal,
  mockProductPerformance,
  mockCampaignSourceInsights,
  mockNotifications,
  KPI_ALERT_MENU_OPTIONS,
  KPI_METRIC_OPTIONS,
  KPI_CONDITION_OPTIONS,
  KPI_METRIC_SUMMARY,
} from '../data/mockDashboard';

type SectionKey =
  | 'overview'
  | 'commerce'
  | 'campaign'
  | 'trend'
  | 'crm'
  | 'seo'
  | 'settings'
  | 'reports';

type SettingsData = {
  shortcuts: typeof mockSettingsShortcuts;
  kpis: typeof mockSettingsKpis;
  branding: typeof mockSettingsBranding;
  refresh: typeof mockSettingsRefresh;
  integrations: typeof mockSettingsIntegrations;
  users: typeof mockSettingsUsers;
  alerts: typeof mockSettingsAlerts;
};

type ThemeName = 'Light' | 'Dark' | 'Canvas';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const buildDefaultSettings = (): SettingsData => ({
  shortcuts: clone(mockSettingsShortcuts),
  kpis: clone(mockSettingsKpis),
  branding: clone(mockSettingsBranding),
  refresh: clone(mockSettingsRefresh),
  integrations: clone(mockSettingsIntegrations),
  users: clone(mockSettingsUsers),
  alerts: clone(mockSettingsAlerts),
});

const hexToRgba = (hex: string | undefined, alpha = 1) => {
  if (!hex) return `rgba(249, 115, 22, ${alpha})`;
  let sanitized = hex.replace('#', '');
  if (![3, 6].includes(sanitized.length)) {
    return `rgba(249, 115, 22, ${alpha})`;
  }
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const normalizeHex = (value?: string) => {
  if (!value) return '#000000';
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    hex = `#${hex}`;
  }
  hex = `#${hex.replace(/[^0-9a-f]/gi, '')}`;
  if (hex.length === 4) {
    hex =
      '#' +
      hex
        .slice(1)
        .split('')
        .map((char) => char + char)
        .join('');
  }
  if (hex.length !== 7) {
    hex = (hex + '000000').slice(0, 7);
  }
  return hex;
};

const adjustHexColor = (hex: string | undefined, amount = 0) => {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  const clamp = (value: number) => Math.min(255, Math.max(0, value));
  const r = clamp(((num >> 16) & 255) + amount * 255);
  const g = clamp(((num >> 8) & 255) + amount * 255);
  const b = clamp((num & 255) + amount * 255);
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

const normalizeColorInput = (value: string) => normalizeHex(value);

const accentGradient = (hex: string | undefined, startAlpha = 0.12, endAlpha = 0.35) =>
  `linear-gradient(135deg, ${hexToRgba(hex, startAlpha)}, ${hexToRgba(hex, endAlpha)})`;

const themedSectionClass = 'theme-section rounded-3xl p-6 shadow-lg space-y-6';
const themedCardBase = 'theme-card rounded-3xl border border-gray-100';
const themedCardClass = `${themedCardBase} p-6 space-y-4`;
const themedCardTightClass = `${themedCardBase} p-5 space-y-4`;
const themePanelBase = 'theme-panel rounded-3xl border border-gray-100';
const themePanelClass = `${themePanelBase} p-6 space-y-6`;
const themePanelTightClass = `${themePanelBase} p-6 space-y-4`;
const themePanelCompactClass = `${themePanelBase} p-5 space-y-4`;

const themeOptions: ThemeName[] = ['Light', 'Dark', 'Canvas'];

const dashboardColorPairs = [
  // 🔴 Red – พื้นหลังชมพูอ่อน อ่านง่าย
  { id: 'pair-1', name: 'Neutral Red', bg: '#FCA5A5', text: '#991B1B' },
  // 🔵 Blue – ฟ้าอ่อน + น้ำเงินเข้ม
  { id: 'pair-2', name: 'Corporate Blue', bg: '#BFDBFE', text: '#1E40AF' },
  // 🟢 Green – เขียวมิ้นต์อ่อน + เขียวเข้ม
  { id: 'pair-3', name: 'System Green', bg: '#BBF7D0', text: '#166534' },
  // 🟡 Yellow – เหลืองพาสเทล + น้ำตาลทอง
  { id: 'pair-4', name: 'Soft Yellow', bg: '#FDE68A', text: '#92400E' },
  // 🟣 Purple – ม่วงอ่อน + ม่วงเข้ม
  { id: 'pair-5', name: 'SaaS Purple', bg: '#DDD6FE', text: '#3730A3' },
  // ⚫ Grey – เทากลาง / Universal
  { id: 'pair-6', name: 'Universal Grey', bg: '#E5E7EB', text: '#111827' },
  // 🟠 Orange – ส้มพาสเทล + ส้มไหม้เข้ม
  { id: 'pair-7', name: 'Accent Orange', bg: '#FED7AA', text: '#9A3412' },
];

const BRANDING_STORAGE_KEY = 'dashboardBranding';
const SETTINGS_STORAGE_KEY = 'dashboardSettings';

interface StatConfig {
  label: string;
  value: string;
  helper?: string;
}

const StatCard: React.FC<StatConfig> = ({ label, value, helper }) => (
  <div className="bg-white rounded-2xl px-4 py-5 border border-gray-100 shadow-sm">
    <p className="text-xs font-semibold text-gray-500 uppercase ">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    {helper && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
);

const RealTimeCard: React.FC<{
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  active?: boolean;
  onSelect?: () => void;
  detail?: string;
}> = ({ label, value, delta, positive = true, active = false, onSelect, detail }) => {
  const interactive = Boolean(onSelect);
  const detailText = detail || delta || 'More insight coming soon.';
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onSelect) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`real-time-card relative overflow-hidden group rounded-[36px] border px-9 py-9 text-left transition bg-gradient-to-br from-white to-orange-50/20 shadow-[0_28px_80px_rgba(15,23,42,0.1)] flex flex-col gap-3 hover:bg-gray-50/60 active:bg-gray-100/80   ${
        active
          ? 'border-gray-900 ring-2 ring-gray-900/10 shadow-[0_32px_90px_rgba(15,23,42,0.15)] translate-y-0'
          : 'border-gray-200 hover:-translate-y-1'
      } ${interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/30' : ''}`}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-gray-500 gap2">
        <span>{label}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-gray-900' : 'bg-gray-300'}`} />
      </div>
      <p className="real-time-value text-[28px] leading-tight font-semibold text-gray-900 -mt-2">{value}</p>
      <div
        className={`real-time-delta inline-flex items-center gap-2 text-[11px] font-semibold px-4 py-2 rounded-full w-fit -mt-2 ${
          positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}
      >
        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {delta}
      </div>
      <p className="real-time-subtitle text-[11px] text-gray-500 -mt-1">from last period</p>
    </div>
  );
};

const ScheduleReportCard: React.FC<{ schedule: typeof mockReportBuilders.schedule }> = ({ schedule }) => (
  <div className="theme-card rounded-3xl p-5 flex flex-col h-full">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="font-semibold theme-text !text-[20px] !leading-tight !mb-0">Schedule Report</p>
        <p className="theme-muted !text-[16px] !leading-tight !mb-0">Set delivery time, recipients, and export format.</p>
      </div>
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border whitespace-nowrap tabular-nums"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--theme-text)' }}
      >
        {schedule.scheduleTime}
      </span>
    </div>

    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="rounded-2xl p-4 border"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--surface-muted)' }}
      >
        <p className="text-xs theme-muted">Report</p>
        <p className="mt-1 font-semibold theme-text !text-[15px] !leading-tight !mb-0">{schedule.name}</p>
        <p className="mt-2 text-xs theme-muted">Menu</p>
        <p className="mt-1 font-semibold theme-text !text-[15px] !leading-tight !mb-0">{schedule.menu}</p>
      </div>

      <div
        className="rounded-2xl p-4 border"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--surface-muted)' }}
      >
        <p className="text-xs theme-muted">Date Range</p>
        <p className="mt-1 font-semibold theme-text !text-[15px] !leading-tight !mb-0">{schedule.dateRange}</p>
        <p className="mt-2 text-xs theme-muted">Send at</p>
        <p className="mt-1 font-semibold theme-text !text-[15px] !leading-tight !mb-0">{schedule.scheduleTime}</p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4">
      <div>
        <p className="text-xs theme-muted">Email Recipients</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {schedule.recipients.map((email) => (
            <span
              key={email}
              className="px-3 py-1 rounded-full border text-xs font-semibold"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'transparent', color: 'var(--theme-text)' }}
            >
              {email}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs theme-muted">Format</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {schedule.format.map((format) => (
            <span
              key={format}
              className="px-3 py-1 rounded-full border text-xs font-semibold"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'transparent' }}
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>

    <button
      className="mt-auto w-full rounded-2xl py-3 text-sm font-semibold"
      style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
    >
      Schedule Report
    </button>
  </div>
);

const ReportStatusTable: React.FC = () => (
  <div className="theme-card rounded-3xl p-5 space-y-4 h-full">
    <p className="font-semibold theme-text !text-[20px] !leading-tight !mb-0">Report Status</p>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase theme-muted">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
          {mockReportStatus.map((row) => (
            <tr key={row.email} className="theme-text">
              <td className="py-3 pr-4">
                <p className="font-semibold theme-text !text-[15px] !leading-tight !mb-0">{row.name}</p>
                <p className="text-xs theme-muted !mb-0">{row.email}</p>
              </td>
              <td className="py-3 pr-4">
                <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs">{row.role}</span>
              </td>
              <td className="py-3 pr-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    row.status === 'Download'
                      ? {
                          backgroundColor: 'rgba(59, 130, 246, 0.16)',
                          border: '1px solid rgba(59, 130, 246, 0.35)',
                          color: 'rgba(147, 197, 253, 0.95)',
                        }
                      : row.status === 'Scheduled'
                      ? {
                          backgroundColor: 'rgba(245, 158, 11, 0.16)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          color: 'rgba(253, 230, 138, 0.95)',
                        }
                      : {
                          backgroundColor: 'rgba(16, 185, 129, 0.16)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: 'rgba(167, 243, 208, 0.95)',
                        }
                  }
                >
                  {row.status}
                </span>
              </td>
              <td className="py-3">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const KPI_OVERVIEW_SUBMENU_OPTIONS = [
  'Campaign Performance',
  'SEO & Web Analytics',
  'E-commerce Insights',
  'CRM & Leads',
  'Trend Analysis & History',
];

const KpiSettingsTable: React.FC<{
  settingsData: SettingsData;
  settingsLoading: boolean;
  onUpdateKpi: (id: string, patch: Partial<any>) => void;
  onAddKpi: () => void;
  onRemoveKpi: (id: string) => void;
}> = ({ settingsData, settingsLoading, onUpdateKpi, onAddKpi, onRemoveKpi }) => (
  <div className="theme-card rounded-3xl border border-gray-100 bg-white p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-900 !text-[20px] !leading-tight !mb-0">KPI Alert Thresholds</p>
        <p className="text-gray-500 !text-[16px] !leading-tight !mb-0">Configure when to trigger alerts for key metrics</p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="py-3 pr-4 whitespace-nowrap">Menu</th>
            <th className="py-3 pr-4 whitespace-nowrap">Metric</th>
            <th className="py-3 pr-4 whitespace-nowrap">Condition</th>
            <th className="py-3 pr-4 whitespace-nowrap">Threshold(%)</th>
            <th className="py-3 pr-4 whitespace-nowrap">Status</th>
            <th className="py-3 whitespace-nowrap"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {settingsData.kpis.length > 0 ? (
            settingsData.kpis.map((kpi: any) => (
              <tr key={kpi.id} className="text-gray-800">
                <td className="py-4 pr-4">
                  {(() => {
                    const baseMenuOptions =
                      Array.isArray(KPI_ALERT_MENU_OPTIONS) && KPI_ALERT_MENU_OPTIONS.length > 0
                        ? KPI_ALERT_MENU_OPTIONS
                        : ['Overview Dashboard'];
                    const rawAlertName = typeof kpi.alertName === 'string' ? kpi.alertName.trim() : '';
                    const currentAlertName = baseMenuOptions.includes(rawAlertName) ? rawAlertName : baseMenuOptions[0];

                    const visibleMenuOptions =
                      currentAlertName === 'Overview Dashboard'
                        ? KPI_OVERVIEW_SUBMENU_OPTIONS
                        : baseMenuOptions;

                    return (
                      <select
                        className="theme-input rounded-2xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--theme-border)' }}
                        value={currentAlertName}
                        onChange={(event) => {
                          const nextAlertName = event.target.value;
                          const nextMetricOptions =
                            KPI_METRIC_OPTIONS?.[nextAlertName] || KPI_METRIC_OPTIONS?.[baseMenuOptions[0]] || ['Financial Overview'];
                          const nextMetric = nextMetricOptions[0];
                          const summary = KPI_METRIC_SUMMARY?.[nextMetric];
                          onUpdateKpi(kpi.id, {
                            alertName: nextAlertName,
                            metric: nextMetric,
                            ...(summary
                              ? {
                                  threshold: summary.threshold,
                                  status: summary.status,
                                  condition: summary.condition || KPI_CONDITION_OPTIONS[0],
                                }
                              : null),
                          });
                        }}
                      >
                        <option value={currentAlertName} hidden>
                          {currentAlertName}
                        </option>
                        {visibleMenuOptions
                          .filter((option) => option !== currentAlertName)
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    );
                  })()}
                </td>
                <td className="py-4 pr-4">
                  {(() => {
                    const baseMenuOptions =
                      Array.isArray(KPI_ALERT_MENU_OPTIONS) && KPI_ALERT_MENU_OPTIONS.length > 0
                        ? KPI_ALERT_MENU_OPTIONS
                        : ['Overview Dashboard'];
                    const rawAlertName = typeof kpi.alertName === 'string' ? kpi.alertName.trim() : '';
                    const currentAlertName = baseMenuOptions.includes(rawAlertName) ? rawAlertName : baseMenuOptions[0];
                    const metricOptions =
                      KPI_METRIC_OPTIONS?.[currentAlertName] || KPI_METRIC_OPTIONS?.[baseMenuOptions[0]] || ['Financial Overview'];
                    const currentMetric =
                      typeof kpi.metric === 'string' && metricOptions.includes(kpi.metric) ? kpi.metric : metricOptions[0];
                    return (
                      <select
                        className="theme-input rounded-2xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--theme-border)' }}
                        value={currentMetric}
                        onChange={(event) => {
                          const nextMetric = event.target.value;
                          const summary = KPI_METRIC_SUMMARY?.[nextMetric];
                          onUpdateKpi(kpi.id, {
                            metric: nextMetric,
                            ...(summary
                              ? {
                                  threshold: summary.threshold,
                                  status: summary.status,
                                  condition: summary.condition || KPI_CONDITION_OPTIONS[0],
                                }
                              : null),
                          });
                        }}
                      >
                        <option value={currentMetric} hidden>
                          {currentMetric}
                        </option>
                        {metricOptions
                          .filter((option) => option !== currentMetric)
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    );
                  })()}
                </td>
                <td className="py-4 pr-4">
                  {(() => {
                    const currentCondition =
                      typeof kpi.condition === 'string' && (KPI_CONDITION_OPTIONS as readonly string[]).includes(kpi.condition)
                        ? kpi.condition
                        : KPI_CONDITION_OPTIONS[0];
                    return (
                      <select
                        className="theme-input rounded-2xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--theme-border)' }}
                        value={currentCondition}
                        onChange={(event) => onUpdateKpi(kpi.id, { condition: event.target.value })}
                      >
                        <option value={currentCondition} hidden>
                          {currentCondition}
                        </option>
                        {(KPI_CONDITION_OPTIONS as readonly string[])
                          .filter((option) => option !== currentCondition)
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    );
                  })()}
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="theme-input rounded-2xl border px-3 py-2 text-sm w-[140px]"
                    style={{ borderColor: 'var(--theme-border)' }}
                    value={typeof kpi.threshold === 'string' ? kpi.threshold : String(kpi.threshold ?? '')}
                    onChange={(event) => onUpdateKpi(kpi.id, { threshold: event.target.value })}
                    placeholder="e.g. 5"
                  />
                </td>
                <td className="py-4 pr-4">
                  {(() => {
                    const normalizedStatus = String(kpi.status || 'inactive').toLowerCase();
                    const enabled = normalizedStatus === 'active' || normalizedStatus === 'enabled';
                    const label = enabled ? 'Active' : 'Inactive';
                    return (
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={
                          enabled
                            ? {
                                backgroundColor: 'rgba(249, 115, 22, 0.14)',
                                border: '1px solid rgba(249, 115, 22, 0.35)',
                                color: 'var(--accent-color)',
                              }
                            : {
                                backgroundColor: 'rgba(148, 163, 184, 0.12)',
                                border: '1px solid rgba(148, 163, 184, 0.22)',
                                color: 'var(--theme-muted)',
                              }
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: enabled ? 'var(--accent-color)' : 'var(--theme-muted)' }}
                        />
                        {label}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-4">
                  <button
                    type="button"
                    aria-label="Remove KPI"
                    className="h-9 w-9 inline-flex items-center justify-center rounded-xl border"
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                    onClick={() => onRemoveKpi(kpi.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 6h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4h8v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6l1 16h10l1-16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 11v6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 11v6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                {settingsLoading ? 'Loading...' : 'No KPI alerts configured'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <button
      type="button"
      className="w-full mt-4 rounded-2xl border py-3 text-sm font-semibold"
      style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
      onClick={onAddKpi}
    >
      + Add KPI
    </button>
  </div>
);

const ThemeBrandingCard: React.FC<{
  settingsData: SettingsData;
  onSelectTheme: (theme: ThemeName) => void;
  onMenuChange: (value: string) => void;
  onResetBranding: () => void;
}> = ({ settingsData, onSelectTheme, onMenuChange, onResetBranding }) => {

  const currentMenuColor = settingsData.branding.menuColor || '#0F172A';
  const selectedPair =
    dashboardColorPairs.find((pair) => pair.bg.toLowerCase() === currentMenuColor.toLowerCase()) || dashboardColorPairs[0];

  return (
    <div className="theme-card rounded-3xl border border-gray-100 p-5 space-y-4">
      <p className="font-semibold text-gray-900 !text-[20px] !leading-tight !mb-0">Theme & Branding</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Color Theme</p>
          <div className="mt-1 flex gap-2">
            {themeOptions.map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => onSelectTheme(themeOption)}
                className={`flex-1 px-3 py-1 rounded-full border text-xs font-semibold ${
                  settingsData.branding.theme === themeOption
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {themeOption}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Color Menu</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold"
              style={{
                backgroundColor: selectedPair.bg,
                color: selectedPair.text,
              }}
            >
              A
            </span>
            <select
              className="theme-input flex-1 rounded border px-2 py-1 text-xs"
              value={selectedPair.id}
              onChange={(event) => {
                const next = dashboardColorPairs.find((pair) => pair.id === event.target.value) || dashboardColorPairs[0];
                onMenuChange(next.bg);
              }}
            >
              {dashboardColorPairs.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.name} ({pair.bg} / {pair.text})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Company Name</p>
          <p className="mt-1 font-semibold text-gray-900">{settingsData.branding.companyName || 'Your Company'}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
        <button
          className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-shadow shadow-sm hover:shadow-md"
          onClick={onResetBranding}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};

const DataRefreshCard: React.FC<{
  settingsData: SettingsData;
  onChangeRefresh: (patch: Partial<SettingsData['refresh']>) => void;
  onManualTrigger: () => void;
}> = ({ settingsData, onChangeRefresh, onManualTrigger }) => {
  const frequencyOptions = ['Every 5 minutes', 'Every 15 minutes', 'Every 30 minutes', 'Hourly', 'Daily'];
  const manualEnabled = Boolean(settingsData.refresh.manual);
  const realtimeEnabled = Boolean(settingsData.refresh.realtime);
	const [manualSpinning, setManualSpinning] = useState(false);

  const currentFrequency = settingsData.refresh.frequency || 'Every 5 minutes';

  return (
    <div className="theme-card rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-semibold theme-text text-[20px] leading-tight mb-0">Data Refresh Schedule</p>
            <p className="theme-muted !text-[16px] !leading-tight !mb-0">Control how often this dashboard pulls fresh data.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium border"
          style={{
            backgroundColor: 'var(--surface-muted)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text)',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: realtimeEnabled ? 'var(--accent-color)' : 'var(--theme-border)' }}
          />
          {realtimeEnabled ? 'Real-time ON' : 'Real-time OFF'}
        </span>
      </div>

      {/* Frequency selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium theme-text">Refresh frequency</p>
          <span className="text-[11px] theme-muted">Applies to all refresh modes</span>
        </div>
        <div className="relative">
          <select
            className="theme-input w-full rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm appearance-none pr-10"
            value={currentFrequency}
            onChange={(event) => onChangeRefresh({ frequency: event.target.value })}
          >
            {frequencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs theme-muted">
            ▼
          </span>
        </div>
      </div>

      {/* Modes: Manual & Real-time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="theme-panel-soft rounded-2xl px-4 py-3 flex flex-col gap-2 justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text">Manual refresh</p>
              <p className="text-[11px] theme-muted">Trigger updates only when you click refresh.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setManualSpinning(true);
              onManualTrigger();
              setTimeout(() => setManualSpinning(false), 700);
            }}
            className="inline-flex items-center justify-between w-full rounded-full px-3 py-1.5 text-xs font-medium border transition-colors theme-text"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <span className="flex items-center gap-2">
              <Loader2 className={`h-3.5 w-3.5 ${manualSpinning ? 'animate-spin' : ''}`} />
              Manual trigger
            </span>
            <span className="text-[10px] uppercase tracking-wide">Manual</span>
          </button>
        </div>

        <div className="theme-panel-soft rounded-2xl px-4 py-3 flex flex-col gap-2 justify-between min-h-[124px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text">Real-time sync</p>
              <p className="text-[11px] theme-muted">Automatically refresh based on the selected interval.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeRefresh({ realtime: !realtimeEnabled })}
            className="inline-flex items-center justify-between w-full rounded-full px-3 py-1.5 text-xs font-medium border transition-colors theme-text"
            style={
              realtimeEnabled
                ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#ffffff' }
                : { borderColor: 'var(--theme-border)' }
            }
          >
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5" />
              Real-time mode
            </span>
            <span className="text-[10px] uppercase tracking-wide">{realtimeEnabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiIntegrationCard: React.FC<{ settingsData: SettingsData; settingsLoading: boolean }> = ({
  settingsData,
  settingsLoading,
}) => (
  <div className="theme-card rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">API Integration</p>
    <div className="space-y-3">
      {settingsData.integrations.length > 0 ? (
        settingsData.integrations.map((integration: any) => (
          <div key={integration?.id || integration?.platform || Math.random()} className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
                {(integration?.platform?.charAt(0) || '?').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{integration?.platform || 'Unknown Platform'}</p>
                <p className="text-xs text-gray-500">{integration?.status || 'Not configured'}</p>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                integration?.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {integration?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          {settingsLoading ? 'Loading...' : 'No integrations configured'}
        </div>
      )}
    </div>
  </div>
);

const UserRolesCard: React.FC<{ settingsData: SettingsData; settingsLoading: boolean }> = ({
  settingsData,
  settingsLoading,
}) => (
  <div className="theme-card rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <div className="flex items-center justify-between">
      <p className="font-semibold text-gray-900 !text-[20px] !leading-tight !mb-0">User Roles & Permissions</p>
      <button className="px-3 py-1 rounded-full border border-gray-200 text-xs">+ Add User</button>
    </div>
    <div className="space-y-3 text-sm">
      {settingsData.users.length > 0 ? (
        settingsData.users.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
            <div>
              <p className="font-semibold text-gray-900 !text-[15px] !leading-tight !mb-0">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          {settingsLoading ? 'Loading...' : 'No users configured'}
        </div>
      )}
    </div>
    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-700">
      <p className="font-semibold text-gray-900 !text-[15px] !leading-tight !mb-1">Role Permissions:</p>
      <p className="text-gray-500 !text-[12px] !leading-tight !mb-0">Admin: Full access.</p>
      <p className="text-gray-500 !text-[12px] !leading-tight !mb-0">Analyst: View-only (dashboards, reports, KPIs).</p>
      <p className="text-gray-500 !text-[12px] !leading-tight !mb-0">Executive: View-only (dashboards, reports).</p>
    </div>
  </div>
);

const AlertSettingsCard: React.FC<{
  settingsData: SettingsData;
  themeMode: 'light' | 'dark' | 'canvas';
  onToggle: (group: keyof SettingsData['alerts'], label: string) => void;
  onAddRecipient: (email: string) => void;
  onRemoveRecipient: (email: string) => void;
}> = ({ settingsData, themeMode, onToggle, onAddRecipient, onRemoveRecipient }) => (
  <div className="theme-card rounded-3xl p-5 space-y-4">
    <p className="font-semibold theme-text !text-[20px] !leading-tight !mb-0">Alert & Notification Settings</p>
    <div className="space-y-4 text-sm">
      <div>
        <p className="uppercase theme-muted !text-[14px] !leading-tight !mb-0">Alert Types</p>
        <div className="mt-2 space-y-2">
          {settingsData.alerts.alertTypes.length > 0 ? (
            settingsData.alerts.alertTypes.map((alert: any) => {
              const enabled = Boolean(alert.enabled);
              const isDark = themeMode === 'dark';
              return (
                <div key={alert.label} className="flex items-center justify-between">
                  <span className={enabled ? 'theme-text font-semibold' : 'theme-muted font-medium'}>{alert.label}</span>
                  <button
                    type="button"
                    onClick={() => onToggle('alertTypes', alert.label)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full border transition-colors"
                    style={{
                      backgroundColor: enabled ? '#f97316' : isDark ? '#020617' : '#e5e7eb',
                      borderColor: enabled ? '#fb923c' : isDark ? '#64748b' : '#d1d5db',
                      boxShadow: enabled
                        ? isDark
                          ? '0 0 10px rgba(249,115,22,0.7)'
                          : '0 0 8px rgba(249,115,22,0.45)'
                        : 'none',
                    }}
                    aria-pressed={enabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: enabled
                          ? '0 2px 4px rgba(0,0,0,0.35)'
                          : '0 1px 3px rgba(0,0,0,0.25)',
                      }}
                    />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="theme-muted">No alert types configured</p>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase theme-muted">Delivery Channels</p>
        <div className="mt-2 space-y-2">
          {settingsData.alerts.deliveryChannels.length > 0 ? (
            settingsData.alerts.deliveryChannels.map((channel: any) => {
              const enabled = Boolean(channel.enabled);
              const isDark = themeMode === 'dark';
              return (
                <div key={channel.label} className="flex items-center justify-between">
                  <span className={enabled ? 'theme-text font-semibold' : 'theme-muted font-medium'}>{channel.label}</span>
                  <button
                    type="button"
                    onClick={() => onToggle('deliveryChannels', channel.label)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full border transition-colors"
                    style={{
                      backgroundColor: enabled ? '#f97316' : isDark ? '#020617' : '#e5e7eb',
                      borderColor: enabled ? '#fb923c' : isDark ? '#64748b' : '#d1d5db',
                      boxShadow: enabled
                        ? isDark
                          ? '0 0 10px rgba(249,115,22,0.7)'
                          : '0 0 8px rgba(249,115,22,0.45)'
                        : 'none',
                    }}
                    aria-pressed={enabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: enabled
                          ? '0 2px 4px rgba(0,0,0,0.35)'
                          : '0 1px 3px rgba(0,0,0,0.25)',
                      }}
                    />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="theme-muted">No delivery channels configured</p>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase theme-muted">Email Recipients</p>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Add email for alerts"
              className="flex-1 rounded-2xl px-3 py-2 text-sm theme-input"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onAddRecipient((event.target as HTMLInputElement).value);
                  (event.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              type="button"
              className="rounded-2xl px-4 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
              onClick={(event) => {
                const container = (event.currentTarget.parentElement as HTMLElement) || null;
                const input = container?.querySelector('input[type="email"]') as HTMLInputElement | null;
                if (input && input.value.trim()) {
                  onAddRecipient(input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {settingsData.alerts.recipients.length > 0 ? (
              settingsData.alerts.recipients.map((email: string) => (
                <div
                  key={email}
                  className="flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs sm:text-sm theme-text"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    className="text-[11px] px-2 py-1 rounded-xl border theme-muted hover:opacity-80"
                    style={{ borderColor: 'var(--theme-border)' }}
                    onClick={() => onRemoveRecipient(email)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="theme-muted !text-[12px] !leading-tight !mb-0">No email recipients configured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SeoConversionCard: React.FC<{ summary: typeof mockSeoConversionSummary }> = ({ summary }) => {
  return (
    <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 p-6 space-y-6 shadow-[0_25px_60px_rgba(249,115,22,0.12)]">
      <header className="space-y-2">
        <span className="px-3 py-1 inline-flex rounded-full border border-orange-200 text-[11px] uppercase  text-orange-500 bg-white">
          Conversions · SEO
        </span>
        <h3 className="text-3xl lg:text-[36px] font-semibold text-gray-900 leading-tight">Register SEO Conversions</h3>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="relative w-full max-w-xs h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.breakdown}
                dataKey="value"
                nameKey="label"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={4}
                stroke="#fff"
                strokeWidth={2}
              >
                {summary.breakdown.map((segment) => (
                  <Cell key={segment.label} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <p className="text-[11px] uppercase theme-muted"></p>
            <p className="text-4xl font-semibold theme-text">{summary.total.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 text-center lg:text-left">
          <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
            <div className="rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              {summary.delta}
            </div>
          </div>
          <p className="rounded-2xl bg-white/90 border border-orange-100 px-4 py-3 text-sm text-gray-600">
            Track how each segment contributes to the total goal. The highest values bubble to the top so you can focus instantly.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {summary.breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white/90 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-900">{item.value.toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChannelComparisonChart: React.FC<{ data: typeof mockTrendRevenueByChannel }> = ({ data }) => {
  const max = Math.max(...data.flatMap((d) => [d.revenue, d.cost]), 1);
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Revenue and costs by channel</p>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.channel}>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.channel}</span>
              <span>${item.revenue}K</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-3 rounded-full bg-pink-200">
                <div className="h-full rounded-full bg-pink-500" style={{ width: `${(item.revenue / max) * 100}%` }} />
              </div>
              <div className="h-3 rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-gray-500" style={{ width: `${(item.cost / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-500" />Revenue</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-500" />Cost</span>
      </div>
    </div>
  );
};

const SalesFunnelChart: React.FC<{ stages: typeof mockTrendSalesFunnel }> = ({ stages }) => {
  const max = Math.max(...stages.map((stage) => stage.value), 1);
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Sales Funnel</p>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{stage.stage}</span>
              <span>{stage.value.toLocaleString()}</span>
            </div>
            <div className="h-6 rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(stage.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RevenueTrendChart: React.FC<{ data: typeof mockTrendRevenueTrend }> = ({ data }) => {
  const max = Math.max(...data.map((point) => point.revenue), 1);
  const points = data
    .map((point, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - (point.revenue / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Revenue Trend</p>
      <div className="h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-purple-500">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
          <polyline fill="rgba(167,139,250,0.2)" stroke="none" points={`0,100 ${points} 100,100`} />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        {data.map((point) => (
          <span key={point.month}>{point.month}</span>
        ))}
      </div>
    </div>
  );
};

const YtdRevenueCard: React.FC<{ data: typeof mockTrendRevenueTrend }> = ({ data }) => {
  const total = data.reduce((sum, point) => sum + point.revenue, 0);
  const peak = data.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), data[0]);
  const low = data.reduce((prev, curr) => (curr.revenue < prev.revenue ? curr : prev), data[0]);
  const avg = Math.round(total / data.length);
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">YTD revenue</p>
      <p className="text-3xl font-semibold text-indigo-600">${(total / 1000).toFixed(0)}K</p>
      <p className="text-xs text-gray-500">+2.5% from last period</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Peak: ${peak.revenue.toLocaleString()} ({peak.month})</span>
          <span className="text-emerald-600 text-xs">+2.8%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Lowest: ${low.revenue.toLocaleString()} ({low.month})</span>
          <span className="text-red-500 text-xs">-3.7%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Average: ${avg.toLocaleString()}</span>
          <span className="text-emerald-600 text-xs">+2.3%</span>
        </div>
      </div>
    </div>
  );
};

const LeadSourceTable: React.FC<{ sources: typeof mockTrendLeadSources }> = ({ sources }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Where Leads Come From</p>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase  text-gray-500">
            <th className="py-2 pr-4">Source</th>
            <th className="py-2 pr-4">Leads</th>
            <th className="py-2 pr-4">Cost</th>
            <th className="py-2 pr-4">Revenue</th>
            <th className="py-2">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sources.map((row) => (
            <tr key={row.source} className="text-gray-800">
              <td className="py-3 pr-4 font-semibold">{row.source}</td>
              <td className="py-3 pr-4">{row.leads}</td>
              <td className="py-3 pr-4">${row.cost.toLocaleString()}</td>
              <td className="py-3 pr-4">${row.revenue.toLocaleString()}</td>
              <td className="py-3">{row.roi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SalesRepTable: React.FC<{ reps: typeof mockTrendSalesReps }> = ({ reps }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Who Closed The Deal</p>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase  text-gray-500">
            <th className="py-2 pr-4">Sales Rep</th>
            <th className="py-2 pr-4">Leads Assigned</th>
            <th className="py-2 pr-4">Conversion Rate</th>
            <th className="py-2">Revenue Closed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reps.map((rep) => (
            <tr key={rep.rep} className="text-gray-800">
              <td className="py-3 pr-4 font-semibold">{rep.rep}</td>
              <td className="py-3 pr-4">{rep.leadsAssigned}</td>
              <td className="py-3 pr-4">{rep.conversionRate}</td>
              <td className="py-3">{rep.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CrmStageChart: React.FC<{ stages: typeof mockCrmStages }> = ({ stages }) => {
  const max = Math.max(...stages.map((stage) => stage.value), 1);
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Pipeline status</p>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{stage.label}</span>
              <span>{stage.value.toFixed(1)}x</span>
            </div>
            <div className="h-6 rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${(stage.value / max) * 100}%`, backgroundColor: stage.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CrmAgeDonut: React.FC<{ ranges: typeof mockCrmAgeRange }> = ({ ranges }) => {
  const total = ranges.reduce((sum, range) => sum + range.customers, 0) || 1;
  let cumulative = 0;
  const gradients = ranges.map((range) => {
    const from = (cumulative / total) * 100;
    cumulative += range.customers;
    const to = (cumulative / total) * 100;
    return `${range.color} ${from}% ${to}%`;
  });

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Age Range</p>
      <div className="flex items-center gap-4">
        <div className="h-36 w-36 rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}>
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-18 w-18 rounded-full bg-white flex flex-col items-center justify-center">
              <p className="text-xl font-semibold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {ranges.map((range) => (
            <div key={range.label} className="grid grid-cols-4 gap-2 items-center">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full flex-shrink-0" style={{ backgroundColor: range.color }} />
                <span className="text-gray-700">{range.label}</span>
              </div>
              <span className="text-gray-500">{range.customers}</span>
              <span className="text-gray-500">{range.value}</span>
              <span className="font-semibold text-gray-900">{range.roi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeadTrackingTable: React.FC<{ leads: typeof mockCrmLeads }> = ({ leads }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">Lead Tracking</p>
        <p className="text-xs text-gray-500">7 leads</p>
      </div>
      <button className="px-3 py-1 rounded-full border border-gray-200 text-xs">Export</button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase  text-gray-500">
            <th className="py-2 pr-4">Lead</th>
            <th className="py-2 pr-4">Company</th>
            <th className="py-2 pr-4">Source</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Value</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={`${lead.lead}-${lead.company}`} className="text-gray-800">
              <td className="py-3 pr-4">
                <p className="font-semibold">{lead.lead}</p>
                <p className="text-xs text-gray-400">{lead.lead.toLowerCase().replace(' ', '.')}@example.com</p>
              </td>
              <td className="py-3 pr-4">{lead.company}</td>
              <td className="py-3 pr-4">{lead.source}</td>
              <td className="py-3 pr-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lead.status === 'Converted'
                      ? 'bg-emerald-50 text-emerald-600'
                      : lead.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-600'
                      : lead.status === 'Lost'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {lead.status}
                </span>
              </td>
              <td className="py-3 pr-4">{lead.value}</td>
              <td className="py-3">{lead.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CommerceFunnelChart: React.FC<{ steps: typeof mockCommerceConversionFunnel }> = ({ steps }) => {
  const max = steps[0]?.value || 1;
  const animated = useAnimatedReveal();
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Conversion Rate</p>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const width = ((steps.length - index) / steps.length) * 100;
          return (
            <div key={step.label} className="flex flex-col items-center gap-1">
              <div
                className="rounded-full h-8 transition-all duration-700 ease-out"
                style={{ width: animated ? `${width}%` : '0%', backgroundColor: step.color }}
              />
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="font-semibold text-gray-900">{step.label}</span>
                <span>{step.value}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {steps.map((step) => (
          <span key={step.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: step.color }} />
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SeoIssuesCard: React.FC<{ issues: typeof mockSeoIssues }> = ({ issues }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Platform health</p>
    <div className="space-y-3">
      {issues.map((issue) => (
        <div key={issue.label} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{issue.label}</p>
            <p className="text-xs text-gray-500">{issue.helper}</p>
          </div>
          <span className={`text-sm font-semibold ${issue.positive ? 'text-emerald-600' : 'text-orange-500'}`}>{issue.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode; badge?: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
  badge,
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="space-y-2 max-w-4xl">
      <h2 className="text-[24px] leading-snug md:text-[24px] font-semibold text-gray-900  break-words">{title}</h2>
      {subtitle && <p className="text-gray-500 !text-[16px] !leading-relaxed !mb-0 break-words">{subtitle}</p>}
    </div>
    {(badge || actions) && (
      <div className="flex items-center gap-2">
        {badge}
        {actions}
      </div>
    )}
  </div>
);

const ZeroState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="bg-gradient-to-br from-white to-orange-50 border border-dashed border-orange-200 rounded-3xl p-6 text-center">
    <p className="text-lg font-semibold text-gray-900">No data available</p>
    <p className="text-sm text-gray-500 mt-2">{message || 'Sample data only • connect your live API sources when ready'}</p>
  </div>
);

const AlertBadge: React.FC<{ label: string; severity?: 'info' | 'warning' | 'success' }> = ({ label, severity = 'info' }) => {
  const styles = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[severity]}`}>{label}</span>;
};

const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const severityClass = (severity: string) => {
    if (severity === 'warning') return 'bg-amber-50 border-amber-100 text-amber-800';
    if (severity === 'success') return 'bg-emerald-50 border-emerald-100 text-emerald-800';
    return 'bg-blue-50 border-blue-100 text-blue-800';
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="relative inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-300"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center">
          {mockNotifications.length}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl z-20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <button className="text-xs text-gray-500" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-auto scrollbar-hide">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-3 space-y-1 ${severityClass(notification.severity)}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{notification.title}</span>
                  <span>{notification.time}</span>
                </div>
                <p className="text-sm">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const useAnimatedReveal = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return ready;
};

const ProfitabilityChart: React.FC<{ data: typeof mockCommerceProfitability }> = ({ data }) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-base font-semibold text-gray-900">Profitability and Cost Analysis</p>
          <p className="text-sm text-gray-500">Budget vs cost vs revenue snapshot</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-600 font-semibold">
            Final Cash Balance
          </div>
          <div className="text-right">
            <p className="text-xs uppercase  text-gray-400">Growth</p>
            <p className="text-lg font-semibold text-emerald-600">+5.8% from last period</p>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#21c45d" />
            <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 12, fill: '#5fa5fa' }} />
            <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#fa7516' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <RechartsTooltip formatter={(value, name) => [`THB ${Number(value).toLocaleString('en-US')}`, name]} />
            <Bar dataKey="value" barSize={32} radius={[12, 12, 0, 0]}>
              {data.map((entry, index) => {
                const colors = ['#21c45d', '#5fa5fa', '#fa7516'];
                const color = colors[index % colors.length];
                return (
                  <Cell 
                    key={entry.label} 
                    fill={color}
                    fillOpacity={0.9}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {data.map((item, index) => {
          const colors = ['#21c45d', '#5fa5fa', '#fa7516'];
          const color = colors[index % colors.length];
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <div>
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">THB {item.value.toLocaleString('en-US')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RevenueOrdersTrendChart: React.FC<{ data: typeof mockCommerceRevenueTrend }> = ({ data }) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-900">Revenue & Orders Trend</p>
            <p className="text-sm text-gray-500">6-month revenue bars with order trend line</p>
          </div>
          <span className="text-[11px] uppercase  text-gray-400">Mock</span>
        </div>
        <div className="flex items-center justify-end gap-6 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            <span>Orders</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="lg:w-1/2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={[0, 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  tickFormatter={(value) => `${value}`}
                  domain={[0, 'auto']}
                />
                <RechartsTooltip
                  formatter={(value, name) => {
                    if (name === 'orders') return [Number(value).toLocaleString('en-US'), 'Orders'];
                    return [`THB ${Number(value).toLocaleString('en-US')}`, 'Revenue'];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#f97316"
                  barSize={28}
                  radius={[10, 10, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 space-y-4 flex flex-col justify-center">
          <div className="space-y-2">
            <p className="text-base font-semibold text-gray-900">Revenue & Orders Summary</p>
            <p className="text-sm text-gray-500">Key insights from 6-month performance</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                <span className="text-sm font-semibold text-gray-700">Revenue</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">THB 254K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Average Monthly</span>
                  <span className="text-sm font-semibold text-gray-900">THB 42.3K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Peak Month</span>
                  <span className="text-sm font-semibold text-gray-900">May (47K)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Growth Trend</span>
                  <span className="text-sm font-semibold text-emerald-600">+5.0%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-sm font-semibold text-gray-700">Orders</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Orders</span>
                  <span className="text-sm font-semibold text-gray-900">1,600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Average Monthly</span>
                  <span className="text-sm font-semibold text-gray-900">267</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Peak Month</span>
                  <span className="text-sm font-semibold text-gray-900">Mar (300)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Order Value</span>
                  <span className="text-sm font-semibold text-gray-900">THB 159</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Revenue per Order Trend</span>
              <span className="text-xs font-semibold text-orange-600">Improving</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Revenue shows steady growth while orders fluctuate, indicating increasing average order value and improved conversion efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonutChart: React.FC<{ segments: { name: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  let cumulative = 0;
  const animated = useAnimatedReveal();
  const gradients = segments.map((seg) => {
    const from = (cumulative / total) * 100;
    cumulative += seg.value;
    const to = (cumulative / total) * 100;
    return `${seg.color} ${from}% ${to}%`;
  });
  return (
    <div className="flex items-center justify-between gap-8">
      <div
        className="h-64 w-64 rounded-full transition-transform duration-700 ease-out flex-shrink-0 hover:scale-110 cursor-pointer"
        style={{
          background: `conic-gradient(${gradients.join(', ')})`,
          transform: animated ? 'scale(1)' : 'scale(0.85)',
          animation: animated ? 'continuousRotate 3s linear forwards' : 'none',
        }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div
            className="h-32 w-32 rounded-full flex flex-col items-center justify-center text-center border"
            style={{
              backgroundColor: 'var(--surface-muted, var(--theme-surface))',
              borderColor: 'var(--theme-border)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide theme-muted">Total</p>
            <p className="text-2xl font-semibold theme-text">{(total / 1000000).toFixed(1)}M</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 text-sm">
        {segments.map((seg) => (
          <div
            key={seg.name}
            className="rounded-2xl p-3 flex items-center justify-between transition-all duration-300 hover:translate-x-1 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--surface-muted, var(--theme-surface))',
              border: '1px solid var(--theme-border)',
              boxShadow: 'var(--theme-card-shadow)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="font-medium theme-text">{seg.name}</span>
            </div>
            <span className="font-semibold theme-text">THB {(seg.value / 1000000).toFixed(2)}M</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeoSparkline: React.FC<{ values: number[]; color?: string }> = ({ values, color = '#f97316' }) => {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

const SearchVisibilityCard: React.FC<{ snapshot: typeof mockSeoSnapshots }> = ({ snapshot }) => {
  const gaugeValue = snapshot.healthScore;
  return (
    <div className="rounded-3xl border border-gray-100 p-6 space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900">Search Visibility</p>
          <p className="text-sm text-gray-500">Live health and ranking signals</p>
        </div>
        <span className="text-xs text-gray-400">Updated 5 min ago</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="relative h-36 w-36">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#f97316 ${gaugeValue}%, #f3f4f6 ${gaugeValue}% 100%)`,
              }}
            />
            <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
              <p className="text-3xl font-semibold text-gray-900">{gaugeValue}%</p>
              <p className="text-xs uppercase  text-gray-500">Health</p>
            </div>
          </div>
          <div className="space-y-4 text-gray-900">
            <div>
              <p className="text-[11px] uppercase  text-gray-500">Avg. Position</p>
              <p className="text-3xl font-semibold">{snapshot.avgPosition}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase  text-gray-500">Organic Sessions</p>
              <p className="text-3xl font-semibold">{snapshot.organicSessions.toLocaleString('en-US')}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-dashed border-gray-200 pt-6 lg:pt-0 lg:pl-8">
          <p className="text-[11px] uppercase  text-gray-500">Sessions (7d)</p>
          <p className="text-base font-medium text-gray-900">Week-on-week trend</p>
          <SeoSparkline values={snapshot.sessionTrend} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-base">
        {snapshot.keywords.map((keyword) => (
          <div key={keyword.keyword} className="rounded-2xl border border-gray-100 p-4 space-y-1">
            <p className="text-sm text-gray-500 truncate">{keyword.keyword}</p>
            <p className="text-2xl font-semibold text-gray-900">#{keyword.position}</p>
            <p className="text-sm text-emerald-500">{keyword.change} • Vol. {keyword.volume.toLocaleString('en-US')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TechnicalScoreList: React.FC<{ scores: typeof mockSeoTechnicalScores }> = ({ scores }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Technical Readiness</p>
    <div className="space-y-3">
      {scores.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500">{item.helper}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{item.value}%</span>
            <div className="w-24 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SeoChannelMix: React.FC<{ channels: typeof mockSeoSnapshots.channels }> = ({ channels }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Organic Channel Mix</p>
    <div className="space-y-3 text-sm">
      {channels.map((channel) => (
        <div key={channel.label}>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{channel.label}</span>
            <span>{channel.value}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${channel.value}%`, backgroundColor: channel.color }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SeoKeywordsTable: React.FC<{ keywords: typeof mockSeoKeywordsDetailed }> = ({ keywords }) => (
  <div className="rounded-3xl border-2 border-[#0066ff]/20 bg-white p-5 shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">Top Organic Keywords (07)</p>
        <p className="text-xs text-gray-500">Most impactful search queries</p>
      </div>
      <button className="px-3 py-1 rounded-full border border-blue-100 text-xs font-medium text-blue-600">View All</button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase  text-gray-500">
            <th className="py-2 pr-4">Keywords</th>
            <th className="py-2 pr-4">Pos.</th>
            <th className="py-2 pr-4">Volume</th>
            <th className="py-2 pr-4">CPUT(THB)</th>
            <th className="py-2">Traffic %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {keywords.map((row, index) => (
            <tr key={`${row.keyword}-${index}`} className="text-gray-800">
              <td className="py-3 pr-4 font-semibold text-blue-600">{row.keyword}</td>
              <td className="py-3 pr-4">{row.pos}</td>
              <td className="py-3 pr-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs font-semibold">
                  {row.volume}
                </span>
              </td>
              <td className="py-3 pr-4">{row.cpu.toLocaleString('en-US')}</td>
              <td className="py-3">{row.traffic}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SeoCompetitorsCard: React.FC<{ competitors: typeof mockSeoCompetitors }> = ({ competitors }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-900">Top organic Competitors</p>
      <button className="px-3 py-1 rounded-full border border-gray-200 text-xs">View All</button>
    </div>
    <div className="space-y-3 text-sm">
      {competitors.map((competitor) => (
        <div key={competitor.name} className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{competitor.name}</p>
            <p className="text-xs text-gray-500">Com. Level {competitor.competition}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Com.keyWords {competitor.keywords}</span>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              {competitor.refDomains}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SeoBacklinkSummaryCard: React.FC = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Backlinks overview</p>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-xs text-gray-500">Backlinks</p>
        <p className="text-2xl font-semibold text-gray-900">{mockSeoBacklinkHighlights.totalBacklinks}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Referring Domains</p>
        <p className="text-2xl font-semibold text-gray-900">{mockSeoBacklinkHighlights.referringDomains}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Keywords</p>
        <p className="text-2xl font-semibold text-gray-900">{mockSeoBacklinkHighlights.keywords}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Traffic Cost</p>
        <p className="text-2xl font-semibold text-gray-900">{mockSeoBacklinkHighlights.trafficCost}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-xs uppercase  text-gray-500 mb-2">Anchors</p>
        <div className="space-y-2">
          {mockSeoAnchors.map((anchor) => (
            <div key={anchor.anchor} className="flex items-center justify-between">
              <span className="text-gray-700 truncate pr-2">{anchor.anchor}</span>
              <span className="font-semibold text-gray-900">{anchor.percent}%</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase  text-gray-500 mb-2">Referring domains</p>
        <div className="space-y-2">
          {mockSeoReferringDomains.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SeoRightRailCard: React.FC = () => (
  <div className="rounded-3xl border border-blue-100 bg-blue-50/30 p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Crawled metrics</p>
    <div className="space-y-2 text-sm">
      {mockSeoRightRailStats.map((stat) => (
        <div key={stat.label} className="flex items-center justify-between">
          <span>{stat.label}</span>
          <span className="font-semibold text-gray-900">{stat.value}</span>
        </div>
      ))}
    </div>
    <div>
      <p className="text-xs uppercase  text-gray-500 mb-2">URL Rating Distribution</p>
      <div className="space-y-2">
        {mockSeoUrlRatings.map((rating) => (
          <div key={rating.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: rating.label === '81-100' ? '#22c55e' : rating.label === '61-80' ? '#10b981' : rating.label === '41-60' ? '#facc15' : rating.label === '21-40' ? '#fb923c' : '#f87171' }} />
              <span>{rating.label}</span>
            </div>
            <span className="text-gray-700">{rating.value} • {rating.percent}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SeoRegionalPerformanceCard: React.FC = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Regional SEO Performance</p>
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 rounded-full" style={{ background: `conic-gradient(${mockSeoRegionalPerformance.map((r) => `${r.color} ${r.value}%`).join(', ')})` }}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-semibold text-gray-900">110</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {mockSeoRegionalPerformance.map((region) => (
          <div key={region.region} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.color }} />
            <span className="w-20 text-gray-600">{region.region}</span>
            <span className="font-semibold text-gray-900">{region.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SeoAuthorityCard: React.FC = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
    <p className="text-sm font-semibold text-gray-900">Authority metrics</p>
    <div className="grid grid-cols-2 gap-4">
      {mockSeoAuthorityScores.map((score) => (
        <div key={score.label} className="rounded-2xl border border-gray-100 p-3">
          <p className="text-xs uppercase  text-gray-500">{score.label}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold text-gray-900">{score.value}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-lime-500" style={{ width: `${score.value}%` }} />
            </div>
          </div>
          <p className="text-xs text-gray-500">{score.helper}</p>
        </div>
      ))}
    </div>
  </div>
);

const SeoOrganicSummaryCard: React.FC = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-3">
    <p className="text-sm font-semibold text-gray-900">Organic Search</p>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-xs text-gray-500">Keywords</p>
        <p className="text-xl font-semibold text-gray-900">{mockSeoOrganicSearch.keywords}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Traff. Cost</p>
        <p className="text-xl font-semibold text-gray-900">{mockSeoOrganicSearch.trafficCost}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Traffic</p>
        <p className="text-xl font-semibold text-gray-900">{mockSeoOrganicSearch.traffic}</p>
      </div>
    </div>
  </div>
);

const SeoPositionDistributionCard: React.FC<{ distribution: typeof mockSeoPositionDistribution }> = ({ distribution }) => {
  const max = Math.max(...distribution.map((item) => item.value), 1);
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">Organic Position Distribution</p>
      <div className="space-y-3">
        {distribution.map((item) => (
          <div key={item.range}>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.range}</span>
              <span>{item.value}%</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeoCompetitiveMapCard: React.FC<{ snapshot: typeof mockSeoCompetitiveMap }> = ({ snapshot }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-gray-900">Competitive Positioning Map</p>
        <p className="text-sm text-gray-500">Authority vs share of voice • mock SERP data</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>↑ Authority</span>
        <span className="px-2 py-1 rounded-full border border-gray-200">→ Momentum</span>
      </div>
    </div>
    <div className="relative h-64 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="absolute inset-6 border border-dashed border-gray-200 rounded-2xl">
        {snapshot.map((brand) => (
          <div
            key={brand.brand}
            className="absolute flex flex-col items-center"
            style={{
              left: `${brand.authority * 0.9}%`,
              bottom: `${brand.share * 0.8}%`,
            }}
          >
            <div
              className="rounded-full shadow-lg text-xs font-semibold text-white flex items-center justify-center"
              style={{
                width: `${Math.max(32, brand.share / 1.5)}px`,
                height: `${Math.max(32, brand.share / 1.5)}px`,
                background: `linear-gradient(135deg, ${hexToRgba(brand.color, 0.9)}, ${hexToRgba(brand.color, 0.6)})`,
              }}
            >
              {brand.brand}
            </div>
            <span className="mt-1 text-[11px] text-gray-500">{brand.share}% SoV</span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
      <span>Bubble size = share of voice</span>
      <span>Position = authority & momentum</span>
    </div>
  </div>
);

type CampaignSource = typeof mockCampaignSourceInsights[number];

const AgeRangeDonut: React.FC<{ ranges: CampaignSource['ageRange'] }> = ({ ranges }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  if (!ranges.length) {
    return <p className="text-sm text-gray-500">No age-range data available.</p>;
  }
  const topRange = ranges.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), ranges[0]);
  const topPercent = topRange?.value || 0;

  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative w-full max-w-[520px] min-w-[260px]">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ranges}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={2}
              activeIndex={activeIndex}
              activeShape={(props) => (
                <Sector
                  {...props}
                  outerRadius={(Number(props.outerRadius) || 0) + 6}
                />
              )}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {ranges.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number, _name: string, payload) => {
                const percent = typeof value === 'number' ? value.toFixed(1) + '%' : value;
                return [percent, (payload?.payload as any)?.name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          style={{ opacity: activeIndex === -1 ? 1 : 0, transition: 'opacity 150ms ease-out' }}
        >
          <p className="text-xs uppercase  text-gray-400">Top</p>
          <p className="text-4xl font-semibold text-gray-900 leading-tight">{topPercent.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

const ConversionRateBars: React.FC<{ data: CampaignSource['conversionRate'] }> = ({ data }) => {
  const [activeLabel, setActiveLabel] = useState(data[0]?.label || '');
  const activeMetric = useMemo(() => data.find((item) => item.label === activeLabel) || data[0], [data, activeLabel]);
  const best = useMemo(() => data.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), data[0]), [data]);
  const lowest = useMemo(() => data.reduce((prev, curr) => (curr.value < prev.value ? curr : prev), data[0]), [data]);

  if (!data.length) {
    return <p className="text-sm text-gray-500">No conversion data available.</p>;
  }

  return (
    <div className="flex flex-col justify-between space-y-5">
      <div className="flex flex-wrap gap-2">
        {data.map((item) => {
          const isActive = item.label === activeMetric?.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveLabel(item.label)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className={`${themePanelClass} space-y-5 shadow-inner`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase theme-muted">Active Channel</p>
            <p className="text-lg font-semibold theme-text">{activeMetric?.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase theme-muted">Conversion Rate</p>
            <p className="text-4xl font-semibold theme-text">{activeMetric?.value}%</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="theme-panel-soft rounded-2xl p-4 border border-orange-200/70">
            <p className="text-xs uppercase text-orange-500">Insight</p>
            <p className="text-sm theme-muted mt-1">
              {activeMetric?.label} converts {((activeMetric!.value / best.value - 1) * 100).toFixed(1)}% {activeMetric?.value === best.value ? 'higher than average' : 'vs best channel'} driven by optimized targeting.
            </p>
          </div>
          <div className="theme-panel-soft rounded-2xl p-4 border border-gray-100/60 benchmark-card">
            <p className="text-xs uppercase theme-muted">Benchmark</p>
            <p className="text-sm theme-muted mt-1">
              Top: {best.label} ({best.value}%). Lowest: {lowest.label} ({lowest.value}%). Keep {activeMetric?.label.toLowerCase()} above {best.value - 2}% to stay competitive.
            </p>
          </div>
          <div className="theme-panel-soft rounded-2xl p-4 border border-emerald-200/70">
            <p className="text-xs uppercase text-emerald-400">Action</p>
            <p className="text-sm theme-muted mt-1">Double down on creatives performing in {activeMetric?.label}. Test new offer variants to close the gap with {best.label}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenderDistributionChart: React.FC<{ data: CampaignSource['genderDistribution'] }> = ({ data }) => {
  const chartData = data.map((segment) => ({
    segment: segment.segment,
    Male: segment.male,
    Female: segment.female,
    Unknown: segment.unknown,
  }));

  const colors = {
    Male: '#3b82f6',
    Female: '#ec4899',
    Unknown: '#94a3b8',
  };

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={530}>
        <BarChart data={chartData} margin={{ top: 60, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
          <XAxis dataKey="segment" tickLine={false} tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-8} height={30} />
          <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
          <RechartsTooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
          <Legend wrapperStyle={{ fontSize: 14, paddingTop: '8px' }} payload={[
            { value: 'Male', type: 'square', color: '#3b82f6' },
            { value: 'Female', type: 'square', color: '#ec4899' },
            { value: 'Unknown', type: 'square', color: '#94a3b8' },
          ]} />
          {(['Male', 'Female', 'Unknown'] as const).map((key) => (
            <Bar key={key} dataKey={key} fill={colors[key]} radius={[6, 6, 0, 0]} barSize={36} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CampaignSourceTabs: React.FC<{
  sources: CampaignSource[];
  themeMode: 'light' | 'dark' | 'canvas';
  onDownload?: (section: string) => void;
  visualizationRef?: React.RefObject<HTMLDivElement>;
}> = ({ sources, themeMode, onDownload, visualizationRef }) => {
  const [activeSourceId, setActiveSourceId] = useState(sources[0]?.id || '');
  const [chartTheme, setChartTheme] = useState<'sunset' | 'carbon'>('sunset');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [campaignQuery, setCampaignQuery] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const detailedAdPerformanceScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollDetailedLeft, setCanScrollDetailedLeft] = useState(false);
  const [canScrollDetailedRight, setCanScrollDetailedRight] = useState(false);

  const activeSource = useMemo(() => {
    if (!sources.length) return null;
    return sources.find((source) => source.id === activeSourceId) || sources[0];
  }, [sources, activeSourceId]);

  const hasSelectedCampaigns = selectedCampaignIds.length > 0;

  useEffect(() => {
    setSelectedCampaignIds([]);
    setCampaignQuery('');
    setCampaignStatusFilter('all');
    setShowSelectedOnly(false);
  }, [activeSourceId]);

  const toggleCampaignSelection = useCallback((campaignId: string) => {
    setSelectedCampaignIds((prev) => {
      if (prev.includes(campaignId)) {
        return prev.filter((id) => id !== campaignId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, campaignId];
    });
  }, []);

  const updateDetailedAdPerformanceScrollState = useCallback(() => {
    const el = detailedAdPerformanceScrollRef.current;
    if (!el) return;
    const maxLeft = el.scrollWidth - el.clientWidth;
    setCanScrollDetailedLeft(el.scrollLeft > 0);
    setCanScrollDetailedRight(el.scrollLeft < maxLeft - 1);
  }, []);

  useEffect(() => {
    updateDetailedAdPerformanceScrollState();
    window.addEventListener('resize', updateDetailedAdPerformanceScrollState);
    return () => window.removeEventListener('resize', updateDetailedAdPerformanceScrollState);
  }, [activeSourceId, updateDetailedAdPerformanceScrollState]);

  const scrollDetailedAdPerformance = useCallback((direction: 'left' | 'right') => {
    const el = detailedAdPerformanceScrollRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const palette = useMemo(() => {
    const accent = activeSource?.accent || '#f97316';
    return chartTheme === 'sunset'
      ? {
          primary: accent,
          secondary: '#fef08a',
          tertiary: '#fb923c',
          card: 'from-white to-orange-50/40',
          border: 'border-orange-100',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          legend: '#0f172a',
          area: 'rgba(249, 115, 22, 0.18)',
        }
      : {
          primary: '#0f172a',
          secondary: '#475569',
          tertiary: '#f97316',
          card: 'from-gray-900 via-gray-800 to-gray-900',
          border: 'border-gray-800',
          text: 'text-white',
          subtext: 'text-gray-300',
          legend: '#e5e7eb',
          area: 'rgba(15, 23, 42, 0.35)',
        };
  }, [activeSource, chartTheme]);

  const selectedCampaigns = useMemo(() => {
    if (!activeSource) return [];
    return activeSource.campaigns.filter((campaign) => selectedCampaignIds.includes(campaign.id));
  }, [activeSource, selectedCampaignIds]);

  const filteredCampaigns = useMemo(() => {
    if (!activeSource) return [];

    const query = campaignQuery.trim().toLowerCase();
    return activeSource.campaigns.filter((campaign) => {
      const matchesQuery = !query || campaign.name.toLowerCase().includes(query);
      const matchesStatus =
        campaignStatusFilter === 'all' || campaign.status.toLowerCase() === campaignStatusFilter;
      const matchesSelected = !showSelectedOnly || selectedCampaignIds.includes(campaign.id);
      return matchesQuery && matchesStatus && matchesSelected;
    });
  }, [activeSource, campaignQuery, campaignStatusFilter, showSelectedOnly, selectedCampaignIds]);

  const budgetVsSpendData = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return [];
    return selectedCampaigns.map((campaign) => ({
      name: campaign.name,
      budget: campaign.budget,
      spent: campaign.spent,
      roi: campaign.roi,
    }));
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const efficiencyData = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return [];
    const selectedNames = new Set(selectedCampaigns.map((campaign) => campaign.name));
    return activeSource.adPerformance
      .filter((item) => selectedNames.has(item.campaign))
      .map((item) => ({
        campaign: item.campaign,
        spend: item.spend,
        impressions: item.impressions,
        clicks: item.clicks,
        ctr: item.ctr,
        cpc: item.cpc,
        cpm: item.cpm,
      }));
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const filteredConversionRate = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return [];
    const selectedNames = new Set(selectedCampaigns.map((campaign) => campaign.name));
    return activeSource.conversionRate.filter((item) => selectedNames.has(item.label));
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const campaignAgeHighlights = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return [];
    const ageBuckets = ['18-24', '25-34', '35-44', '45-54'];

    return selectedCampaigns.map((campaign) => {
      const seed = Array.from(campaign.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const raw = ageBuckets.map((_, idx) => ((seed + idx * 7) % 9) + 3);
      const rawTotal = raw.reduce((sum, v) => sum + v, 0) || 1;
      const distPct = raw.map((v) => (v / rawTotal) * 100);

      let bestIndex = 0;
      for (let i = 1; i < distPct.length; i += 1) {
        if (distPct[i] > distPct[bestIndex]) bestIndex = i;
      }

      const topPercent = distPct[bestIndex];

      return {
        id: campaign.id,
        name: campaign.name,
        topBucket: ageBuckets[bestIndex],
        topPercent,
        distribution: distPct,
      };
    });
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const filteredAgeRange = useMemo(() => {
    if (!campaignAgeHighlights.length) return [];

    const baseColors = [palette.primary, palette.secondary, palette.tertiary, '#facc15', '#22c55e'];

    return campaignAgeHighlights.map((item, idx) => ({
      name: item.name,
      value: item.topPercent,
      color: baseColors[idx % baseColors.length] || palette.primary,
    }));
  }, [campaignAgeHighlights, palette]);

  const filteredGenderDistribution = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return [];
    return selectedCampaigns.map((campaign) => {
      const seed = Array.from(campaign.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const base = Math.max(60, Math.min(180, Math.round(campaign.conversions / 2)));
      const male = Math.round(base * (0.38 + ((seed % 17) / 100)));
      const female = Math.round(base * (0.52 + (((seed + 5) % 19) / 120)));
      const unknown = Math.max(6, Math.round(base * (0.06 + (((seed + 11) % 7) / 100))));

      const label = campaign.name.length > 18 ? `${campaign.name.slice(0, 18)}…` : campaign.name;

      return {
        segment: label,
        male,
        female,
        unknown,
      };
    });
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const topCampaignByRoi = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns || !selectedCampaigns.length) return null;
    return selectedCampaigns.reduce((best, current) => (current.roi > best.roi ? current : best), selectedCampaigns[0]);
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const totalCampaignSpend = useMemo(() => {
    if (!activeSource || !hasSelectedCampaigns) return 0;
    return selectedCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  }, [activeSource, hasSelectedCampaigns, selectedCampaigns]);

  const exportToCsv = useCallback((filename: string, rows: (string | number)[][]) => {
    if (!rows.length) return;
    const escape = (value: string | number) => {
      const str = String(value ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };
    const csvContent = rows.map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleCampaignAnalyticsDownload = useCallback(() => {
    if (!activeSource) return;
    const rows: (string | number)[][] = [];

    if (activeSource.summary?.length) {
      rows.push(['Real-Time Analytics']);
      rows.push(['Metric', 'Value', 'Delta', 'Trend']);
      activeSource.summary.forEach((stat) => {
        rows.push([
          stat.label,
          stat.value,
          stat.delta ?? '',
          stat.positive ? 'Positive' : 'Negative',
        ]);
      });
    }

    if (activeSource.adPerformance?.length) {
      if (rows.length) {
        rows.push(['']);
      }
      rows.push(['Detailed Ad Performance']);
      rows.push(['Campaign', 'Spend', 'Impressions', 'Clicks', 'CTR', 'CPC', 'CPM']);
      activeSource.adPerformance.forEach((campaign) => {
        rows.push([
          campaign.campaign,
          campaign.spend,
          campaign.impressions,
          campaign.clicks,
          campaign.ctr,
          campaign.cpc,
          campaign.cpm,
        ]);
      });
    }

    if (!rows.length) return;
    exportToCsv('campaign-performance-analytics.csv', rows);
  }, [activeSource, exportToCsv]);

  const handleDetailedAdPerformanceDownload = useCallback(() => {
    if (!activeSource?.adPerformance?.length) return;
    const rows: (string | number)[][] = [];
    rows.push(['Detailed Ad Performance']);
    rows.push(['Campaign', 'Spend', 'Impressions', 'Clicks', 'CTR', 'CPC', 'CPM']);
    activeSource.adPerformance.forEach((campaign) => {
      rows.push([
        campaign.campaign,
        campaign.spend,
        campaign.impressions,
        campaign.clicks,
        campaign.ctr,
        campaign.cpc,
        campaign.cpm,
      ]);
    });
    exportToCsv('detailed-ad-performance.csv', rows);
  }, [activeSource, exportToCsv]);

  const statusClasses = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'active') return 'bg-emerald-100 text-emerald-700';
    if (normalized === 'paused') return 'bg-gray-200 text-gray-700';
    if (normalized === 'ended') return 'bg-rose-100 text-rose-700';
    if (normalized === 'learning') return 'bg-gray-200 text-gray-700';
    return 'bg-gray-100 text-gray-600';
  };

  if (!activeSource) {
    return <ZeroState message="No sample campaign is available for this platform yet" />;
  }

  const currentSourceId = activeSource.id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sources.map((source) => {
          const isActive = source.id === currentSourceId;
          const activeStyle = isActive
            ? {
                background: accentGradient(source.accent, 0.25, 0.85),
                borderColor: 'transparent',
                color: '#fff',
                boxShadow: `0 18px 35px ${hexToRgba(source.accent, 0.35)}`,
              }
            : undefined;
          return (
            <button
              key={source.id}
              onClick={() => setActiveSourceId(source.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition ${
                isActive
                  ? 'text-white'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400 shadow-sm'
              }`}
              style={activeStyle}
            >
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                  isActive ? 'bg-white/20 backdrop-blur border border-white/30' : 'bg-white'
                }`}
              >
                <img src={source.logo} alt={source.label} className="h-7 w-7 object-contain" />
              </div>
              <div className="text-left">
                <p className={`text-[15px] uppercase  ${isActive ? 'text-white/80' : 'theme-muted'}`}>Ads</p>
                <p className={`text-base font-semibold ${isActive ? '' : 'theme-muted'}`}>{source.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[20px] font-bold text-gray-900">Real-Time Analytics</p>
            <p className="text-base text-gray-500">Updated on mock data • swap with live API anytime</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleCampaignAnalyticsDownload}
            title="Download analytics & ad performance data"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {activeSource.summary.map((stat) => (
            <RealTimeCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} positive={stat.positive} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="rounded-2xl p-4 border shadow-sm"
            style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'var(--theme-border)', boxShadow: 'var(--theme-card-shadow)' }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold theme-text">Filter campaigns</p>
                <button
                  type="button"
                  className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors theme-text"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'transparent' }}
                  onClick={() => {
                    setCampaignQuery('');
                    setCampaignStatusFilter('all');
                    setShowSelectedOnly(false);
                    setSelectedCampaignIds([]);
                  }}
                >
                  Clear
                </button>
              </div>

              <p className="text-sm theme-muted">
                Showing <span className="font-semibold theme-text">{filteredCampaigns.length}</span> campaign{filteredCampaigns.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center">
              <input
                value={campaignQuery}
                onChange={(e) => setCampaignQuery(e.target.value)}
                placeholder="Search campaigns"
                className="w-full rounded-xl border px-3 py-2 text-sm theme-text placeholder:text-gray-400 shadow-sm focus:outline-none"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--theme-border)' }}
              />
              <select
                value={campaignStatusFilter}
                onChange={(e) => setCampaignStatusFilter(e.target.value as typeof campaignStatusFilter)}
                className="w-full rounded-xl border px-3 py-2 text-sm theme-text shadow-sm focus:outline-none"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--theme-border)' }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
              <label
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm select-none theme-text"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--theme-border)' }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-300"
                  checked={showSelectedOnly}
                  onChange={(e) => setShowSelectedOnly(e.target.checked)}
                />
                Selected only
              </label>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
          <table className="min-w-full text-base">
            <thead>
              <tr className="text-left text-[15px] uppercase  text-gray-500">
                <th className="py-3 pr-6">Campaign</th>
                <th className="py-3 pr-6">Date</th>
                <th className="py-3 pr-6">Status</th>
                <th className="py-3 pr-6">Budget</th>
                <th className="py-3 pr-6">Spent</th>
                <th className="py-3 pr-6">Conversions</th>
                <th className="py-3 pr-6">ROI</th>
                <th className="py-3">Show</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.map((campaign) => {
                const isSelected = selectedCampaignIds.includes(campaign.id);
                const isDark = themeMode === 'dark';
                return (
                <tr key={campaign.id} className="text-gray-800">
                  <td className="py-4 pr-6 font-semibold text-gray-900">{campaign.name}</td>
                  <td className="py-4 pr-6 text-gray-500">{campaign.date}</td>
                  <td className="py-4 pr-6">
                    <span className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize ${statusClasses(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6">THB {campaign.budget.toLocaleString('en-US')}</td>
                  <td className="py-4 pr-6">THB {campaign.spent.toLocaleString('en-US')}</td>
                  <td className="py-4 pr-6">{campaign.conversions.toLocaleString('en-US')}</td>
                  <td className="py-4 pr-6">{campaign.roi}%</td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => toggleCampaignSelection(campaign.id)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full border transition-colors"
                      style={{
                        backgroundColor: isSelected ? '#f97316' : isDark ? '#020617' : '#e5e7eb',
                        borderColor: isSelected ? '#fb923c' : isDark ? '#64748b' : '#d1d5db',
                        boxShadow: isSelected
                          ? isDark
                            ? '0 0 10px rgba(249,115,22,0.7)'
                            : '0 0 8px rgba(249,115,22,0.45)'
                          : 'none',
                      }}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform ${
                          isSelected ? 'translate-x-5' : 'translate-x-1'
                        }`}
                        style={{
                          backgroundColor: '#ffffff',
                          boxShadow: isSelected
                            ? '0 2px 4px rgba(0,0,0,0.35)'
                            : '0 1px 3px rgba(0,0,0,0.25)',
                        }}
                      />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {!hasSelectedCampaigns ? (
        <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
          Please select one or more campaigns from the table above (up to 5) to view Campaign Performance.
        </div>
      ) : (
        <>
          <div ref={visualizationRef} className={themePanelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold theme-text" style={{ fontSize: '24px' }}>Visualization Controls</p>
                <p className="theme-muted" style={{ fontSize: '18px' }}>Add more context with themed charts and mock trends</p>
              </div>
              {onDownload && (
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => onDownload('Visualization Controls')}
                  title="Download visualization data"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className={`${themePanelClass} space-y-4 shadow-inner`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${palette.text}`}>Budget vs Spend</p>
                    <p className={`text-xs ${palette.subtext}`}>Includes ROI overlay for the latest campaigns</p>
                  </div>
                  <span className={`text-[15px] uppercase ${palette.subtext}`}>Mock</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetVsSpendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={chartTheme === 'carbon' ? 'rgba(148,163,184,0.45)' : 'rgba(249,115,22,0.18)'}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: chartTheme === 'carbon' ? palette.legend : '#475569' }}
                        tickLine={false}
                        interval={0}
                        angle={-8}
                        height={60}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: chartTheme === 'carbon' ? palette.legend : '#475569' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: chartTheme === 'carbon' ? palette.legend : '#475569' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip
                        cursor={{ fill: chartTheme === 'carbon' ? palette.area : 'rgba(249,115,22,0.10)' }}
                        formatter={(value, name: string) => {
                          if (name === 'roi') return [`${value}%`, 'ROI'];
                          return [`THB ${Number(value).toLocaleString('en-US')}`, name === 'budget' ? 'Budget' : 'Spend'];
                        }}
                      />
                      <Legend wrapperStyle={{ color: palette.legend }} />
                      <Bar yAxisId="left" dataKey="budget" fill={palette.secondary} radius={[12, 12, 0, 0]} maxBarSize={42} name="Budget" />
                      <Bar yAxisId="left" dataKey="spent" fill={palette.primary} radius={[12, 12, 0, 0]} maxBarSize={42} name="Spend" />
                      <Line yAxisId="right" type="monotone" dataKey="roi" stroke={palette.tertiary} strokeWidth={3} dot={{ r: 4 }} name="ROI" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${themePanelClass} flex flex-col justify-between space-y-4`}>
                <div className="space-y-1">
                  <p className="text-xs uppercase theme-muted">Campaign Snapshot</p>
                  <p className="text-sm font-semibold theme-text">{activeSource.label}</p>
                  <p className="text-xs theme-muted">Quick view of spend and best-performing campaign</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="theme-panel-soft rounded-2xl p-3 shadow-sm border border-gray-100/60">
                    <p className="text-xs uppercase theme-muted">Total Spend</p>
                    <p className="mt-1 text-lg font-semibold theme-text">THB {totalCampaignSpend.toLocaleString('en-US')}</p>
                  </div>
                  <div className="theme-panel-soft rounded-2xl p-3 shadow-sm border border-emerald-200/70">
                    <p className="text-xs uppercase" style={{ color: '#6ee7b7' }}>Top ROI</p>
                    <p className="mt-1 text-lg font-semibold theme-text">{topCampaignByRoi?.roi ?? '-'}%</p>
                    <p className="text-xs theme-muted truncate">{topCampaignByRoi?.name || 'N/A'}</p>
                  </div>
                  <div className="theme-panel-soft rounded-2xl p-3 shadow-sm border border-gray-100/60">
                    <p className="text-xs uppercase theme-muted">Best Campaign</p>
                    <p className="mt-1 text-sm font-semibold theme-text truncate">{topCampaignByRoi?.name || 'No data'}</p>
                    <p className="text-xs theme-muted">ROI {(topCampaignByRoi?.roi ?? '-')}%</p>
                  </div>
                  <div className="theme-panel-soft rounded-2xl p-3 shadow-sm border border-gray-100/60">
                    <p className="text-xs uppercase theme-muted">Active Campaigns</p>
                    <p className="mt-1 text-lg font-semibold theme-text">{activeSource.adPerformance.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-4 xl:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[24px] font-semibold text-gray-900">Age Range</p>
                  <p className="text-[18px] text-gray-500">Audience balance by campaign segments</p>
                </div>
                {onDownload && (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => onDownload('Age Range')}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
                <div className="w-full lg:w-[42%] min-w-[260px]">
                  <AgeRangeDonut ranges={filteredAgeRange} />
                </div>
                <div className="w-full lg:flex-1 overflow-x-auto">
                  <table className="min-w-full text-xs border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase theme-muted border-b" style={{ borderColor: 'var(--theme-border)' }}>
                        <th className="py-2 pr-3 text-left font-semibold">Campaign</th>
                        <th className="py-2 px-2 text-right font-semibold">18-24</th>
                        <th className="py-2 px-2 text-right font-semibold">25-34</th>
                        <th className="py-2 px-2 text-right font-semibold">35-44</th>
                        <th className="py-2 px-2 text-right font-semibold">45-54</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignAgeHighlights.map((item) => (
                        <tr key={item.id} className="border-b last:border-0" style={{ borderColor: 'var(--theme-border)' }}>
                          <td className="py-2 pr-3 align-middle">
                            <p className="text-[11px] font-semibold theme-text truncate max-w-[180px]">{item.name}</p>
                            <p className="text-[10px] theme-muted">Top: {item.topBucket} · {item.topPercent.toFixed(1)}%</p>
                          </td>
                          {item.distribution.map((pct, idx) => (
                            <td key={idx} className="py-2 px-2 text-right align-middle text-[11px] theme-muted">
                              {pct.toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-4 h-full xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[24px] font-semibold text-gray-900">Detailed Ad Performance</p>
                  <p className="text-[18px] text-gray-500">Campaign-level spend and engagement</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleDetailedAdPerformanceDownload}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              <div className="relative flex-1">
                <div
                  ref={detailedAdPerformanceScrollRef}
                  onScroll={updateDetailedAdPerformanceScrollState}
                  className="overflow-x-auto scroll-smooth scrollbar-hidden rounded-2xl border border-gray-100/60"
                >
                  <table className="min-w-max w-full text-sm table-auto">
                    <thead>
                      <tr
                        className="text-left text-[11px] uppercase tracking-wider font-semibold border-b break-normal"
                        style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--theme-muted)', borderColor: 'var(--theme-border)' }}
                      >
                        <th className="py-3 pr-6 whitespace-nowrap break-normal w-[34%]">Campaign</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[11%]">Spend</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[13%]">Impressions</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[11%]">Clicks</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[8%]">CTR</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[11%]">CPC</th>
                        <th className="py-3 pr-6 whitespace-nowrap break-normal text-right w-[12%]">CPM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/70">
                      {efficiencyData.map((campaign) => (
                        <tr
                          key={campaign.campaign}
                          className="group text-gray-600 hover:bg-orange-500 hover:text-white hover:shadow-sm transition-colors duration-150 cursor-pointer"
                        >
                          <td className="py-4 pr-6 font-semibold text-gray-900 group-hover:text-white">{campaign.campaign}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.spend}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.impressions}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.clicks}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.ctr}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.cpc}</td>
                          <td className="py-4 pr-6 text-right tabular-nums font-semibold group-hover:text-white">{campaign.cpm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(canScrollDetailedLeft || canScrollDetailedRight) && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <button
                        type="button"
                        className={`pointer-events-auto h-9 w-9 rounded-full border text-sm font-bold shadow-sm transition-colors ${
                          canScrollDetailedLeft
                            ? 'bg-white/90 hover:bg-white border-gray-200 text-gray-800'
                            : 'bg-white/60 border-gray-100 text-gray-300'
                        }`}
                        onClick={() => scrollDetailedAdPerformance('left')}
                        disabled={!canScrollDetailedLeft}
                        aria-label="Scroll left"
                      >
                        {'<'}
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <button
                        type="button"
                        className={`pointer-events-auto h-9 w-9 rounded-full border text-sm font-bold shadow-sm transition-colors ${
                          canScrollDetailedRight
                            ? 'bg-white/90 hover:bg-white border-gray-200 text-gray-800'
                            : 'bg-white/60 border-gray-100 text-gray-300'
                        }`}
                        onClick={() => scrollDetailedAdPerformance('right')}
                        disabled={!canScrollDetailedRight}
                        aria-label="Scroll right"
                      >
                        {'>'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center pt-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[24px] font-semibold text-gray-900">Gender Distribution</p>
                  <p className="text-[18px] text-gray-500">Audience balance by campaign segments</p>
                </div>
                {onDownload && (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => onDownload('Gender Distribution')}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>
              <GenderDistributionChart data={filteredGenderDistribution} />
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[24px] font-semibold text-gray-900">Conversion Rate</p>
                  <p className="text-[18px] text-gray-500">Channel-by-channel AI insights</p>
                </div>
                {onDownload && (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => onDownload('Conversion Rate')}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>
              <ConversionRateBars data={filteredConversionRate} />
            </div>
          </div>

          {activeSource.id !== 'google' && activeSource.id !== 'line' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Detailed from {activeSource.label}</p>
                <p className="text-xs text-gray-500">Creative previews</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeSource.creatives.map((creative, index) => (
                  <div key={creative.id} className="rounded-3xl border border-gray-100 bg-white p-4 space-y-4 shadow-sm">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden relative group cursor-pointer"
                      style={{
                        background: index % 3 === 0
                          ? 'linear-gradient(135deg, #0f172a, #1d4ed8)'
                          : index % 3 === 1
                          ? 'linear-gradient(135deg, #4c1d95, #db2777)'
                          : 'linear-gradient(135deg, #0f766e, #22d3ee)',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="h-16 w-16 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform text-2xl">
                          ▶
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-white/95">
                        <span className="px-3 py-2 rounded-full bg-black/40 backdrop-blur font-medium">AI Auto-Edit</span>
                        <span className="px-3 py-2 rounded-full bg-white/30 font-medium">30s Vertical</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">LIVE</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        {creative.name}
                      </p>
                      <p className="text-xs text-gray-500">AI video · {creative.type}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <p className="text-[15px] uppercase text-gray-500 font-medium">Reach</p>
                        <p className="font-bold text-gray-900">{creative.reach.toLocaleString('en-US')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] uppercase text-gray-500 font-medium">Reactions</p>
                        <p className="font-bold text-gray-900">{creative.reactions.toLocaleString('en-US')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{creative.cta} CTA</span>
                      <button className="inline-flex items-center gap-1 text-gray-900 font-semibold">
                        <span>Generate variants</span>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const LtvComparisonChart: React.FC<{ data: { label: string; ltv: number; cac: number }[] }> = ({ data }) => {
  const max = Math.max(...data.flatMap((d) => [d.ltv, d.cac])) || 1;
  const animated = useAnimatedReveal();

  return (
    <div className="relative h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 24, left: 8, bottom: 20 }}
          barCategoryGap="12%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 1000]} />
          <RechartsTooltip
            cursor={{ fill: 'rgba(249,115,22,0.06)' }}
            formatter={(value: any, name: string) => [
              `THB ${Number(value).toLocaleString('en-US')}`,
              name.toUpperCase(),
            ]}
          />
          <Legend formatter={(value) => value.toUpperCase()} />
          <Bar
            dataKey="ltv"
            name="LTV"
            fill="#eb5a0c"
            radius={[16, 16, 0, 0]}
            barSize={40}
            isAnimationActive={animated}
          />
          <Bar
            dataKey="cac"
            name="CAC"
            fill="#fcd44e"
            radius={[16, 16, 0, 0]}
            barSize={32}
            isAnimationActive={animated}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 

const CONVERSION_PLATFORM_PROVIDERS: Record<string, string> = {
  Facebook: 'facebook',
  Google: 'googleads',
  'Google Analytics': 'googleanalytics',
  LINE: 'line',
  TikTok: 'tiktok',
};

const ConversionPlatformBars: React.FC<{
  data: { platform: string; value: number }[];
  connectionStatus?: Record<string, 'connected' | 'disconnected'>;
}> = ({ data, connectionStatus }) => {
  const animated = useAnimatedReveal();

  const colors = ['#4267B2', '#FBBC05', '#F97316', '#00C300', '#EE1D52'];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const best = data.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), data[0]);
  const ranked = data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between text-[16px] theme-muted gap-2">
        <p className="space-x-1">
          <span className="font-semibold theme-text text-[16px]">Total conversions:</span>
          <span className="text-[16px] theme-text">{total.toLocaleString('en-US')}</span>
        </p>
        <p className="space-x-1">
          <span className="font-semibold theme-text text-[16px]">Top platform:</span>
          <span className="text-[16px] theme-text">
            {best.platform} ({best.value.toLocaleString('en-US')} conversions)
          </span>
        </p>
      </div>
      <div className="mt-2 space-y-3">
        {ranked.map((item, index) => {
          const share = total ? (item.value / total) * 100 : 0;
          const color = colors[index] ?? colors[colors.length - 1];
          const isTop = item.platform === best.platform;
          const provider = CONVERSION_PLATFORM_PROVIDERS[item.platform];
          const isConnected = provider ? connectionStatus?.[provider] === 'connected' : false;
          const iconBg = isConnected ? color : `${color}30`;
          const fillColor = isConnected ? color : `${color}55`;
          const iconFilter = isConnected ? 'drop-shadow(0 6px 14px rgba(15, 23, 42, 0.15))' : 'grayscale(0.2)';

          return (
            <div
              key={item.platform}
              className={`flex items-center justify-between rounded-3xl border px-6 py-7 text-xs sm:text-sm shadow-sm transition-colors ${
                animated ? 'transition-all duration-500 ease-out' : ''
              } ${isConnected ? 'theme-panel-soft' : 'theme-panel-soft border-dashed opacity-90'}`}
              style={{
                transform: animated ? 'translateY(0)' : 'translateY(4px)',
                opacity: animated ? 1 : 0,
                transitionDelay: animated ? `${index * 70}ms` : undefined,
              }}
            >
              <div className="flex gap-3 min-w-[140px] items-center">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 overflow-hidden border border-white/50"
                  style={{ backgroundColor: iconBg, filter: iconFilter, opacity: isConnected ? 1 : 0.7 }}
                >
                  {item.platform === 'Facebook' && <img src="https://cdn.simpleicons.org/facebook/FFFFFF" className="h-6 w-6" alt="Facebook" />}
                  {item.platform === 'Google' && <img src="https://cdn.simpleicons.org/googleads/FFFFFF" className="h-6 w-6" alt="Google" />}
                  {item.platform === 'Google Analytics' && <img src="https://cdn.simpleicons.org/googleanalytics/FFFFFF" className="h-6 w-6" alt="Google Analytics" />}
                  {item.platform === 'LINE' && <img src="https://cdn.simpleicons.org/line/FFFFFF" className="h-6 w-6" alt="LINE" />}
                  {item.platform === 'TikTok' && <img src="https://cdn.simpleicons.org/tiktok/FFFFFF" className="h-6 w-6" alt="TikTok" />}
                </span>
                <div className="flex-1 flex items-center" style={{ paddingTop: '6px' }}>
                  <div>
                    <p className="text-sm sm:text-base font-semibold theme-text whitespace-nowrap">{item.platform}</p>
                    <p className="text-[11px] sm:text-xs theme-muted" style={{ marginTop: '-17px' }}>
                      {item.value.toLocaleString('en-US')} conversions
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 mx-5 hidden sm:flex items-center gap-2">
                <div className="w-full h-3.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-muted)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${share}%`, backgroundColor: fillColor, opacity: isConnected ? 1 : 0.5 }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 min-w-[100px]">
                {isTop && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border"
                    style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}>
                    Top performer
                  </span>
                )}
                <span className="text-xs sm:text-sm font-semibold theme-text">{share.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FunnelVisualizer: React.FC<{ steps: { label: string; value: number; color: string }[] }> = ({ steps }) => {
  const animated = useAnimatedReveal();
  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const percent = ((steps.length - index) / steps.length) * 100;
        const topRadius = 18 - index * 4;
        const highlightColor = adjustHexColor(step.color, 0.2);
        return (
          <div key={step.label} className="flex items-center justify-between group">
            <div
              className="h-12 transition-all duration-700 ease-out shadow-sm hover:shadow-lg hover:scale-[1.02] transform cursor-pointer relative overflow-hidden"
              style={{
                width: animated ? `${percent}%` : '0%',
                maxWidth: '100%',
                background: `linear-gradient(90deg, ${step.color}, ${highlightColor})`,
                borderTopLeftRadius: `${topRadius}px`,
                borderTopRightRadius: `${topRadius}px`,
                borderBottomLeftRadius: `${Math.max(topRadius - 4, 4)}px`,
                borderBottomRightRadius: `${Math.max(topRadius - 4, 4)}px`,
                mixBlendMode: 'normal',
                filter: 'brightness(1.05)',
              }}
            >
              {/* Blending overlay effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  mixBlendMode: 'overlay',
                }}
              />
            </div>
            <div className="text-sm min-w-[140px] text-right flex-shrink-0 ml-4">
              <p className="font-semibold text-gray-900 text-base">{step.label}</p>
              <p className="text-2xl font-semibold text-gray-800">{step.value.toLocaleString('en-US')}</p>
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 text-xs text-gray-500">
        {steps.map((step) => (
          <span key={step.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: step.color }} />
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

interface DashboardProps {
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const {
    metrics: rawMetrics,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useMetrics();
  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaigns();
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [pendingScroll, setPendingScroll] = useState<{ section: SectionKey; ref: React.RefObject<HTMLDivElement> } | null>(null);
  const overviewSectionRefs = {
    integrations: useRef<HTMLDivElement | null>(null),
    aiSummaries: useRef<HTMLDivElement | null>(null),
    performance: useRef<HTMLDivElement | null>(null),
  };
  const campaignSectionRefs = {
    performance: useRef<HTMLDivElement | null>(null),
    visualization: useRef<HTMLDivElement | null>(null),
  };
  const initialRealtime = mockOverviewRealtime['7D']?.[0]?.id || 'active-now';
  const [selectedRealtimeId, setSelectedRealtimeId] = useState<string>(initialRealtime);
  const [selectedRange, setSelectedRange] = useState<'Today' | '7D' | '30D'>('7D');
  const [compareMode, setCompareMode] = useState<'previous' | 'target'>('previous');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [productCategory, setProductCategory] = useState<string>('All');
  const [settingsData, setSettingsData] = useState<SettingsData>(() => buildDefaultSettings());
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsHydrated, setSettingsHydrated] = useState(false);

  const handleMenuChange = useCallback((value: string) => {
    const normalized = normalizeColorInput(value);
    setSettingsData((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        menuColor: normalized,
      },
    }));
  }, []);

  const handleRefreshChange = useCallback(
    (patch: Partial<SettingsData['refresh']>) => {
      setSettingsData((prev) => ({
        ...prev,
        refresh: {
          ...prev.refresh,
          ...patch,
        },
      }));
    },
    [],
  );

  const handleAlertAddRecipient = useCallback((email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setSettingsData((prev) => {
      if (prev.alerts.recipients.includes(trimmed)) {
        return prev;
      }

      return {
        ...prev,
        alerts: {
          ...prev.alerts,
          recipients: [...prev.alerts.recipients, trimmed],
        },
      };
    });
  }, []);

  const handleAlertRemoveRecipient = useCallback((email: string) => {
    setSettingsData((prev) => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        recipients: prev.alerts.recipients.filter((item) => item !== email),
      },
    }));
  }, []);

  const handleUpdateKpi = useCallback((id: string, patch: Partial<any>) => {
    setSettingsData((prev) => ({
      ...prev,
      kpis: prev.kpis.map((kpi: any) => (kpi.id === id ? { ...kpi, ...patch } : kpi)),
    }));
  }, []);

  const handleAddKpi = useCallback(() => {
    const baseMenuOptions =
      Array.isArray(KPI_ALERT_MENU_OPTIONS) && KPI_ALERT_MENU_OPTIONS.length > 0
        ? KPI_ALERT_MENU_OPTIONS
        : ['Overview Dashboard'];
    const alertName = baseMenuOptions[0];
    const metricOptions = KPI_METRIC_OPTIONS?.[alertName] || ['Financial Overview'];
    const metric = metricOptions[0];
    const summary = KPI_METRIC_SUMMARY?.[metric];

    const id =
      typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
        ? (crypto as any).randomUUID()
        : `kpi-${Date.now()}`;

    setSettingsData((prev) => ({
      ...prev,
      kpis: [
        ...prev.kpis,
        {
          id,
          alertName,
          metric,
          condition: summary?.condition || KPI_CONDITION_OPTIONS[0],
          threshold: summary?.threshold || '',
          status: summary?.status || 'active',
        },
      ],
    }));
  }, []);

  const handleRemoveKpi = useCallback((id: string) => {
    setSettingsData((prev) => ({
      ...prev,
      kpis: prev.kpis.filter((kpi: any) => kpi.id !== id),
    }));
  }, []);

  const handleAlertToggle = useCallback(
    (group: keyof SettingsData['alerts'], label: string) => {
      setSettingsData((prev) => ({
        ...prev,
        alerts: {
          ...prev.alerts,
          [group]: prev.alerts[group].map((item: any) =>
            item.label === label ? { ...item, enabled: !item.enabled } : item,
          ),
        },
      }));
    },
    [],
  );

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      // Simulate async for now; replace with API call when backend ready
      const defaults = await Promise.resolve(buildDefaultSettings());

      try {
        if (typeof window !== 'undefined') {
          const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
          const storedBranding = window.localStorage.getItem(BRANDING_STORAGE_KEY);

          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            const baseMenu =
              Array.isArray(KPI_ALERT_MENU_OPTIONS) && KPI_ALERT_MENU_OPTIONS.length > 0
                ? KPI_ALERT_MENU_OPTIONS[0]
                : 'Overview Dashboard';
            const cleanedSettings = {
              ...parsedSettings,
              kpis: Array.isArray(parsedSettings?.kpis)
                ? parsedSettings.kpis.map((kpi: any) => {
                    const alertName = typeof kpi?.alertName === 'string' ? kpi.alertName.trim() : '';
                    if (alertName !== 'MENU Dashboard') return kpi;
                    const nextAlertName = 'Overview Dashboard';
                    const nextMetricOptions =
                      KPI_METRIC_OPTIONS?.[nextAlertName] || KPI_METRIC_OPTIONS?.[baseMenu] || ['Financial Overview'];
                    return {
                      ...kpi,
                      alertName: nextAlertName,
                      metric: nextMetricOptions[0],
                    };
                  })
                : parsedSettings?.kpis,
            };
            // Merge stored settings over defaults to avoid breaking shape
            setSettingsData({
              ...defaults,
              ...cleanedSettings,
              branding: {
                ...defaults.branding,
                ...(cleanedSettings.branding || {}),
              },
            });
          } else if (storedBranding) {
            const parsedBranding = JSON.parse(storedBranding);
            setSettingsData({
              ...defaults,
              branding: {
                ...defaults.branding,
                ...parsedBranding,
              },
            });
          } else {
            setSettingsData(defaults);
          }
        } else {
          setSettingsData(defaults);
        }
      } catch {
        setSettingsData(defaults);
      }
      setSettingsHydrated(true);
    } catch (err: any) {
      setSettingsError(err?.message || 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!settingsHydrated) return;
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsData));
    } catch {
      // Best-effort persistence; ignore storage errors
    }
  }, [settingsData, settingsHydrated]);

  const brandingTheme = useMemo<ThemeTokens>(() => {
    const themeName: ThemeName = (settingsData.branding.theme as ThemeName) || 'Light';
    const menu = normalizeHex(settingsData.branding.menuColor || '#1a1612');

    const matchedPair = dashboardColorPairs.find(
      (pair) => normalizeHex(pair.bg).toLowerCase() === menu.toLowerCase()
    );

    const menuText = normalizeHex(matchedPair?.text || '#f97316');
    const accent = normalizeHex(settingsData.branding.accentColor || menuText);
    const isDark = themeName === 'Dark';
    const isCanvas = themeName === 'Canvas';

    const background = isDark ? '#04060b' : isCanvas ? '#fff9f1' : '#fdf6f0';
    const surface = isDark ? '#111827' : isCanvas ? '#fffaf2' : '#ffffff';
    const surfaceMuted = isDark ? '#1a2135' : isCanvas ? '#fff2e0' : '#fdf6f0';
    const textPrimary = isDark ? '#f7f9ff' : isCanvas ? '#402b1a' : '#1f232c';
    const textMuted = isDark ? '#a9b4cc' : isCanvas ? '#8b5f40' : '#6b7280';
    const sectionFrom = isDark ? '#0b0f1a' : isCanvas ? '#fff1db' : '#fff5ec';
    const sectionTo = isDark ? '#05070f' : isCanvas ? '#fffaf1' : '#ffffff';
    const border = isDark ? 'rgba(148, 163, 184, 0.28)' : isCanvas ? 'rgba(245, 160, 98, 0.35)' : 'rgba(15, 23, 42, 0.08)';
    const cardShadow = isDark ? '0 40px 140px rgba(0,0,0,0.65)' : isCanvas ? '0 30px 80px rgba(249, 115, 22, 0.18)' : '0 25px 80px rgba(15,23,42,0.08)';

    // Use a consistent gradient offset for all themes so Light/Dark/Canvas
    // share the same style of sidebar color transition
    const sidebarFrom = adjustHexColor(menu, -0.08);
    const sidebarTo = adjustHexColor(menu, 0.12);

    return {
      accent,
      accentSoft: hexToRgba(accent, 0.16),
      background,
      surface,
      surfaceMuted,
      textPrimary,
      textMuted,
      menuFrom: sidebarFrom,
      menuTo: sidebarTo,
      menuText,
      sectionFrom,
      sectionTo,
      border,
      cardShadow,
      mode: isDark ? 'dark' : isCanvas ? 'canvas' : 'light',
    };
  }, [settingsData.branding]);

  const filterOptions = [
    { key: '1d', label: 'Last 1 Day' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: '365d', label: 'Last 365 Days' },
  ] as const;
  type DateRangeKey = typeof filterOptions[number]['key'] | 'custom';
  const [campaignDateRange, setCampaignDateRange] = useState<DateRangeKey>('30d');
  const [campaignFilterOpen, setCampaignFilterOpen] = useState(false);
  const [seoDateRange, setSeoDateRange] = useState<DateRangeKey>('30d');
  const [seoFilterOpen, setSeoFilterOpen] = useState(false);
  const [globalDateRange, setGlobalDateRange] = useState<DateRangeKey>('30d');
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [headerSearch, setHeaderSearch] = useState('');
  const [calendarSelection, setCalendarSelection] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const themePresets = [
    { theme: 'Sunset', accentColor: '#f97316', menuColor: '#1a1612' },
    { theme: 'Midnight', accentColor: '#6366f1', menuColor: '#0f172a' },
    { theme: 'Emerald', accentColor: '#10b981', menuColor: '#022c22' },
  ];

  const applyTheme = useCallback((theme: 'Light' | 'Dark') => {
    setSettingsData((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        theme,
      },
    }));
  }, []);

  const handleResetBranding = useCallback(() => {
    const defaults = buildDefaultSettings();
    setSettingsData((prev) => ({
      ...prev,
      branding: { ...defaults.branding },
    }));
  }, []);

  // Integration Checklist state
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const { notifications, loading: loadingNotifications, error: notificationError, refetch } = useIntegrationNotifications('open');
  const [platformAlert, setPlatformAlert] = useState<{ title: string; description: string; timestamp: string } | null>(null);

  // Platform configuration for Integration Checklist
  const REQUIRED_PLATFORMS = [
    {
      id: 'googleads',
      label: 'Google Ads',
      provider: 'googleads',
      icon: <img src="https://cdn.simpleicons.org/googleads/FFFFFF" className="h-8 w-8" alt="Google Ads" />,
      color: 'bg-red-500',
      description: 'Sync campaigns and conversion data from Google Ads.',
    },
    {
      id: 'googleanalytics',
      label: 'Google Analytics',
      provider: 'googleanalytics',
      icon: <img src="https://cdn.simpleicons.org/googleanalytics/FFFFFF" className="h-8 w-8" alt="Google Analytics" />,
      color: 'bg-orange-500',
      description: 'Track website traffic and user behavior analytics.',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      provider: 'facebook',
      icon: <img src="https://cdn.simpleicons.org/facebook/FFFFFF" className="h-8 w-8" alt="Facebook" />,
      color: 'bg-blue-600',
      description: 'Connect Meta Ads for real-time performance.',
    },
    {
      id: 'line',
      label: 'LINE OA',
      provider: 'line',
      icon: <img src="https://cdn.simpleicons.org/line/FFFFFF" className="h-8 w-8" alt="LINE" />,
      color: 'bg-green-500',
      description: 'Pull CRM and messaging KPIs from LINE OA.',
    },
    {
      id: 'tiktok',
      label: 'TikTok Ads',
      provider: 'tiktok',
      icon: <img src="https://cdn.simpleicons.org/tiktok/FFFFFF" className="h-8 w-8" alt="TikTok" />,
      color: 'bg-zinc-900',
      description: 'Monitor short-form video campaigns from TikTok.',
    },
  ];

  const isLoading = metricsLoading || campaignsLoading;
  const error = metricsError || campaignsError;

  const chartSeries: ChartDatum[] = useMemo(
    () =>
      rawMetrics.map((point) => ({
        date: point.date,
        impressions: point.impressions ?? 0,
        clicks: point.clicks ?? 0,
        conversions: point.conversions ?? 0,
        spend: Number(point.spend || 0),
        revenue: Number(point.revenue || 0),
      })),
    [rawMetrics]
  );

  const aggregated = useMemo(() => {
    const totals = chartSeries.reduce(
      (acc, point) => ({
        impressions: acc.impressions + Number(point.impressions || 0),
        clicks: acc.clicks + Number(point.clicks || 0),
        conversions: acc.conversions + Number(point.conversions || 0),
        spend: acc.spend + Number(point.spend || 0),
        revenue: acc.revenue + Number(point.revenue || 0),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
    );

    const platformTotals: Record<string, number> = {};
    campaigns.forEach((campaign) => {
      const revenue = (campaign.metrics || []).reduce((sum, metric) => sum + Number(metric.revenue || 0), 0);
      platformTotals[campaign.platform] = (platformTotals[campaign.platform] || 0) + revenue;
    });

    const platformBreakdown = Object.entries(platformTotals).map(([platform, value]) => ({
      name: platform.toUpperCase(),
      value,
    }));

    return { totals, platformBreakdown };
  }, [chartSeries, campaigns]);

  const campaignTotals = useMemo(
    () =>
      campaigns.reduce(
        (acc, campaign) => {
          (campaign.metrics || []).forEach((metric) => {
            acc.spend += Number(metric.spend || 0);
            acc.revenue += Number(metric.revenue || 0);
            acc.orders += Number(metric.orders || 0);
          });
          return acc;
        },
        { spend: 0, revenue: 0, orders: 0 }
      ),
    [campaigns]
  );

  const currentRealtimeStats = useMemo(() => {
    return mockOverviewRealtime[selectedRange] || mockOverviewRealtime['7D'];
  }, [selectedRange]);

  useEffect(() => {
    if (!currentRealtimeStats?.length) return;
    if (!currentRealtimeStats.find((stat) => stat.id === selectedRealtimeId)) {
      setSelectedRealtimeId(currentRealtimeStats[0].id);
    }
  }, [currentRealtimeStats, selectedRealtimeId]);

  const activeRealtimeStat = useMemo(
    () => currentRealtimeStats.find((stat) => stat.id === selectedRealtimeId) || currentRealtimeStats[0],
    [currentRealtimeStats, selectedRealtimeId]
  );

  // Integration Checklist functions
  const loadIntegrations = useCallback(async () => {
    try {
      setIntegrationLoading(true);
      setIntegrationError(null);
      const data = await getIntegrations();
      setIntegrations(data || []);
    } catch (err: any) {
      setIntegrationError(err?.response?.data?.message || 'Unable to load integration status from the API');
    } finally {
      setIntegrationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    loadIntegrations();
    refetch();
  }, [loadIntegrations]);

  const integrationMap = useMemo(() => {
    return integrations.reduce<Record<string, Integration>>((acc, integration) => {
      acc[integration.provider] = integration;
      return acc;
    }, {});
  }, [integrations]);

  const integrationSteps = useMemo(() => {
    return REQUIRED_PLATFORMS.map((platform) => {
      const integration = integrationMap[platform.provider];
      const isConnected = Boolean(integration?.isActive);
      return {
        ...platform,
        status: isConnected ? ('connected' as const) : ('disconnected' as const),
        integration,
      };
    });
  }, [integrationMap]);

  const completedSteps = integrationSteps.filter((step) => step.status === 'connected').length;
  const completionPercent = useMemo(() => {
    if (!integrationSteps.length) return 0;
    return Math.round((completedSteps / integrationSteps.length) * 100);
  }, [completedSteps, integrationSteps.length]);

  const conversionConnectionStatus = useMemo(() => {
    return integrationSteps.reduce<Record<string, 'connected' | 'disconnected'>>((acc, step) => {
      acc[step.provider] = step.status;
      return acc;
    }, {});
  }, [integrationSteps]);

  const handleToggle = async (provider: string) => {
    const integration = integrationMap[provider];
    if (!integration) {
      setIntegrationError('Integration record not found. Configure it first via Integrations > Add Integration.');
      return;
    }

    try {
      setActionTarget(provider);
      await updateIntegration(integration.id, { isActive: !integration.isActive });
      await loadIntegrations();
    } catch (err: any) {
      setIntegrationError(err?.response?.data?.message || 'Unable to update integration status');
    } finally {
      setActionTarget(null);
    }
  };

  const handleConfigure = (provider: string, label: string) => {
    const timestamp = new Date().toLocaleString();
    setPlatformAlert({
      title: `${label} integration is not ready yet`,
      description:
        'We are still preparing the API connection for this platform. Please verify access permissions and wait for the administrator to finish setup. You will receive an automatic alert here once it is ready.',
      timestamp,
    });
  };

  const productCategories = useMemo(() => {
    const categories = Array.from(new Set(mockProductPerformance.map((product) => product.category)));
    return ['All', ...categories];
  }, []);

  const filteredProductPerformance = useMemo(() => {
    if (productCategory === 'All') return mockProductPerformance;
    return mockProductPerformance.filter((product) => product.category === productCategory);
  }, [productCategory]);

  const [downloadModal, setDownloadModal] = useState<{ open: boolean; section: string | null }>({
    open: false,
    section: null,
  });

  const openDownloadModal = useCallback((section: string) => {
    setDownloadModal({ open: true, section });
  }, []);

  const closeDownloadModal = useCallback(() => {
    setDownloadModal({ open: false, section: null });
  }, []);

  const handleProductPerformanceDownload = useCallback(() => {
    if (!filteredProductPerformance.length) {
      return;
    }

    const headers = ['Product Name', 'Category', 'Sales', 'Revenue', 'Stock', 'Status'];
    const escapeCsvValue = (value: string | number) => {
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredProductPerformance.map((product) => [
      product.name,
      product.category,
      product.sales,
      product.revenue,
      product.stock,
      product.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product-performance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredProductPerformance]);

  const handleConversionsPlatformDownload = useCallback(() => {
    if (!mockConversionPlatforms.length) {
      return;
    }

    const headers = ['Platform', 'Conversions', 'Percentage'];
    const escapeCsvValue = (value: string | number) => {
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const totalConversions = mockConversionPlatforms.reduce((sum, platform) => sum + platform.value, 0);
    
    const rows = mockConversionPlatforms.map((platform) => [
      platform.platform,
      platform.value,
      ((platform.value / totalConversions) * 100).toFixed(1) + '%',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'conversions-platform.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadOptions = ['Image', 'PDF', 'CSV', 'DOC'];

  const handleDownloadOption = useCallback(
    (option: string) => {
      if (option === 'CSV' && downloadModal.section === 'Product Performance') {
        handleProductPerformanceDownload();
      } else if (option === 'CSV' && downloadModal.section === 'Conversions Platform') {
        handleConversionsPlatformDownload();
      } else {
        alert(`${option} download for ${downloadModal.section ?? 'this section'} is coming soon.`);
      }
      closeDownloadModal();
    },
    [closeDownloadModal, downloadModal.section, handleProductPerformanceDownload, handleConversionsPlatformDownload],
  );

  useEffect(() => {
    const existing = document.querySelector('link[data-fontawesome="true"]') as HTMLLinkElement | null;
    if (existing) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    link.dataset.fontawesome = 'true';
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    const element = ref.current;
    if (element) {
      const headerOffset = 90;
      const viewportOffset = window.innerHeight * 0.3;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(elementPosition - headerOffset - viewportOffset, 0);
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const handleSectionNav = useCallback(
    (sectionKey: SectionKey, ref: React.RefObject<HTMLDivElement>) => {
      if (activeSection === sectionKey) {
        scrollToSection(ref);
      } else {
        setPendingScroll({ section: sectionKey, ref });
        setActiveSection(sectionKey);
      }
    },
    [activeSection, scrollToSection]
  );

  useEffect(() => {
    if (pendingScroll && activeSection === pendingScroll.section) {
      scrollToSection(pendingScroll.ref);
      setPendingScroll(null);
    }
  }, [pendingScroll, activeSection, scrollToSection]);

  const overviewChildLinks = useMemo(
    () => [
      {
        label: 'Integration Checklist',
        onClick: () => handleSectionNav('overview', overviewSectionRefs.integrations),
      },
      {
        label: 'AI Summaries & Live KPIs',
        onClick: () => handleSectionNav('overview', overviewSectionRefs.aiSummaries),
      },
      {
        label: 'Performance Insights',
        onClick: () => handleSectionNav('overview', overviewSectionRefs.performance),
      },
    ],
    [handleSectionNav]
  );

  const campaignChildLinks = useMemo(
    () => [
      {
        label: 'Campaign Performance',
        onClick: () => handleSectionNav('campaign', campaignSectionRefs.performance),
      },
      {
        label: 'Visualization Controls',
        onClick: () => handleSectionNav('campaign', campaignSectionRefs.visualization),
      },
    ],
    [handleSectionNav]
  );

  const menuItems = useMemo(
    () =>
      [
        { label: 'Overview Dashboard', icon: <LayoutDashboard />, key: 'overview' as SectionKey, children: overviewChildLinks },
        { label: 'Campaign Performance', icon: <BarChart3 />, key: 'campaign' as SectionKey, children: campaignChildLinks },
        { label: 'SEO & Web Analytics', icon: <Search />, key: 'seo' as SectionKey },
        { label: 'E-commerce Insights', icon: <ShoppingBag />, key: 'commerce' as SectionKey },
        { label: 'CRM & Leads Insights', icon: <Users />, key: 'crm' as SectionKey },
        { label: 'Trend Analysis', icon: <TrendingUp />, key: 'trend' as SectionKey },
        { label: 'Settings', icon: <Settings />, key: 'settings' as SectionKey },
        { label: 'Reports & Automation', icon: <FileText />, key: 'reports' as SectionKey },
      ].map((item) => ({
        ...item,
        active: item.key === activeSection,
        onClick: () => setActiveSection(item.key),
      })),
    [activeSection, overviewChildLinks, campaignChildLinks]
  );

  const handleRefresh = () => {
    refetchMetrics();
    refetchCampaigns();
  };

  // Integration Checklist Widget Component
  const IntegrationChecklistWidget: React.FC = () => (
    <div ref={overviewSectionRefs.integrations} className={`${themePanelClass} shadow p-6 space-y-6`}>
      <div className="flex flex-col gap-4">
        <SectionTitle title="Integration Checklist" subtitle="Connect data sources for real-time insights" />

        {/* Progress Summary */}
        <div className="theme-panel-soft rounded-[26px] p-4 space-y-2 shadow-[0_10px_40px_-25px_rgba(249,115,22,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]" />
              Connections in progress
            </div>
            <button
              type="button"
              className="text-[9px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              onClick={() => navigate('/integrations')}
            >
              keep connection
            </button>
          </div>
          <div className="relative h-4 rounded-full bg-gray-100/90 border border-white shadow-inner overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, completionPercent)}%` }}
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-[9px] font-semibold text-orange-600">
              {completionPercent}%
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-500">
            <span className="font-semibold text-gray-800">
              You&apos;re {completedSteps} out of {integrationSteps.length} steps complete
            </span>
            <span className="text-orange-500">•</span>
            <span>Stay synced for accurate KPIs</span>
          </div>
        </div>

        {/* Alerts Section */}
        {platformAlert && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{platformAlert.title}</p>
                <p className="text-xs text-gray-600">{platformAlert.description}</p>
                <p className="text-xs text-gray-400 mt-1">{platformAlert.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/integrations')}
          >
            Open workspace
          </button>
          <button
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center gap-2"
            onClick={loadIntegrations}
            disabled={integrationLoading}
          >
            {integrationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
          <button
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/integrations')}
          >
            Configure
          </button>
          <button
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors open-data-btn"
            onClick={() => navigate('/integrations')}
          >
            Open data setup
          </button>
        </div>

        {/* Integration List */}
        <div className="space-y-0">
          {integrationLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Loading integrations...</span>
            </div>
          ) : (
            integrationSteps.map((step) => (
              <div
                key={step.id}
                className="theme-panel flex flex-col gap-1.5 rounded-2xl px-4 py-4 md:flex-row md:items-center md:justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`${step.color} p-2 rounded-xl shadow-sm flex items-center justify-center`}>{step.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-[1.05] m-1">{step.label}</p>
                    <p className="text-xs text-gray-500 leading-[1.05] m-1">{step.description}</p>
                    {step.integration?.lastSyncAt && (
                      <p className="text-xs text-gray-400 leading-[1.05] m-1">
                        Last sync · {new Date(step.integration.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium text-center whitespace-nowrap min-w-[100px] border ${
                      step.status === 'connected'
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                        : 'border-gray-200 text-gray-500 bg-gray-50'
                    }`}
                  >
                    {step.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                  <div className="flex flex-col gap-1 sm:flex-row">
                    {step.integration ? (
                      <button
                        className={`min-w-[120px] rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          step.status === 'connected'
                            ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                        }`}
                        onClick={() => handleToggle(step.provider)}
                        disabled={actionTarget === step.provider}
                      >
                        {actionTarget === step.provider ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : step.status === 'connected' ? (
                          'Disconnect'
                        ) : (
                          'Activate'
                        )}
                      </button>
                    ) : (
                      <button
                        className="min-w-[120px] rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
                        onClick={() => handleConfigure(step.provider, step.label)}
                      >
                        Configure
                      </button>
                    )}
                    <button
                      className="min-w-[120px] rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark-theme-hover open-data-btn"
                      onClick={() => handleConfigure(step.provider, step.label)}
                    >
                      Open data setup
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const sectionCtx = {
    SectionTitle,

    themedSectionClass,
    themePanelClass,
    themePanelCompactClass,

    IntegrationChecklistWidget,
    overviewSectionRefs,
    currentRealtimeStats,
    RealTimeCard,
    compareMode,
    setCompareMode,
    selectedRange,
    setSelectedRange,
    selectedRealtimeId,
    setSelectedRealtimeId,
    openDownloadModal,
    Download,
    mockFinancialOverview,
    DonutChart,
    mockConversionFunnel,
    FunnelVisualizer,
    handleConversionsPlatformDownload,
    productCategory,
    setProductCategory,
    productCategories,
    filteredProductPerformance,
    TrendingUp,
    mockConversionPlatforms,
    conversionConnectionStatus,
    ConversionPlatformBars,
    mockLtvTrend,
    LtvComparisonChart,
    ArrowUpRight,

    campaignSectionRefs,
    handleRefresh,
    RefreshCw,
    Filter,
    filterOptions,
    campaignDateRange,
    campaignFilterOpen,
    setCampaignFilterOpen,
    setCampaignDateRange,
    CampaignSourceTabs,
    mockCampaignSourceInsights,
    brandingTheme,

    seoDateRange,
    seoFilterOpen,
    setSeoFilterOpen,
    setSeoDateRange,
    mockSeoRealtimeStats,
    SeoAuthorityCard,
    SeoOrganicSummaryCard,
    SearchVisibilityCard,
    mockSeoSnapshots,
    SeoConversionCard,
    mockSeoConversionSummary,
    SeoIssuesCard,
    mockSeoIssues,
    SeoKeywordsTable,
    mockSeoKeywordsDetailed,
    SeoCompetitorsCard,
    mockSeoCompetitors,
    SeoPositionDistributionCard,
    mockSeoPositionDistribution,
    SeoBacklinkSummaryCard,
    SeoCompetitiveMapCard,
    mockSeoCompetitiveMap,
    SeoRegionalPerformanceCard,
    TechnicalScoreList,
    mockSeoTechnicalScores,
    SeoChannelMix,
    SeoRightRailCard,

    mockCommerceRealtime,
    ProfitabilityChart,
    mockCommerceProfitability,
    CommerceFunnelChart,
    mockCommerceConversionFunnel,
    RevenueOrdersTrendChart,
    mockCommerceRevenueTrend,
    mockProductPerformance,
    mockCommerceCreatives,
    mockCommerceProductVideos,

    mockCrmRealtime,
    CrmStageChart,
    mockCrmStages,
    CrmAgeDonut,
    mockCrmAgeRange,
    LeadTrackingTable,
    mockCrmLeads,

    mockTrendRealtime,
    ChannelComparisonChart,
    mockTrendRevenueByChannel,
    SalesFunnelChart,
    mockTrendSalesFunnel,
    RevenueTrendChart,
    mockTrendRevenueTrend,
    YtdRevenueCard,
    LeadSourceTable,
    mockTrendLeadSources,
    SalesRepTable,
    mockTrendSalesReps,

    KpiSettingsTable,
    settingsData,
    settingsLoading,
    handleUpdateKpi,
    handleAddKpi,
    handleRemoveKpi,
    ThemeBrandingCard,
    applyTheme,
    handleMenuChange,
    handleResetBranding,
    DataRefreshCard,
    handleRefreshChange,
    UserRolesCard,
    AlertSettingsCard,
    handleAlertToggle,
    handleAlertAddRecipient,
    handleAlertRemoveRecipient,

    mockReportBuilders,
    ScheduleReportCard,
    ReportStatusTable,
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection(sectionCtx);
      case 'commerce':
        return renderCommerceSection(sectionCtx);
      case 'campaign':
        return renderCampaignSection(sectionCtx);
      case 'crm':
        return renderCrmSection(sectionCtx);
      case 'trend':
        return renderTrendSection(sectionCtx);
      case 'seo':
        return renderSeoSection(sectionCtx);
      case 'settings':
        return renderSettingsSection(sectionCtx);
      case 'reports':
        return renderReportsSection(sectionCtx);
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen dashboard-theme"
        style={{ backgroundColor: brandingTheme.background }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen dashboard-theme flex items-center justify-center"
        style={{ backgroundColor: brandingTheme.background, color: brandingTheme.textPrimary }}
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          <p className="font-semibold mb-1">Unable to load dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardShell
        title={undefined}
        subtitle={undefined}
        roleLabel={undefined}
        menuItems={menuItems}
        theme={brandingTheme}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" /> Refresh mock
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            <div className="relative">
              <button
                className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-md text-sm font-medium text-gray-800 hover:shadow-lg transition"
                onClick={() => setGlobalFilterOpen((prev) => !prev)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterOptions.find((option) => option.key === globalDateRange)?.label || 'Filter'}
              </button>
              {globalFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-3xl shadow-2xl z-30 theme-panel-soft p-3 space-y-2">
                  {filterOptions.map((option) => {
                    const isActive = globalDateRange === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => {
                          setGlobalDateRange(option.key as any);
                          setGlobalFilterOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors theme-text"
                        style={
                          isActive
                            ? { backgroundColor: 'var(--accent-color)', color: '#ffffff' }
                            : undefined
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-sm hover:shadow-md transition"
                onClick={() => setCalendarOpen((prev) => !prev)}
                aria-label="Open calendar"
              >
                <Calendar className="h-5 w-5" />
              </button>
              {calendarOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl shadow-2xl space-y-4 z-30 theme-panel-soft p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold theme-text">Select date range</p>
                    <button
                      className="text-xs theme-muted hover:opacity-80"
                      onClick={() => setCalendarOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] uppercase theme-muted">From</label>
                      <div className="relative mt-1">
                        <input
                          type="date"
                          value={calendarSelection.start}
                          onChange={(event) =>
                            setCalendarSelection((prev) => ({ ...prev, start: event.target.value }))
                          }
                          className="date-input w-full rounded-xl px-3 py-2 pr-10 text-sm"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)',
                          }}
                        />
                        <Calendar
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer"
                          style={{ color: '#ffffff' }}
                          onClick={(event) => {
                            const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                            if (input) {
                              const anyInput = input as any;
                              if (typeof anyInput.showPicker === 'function') {
                                anyInput.showPicker();
                              } else {
                                input.focus();
                                input.click();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase theme-muted">To</label>
                      <div className="relative mt-1">
                        <input
                          type="date"
                          value={calendarSelection.end}
                          onChange={(event) =>
                            setCalendarSelection((prev) => ({ ...prev, end: event.target.value }))
                          }
                          className="date-input w-full rounded-xl px-3 py-2 pr-10 text-sm"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)',
                          }}
                        />
                        <Calendar
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer"
                          style={{ color: '#ffffff' }}
                          onClick={(event) => {
                            const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                            if (input) {
                              const anyInput = input as any;
                              if (typeof anyInput.showPicker === 'function') {
                                anyInput.showPicker();
                              } else {
                                input.focus();
                                input.click();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {calendarSelection.start && calendarSelection.end ? (
                    <p className="text-xs theme-muted">
                      Showing data for {format(new Date(calendarSelection.start), 'dd MMM yyyy')} –{' '}
                      {format(new Date(calendarSelection.end), 'dd MMM yyyy')}
                    </p>
                  ) : (
                    <p className="text-xs theme-muted">Select a start and end date to filter dashboard metrics.</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-xs font-semibold theme-muted hover:opacity-80"
                      onClick={() => {
                        setCalendarSelection({ start: '', end: '' });
                        setCalendarOpen(false);
                      }}
                    >
                      Clear
                    </button>
                    <button
                      className="rounded-full text-base font-bold px-6 py-3"
                      style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
                      onClick={() => setCalendarOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <NotificationCenter />
          </div>
        }
        onLogout={onLogout}
        onProfileClick={() => navigate('/profile')}
      >
        {renderSection()}
      </DashboardShell>
      <AI />
      {downloadModal.open && (
        <div
          className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeDownloadModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-[24px] font-semibold text-gray-900">Download options</p>
              <p className="text-[18px] text-gray-500">{downloadModal.section}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {downloadOptions.map((option) => (
                <button
                  key={option}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleDownloadOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={closeDownloadModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
