export const renderOverviewSection = (ctx: any) => {
  const {
    SectionTitle,
    IntegrationChecklistWidget,
    overviewSectionRefs,
    themePanelClass,
    themePanelCompactClass,
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
  } = ctx;

  return (
    <div className="space-y-8">
      {/* Integration Checklist Widget */}
      <IntegrationChecklistWidget />

      {/* Key Metrics Cards */}
      <div
        ref={overviewSectionRefs.aiSummaries}
        className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[24px] font-bold theme-text">AI summaries</p>
            <p className="text-[18px] theme-muted">Core metrics overview</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95">
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="theme-panel-soft rounded-2xl p-4 space-y-2 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase theme-muted group-hover:text-blue-400 transition-colors">Total Revenue</p>
              <span className="text-xs font-semibold text-blue-400 group-hover:scale-110 transition-transform">+15.3%</span>
            </div>
            <p className="text-[18px] font-bold theme-text group-hover:text-blue-300 transition-colors">THB 2.45M</p>
            <p className="text-xs theme-muted">From last period</p>
          </div>

          <div className="theme-panel-soft rounded-2xl p-4 space-y-2 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase theme-muted group-hover:text-emerald-300 transition-colors">Total Orders</p>
              <span className="text-xs text-emerald-300 font-semibold group-hover:scale-110 transition-transform">+8.2%</span>
            </div>
            <p className="text-[18px] font-bold theme-text group-hover:text-emerald-200 transition-colors">1,284</p>
            <p className="text-xs theme-muted">From last period</p>
          </div>

          <div className="theme-panel-soft rounded-2xl p-4 space-y-2 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase theme-muted group-hover:text-purple-300 transition-colors">Avg Order Value</p>
              <span className="text-xs text-purple-300 font-semibold group-hover:scale-110 transition-transform">+6.8%</span>
            </div>
            <p className="text-[18px] font-bold theme-text group-hover:text-purple-200 transition-colors">THB 1,908</p>
            <p className="text-xs theme-muted">From last period</p>
          </div>

          <div className="theme-panel-soft rounded-2xl p-4 space-y-2 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase theme-muted group-hover:text-orange-300 transition-colors">Conversion Rate</p>
              <span className="text-xs text-orange-300 font-semibold group-hover:scale-110 transition-transform">+2.1%</span>
            </div>
            <p className="text-[18px] font-bold theme-text group-hover:text-orange-200 transition-colors">4.8%</p>
            <p className="text-xs theme-muted">From last period</p>
          </div>
        </div>
      </div>

      <section className={themePanelClass}>
        <div className="flex flex-col gap-4">
          <SectionTitle title="Overview Dashboard" subtitle="Real-time marketing performance insights" />
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="uppercase text-gray-400">Range</span>
            {(['Today', '7D', '30D'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`rounded-full border px-3 py-1 font-semibold ${selectedRange === range ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-200 text-gray-700'}`}
              >
                {range}
              </button>
            ))}
            <span className="ml-4 uppercase text-gray-400">Compare</span>
            {(['previous', 'target'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCompareMode(mode)}
                className={`rounded-full border px-3 py-1 font-semibold capitalize ${compareMode === mode ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-200 text-gray-700'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold theme-text">Real-Time Analytics</p>
              <p className="text-base theme-muted">Monitors live marketing signals</p>
            </div>
            <p className="text-xs theme-muted">+6.5% vs last period</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRealtimeStats.map((stat: any) => (
              <RealTimeCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                delta={compareMode === 'previous' ? stat.delta : stat.deltaTarget || stat.delta}
                positive={stat.positive}
                active={stat.id === selectedRealtimeId}
                onSelect={() => setSelectedRealtimeId(stat.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${themePanelClass} shadow-xl`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[18px] font-bold flex items-center gap-3" style={{ color: 'var(--theme-text)' }}>
                  <i className="fa-solid fa-chart-simple text-indigo-400 text-xl" /> Financial Overview
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
                  ROI {mockFinancialOverview.roi} ({mockFinancialOverview.roiChange})
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors download-pill"
                style={{
                  color: 'var(--theme-text)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                }}
                title="Download financial overview"
                onClick={() => openDownloadModal('Financial Overview')}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
            <div className="flex items-center justify-center">
              <DonutChart segments={mockFinancialOverview.breakdown} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-sm">
              {[
                {
                  label: 'Total Revenue',
                  value: mockFinancialOverview.revenue,
                  delta: mockFinancialOverview.revenueChange,
                  accent: 'rgba(16,185,129,0.7)',
                },
                {
                  label: 'Total Profit',
                  value: mockFinancialOverview.profit,
                  delta: mockFinancialOverview.profitChange,
                  accent: 'rgba(96,165,250,0.7)',
                },
                {
                  label: 'Total Cost',
                  value: mockFinancialOverview.cost,
                  delta: mockFinancialOverview.costChange,
                  accent: 'rgba(248,113,113,0.7)',
                },
              ].map((card: any) => (
                <div key={card.label} className="theme-panel-soft rounded-2xl p-4 space-y-2 border">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--theme-muted)' }}>
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--theme-text)' }}>
                    THB {card.value.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: card.accent }}>
                    {card.delta}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className={`${themePanelClass} shadow-sm`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[18px] font-bold theme-text">User Conversion Funnel</p>
                <p className="text-sm theme-muted">Track user journey through conversion stages</p>
              </div>
              <button
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors download-pill"
                style={{
                  color: 'var(--theme-text)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                }}
                title="Download funnel data"
                onClick={() => openDownloadModal('User Conversion Funnel')}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
            <FunnelVisualizer steps={mockConversionFunnel} />
          </div>
        </div>

        <div ref={overviewSectionRefs.performance} className={`${themePanelCompactClass} space-y-5`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[20px] font-bold theme-text flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Conversions Platform
              </p>
              <p className="theme-muted" style={{ fontSize: '16px' }}>
                Performance breakdown by platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors download-pill"
                style={{
                  color: 'var(--theme-text)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  marginTop: '18px',
                }}
                title="Download conversions platform data (CSV)"
                onClick={handleConversionsPlatformDownload}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 uppercase text-[11px]">Category</label>
                <select
                  value={productCategory}
                  onChange={(event: any) => setProductCategory(event.target.value)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 text-base focus:outline-none"
                >
                  {productCategories.map((category: any) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base table-fixed">
              <thead>
                <tr className="text-left text-sm uppercase text-gray-400">
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm">Product Name</th>
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm">Category</th>
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm">Sales</th>
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm">Revenue</th>
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm">Stock</th>
                  <th className="py-3 pr-6 whitespace-nowrap font-semibold text-sm w-1/6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProductPerformance.map((product: any) => (
                  <tr
                    key={product.name}
                    className="group text-gray-600 hover:bg-orange-500 hover:text-white hover:shadow-sm transition-colors duration-150 cursor-pointer"
                  >
                    <td className="py-4 pr-6 font-semibold text-gray-900 group-hover:text-white">{product.name}</td>
                    <td className="py-4 pr-6 text-gray-600 font-semibold text-base group-hover:text-white">{product.category}</td>
                    <td className="py-4 pr-6 whitespace-nowrap font-semibold group-hover:text-white">{product.sales.toLocaleString('en-US')}</td>
                    <td className="py-4 pr-6 whitespace-nowrap font-semibold group-hover:text-white">THB {product.revenue.toLocaleString('en-US')}</td>
                    <td className="py-4 pr-6 text-gray-600 font-semibold text-base group-hover:text-white">{product.stock}</td>
                    <td className="py-4 pr-6 w-1/6">
                      <span className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase bg-gray-700 text-white group-hover:bg-white group-hover:text-orange-700">
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center pt-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Learn more
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-2">
          <div className={`${themePanelClass} shadow-sm lg:basis-[35%] lg:max-w-[35%]`}>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[20px] font-bold theme-text flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Conversions Platform
                  </p>
                  <p className="text-sm theme-muted">Performance breakdown by platform</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors download-pill"
                  style={{
                    color: 'var(--theme-text)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'transparent',
                  }}
                  title="Download conversions platform data (CSV)"
                  onClick={handleConversionsPlatformDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
            <ConversionPlatformBars data={mockConversionPlatforms} connectionStatus={conversionConnectionStatus} />
          </div>
          <div className={`${themePanelClass} p-5 space-y-5 lg:basis-[65%] lg:max-w-[65%]`}>
            <div className="w-full pt-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[18px] font-bold theme-text">LTV : CAC Ratio</p>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="rounded-full font-semibold px-3 py-1 border"
                    style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                  >
                    Healthy
                  </span>
                  <button
                    className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors download-pill"
                    style={{
                      color: 'var(--theme-text)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'transparent',
                    }}
                    title="Download LTV : CAC data"
                    onClick={() => openDownloadModal('LTV : CAC Ratio')}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
              <LtvComparisonChart data={mockLtvTrend} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-7">
                  <div className="space-y-1">
                    <p className="uppercase text-sm theme-muted">Current Ratio</p>
                    <p className="text-[14px] font-semibold theme-text leading-tight">3.4x</p>
                  </div>
                  <div className="space-y-1">
                    <p className="uppercase text-sm theme-muted">Movement</p>
                    <p className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                      <ArrowUpRight className="h-4 w-4" />
                      +0.2 vs last month
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="theme-panel-soft rounded-2xl border px-3.5 py-3 transition shadow-sm hover:shadow-md">
                    <p className="uppercase text-xs sm:text-sm theme-muted tracking-wide font-semibold">Avg. LTV</p>
                    <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--accent-color)' }}>
                      THB 520
                    </p>
                  </div>
                  <div className="theme-panel-soft rounded-2xl border px-3.5 py-3 transition shadow-sm hover:shadow-md">
                    <p className="uppercase text-xs sm:text-sm theme-muted tracking-wide font-semibold">Avg. CAC</p>
                    <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--theme-text)' }}>
                      THB 150
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-[14px] leading-relaxed">
                <span className="uppercase text-[11px] font-semibold tracking-wide theme-text opacity-80">Goal</span>
                <p className="theme-text opacity-70 text-[12px]">
                  When the ratio stays above target, your acquisition budget is creating enough lifetime value. If this dips towards the goal, consider shifting spend to high LTV channels or improving retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
