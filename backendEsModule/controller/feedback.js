import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

const addFeedback = (req, res) => {
  const user_id = req.token?.userId;
  const { freelancer_id, content, type } = req.body;

  if (!user_id || !freelancer_id || !content || !type) {
    return res.status(400).json({
      success: false,
      message: "freelancer_id, content, and type are required",
    });
  }

  pool
    .query(
      `INSERT INTO feedbacks (user_id, freelancer_id, content, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, freelancer_id, content, type]
    )
    .then((result) => {
      const newFeedback = result.rows[0];

      try {
        // This reuses the 'reviewSubmitted' creator, which is perfect for this case.
        // It notifies the freelancer (freelancer_id) that a user (req.token.username) left feedback.
        NotificationCreators.reviewSubmitted(newFeedback.id, freelancer_id, req.token.username || 'A user');
      } catch (notificationError) {
        console.error(`Failed to create feedback notification for freelancer ${freelancer_id}:`, notificationError);
      }

      res.status(201).json({
        success: true,
        message: "Feedback added successfully",
        feedback: newFeedback,
      });
    })
    .catch((err) => {
      console.error("Error adding feedback:", err);
      res.status(500).json({
        success: false,
        message: "Error adding feedback",
        error: err.message,
      });
    });
};

const viewFeedbacksById = (req, res) => {
  const { freelancerId } = req.params;

  if (!freelancerId) {
    return res.status(400).json({
      success: false,
      message: "Freelancer ID is required",
    });
  }

  const query = `
  SELECT 
    f.id,
    f.content,
    f.type,
    f.created_at,
    reviewer.id AS reviewer_id,
    freelancer.id AS freelancer_id
  FROM feedbacks f
  LEFT JOIN users reviewer ON f.user_id = reviewer.id
  LEFT JOIN users freelancer ON f.freelancer_id = freelancer.id
  WHERE f.freelancer_id = $1
  ORDER BY f.created_at DESC
`;

  pool
    .query(query, [freelancerId])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No feedback found for this freelancer",
        });
      }

      res.status(200).json({
        success: true,
        feedbacks: result.rows,
      });
    })
    .catch((err) => {
      console.error("Error fetching feedbacks by freelancer ID:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    });
};

const viewAllFeedbacks = (req, res) => {
  const query = `
  SELECT 
    f.id,
    f.content,
    f.type,
    f.created_at,
    reviewer.id AS reviewer_id,
    freelancer.id AS freelancer_id
  FROM feedbacks f
  LEFT JOIN users reviewer ON f.user_id = reviewer.id
  LEFT JOIN users freelancer ON f.freelancer_id = freelancer.id
  ORDER BY f.created_at DESC
`;

  pool
    .query(query)
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No feedbacks found",
        });
      }

      res.status(200).json({
        success: true,
        feedbacks: result.rows,
      });
    })
    .catch((err) => {
      console.error("Error fetching all feedbacks:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    });
};

export {
  addFeedback,
  viewFeedbacksById,
  viewAllFeedbacks,
};
