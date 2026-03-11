"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasksByProject = exports.createTask = void 0;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const createTask = async (req, res) => {
    try {
        const { projectId, title, description, assignedTo, priority, dueDate } = req.body;
        if (!projectId || !title) {
            res.status(400).json({ message: "Project ID and title are required" });
            return;
        }
        const project = await Project_1.Project.findOne({
            _id: projectId,
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const task = await Task_1.Task.create({
            projectId,
            title,
            description: description || "",
            assignedTo: assignedTo || undefined,
            status: "todo",
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            createdBy: req.user.id,
        });
        const populated = await Task_1.Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
        const emitToProject = req.app.get("emitToProject");
        if (emitToProject)
            emitToProject(projectId, "taskCreated", populated || task);
        res.status(201).json(populated || task);
    }
    catch (err) {
        console.error("Create task error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createTask = createTask;
const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_1.Project.findOne({
            _id: projectId,
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const tasks = await Task_1.Task.find({ projectId })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (err) {
        console.error("Get tasks error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getTasksByProject = getTasksByProject;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const project = await Project_1.Project.findOne({
            _id: task.projectId,
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const { title, description, assignedTo, status, priority, dueDate } = req.body;
        if (title !== undefined)
            task.title = title;
        if (description !== undefined)
            task.description = description;
        if (assignedTo !== undefined)
            task.assignedTo = assignedTo;
        if (status !== undefined)
            task.status = status;
        if (priority !== undefined)
            task.priority = priority;
        if (dueDate !== undefined)
            task.dueDate = dueDate ? new Date(dueDate) : undefined;
        await task.save();
        const updated = await Task_1.Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
        const emitToProject = req.app.get("emitToProject");
        if (emitToProject) {
            emitToProject(task.projectId.toString(), "taskUpdated", updated || task);
            if (status !== undefined)
                emitToProject(task.projectId.toString(), "taskMoved", updated || task);
        }
        res.json(updated || task);
    }
    catch (err) {
        console.error("Update task error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const project = await Project_1.Project.findOne({
            _id: task.projectId,
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const projectId = task.projectId.toString();
        await Task_1.Task.findByIdAndDelete(req.params.id);
        const emitToProject = req.app.get("emitToProject");
        if (emitToProject)
            emitToProject(projectId, "taskDeleted", { id: req.params.id });
        res.json({ message: "Task deleted" });
    }
    catch (err) {
        console.error("Delete task error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteTask = deleteTask;
