import express from "express";
import { authentication } from "../../middleware/authentication.js";
import {
  createApplicantAppointment,
  createPublicApplicantAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getFilteredAppointments,
  rescheduleAppointment,
} from "../../controller/Applicants/appointment.js";

const AppointmentRouter = express.Router();

/* ===========================================================
   PUBLIC ROUTE
=========================================================== */
AppointmentRouter.post("/public", createPublicApplicantAppointment);
AppointmentRouter.get("/booked", getBookedTimes);


/* ===========================================================
   ADMIN / MANAGER ROUTES
=========================================================== */
AppointmentRouter.post("/", authentication, createApplicantAppointment);
AppointmentRouter.get("/", authentication, getAllAppointments);
AppointmentRouter.get("/filter", authentication, getFilteredAppointments);
AppointmentRouter.get("/:id", authentication, getAppointmentById);
AppointmentRouter.put("/:id", authentication, updateAppointment);
AppointmentRouter.put("/:id/reschedule", authentication, rescheduleAppointment);
AppointmentRouter.delete("/:id", authentication, deleteAppointment);

export default AppointmentRouter;
