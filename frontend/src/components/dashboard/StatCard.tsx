import React from 'react';

type StatConfig = {
  label: string;
  value: string;
  helper?: string;
};

const StatCard: React.FC<StatConfig> = ({ label, value, helper }) => (
  <div className="theme-panel rounded-2xl px-4 py-5">
    <p className="text-xs font-semibold theme-muted uppercase ">{label}</p>
    <p className="mt-2 text-3xl font-semibold theme-text">{value}</p>
    {helper && <p className="text-xs theme-muted">{helper}</p>}
  </div>
);

export default StatCard;
export type { StatConfig };
