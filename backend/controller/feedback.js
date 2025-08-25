const {pool} = require("../models/db");

const addFeedback = (req, res) => {
  const { user_id, content, type } = req.body;

  if (!user_id || !content || !type) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  pool
    .query(
      `INSERT INTO feedbacks (user_id, content, type) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, content, type]
    )
    .then((result) => {
      res.status(201).json({
        success: true,
        message: "Feedback added successfully",
        feedback: result.rows[0],
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Error adding feedback",
        error: err.message,
      });
    });
};

const pool = require("../models/db");

const viewFeedbacksById = (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT id, user_id, content, type, created_at
    FROM feedbacks
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  pool
    .query(query, [userId])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No feedback found for this user",
        });
      }

      res.status(200).json({
        success: true,
        feedbacks: result.rows,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Error fetching feedbacks",
        error: err.message,
      });
    });
};

module.exports = {
  addFeedback,
  viewFeedbacksById,
};
