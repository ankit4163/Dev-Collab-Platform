import { Response } from "express";
import { Project } from "../models/Project";
import { AuthRequest } from "../middleware/auth";

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }
    const project = await Project.create({
      name,
      description: description || "",
      ownerId: req.user!.id,
      members: [req.user!.id],
    });
    res.status(201).json(project);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    })
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    }).populate("ownerId members", "name email");
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.id },
      { $set: req.body },
      { new: true }
    );
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user!.id,
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    const { Task } = await import("../models/Task");
    await Task.deleteMany({ projectId: project._id });
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
