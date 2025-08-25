const express = require("express");
const {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  getAppointmentsByFreelancer,
} = require("../controller/appointment");
const authentication = require("../middleware/authentication");

const appointmentsRouter = express.Router();

appointmentsRouter.post("/", authentication, makeAppointment);
appointmentsRouter.patch(
  "/reschedule/:appointment_id",
  authentication,
  rescheduleAppointment
);
appointmentsRouter.patch(
  "/accept/:appointment_id",
  authentication,
  acceptAppointment
);
appointmentsRouter.get("/get", authentication, getAllAppointments);

appointmentsRouter.get("/my", authentication, getAppointmentsByFreelancer);

module.exports = appointmentsRouter;
