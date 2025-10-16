import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

const makeAppointment = (req, res) => {
  const freelancer_id = req.token?.userId;
  const { appointment_date, message, appointment_type } = req.body;

  if (!freelancer_id) {
    return res.status(401).json({ success: false, message: "Unauthorized: freelancer_id missing in token" });
  }
  if (!appointment_date || !appointment_type) {
    return res.status(400).json({ success: false, message: "appointment_date and appointment_type are required" });
  }
  if (!["online", "in_company"].includes(appointment_type)) {
    return res.status(400).json({ success: false, message: "appointment_type must be either 'online' or 'in_company'" });
  }

  pool.query(
      `INSERT INTO appointments (freelancer_id, appointment_date, message, status, appointment_type)
       VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
      [freelancer_id, appointment_date, message || null, appointment_type]
    )
    .then((result) => {
      const newAppointment = result.rows[0];

      try {
        // NOTE: This creator function needs to be added to your notificationService.
        // It should get all admin IDs and send them a notification.
        NotificationCreators.appointmentRequested(newAppointment.id, newAppointment.appointment_date, req.token.username);
      } catch(e) {
        console.error("Failed to create appointment request notification:", e);
      }

      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        appointment: newAppointment,
      });
    })
    .catch((err) => {
      console.error("Error creating appointment:", err);
      res.status(500).json({ success: false, message: "Server error creating appointment", error: err.message });
    });
};

const rescheduleAppointment = (req, res) => {
  const { appointment_id } = req.params;
  const { appointment_date } = req.body;

  if (!appointment_id || !appointment_date) {
    return res.status(400).json({ success: false, message: "Appointment ID and new appointment_date are required" });
  }

  const query = `UPDATE appointments SET appointment_date = $1 WHERE id = $2 RETURNING *`;

  pool.query(query, [appointment_date, appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      const rescheduledAppointment = result.rows[0];

      try {
        const details = `on ${new Date(rescheduledAppointment.appointment_date).toLocaleString()}`;
        NotificationCreators.appointmentRescheduled(rescheduledAppointment.id, rescheduledAppointment.freelancer_id, details);
      } catch(e) {
        console.error("Failed to create appointment reschedule notification:", e);
      }

      res.status(200).json({
        success: true,
        message: "Appointment rescheduled",
        appointment: rescheduledAppointment,
      });
    })
    .catch((err) => {
      console.error("Error rescheduling appointment:", err);
      res.status(500).json({ success: false, message: "Server error while rescheduling appointment", error: err.message });
    });
};

const acceptAppointment = (req, res) => {
  const { appointment_id } = req.params;

  if (!appointment_id) {
    return res.status(400).json({ success: false, message: "Appointment ID is required" });
  }

  const query = `UPDATE appointments SET status = 'accepted' WHERE id = $1 RETURNING *`;

  pool.query(query, [appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      const acceptedAppointment = result.rows[0];

      try {
        const details = `for ${new Date(acceptedAppointment.appointment_date).toLocaleString()}`;
        NotificationCreators.appointmentStatusChanged(acceptedAppointment.id, acceptedAppointment.freelancer_id, details, true);
      } catch(e) {
        console.error("Failed to create appointment acceptance notification:", e);
      }

      res.status(200).json({
        success: true,
        message: "Appointment accepted successfully",
        appointment: acceptedAppointment,
      });
    })
    .catch((err) => {
      console.error("Error accepting appointment:", err);
      res.status(500).json({ success: false, message: "Server error while accepting appointment", error: err.message });
    });
};

const getAllAppointments = (req, res) => {
  const query = `
    SELECT a.id, a.freelancer_id, a.appointment_date, a.message, a.status, a.appointment_type, a.created_at,
           u.email as freelancer_email, u.phone_number as freelancer_phone, u.first_name, u.last_name
    FROM appointments a
    LEFT JOIN users u ON a.freelancer_id = u.id
    ORDER BY a.created_at DESC;
  `;

  pool.query(query)
    .then((result) => {
      res.status(200).json({ success: true, appointments: result.rows });
    })
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      res.status(500).json({ success: false, message: "Server error while fetching appointments", error: err.message });
    });
};

const getAppointmentsByFreelancer = (req, res) => {
  const freelancer_id = req.token?.userId;

  if (!freelancer_id) {
    return res.status(401).json({ success: false, message: "Unauthorized: freelancer_id missing in token" });
  }

  const query = `
    SELECT a.id, a.freelancer_id, a.appointment_date, a.message, a.status, a.appointment_type, a.created_at
    FROM appointments a
    WHERE a.freelancer_id = $1
    ORDER BY a.created_at DESC;
  `;

  pool.query(query, [freelancer_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "No appointments found for this freelancer" });
      }
      res.status(200).json({ success: true, appointments: result.rows });
    })
    .catch((err) => {
      console.error("Error fetching freelancer appointments:", err);
      res.status(500).json({ success: false, message: "Server error while fetching appointments", error: err.message });
    });
};

const rejectAppointment = (req, res) => {
  const { appointment_id } = req.params;

  if (!appointment_id) {
    return res.status(400).json({ success: false, message: "Appointment ID is required" });
  }

  const query = `UPDATE appointments SET status = 'rejected' WHERE id = $1 RETURNING *`;

  pool.query(query, [appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      const rejectedAppointment = result.rows[0];

      try {
        const details = `for ${new Date(rejectedAppointment.appointment_date).toLocaleString()}`;
        NotificationCreators.appointmentStatusChanged(rejectedAppointment.id, rejectedAppointment.freelancer_id, details, false);
      } catch(e) {
        console.error("Failed to create appointment rejection notification:", e);
      }

      res.status(200).json({
        success: true,
        message: "Appointment rejected successfully",
        appointment: rejectedAppointment,
      });
    })
    .catch((err) => {
      console.error("Error rejecting appointment:", err);
      res.status(500).json({ success: false, message: "Server error while rejecting appointment", error: err.message });
    });
};

const createAppointmentByAdmin = (req, res) => {
  const { freelancer_id, appointment_date, message, appointment_type } = req.body;

  if (!freelancer_id || !appointment_date || !appointment_type) {
    return res.status(400).json({ success: false, message: "freelancer_id, appointment_date and appointment_type are required" });
  }
  if (!["online", "in_company"].includes(appointment_type)) {
    return res.status(400).json({ success: false, message: "appointment_type must be either 'online' or 'in_company'" });
  }

  pool.query(
      `INSERT INTO appointments (freelancer_id, appointment_date, message, status, appointment_type)
       VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
      [freelancer_id, appointment_date, message || null, appointment_type]
    )
    .then((result) => {
      const newAppointment = result.rows[0];

      try {
        const details = `on ${new Date(newAppointment.appointment_date).toLocaleString()} has been scheduled for you by an admin.`;
        NotificationCreators.appointmentStatusChanged(newAppointment.id, newAppointment.freelancer_id, details, true);
      } catch(e) {
        console.error("Failed to create admin-scheduled appointment notification:", e);
      }

      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        appointment: newAppointment,
      });
    })
    .catch((err) => {
      console.error("Error creating appointment:", err);
      res.status(500).json({ success: false, message: "Server error creating appointment", error: err.message });
    });
};

