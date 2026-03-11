import React from "react";
import type { Task } from "../types";
import { formatDate } from "../utils/format";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

const priorityColors = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDragging }) => {
  const assignedName = typeof task.assignedTo === "object" && task.assignedTo ? (task.assignedTo as { name?: string }).name : "Unassigned";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`rounded-lg border border-surface-200 bg-white p-3 shadow-sm cursor-pointer transition-shadow hover:shadow-md text-left ${
        isDragging ? "opacity-90 shadow-lg ring-2 ring-primary-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-surface-900 text-sm line-clamp-1 flex-1">{task.title}</span>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description ? (
        <p className="mt-1 text-xs text-surface-500 line-clamp-2">{task.description}</p>
      ) : null}
      <div className="mt-2 flex items-center justify-between text-xs text-surface-400">
        <span>{assignedName}</span>
        {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
      </div>
    </div>
  );
};
