import express from "express";

import { getMessageLogs } from "../controller/logs.js";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
const logsRouter = express.Router();

logsRouter.get("/messages", authentication ,authorization("view_logs"), getMessageLogs)

export default logsRouter