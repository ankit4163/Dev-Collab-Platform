import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { projectsApi, tasksApi } from "../services/api";
import { useTasks } from "../hooks/useTasks";
import type { Project as ProjectType, Task } from "../types";
import { KanbanBoard } from "../components/KanbanBoard";
import { useSocketProjectTasks } from "../hooks/useSocketProjectTasks";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tasks, setTasks, loading: tasksLoading, refetch } = useTasks(id);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [creating, setCreating] = useState(false);

  useSocketProjectTasks(id || "", setTasks);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    projectsApi
      .getProject(id)
      .then(({ data }) => {
        if (!cancelled) setProject(data);
      })
      .catch(() => {
        if (!cancelled) setError("Project not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTitle.trim()) return;
    setCreating(true);
    try {
      await tasksApi.createTask({
        projectId: id,
        title: newTitle.trim(),
        priority: newPriority,
      });
      setNewTitle("");
      setShowTaskForm(false);
      refetch();
    } finally {
      setCreating(false);
    }
  };

  if (loading || !id) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-surface-500">Loading…</p>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="rounded-lg bg-rose-50 px-4 py-3 text-rose-700">
        {error || "Project not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-surface-500">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowTaskForm(!showTaskForm)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shrink-0"
        >
          {showTaskForm ? "Cancel" : "Add task"}
        </button>
      </div>

      {showTaskForm && (
        <form onSubmit={handleCreateTask} className="rounded-xl border border-surface-200 bg-white p-4 shadow-sm flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-surface-700">Task title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm"
              placeholder="Task title"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-surface-700">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
              className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {creating ? "Adding…" : "Add task"}
          </button>
        </form>
      )}

      {tasksLoading ? (
        <p className="text-surface-500">Loading tasks…</p>
      ) : (
        <KanbanBoard
          projectId={id}
          tasks={tasks}
          onTasksChange={setTasks}
        />
      )}
    </div>
  );
};