const markAppointmentCompleted = (req, res) => {
  const { appointment_id } = req.params;
  const admin_id = req.token?.userId;

  if (!appointment_id) {
    return res.status(400).json({ success: false, message: "Appointment ID is required" });
  }

  const query = `
    UPDATE appointments 
    SET status = 'completed', completed_at = NOW(), completed_by = $1
    WHERE id = $2 RETURNING *`;

  pool.query(query, [admin_id, appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      const completedAppointment = result.rows[0];

      try {
        // NOTE: You may need to add an 'APPOINTMENT_COMPLETED' type and creator function.
        const details = `on ${new Date(completedAppointment.appointment_date).toLocaleString()}`;
        NotificationCreators.appointmentCompleted(completedAppointment.id, completedAppointment.freelancer_id, details);
      } catch(e) {
        console.error("Failed to create appointment completion notification:", e);
      }

      res.status(200).json({
        success: true,
        message: "Appointment marked as completed successfully",
        appointment: completedAppointment,
      });
    })
    .catch((err) => {
      console.error("Error marking appointment as completed:", err);
      res.status(500).json({ success: false, message: "Server error while marking appointment as completed", error: err.message });
    });
};

export {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  getAppointmentsByFreelancer,
  rejectAppointment,
  createAppointmentByAdmin,
  markAppointmentCompleted  
};
