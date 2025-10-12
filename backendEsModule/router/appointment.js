import { authentication } from "../middleware/authentication.js"; 
import express from "express";
import {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  rejectAppointment,
  getAppointmentsByFreelancer,
  createAppointmentByAdmin,
  markAppointmentCompleted
} from "../controller/appointment.js";

const appointmentsRouter = express.Router();

appointmentsRouter.post("/admin/appointments", authentication, createAppointmentByAdmin);
appointmentsRouter.post("/", authentication, makeAppointment);
appointmentsRouter.patch("/reschedule/:appointment_id", authentication, rescheduleAppointment);
appointmentsRouter.patch("/accept/:appointment_id", authentication, acceptAppointment);
appointmentsRouter.patch("/reject/:appointment_id", authentication, rejectAppointment);
appointmentsRouter.patch("/complete/:appointment_id", authentication, markAppointmentCompleted);
appointmentsRouter.get("/get", authentication, getAllAppointments);
appointmentsRouter.get("/my", authentication, getAppointmentsByFreelancer);

export default appointmentsRouter;