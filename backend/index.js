import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.route.js";
import codeRoutes from "./routes/code.route.js";
import aiRoutes from "./routes/ai.route.js"; // <-- 1. ADDED AI ROUTE IMPORT
import { handleSocketConnection } from "./controllers/socket.controller.js";

// 1. Bulletproof path resolution for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const httpServer = createServer(app);

// 👉 UPDATED: Added your live Vercel URL to Socket.io CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174",
      "https://coderace-live.vercel.app" 
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// MAKE IO GLOBAL: This allows your code.controller.js to broadcast wins!
global.io = io;

// 👉 UPDATED: Added your live Vercel URL to Express CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5174",
    "https://coderace-live.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/code", codeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes); // <-- 2. ADDED AI ROUTE MOUNT

// Sanity check route to ensure Express is working
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", platform: "CodeRace" });
});

// The entry point for all real-time multiplayer connections
io.on("connection", (socket) => handleSocketConnection(io, socket));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 CodeRace backend running on port ${PORT}`);
});