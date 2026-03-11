"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToProject = exports.initSockets = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const initSockets = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: process.env.CORS_ORIGIN || "*" },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("Authentication required"));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            next();
        }
        catch {
            next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        socket.on("join:project", (projectId) => {
            socket.join(`project:${projectId}`);
        });
        socket.on("leave:project", (projectId) => {
            socket.leave(`project:${projectId}`);
        });
    });
    return io;
};
exports.initSockets = initSockets;
const emitToProject = (io, projectId, event, payload) => {
    io.to(`project:${projectId}`).emit(event, payload);
};
exports.emitToProject = emitToProject;
