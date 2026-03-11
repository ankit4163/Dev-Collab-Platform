import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import { initSockets, emitToProject } from "./sockets";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const io = initSockets(httpServer);
app.set("io", io);
app.set("emitToProject", (projectId: string, event: string, payload: unknown) =>
  emitToProject(io, projectId, event, payload)
);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
