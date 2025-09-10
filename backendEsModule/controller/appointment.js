import { pool } from "../models/db.js";

const makeAppointment = (req, res) => {
  const freelancer_id = req.token?.userId;
  const { appointment_date, message, appointment_type } = req.body;

  if (!freelancer_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: freelancer_id missing in token",
    });
  }

  if (!appointment_date || !appointment_type) {
    return res.status(400).json({
      success: false,
      message: "appointment_date and appointment_type are required",
    });
  }

  if (!["online", "in_company"].includes(appointment_type)) {
    return res.status(400).json({
      success: false,
      message: "appointment_type must be either 'online' or 'in_company'",
    });
  }

  pool
    .query(
      `INSERT INTO appointments (freelancer_id, appointment_date, message, status, appointment_type)
       VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
      [freelancer_id, appointment_date, message || null, appointment_type]
    )
    .then((result) => {
      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        appointment: result.rows[0],
      });
    })
    .catch((err) => {
      console.error("Error creating appointment:", err);
      res.status(500).json({
        success: false,
        message: "Server error creating appointment",
        error: err.message,
      });
    });
};
const rescheduleAppointment = (req, res) => {
  const { appointment_id } = req.params;
  const { appointment_date } = req.body;

  if (!appointment_id || !appointment_date) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID and new appointment_date are required",
    });
  }

  const query = `
    UPDATE appointments
    SET appointment_date = $1
    WHERE id = $2
    RETURNING *
  `;

  pool
    .query(query, [appointment_date, appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Appointment rescheduled",
        appointment: result.rows[0],
      });
    })
    .catch((err) => {
      console.error("Error rescheduling appointment:", err);
      res.status(500).json({
        success: false,
        message: "Server error while rescheduling appointment",
        error: err.message,
      });
    });
};

const acceptAppointment = (req, res) => {
  const { appointment_id } = req.params;

  if (!appointment_id) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required",
    });
  }

  const query = `
    UPDATE appointments
    SET status = 'accepted'
    WHERE id = $1
    RETURNING *
  `;

  pool
    .query(query, [appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Appointment accepted successfully",
        appointment: result.rows[0],
      });
    })
    .catch((err) => {
      console.error("Error accepting appointment:", err);
      res.status(500).json({
        success: false,
        message: "Server error while accepting appointment",
        error: err.message,
      });
    });
};

const getAllAppointments = (req, res) => {
  const query = `
    SELECT 
      a.id,
      a.freelancer_id,
      a.appointment_date,
      a.message,
      a.status,
      a.appointment_type,  
      a.created_at,
      u.email as freelancer_email,
      u.phone_number as freelancer_phone,
      u.first_name,
      u.last_name
    FROM appointments a
    LEFT JOIN users u ON a.freelancer_id = u.id
    ORDER BY a.created_at DESC;
  `;

  pool
    .query(query)
    .then((result) => {
      res.status(200).json({
        success: true,
        appointments: result.rows,
      });
    })
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching appointments",
        error: err.message,
      });
    });
};

const getAppointmentsByFreelancer = (req, res) => {
  const freelancer_id = req.token?.userId;

  if (!freelancer_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: freelancer_id missing in token",
    });
  }

  const query = `
    SELECT 
      a.id,
      a.freelancer_id,
      a.appointment_date,
      a.message,
      a.status,
      a.appointment_type,
      a.created_at
    FROM appointments a
    WHERE a.freelancer_id = $1
    ORDER BY a.created_at DESC;
  `;

  pool
    .query(query, [freelancer_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No appointments found for this freelancer",
        });
      }

      res.status(200).json({
        success: true,
        appointments: result.rows,
      });
    })
    .catch((err) => {
      console.error("Error fetching freelancer appointments:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching appointments",
        error: err.message,
      });
    });
};

const rejectAppointment = (req, res) => {
  const { appointment_id } = req.params;

  if (!appointment_id) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required",
    });
  }

  const query = `
    UPDATE appointments
    SET status = 'rejected'
    WHERE id = $1
    RETURNING *
  `;

  pool
    .query(query, [appointment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Appointment rejected successfully",
        appointment: result.rows[0],
      });
    })
    .catch((err) => {
      console.error("Error rejecting appointment:", err);
      res.status(500).json({
        success: false,
        message: "Server error while rejecting appointment",
        error: err.message,
      });
    });
};

export {
  makeAppointment,
  rescheduleAppointment,
  acceptAppointment,
  getAllAppointments,
  getAppointmentsByFreelancer,
  rejectAppointment,
};
