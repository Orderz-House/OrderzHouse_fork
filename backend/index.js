const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const { AdminInit } = require("./Admin");

require("dotenv").config();

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 3003;
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
const logsRouter = require("./router/logs");

app.use("/users", usersRouter);
app.use("/plans", plansRouter);
// app.use("/orders", require("./router/orders"));
app.use("/feedbacks", feedbackRouter);
app.use("/appointments", appointmentsRouter);
app.use("/logs", logsRouter);
app.use("/courses", coursesRouter);
app.use("/orders", ordersRouter);
app.use("/chats", require("./router/chats"));

(async () => {
  await AdminInit(app);
})();

let server, io;

if (process.env.NODE_ENV !== "test") {
  server = http.createServer(app);
  const initSocket = require("./sockets/socket");
  io = initSocket(server);

  server.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
  });
} else {
  // For tests, create minimal server without socket.io
  server = http.createServer(app);
  io = null;
}

module.exports = { app, server, io };
