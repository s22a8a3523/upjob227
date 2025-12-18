export const renderSeoSection = (ctx: any) => {
  const {
    themedSectionClass,
    themePanelClass,
    SectionTitle,
    filterOptions,
    seoDateRange,
    handleRefresh,
    RefreshCw,
    Filter,
    seoFilterOpen,
    setSeoFilterOpen,
    setSeoDateRange,
    openDownloadModal,
    Download,
    mockSeoRealtimeStats,
    RealTimeCard,
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
  } = ctx;

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle
          title="SEO & Web Analytics"
          subtitle="Real-time SERP visibility & organic insights"
          badge={
            <span className="rounded-full border border-orange-200 bg-white/70 px-4 py-1 text-xs font-semibold text-orange-600">
              Demonstration data • Mock dataset
            </span>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase  text-gray-500">
                {filterOptions.find((option: any) => option.key === seoDateRange)?.label || 'Last 30 Days'}
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" /> Refresh mock
              </button>
              <div className="relative">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800"
                  onClick={() => setSeoFilterOpen((prev: any) => !prev)}
                >
                  <Filter className="h-4 w-4" />{' '}
                  {filterOptions.find((option: any) => option.key === seoDateRange)?.label || 'Filter'}
                </button>
                {seoFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 theme-card rounded-2xl p-3 shadow-2xl z-10">
                    {filterOptions.map((option: any) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setSeoDateRange(option.key);
                          setSeoFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                          seoDateRange === option.key ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button className="w-full mt-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      Custom
                    </button>
                  </div>
                )}
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800"
                onClick={() => openDownloadModal('SEO & Web Analytics')}
              >
                <Download className="h-4 w-4" /> Download data
              </button>
            </div>
          }
        />

        <div className={`${themePanelClass} shadow-sm hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold text-gray-900">Real-Time Analytics</p>
              <p className="text-base text-gray-500">Organic KPIs styled to mirror the Overview Dashboard</p>
            </div>
            <span className="text-xs text-gray-500 uppercase ">SEO Focus</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockSeoRealtimeStats.map((stat: any) => (
              <RealTimeCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} positive={stat.positive} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="space-y-4 xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SeoAuthorityCard />
              <SeoOrganicSummaryCard />
            </div>
            <SearchVisibilityCard snapshot={mockSeoSnapshots} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SeoConversionCard summary={mockSeoConversionSummary} />
              <SeoIssuesCard issues={mockSeoIssues} />
            </div>
            <SeoKeywordsTable keywords={mockSeoKeywordsDetailed} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SeoCompetitorsCard competitors={mockSeoCompetitors} />
              <SeoPositionDistributionCard distribution={mockSeoPositionDistribution} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SeoBacklinkSummaryCard />
              <SeoCompetitiveMapCard snapshot={mockSeoCompetitiveMap} />
            </div>
          </div>
          <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-28 self-start">
            <SeoRegionalPerformanceCard />
            <TechnicalScoreList scores={mockSeoTechnicalScores} />
            <SeoChannelMix channels={mockSeoSnapshots.channels} />
            <SeoRightRailCard />
          </div>
        </div>
      </section>
    </div>
  );
};
