import { useState, useCallback, useEffect } from "react";
import { tasksApi } from "../services/api";
import type { Task } from "../types";

export const useTasks = (projectId: string | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await tasksApi.getTasks(projectId);
      setTasks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, setTasks, loading, error, refetch: fetchTasks };
};
