import React from 'react';
import SectionTitle from '../SectionTitle';

export type SettingsSectionRefs = {
  root: React.RefObject<HTMLDivElement>;
  integrations: React.RefObject<HTMLDivElement>;
  header: React.RefObject<HTMLDivElement>;
};

export type SettingsSectionProps = {
  themePanelClass: string;
  IntegrationChecklistWidgetSettings: React.ComponentType<{ containerRef?: React.RefObject<HTMLDivElement> }>;
  settingsSectionRefs: SettingsSectionRefs;
  KpiSettingsTable: React.ComponentType<any>;
  settingsData: any;
  settingsLoading: boolean;
  handleUpdateKpi: (...args: any[]) => void;
  handleAddKpi: (...args: any[]) => void;
  handleRemoveKpi: (...args: any[]) => void;
  platformOptions: string[];
  ThemeBrandingCard: React.ComponentType<any>;
  applyTheme: (...args: any[]) => void;
  handleMenuChange: (...args: any[]) => void;
  handleResetBranding: (...args: any[]) => void;
  DataRefreshCard: React.ComponentType<any>;
  handleRefreshChange: (...args: any[]) => void;
  handleRefresh: (...args: any[]) => void;
  UserRolesCard: React.ComponentType<any>;
  AlertSettingsCard: React.ComponentType<any>;
  brandingTheme: { mode: string };
  handleAlertToggle: (...args: any[]) => void;
  handleAlertAddRecipient: (...args: any[]) => void;
  handleAlertRemoveRecipient: (...args: any[]) => void;
  defaultRecipientEmail: string;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  themePanelClass,
  IntegrationChecklistWidgetSettings,
  settingsSectionRefs,
  KpiSettingsTable,
  settingsData,
  settingsLoading,
  handleUpdateKpi,
  handleAddKpi,
  handleRemoveKpi,
  platformOptions,
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
  defaultRecipientEmail,
}) => {

  return (
    <div ref={settingsSectionRefs.root} className="space-y-8">
      <IntegrationChecklistWidgetSettings containerRef={settingsSectionRefs.integrations} />
      <section ref={settingsSectionRefs.header} className={themePanelClass}>
        <SectionTitle title="Settings" subtitle="Track and optimize your marketing campaigns" />

        <KpiSettingsTable
          settingsData={settingsData}
          settingsLoading={settingsLoading}
          onUpdateKpi={handleUpdateKpi}
          onAddKpi={handleAddKpi}
          onRemoveKpi={handleRemoveKpi}
          platformOptions={platformOptions}
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
            defaultRecipientEmail={defaultRecipientEmail}
          />
        </div>
      </section>
    </div>
  );
};

export default SettingsSection;
