export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: User | string;
  members: (User | string)[];
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: User | string;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  createdBy?: User | string;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}
