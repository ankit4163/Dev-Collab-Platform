import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

export const useSocketProjectTasks = (
  projectId: string,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { socket } = useAuth();
  useEffect(() => {
    if (!projectId || !socket) return;
    socket.emit("join:project", projectId);
    const onCreated = (task: Task) => {
      setTasks((prev) => [task, ...prev]);
    };
    const onUpdated = (task: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };
    const onMoved = (task: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };
    const onDeleted = (payload: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t._id !== payload.id));
    };
    socket.on("taskCreated", onCreated);
    socket.on("taskUpdated", onUpdated);
    socket.on("taskMoved", onMoved);
    socket.on("taskDeleted", onDeleted);
    return () => {
      socket.emit("leave:project", projectId);
      socket.off("taskCreated", onCreated);
      socket.off("taskUpdated", onUpdated);
      socket.off("taskMoved", onMoved);
      socket.off("taskDeleted", onDeleted);
    };
  }, [projectId, socket, setTasks]);
};
