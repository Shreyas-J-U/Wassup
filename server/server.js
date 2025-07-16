import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// ====== CONFIGURATION ======
const FRONTEND_ORIGIN = "https://wassup-1fmu12y3v-shreyas-j-us-projects.vercel.app";
const PORT = process.env.PORT || 5000;

// ====== EXPRESS SETUP ======
const app = express();
const server = http.createServer(app);

// CORS Middleware for HTTP APIs
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

// ====== ROUTES ======
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ====== SOCKET.IO SETUP ======
export const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // fixed typo: "getOnlineUser" → "getOnlineUsers"
  });
});

// ====== DATABASE CONNECTION ======
await connectDB();

// ====== START SERVER (for dev only) ======
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () =>
    console.log("Server is running on PORT " + PORT)
  );
}

// Export for Vercel
export default server;
