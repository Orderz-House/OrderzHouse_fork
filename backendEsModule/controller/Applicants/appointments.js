import pool from "../../models/db.js";

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
      survey_id,
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
