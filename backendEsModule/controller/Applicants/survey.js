import pool from "../../models/db.js";

export const createSurveyByAdmin = async (req, res) => {
  try {
    const managerId = req.token?.userId;
    const {
      first_name, father_name, last_name, age, nationality,
      social_status, national_id, passport_id, city, state,
      degree, major, university, phone_number, email,
      how_did_you_know_us, source = "admin", notes = ""
    } = req.body;

    await pool.query(
      `INSERT INTO applicants_surveys (
        first_name, father_name, last_name, age, nationality, social_status,
        national_id, passport_id, city, state, degree, major, university,
        phone_number, email, how_did_you_know_us, source,
        assigned_to, status, notes, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,'reviewed',$19,NOW(),NOW()
      )`,
      [
        first_name, father_name, last_name, age, nationality, social_status,
        national_id, passport_id, city, state, degree, major, university,
        phone_number, email, how_did_you_know_us, source, managerId, notes
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Applicant survey created successfully by admin/manager"
    });
  } catch (err) {
    console.error("Error creating applicant survey by admin:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createSurveyByPublic = async (req, res) => {
  try {
    const {
      first_name, father_name, last_name, age, nationality,
      social_status, national_id, passport_id, city, state,
      degree, major, university, phone_number, email,
      how_did_you_know_us, source, notes = "form"
    } = req.body;

    await pool.query(
  `INSERT INTO applicants_surveys (
    first_name, father_name, last_name, age, nationality, social_status,
    national_id, passport_id, city, state, degree, major, university,
    phone_number, email, how_did_you_know_us, source, notes
  )
  VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
    $11,$12,$13,$14,$15,$16,$17,$18
  )`,
  [
    first_name, father_name, last_name, age, nationality, social_status,
    national_id, passport_id, city, state, degree, major, university,
    phone_number, email, how_did_you_know_us, source, notes
  ]
);

    return res.status(201).json({
      success: true,
      message: "Applicant survey submitted successfully"
    });
  } catch (err) {
    console.error("Error creating public applicant survey:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getAllSurveys = async (req, res) => {
  try {
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins and managers can view surveys.",
      });
    }

    const { rows } = await pool.query(`
      SELECT 
        s.*, 
        u.username AS assigned_manager_name
      FROM applicants_surveys s
      LEFT JOIN users u ON s.assigned_to = u.id
      ORDER BY s.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      surveys: rows,
    });
  } catch (err) {
    console.error("Error fetching surveys:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching surveys",
      error: err.message,
    });
  }
};

export const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const { rows } = await pool.query(
      `SELECT 
         s.*, 
         u.username AS assigned_manager_name
       FROM applicants_surveys s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    return res.status(200).json({
      success: true,
      survey: rows[0],
    });
  } catch (err) {
    console.error("Error fetching survey by ID:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleSurveyVisibility = async (req, res) => {
  try {
    const roleId = req.token?.role;
    const { id } = req.params;
    const { is_visible } = req.body;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Only admins or managers can change survey visibility.",
      });
    }

    const { rows } = await pool.query(
      `UPDATE applicants_surveys
       SET is_visible = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [is_visible, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Survey not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Survey visibility set to ${is_visible ? "visible" : "hidden"}.`,
      survey: rows[0],
    });
  } catch (err) {
    console.error("Error toggling survey visibility:", err);
    return res.status(500).json({
      success: false,
      message: "Server error toggling survey visibility.",
      error: err.message,
    });
  }
};

export const updateSurvey = async (req, res) => {
  try {
    const roleId = req.token?.role;
    const { id } = req.params;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Only admins or managers can update surveys.",
      });
    }

    const {
      first_name,
      father_name,
      last_name,
      age,
      nationality,
      social_status,
      national_id,
      passport_id,
      city,
      state,
      degree,
      major,
      university,
      phone_number,
      email,
      how_did_you_know_us,
      notes,
      assigned_to,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE applicants_surveys
       SET 
         first_name = COALESCE($1, first_name),
         father_name = COALESCE($2, father_name),
         last_name = COALESCE($3, last_name),
         age = COALESCE($4, age),
         nationality = COALESCE($5, nationality),
         social_status = COALESCE($6, social_status),
         national_id = COALESCE($7, national_id),
         passport_id = COALESCE($8, passport_id),
         city = COALESCE($9, city),
         state = COALESCE($10, state),
         degree = COALESCE($11, degree),
         major = COALESCE($12, major),
         university = COALESCE($13, university),
         phone_number = COALESCE($14, phone_number),
         email = COALESCE($15, email),
         how_did_you_know_us = COALESCE($16, how_did_you_know_us),
         notes = COALESCE($17, notes),
         assigned_to = COALESCE($18, assigned_to),
         updated_at = NOW()
       WHERE id = $19
       RETURNING *`,
      [
        first_name,
        father_name,
        last_name,
        age,
        nationality,
        social_status,
        national_id,
        passport_id,
        city,
        state,
        degree,
        major,
        university,
        phone_number,
        email,
        how_did_you_know_us,
        notes,
        assigned_to,
        id,
      ]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Survey not found" });

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully.",
      survey: rows[0],
    });
  } catch (err) {
    console.error("Error updating survey:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = req.token?.role;

    if (![1, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Only admins or managers can delete surveys.",
      });
    }

    const { rows } = await pool.query(
      `UPDATE applicants_surveys
       SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Survey not found." });

    return res.status(200).json({
      success: true,
      message: "Survey marked as deleted successfully.",
      survey: rows[0],
    });
  } catch (err) {
    console.error("Error deleting survey:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


