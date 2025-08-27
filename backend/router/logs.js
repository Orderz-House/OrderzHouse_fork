const express = require("express");

const {getMessageLogs} = require("../controller/logs");
const { authentication } = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const logsRouter = express.Router();

logsRouter.get("/messages", authentication ,authorization("view_logs"), getMessageLogs)

module.exports = logsRouter