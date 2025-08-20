import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.split(" ")[1];
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (e) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 socket connected:", socket.user.userId);

    socket.on("disconnect", () => {
      console.log("🔌 socket disconnected:", socket.user.userId);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
