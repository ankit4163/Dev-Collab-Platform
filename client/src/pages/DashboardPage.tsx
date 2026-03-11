import React from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";
import { ChartCard } from "../components/ChartCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const DashboardPage: React.FC = () => {
  const { projects, loading, error } = useProjects();

  const totalProjects = projects.length;
  const recentProjects = projects.slice(0, 4);

  const statusData = [
    { name: "To Do", count: 0 },
    { name: "In Progress", count: 0 },
    { name: "Done", count: 0 },
  ];
  // In a full impl you'd aggregate tasks across projects; here we show placeholder
  const chartData = statusData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-surface-500">Overview of your projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total projects</p>
          <p className="mt-1 text-2xl font-bold text-surface-900">{totalProjects}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{totalProjects}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Tasks (all projects)</p>
          <p className="mt-1 text-2xl font-bold text-surface-900">—</p>
        </div>
      </div>

      <ChartCard title="Tasks by status">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Recent projects</h2>
          <Link to="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        {error && (
          <p className="text-rose-600 text-sm">{error}</p>
        )}
        {loading ? (
          <p className="text-surface-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
            {recentProjects.length === 0 && (
              <p className="text-surface-500 col-span-full">No projects yet. Create one from Projects.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
