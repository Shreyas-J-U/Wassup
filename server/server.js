import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// ====== CONFIGURATION ======
const allowedOrigins = [
  "https://wassup-1fmu12y3v-shreyas-j-us-projects.vercel.app",
  "https://wassup-black.vercel.app", // ✅ Add all frontend domains here
];

const PORT = process.env.PORT || 5000;

// ====== INIT ======
const app = express();
const server = http.createServer(app);

// ====== CORS MIDDLEWARE ======
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token"],
  })
);

// Optional: handle preflight requests (if needed manually)
app.options("*", cors());

// ====== BODY PARSER ======
app.use(express.json({ limit: "4mb" }));

// ====== ROUTES ======
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ====== SOCKET.IO SETUP ======
export const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Socket.io CORS Error"));
      }
    },
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
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ====== GLOBAL ERROR HANDLER (for CORS on errors like 401) ======
app.use((err, req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// ====== CONNECT DB + START SERVER ======
await connectDB();

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () =>
    console.log("🚀 Server running on http://localhost:" + PORT)
  );
}

// Export server for Vercel compatibility
export default server;
