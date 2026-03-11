import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "../types";
import { DraggableTaskCard } from "./DraggableTaskCard";

const COLUMN_STATUS: TaskStatus[] = ["todo", "in-progress", "done"];
const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isOver?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  isOver,
}) => {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({ id: status });
  const active = isOver ?? isDroppableOver;

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-xl border-2 bg-surface-50/50 p-4 transition-colors ${
        active ? "border-primary-400 bg-primary-50/30" : "border-surface-200"
      }`}
    >
      <h3 className="font-semibold text-surface-700 mb-3 flex items-center gap-2">
        {COLUMN_LABELS[status]}
        <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-600">
          {tasks.length}
        </span>
      </h3>
      <div className="space-y-2 min-h-[120px]">
        {tasks.map((task) => (
          <DraggableTaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
};

export { COLUMN_STATUS, COLUMN_LABELS };
