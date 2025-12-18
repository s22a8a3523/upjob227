export const renderCrmSection = (ctx: any) => {
  const {
    themedSectionClass,
    themePanelClass,
    SectionTitle,
    mockCrmRealtime,
    RealTimeCard,
    CrmStageChart,
    mockCrmStages,
    CrmAgeDonut,
    mockCrmAgeRange,
    LeadTrackingTable,
    mockCrmLeads,
  } = ctx;

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle title="CRM & Leads" subtitle="Track leads, analyze customers, and manage integrations" />

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold text-gray-900">Real-Time Analytics</p>
              <p className="text-base text-gray-500">Performance overview for your pipeline</p>
            </div>
            <p className="text-xs text-gray-500">+6.5% from last period</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockCrmRealtime.map((stat: any) => (
              <RealTimeCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} positive={stat.positive} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CrmStageChart stages={mockCrmStages} />
          <CrmAgeDonut ranges={mockCrmAgeRange} />
        </div>

        <LeadTrackingTable leads={mockCrmLeads} />
      </section>
    </div>
  );
};
