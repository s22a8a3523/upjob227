export const renderReportsSection = (ctx: any) => {
  const { themedSectionClass, SectionTitle, mockReportBuilders, ScheduleReportCard, ReportStatusTable } = ctx;

  return (
    <div className="space-y-8">
      <section className={themedSectionClass}>
        <SectionTitle title="Reports & Automation" subtitle="Track and optimize your marketing campaigns" />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          <div className="xl:col-span-1">
            <ScheduleReportCard schedule={mockReportBuilders.schedule} />
          </div>
          <div className="xl:col-span-2">
            <ReportStatusTable />
          </div>
        </div>
      </section>
    </div>
  );
};
