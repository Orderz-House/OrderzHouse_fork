import pool from "../../models/db.js";
import nodemailer from "nodemailer";
import twilio from "twilio";

/* ===========================================================
   CREATE APPOINTMENT (ADMIN / MANAGER)
=========================================================== */
export const createApplicantAppointment = async (req, res) => {
  try {
    const managerId = req.token?.userId;
    const roleId = req.token?.role;

    // Only Admin (1) or Manager (4) can create appointments
    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers or admins can create appointments.",
      });
    }

    const {
      survey_id,// use id as param
      appointment_date,
      appointment_time,
      appointment_type,
      interviewer_name,
      note = "",
    } = req.body;

    if (
      !survey_id ||
      !appointment_date ||
      !appointment_time ||
      !appointment_type ||
      !interviewer_name
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    if (!["online", "offline"].includes(appointment_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment_type. Must be 'online' or 'offline'.",
      });
    }

    // Verify that survey exists
    const { rows: surveyCheck } = await pool.query(
      "SELECT id FROM applicants_surveys WHERE id = $1",
      [survey_id]
    );
    if (surveyCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Applicant survey not found.",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO applicants_appointments (
        created_by, survey_id, appointment_date, appointment_time, appointment_type,
        followed_up_by, updated_by, interviewer_name, status, note,
        created_at, updated_at
      )
      VALUES ('Manager',$1,$2,$3,$4,$5,$6,$7,'scheduled',$8,NOW(),NOW())
      RETURNING *`,
      [
        survey_id,
        appointment_date,
        appointment_time,
        appointment_type,
        managerId,          // followed_up_by
        managerId,          // updated_by
        interviewer_name,
        note,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully by manager.",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("Error creating applicant appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: err.message,
    });
  }
};

/* ===========================================================
     CREATE APPOINTMENT (PUBLIC USER)
=========================================================== */
export const createPublicApplicantAppointment = async (req, res) => {
  try {
    const {
      survey_id,
      appointment_date,
      appointment_time,
      appointment_type,
      interviewer_name,
    } = req.body;

    if (
      !survey_id ||
      !appointment_date ||
      !appointment_time ||
      !appointment_type ||
      !interviewer_name
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    if (!["online", "offline"].includes(appointment_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment_type. Must be 'online' or 'offline'.",
      });
    }

    const { rows: surveyCheck } = await pool.query(
      "SELECT id FROM applicants_surveys WHERE id = $1",
      [survey_id]
    );
    if (surveyCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Applicant survey not found.",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO applicants_appointments (
        created_by, survey_id, appointment_date, appointment_time, appointment_type,
        followed_up_by, updated_by, interviewer_name, status, note,
        created_at, updated_at
      )
      VALUES ('Applicant',$1,$2,$3,$4,NULL,NULL,$5,'scheduled','',NOW(),NOW())
      RETURNING *`,
      [
        survey_id,
        appointment_date,
        appointment_time,
        appointment_type,
        interviewer_name,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully by applicant.",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("Error creating public applicant appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: err.message,
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins and managers can view all appointments.",
      });
    }

    const { rows } = await pool.query(`
      SELECT 
        a.id AS appointment_id,
        a.created_by,
        a.survey_id,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.followed_up_by,
        a.updated_by,
        a.interviewer_name,
        a.status,
        a.note,
        a.is_deleted,
        a.created_at,
        a.updated_at,
        s.first_name,
        s.last_name,
        s.phone_number,
        s.email,
        s.city,
        s.state,
        s.nationality,
        s.how_did_you_know_us,
        s.source
      FROM applicants_appointments a
      LEFT JOIN applicants_surveys s ON a.survey_id = s.id
      WHERE a.is_deleted = FALSE
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      appointments: rows,
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching appointments.",
      error: err.message,
    });
  }
};


export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins and managers can view appointment details.",
      });
    }

    const { rows } = await pool.query(
      `SELECT * FROM applicants_appointments WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    return res.status(200).json({ success: true, appointment: rows[0] });
  } catch (err) {
    console.error("Error fetching appointment by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching appointment.",
      error: err.message,
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, followed_up_by } = req.body;
    const updaterId = req.token?.userId;
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins or managers can update appointments.",
      });
    }

    const { rows: existing } = await pool.query(
      "SELECT * FROM applicants_appointments WHERE id = $1",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    const { rows } = await pool.query(
      `UPDATE applicants_appointments
       SET 
         status = COALESCE($1, status),
         note = COALESCE($2, note),
         followed_up_by = COALESCE($3, followed_up_by),
         updated_by = $4,
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, note, followed_up_by, updaterId, id]
    );

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully.",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Server error updating appointment.",
      error: err.message,
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = req.token?.role;
    const userId = req.token?.userId;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins or managers can delete appointments.",
      });
    }

    const { rows: existing } = await pool.query(
      "SELECT * FROM applicants_appointments WHERE id = $1 AND is_deleted = FALSE",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already deleted.",
      });
    }

    const { rows } = await pool.query(
      `UPDATE applicants_appointments
       SET is_deleted = TRUE,
           updated_by = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [userId, id]
    );

    return res.status(200).json({
      success: true,
      message: "Appointment marked as deleted successfully.",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("Error soft deleting appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Server error deleting appointment.",
      error: err.message,
    });
  }
};

export const getFilteredAppointments = async (req, res) => {
  try {
    const roleId = req.token?.role;
    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and managers can view appointments.",
      });
    }

    const { status, search, limit = 20, offset = 0 } = req.query;
    const conditions = ["a.is_deleted = FALSE"];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.email ILIKE $${params.length})`);
    }

    const query = `
      SELECT 
        a.*, s.first_name, s.last_name, s.email
      FROM applicants_appointments a
      LEFT JOIN applicants_surveys s ON a.survey_id = s.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY a.appointment_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await pool.query(query, params);
    return res.status(200).json({ success: true, count: rows.length, appointments: rows });
  } catch (err) {
    console.error("Error filtering appointments:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


/* ===========================================================
   RESCHEDULE APPOINTMENT (ADMIN / MANAGER)
=========================================================== */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, new_time } = req.body;
    const roleId = req.token?.role;
    const userId = req.token?.userId;

    // Only admins or managers can reschedule
    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Only admins or managers can reschedule appointments.",
      });
    }

    // Validate input
    if (!new_date || !new_time) {
      return res.status(400).json({
        success: false,
        message: "New date and time are required.",
      });
    }

    // Check if appointment exists
    const { rows: existing } = await pool.query(
      `SELECT * FROM applicants_appointments 
       WHERE id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or deleted.",
      });
    }

    // Update appointment
    const { rows } = await pool.query(
      `UPDATE applicants_appointments
       SET appointment_date = $1,
           appointment_time = $2,
           status = 'rescheduled',
           updated_by = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [new_date, new_time, userId, id]
    );

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully.",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("Error rescheduling appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Server error rescheduling appointment.",
      error: err.message,
    });
  }
};
