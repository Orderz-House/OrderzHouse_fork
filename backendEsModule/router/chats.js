import express from "express";
import {
  getMessagesByProjectId,
  getMessagesByTaskId,
  createMessage,
} from "../controller/chats.js";
import { authentication } from "../middleware/authentication.js";

const chatsRouter = express.Router();

// Get all messages by project
chatsRouter.get("/project/:projectId/messages", authentication, getMessagesByProjectId);

// Get all messages by task
chatsRouter.get("/task/:taskId/messages", authentication, getMessagesByTaskId);

// Create a new message
chatsRouter.post("/messages", authentication, createMessage);

export default chatsRouter;
