const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from 'client' folder
app.use(express.static(path.join(__dirname, "client")));

// Send index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  let multiplier = 1.0;
  const interval = setInterval(() => {
    multiplier += Math.random();
    socket.emit("multiplier", multiplier.toFixed(2));
  }, 1000);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
    clearInterval(interval);
  });
});

// Connect to DB and start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
