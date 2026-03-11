import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/login", { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/signup", { name, email, password }),
  me: () => api.get<{ user: { id: string; name: string; email: string } }>("/api/auth/me"),
};

export const projectsApi = {
  getProjects: () => api.get<import("../types").Project[]>("/api/projects"),
  getProject: (id: string) => api.get<import("../types").Project>(`/api/projects/${id}`),
  createProject: (data: { name: string; description?: string }) => api.post<import("../types").Project>("/api/projects", data),
  updateProject: (id: string, data: Partial<{ name: string; description: string }>) => api.put<import("../types").Project>(`/api/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/api/projects/${id}`),
};

export const tasksApi = {
  getTasks: (projectId: string) => api.get<import("../types").Task[]>(`/api/tasks/${projectId}`),
  createTask: (data: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo?: string;
    priority?: import("../types").TaskPriority;
    dueDate?: string;
  }) => api.post<import("../types").Task>("/api/tasks", data),
  updateTask: (id: string, data: Partial<{
    title: string;
    description: string;
    assignedTo: string;
    status: import("../types").TaskStatus;
    priority: import("../types").TaskPriority;
    dueDate: string;
  }>) => api.put<import("../types").Task>(`/api/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
};
