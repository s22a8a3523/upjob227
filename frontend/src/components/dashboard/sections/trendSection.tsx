import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionTitle from '../SectionTitle';
import { Button } from '../../ui/button';

export type TrendSectionProps = {
  themedSectionClass: string;
  themePanelClass: string;
  mockTrendRealtime: any[];
  RealTimeCard: React.ComponentType<any>;
  ChannelComparisonChart: React.ComponentType<any>;
  mockTrendRevenueByChannel: any;
  SalesFunnelChart: React.ComponentType<any>;
  mockTrendSalesFunnel: any;
  RevenueTrendChart: React.ComponentType<any>;
  mockTrendRevenueTrend: any;
  YtdRevenueCard: React.ComponentType<any>;
  LeadSourceTable: React.ComponentType<any>;
  mockTrendLeadSources: any;
  SalesRepTable: React.ComponentType<any>;
  mockTrendSalesReps: any;
};

const TrendSection: React.FC<TrendSectionProps> = ({
  themedSectionClass,
  themePanelClass,
  mockTrendRealtime,
  RealTimeCard,
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
}) => {

  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle
          title="Trend Analysis & History"
          subtitle="Track your metrics over time and compare performance across periods"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
                View Sync History
              </Button>
            </div>
          }
        />

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold text-gray-900">Real-Time Analytics</p>
              <p className="text-base text-gray-500">Comparative metrics this period vs last</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockTrendRealtime.map((stat: any) => (
              <RealTimeCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} positive={stat.positive} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChannelComparisonChart data={mockTrendRevenueByChannel} />
          <SalesFunnelChart stages={mockTrendSalesFunnel} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <LeadSourceTable sources={mockTrendLeadSources} />
          <SalesRepTable reps={mockTrendSalesReps} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueTrendChart data={mockTrendRevenueTrend} />
          </div>
          <YtdRevenueCard data={mockTrendRevenueTrend} />
        </div>
      </section>
    </div>
  );
};

export default TrendSection;
