import express from "express";
import {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  getAppointmentsByFreelancer,
} from "../controller/appointment.js";
import { authentication } from "../middleware/authentication.js";

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

export default appointmentsRouter;
