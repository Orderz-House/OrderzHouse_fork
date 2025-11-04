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
      how_did_you_know_us, source = "form"
    } = req.body;

    await pool.query(
      `INSERT INTO applicants_surveys (
        first_name, father_name, last_name, age, nationality, social_status,
        national_id, passport_id, city, state, degree, major, university,
        phone_number, email, how_did_you_know_us, source,
        status, notes, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        'pending','',NOW(),NOW()
      )`,
      [
        first_name, father_name, last_name, age, nationality, social_status,
        national_id, passport_id, city, state, degree, major, university,
        phone_number, email, how_did_you_know_us, source
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
