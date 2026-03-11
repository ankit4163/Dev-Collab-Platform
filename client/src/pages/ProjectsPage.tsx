import React, { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";
import { projectsApi } from "../services/api";

export const ProjectsPage: React.FC = () => {
  const { projects, loading, error, refetch } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await projectsApi.createProject({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      setShowForm(false);
      refetch();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Projects</h1>
          <p className="mt-1 text-surface-500">Create and manage your projects</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shrink-0"
        >
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-surface-300 px-3 py-2 text-sm"
              placeholder="Project name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full max-w-md rounded-lg border border-surface-300 px-3 py-2 text-sm"
              placeholder="Optional description"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create project"}
          </button>
        </form>
      )}

      {error && <p className="text-rose-600 text-sm">{error}</p>}
      {loading ? (
        <p className="text-surface-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
          {projects.length === 0 && (
            <p className="text-surface-500 col-span-full">No projects yet. Create one above.</p>
          )}
        </div>
      )}
    </div>
  );
};
