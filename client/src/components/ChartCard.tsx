import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-surface-700 mb-4">{title}</h3>
      {children}
    </div>
  );
};
