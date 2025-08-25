const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.set("trust proxy", 1);
}
app.use(cors());
app.use(express.json());

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "try again later",
});
app.use(limiter);

// db connection
require("./models/db");

// routes
const usersRouter = require("./router/user");
const plansRouter = require("./router/plans");
const feedbackRouter = require("./router/feedback");
const appointmentsRouter = require("./router/appointment");
const coursesRouter = require("./router/courses");
const ordersRouter = require("./router/orders");

app.use("/users", usersRouter);
app.use("/plans", plansRouter);
app.use("/orders", require("./router/orders"));
app.use("/feedbacks", feedbackRouter);
app.use("/appointments", appointmentsRouter);

app.use("/courses", coursesRouter);
app.use("/orders", ordersRouter);

// create http server
const server = http.createServer(app);

// socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // غيرها لفرونتك بال production
    methods: ["GET", "POST"],
  },
});

// socket events
io.on("connection", (socket) => {
  console.log("🔌 client connected:", socket.id);

  socket.on("message", (msg) => {
    console.log("📩 message:", msg);
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ client disconnected:", socket.id);
  });
});

// start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
