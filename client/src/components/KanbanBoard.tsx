import React, { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "../types";
import { KanbanColumn, COLUMN_STATUS } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { tasksApi } from "../services/api";

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId: _projectId,
  tasks,
  onTasksChange,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const tasksByStatus = COLUMN_STATUS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const task = tasks.find((t) => t._id === active.id);
      const newStatus = COLUMN_STATUS.includes(over.id as TaskStatus) ? (over.id as TaskStatus) : null;
      if (!task || !newStatus || task.status === newStatus) return;
      try {
        const { data } = await tasksApi.updateTask(task._id, { status: newStatus });
        onTasksChange(
          tasks.map((t) => (t._id === data._id ? data : t))
        );
      } catch {
        // revert on error could be done here
      }
    },
    [tasks, onTasksChange]
  );

  const handleSaveTask = useCallback(
    async (id: string, data: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "dueDate">>) => {
      const { data: updated } = await tasksApi.updateTask(id, data);
      onTasksChange(tasks.map((t) => (t._id === id ? updated : t)));
    },
    [tasks, onTasksChange]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await tasksApi.deleteTask(id);
      onTasksChange(tasks.filter((t) => t._id !== id));
    },
    [tasks, onTasksChange]
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMN_STATUS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={setModalTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rounded-lg border border-surface-200 bg-white p-3 shadow-lg">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
};
