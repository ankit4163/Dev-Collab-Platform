import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import type { Task } from "../types";

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
};
