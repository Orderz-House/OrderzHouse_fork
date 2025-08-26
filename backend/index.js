const express = require("express");
const rateLimit=require("express-rate-limit");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

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

const server = http.createServer(app);
const initSocket = require("./sockets/socket");
const io = initSocket(server);


if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
