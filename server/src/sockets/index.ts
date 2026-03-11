import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export const initSockets = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:project", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("leave:project", (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
};

export const emitToProject = (
  io: Server,
  projectId: string,
  event: string,
  payload: unknown
): void => {
  io.to(`project:${projectId}`).emit(event, payload);
};
