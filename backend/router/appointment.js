const express = require("express");
const { createAppointment } = require("../controller/appointment");
const authentication = require("../middleware/authentication");
const appointmentsRouter = express.Router();

appointmentsRouter.post("/", authentication, createAppointment);

module.exports = appointmentsRouter;
