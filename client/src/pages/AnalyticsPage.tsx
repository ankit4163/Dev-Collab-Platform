import React, { useMemo } from "react";
import { useProjects } from "../hooks/useProjects";
import { ChartCard } from "../components/ChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS = ["#94a3b8", "#3b82f6", "#22c55e"];

export const AnalyticsPage: React.FC = () => {
  const { projects, loading, error } = useProjects();

  const totalProjects = projects.length;

  const statusData = useMemo(
    () => [
      { name: "To Do", value: 0, fill: STATUS_COLORS[0] },
      { name: "In Progress", value: 0, fill: STATUS_COLORS[1] },
      { name: "Done", value: 0, fill: STATUS_COLORS[2] },
    ],
    []
  );

  const barData = [
    { name: "To Do", count: 0 },
    { name: "In Progress", count: 0 },
    { name: "Done", count: 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <p className="mt-1 text-surface-500">Task and project insights</p>
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}
      {loading && <p className="text-surface-500">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total projects</p>
          <p className="mt-1 text-2xl font-bold text-surface-900">{totalProjects}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Completed tasks</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">—</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Pending tasks</p>
          <p className="mt-1 text-2xl font-bold text-surface-900">—</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasks by status (bar)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Tasks by status (pie)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
