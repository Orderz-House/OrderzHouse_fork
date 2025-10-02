import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

import { AdminInit } from "./Admin.js";

// Routers
import tasksRouter from "./router/tasks.js";        
import usersRouter from "./router/user.js";
import plansRouter from "./router/plans.js";
import feedbackRouter from "./router/feedback.js";
import appointmentsRouter from "./router/appointment.js";
import coursesRouter from "./router/courses.js";
import ordersRouter from "./router/orders.js";
import logsRouter from "./router/logs.js";
import projectsRouter from "./router/projects.js";
import verificationRouter from "./router/verification.js";
import newsRouter from "./router/news.js";
// import categoriesRouter from "./router/categories.js";
import analyticsRoutes from "./Admin/routes/analyticsRoutes.js";
import subscriptionsRouter from "./router/subscriptions.js";
import adminRouter from "./router/adminUsers.js";
import earningsRouter from "./router/earning.js";
import uploadRouter from "./router/projectFilesUser.js";
import chatsRouter from "./router/chats.js";
import notificationsRouter from "./router/notifications.js";
import paymentsRouter from "./router/payments.js";

// DB connection
import "./models/db.js";
dotenv.config();

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Rate limiter (optional)
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "try again later",
});
app.use(limiter);
*/

// ✅ Routers
app.use("/tasks", tasksRouter);
app.use("/uploads", uploadRouter);
app.use("/admins", adminRouter);
app.use("/earnings", earningsRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/news", newsRouter);
app.use("/verification", verificationRouter);
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use("/plans", plansRouter);
app.use("/orders", ordersRouter);
app.use("/feedbacks", feedbackRouter);
app.use("/appointments", appointmentsRouter);
app.use("/logs", logsRouter);
app.use("/courses", coursesRouter);
// app.use("/categories", categoriesRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/chats", chatsRouter);
app.use("/notifications", notificationsRouter);
app.use("/payments", paymentsRouter);

// ✅ Admin init
(async () => {
  await AdminInit(app);
})();

let server, io;

if (process.env.NODE_ENV !== "test") {
  server = http.createServer(app);
  const { default: initSocket } = await import("./sockets/socket.js");
  io = initSocket(server);

  const startServer = (portToUse) => {
    server.once("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(
          `⚠️ Port ${portToUse} in use. Retrying with a random free port...`
        );
        server.close(() => startServer(0));
        return;
      }
      throw err;
    });

    server.listen(portToUse, () => {
      const addressInfo = server.address();
      const boundPort =
        typeof addressInfo === "object" && addressInfo
          ? addressInfo.port
          : portToUse;

      console.log(`✅ Server listening at http://localhost:${boundPort}`);
    });
  };

  startServer(PORT);
} else {
  // For tests, create minimal server without socket.io
  server = http.createServer(app);
  io = null;
}

export { app, server, io };