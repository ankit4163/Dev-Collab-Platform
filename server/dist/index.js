"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const sockets_1 = require("./sockets");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
app.get("/health", (_req, res) => res.json({ ok: true }));
const io = (0, sockets_1.initSockets)(httpServer);
app.set("io", io);
app.set("emitToProject", (projectId, event, payload) => (0, sockets_1.emitToProject)(io, projectId, event, payload));
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
