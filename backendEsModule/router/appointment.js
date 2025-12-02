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

const appointmentRouter = express.Router();

appointmentRouter.post("/admin/appointments", authentication, createAppointmentByAdmin);
appointmentRouter.post("/", authentication, makeAppointment);
appointmentRouter.patch("/reschedule/:appointment_id", authentication, rescheduleAppointment);
appointmentRouter.patch("/accept/:appointment_id", authentication, acceptAppointment);
appointmentRouter.patch("/reject/:appointment_id", authentication, rejectAppointment);
appointmentRouter.patch("/complete/:appointment_id", authentication, markAppointmentCompleted);
appointmentRouter.get("/get", authentication, getAllAppointments);
appointmentRouter.get("/my", authentication, getAppointmentsByFreelancer);

export default appointmentRouter;