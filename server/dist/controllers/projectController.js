"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const Project_1 = require("../models/Project");
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: "Project name is required" });
            return;
        }
        const project = await Project_1.Project.create({
            name,
            description: description || "",
            ownerId: req.user.id,
            members: [req.user.id],
        });
        res.status(201).json(project);
    }
    catch (err) {
        console.error("Create project error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const projects = await Project_1.Project.find({
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        })
            .populate("ownerId", "name email")
            .sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (err) {
        console.error("Get projects error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const project = await Project_1.Project.findOne({
            _id: req.params.id,
            $or: [{ ownerId: req.user.id }, { members: req.user.id }],
        }).populate("ownerId members", "name email");
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.json(project);
    }
    catch (err) {
        console.error("Get project error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const project = await Project_1.Project.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.id }, { $set: req.body }, { new: true });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.json(project);
    }
    catch (err) {
        console.error("Update project error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const project = await Project_1.Project.findOneAndDelete({
            _id: req.params.id,
            ownerId: req.user.id,
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const { Task } = await Promise.resolve().then(() => __importStar(require("../models/Task")));
        await Task.deleteMany({ projectId: project._id });
        res.json({ message: "Project deleted" });
    }
    catch (err) {
        console.error("Delete project error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteProject = deleteProject;
