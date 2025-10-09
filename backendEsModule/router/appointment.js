import { authentication } from "../middleware/authentication.js"; 

import express from "express";
import {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  rejectAppointment,
  getAppointmentsByFreelancer,
  createAppointmentByAdmin
} from "../controller/appointment.js";

const appointmentsRouter = express.Router();



appointmentsRouter.post("/admin/appointments", createAppointmentByAdmin);
appointmentsRouter.post("/", makeAppointment);
appointmentsRouter.patch("/reschedule/:appointment_id", rescheduleAppointment);
appointmentsRouter.patch("/accept/:appointment_id", acceptAppointment);
appointmentsRouter.patch("/reject/:appointment_id", rejectAppointment);
appointmentsRouter.get("/get", getAllAppointments);
appointmentsRouter.get("/my", getAppointmentsByFreelancer);

export default appointmentsRouter;
