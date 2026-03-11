import React from "react";
import { useProjects } from "../hooks/useProjects";

export const TeamPage: React.FC = () => {
  const { projects, loading, error } = useProjects();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Team</h1>
        <p className="mt-1 text-surface-500">Team members across your projects</p>
      </div>

      <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">Overview</h2>
        {error && <p className="mt-2 text-rose-600 text-sm">{error}</p>}
        {loading ? (
          <p className="mt-2 text-surface-500">Loading…</p>
        ) : (
          <p className="mt-2 text-surface-600">
            You have <strong>{projects.length}</strong> project(s). Invite team members from each project settings (expand in a future iteration).
          </p>
        )}
      </div>
    </div>
  );
};
