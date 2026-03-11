import { io } from "socket.io-client";

const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: ReturnType<typeof io> | null = null;

export const getSocket = (token: string | null) => {
  if (!token) return null;
  if (socket?.connected) return socket;
  socket = io(wsUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
