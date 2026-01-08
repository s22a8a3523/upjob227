import React from 'react';
import SectionTitle from '../SectionTitle';

export type CrmSectionProps = {
  themedSectionClass: string;
  themePanelClass: string;
  mockCrmRealtime: any[];
  RealTimeCard: React.ComponentType<any>;
  CrmStageChart: React.ComponentType<any>;
  mockCrmStages: any;
  CrmAgeDonut: React.ComponentType<any>;
  mockCrmAgeRange: any;
  LeadTrackingTable: React.ComponentType<any>;
  mockCrmLeads: any;
};

const CrmSection: React.FC<CrmSectionProps> = ({
  themedSectionClass,
  themePanelClass,
  mockCrmRealtime,
  RealTimeCard,
  CrmStageChart,
  mockCrmStages,
  CrmAgeDonut,
  mockCrmAgeRange,
  LeadTrackingTable,
  mockCrmLeads,
}) => {

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle title="CRM & Leads" subtitle="Track leads, analyze customers, and manage integrations" />

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold theme-text">Real-Time Analytics</p>
              <p className="text-base theme-muted">Performance overview for your pipeline</p>
            </div>
            <p className="text-xs theme-muted">+6.5% from last period</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockCrmRealtime.map((stat: any) => (
              <RealTimeCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} positive={stat.positive} />
            ))}
          </div>
        </div>

        <CrmStageChart stages={mockCrmStages} />
        <CrmAgeDonut ranges={mockCrmAgeRange} />

        <LeadTrackingTable leads={mockCrmLeads} />
      </section>
    </div>
  );
};

export default CrmSection;
