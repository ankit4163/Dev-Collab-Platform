import React from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="block rounded-xl border border-surface-200 bg-white p-5 shadow-sm hover:border-primary-200 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-surface-900 truncate">{project.name}</h3>
      <p className="mt-1 text-sm text-surface-500 line-clamp-2">{project.description || "No description"}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-surface-400">
        <span>{Array.isArray(project.members) ? project.members.length : 0} members</span>
      </div>
    </Link>
  );
};
