const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
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
    origin: "*", // Allow all for now
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 CryptoCrash backend is live");
});

// Socket logic
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
