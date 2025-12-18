export const renderSettingsSection = (ctx: any) => {
  const {
    themePanelClass,
    SectionTitle,
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
    handleRefresh,
    UserRolesCard,
    AlertSettingsCard,
    brandingTheme,
    handleAlertToggle,
    handleAlertAddRecipient,
    handleAlertRemoveRecipient,
  } = ctx;

  return (
    <div className="space-y-8">
      <section className={themePanelClass}>
        <SectionTitle title="Settings" subtitle="Track and optimize your marketing campaigns" />

        <KpiSettingsTable
          settingsData={settingsData}
          settingsLoading={settingsLoading}
          onUpdateKpi={handleUpdateKpi}
          onAddKpi={handleAddKpi}
          onRemoveKpi={handleRemoveKpi}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ThemeBrandingCard
            settingsData={settingsData}
            onSelectTheme={applyTheme}
            onMenuChange={handleMenuChange}
            onResetBranding={handleResetBranding}
          />
          <DataRefreshCard
            settingsData={settingsData}
            onChangeRefresh={handleRefreshChange}
            onManualTrigger={handleRefresh}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UserRolesCard settingsData={settingsData} settingsLoading={settingsLoading} />
          <AlertSettingsCard
            settingsData={settingsData}
            themeMode={brandingTheme.mode}
            onToggle={handleAlertToggle}
            onAddRecipient={handleAlertAddRecipient}
            onRemoveRecipient={handleAlertRemoveRecipient}
          />
        </div>
      </section>
    </div>
  );
};
