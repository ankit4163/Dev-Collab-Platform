import { Response } from "express";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { AuthRequest } from "../middleware/auth";

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, title, description, assignedTo, priority, dueDate } = req.body;
    if (!projectId || !title) {
      res.status(400).json({ message: "Project ID and title are required" });
      return;
    }
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    const task = await Task.create({
      projectId,
      title,
      description: description || "",
      assignedTo: assignedTo || undefined,
      status: "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user!.id,
    });
    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");
    const emitToProject = (req as any).app.get("emitToProject");
    if (emitToProject) emitToProject(projectId, "taskCreated", populated || task);
    res.status(201).json(populated || task);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasksByProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    await task.save();
    const updated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");
    const emitToProject = (req as any).app.get("emitToProject");
    if (emitToProject) {
      emitToProject(task.projectId.toString(), "taskUpdated", updated || task);
      if (status !== undefined) emitToProject(task.projectId.toString(), "taskMoved", updated || task);
    }
    res.json(updated || task);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    const projectId = task.projectId.toString();
    await Task.findByIdAndDelete(req.params.id);
    const emitToProject = (req as any).app.get("emitToProject");
    if (emitToProject) emitToProject(projectId, "taskDeleted", { id: req.params.id });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
