export const renderTrendSection = (ctx: any) => {
  const {
    themedSectionClass,
    themePanelClass,
    SectionTitle,
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
  } = ctx;

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle title="Trend Analysis & History" subtitle="Track your metrics over time and compare performance across periods" />

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold text-gray-900">Real-Time Analytics</p>
              <p className="text-base text-gray-500">Comparative metrics this period vs last</p>
            </div>
            <button className="px-3 py-1 rounded-full border border-gray-200 text-xs">Filter</button>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueTrendChart data={mockTrendRevenueTrend} />
          </div>
          <YtdRevenueCard data={mockTrendRevenueTrend} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <LeadSourceTable sources={mockTrendLeadSources} />
          <SalesRepTable reps={mockTrendSalesReps} />
        </div>
      </section>
    </div>
  );
};
