import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

const getMessagesByProjectId = async (req,res)=>{
    const {projectId} = req.params;
       pool.query(`SELECT 
  m.*,
  json_build_object(
    'id', u.id,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'username', u.username,
    'email', u.email,
    'sender_avatar', u.profile_pic_url
  ) AS sender
FROM messages m
JOIN users u ON u.id = m.sender_id
WHERE m.project_id = $1
ORDER BY m.time_sent ASC;`, [projectId]).then((result) => {
         res.status(200).json({ success: true, messages: result.rows });
       }).catch((err) => {
        console.error("Error getting messages:", err);
        res.status(500).json({ success: false, message: "Server error" });
       });
}

/**
 * @desc Create a new message in a project chat.
 * @route POST /api/messages
 */
const createMessage = async (req, res) => {
  const sender_id = req.token?.userId;
  const { project_id, receiver_id, content } = req.body;

  if (!sender_id || !project_id || !receiver_id || !content) {
    return res.status(400).json({
      success: false,
      message: "sender_id, project_id, receiver_id, and content are required.",
    });
  }

  try {
    // Insert the new message into the database
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, project_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sender_id, receiver_id, project_id, content]
    );
    const newMessage = result.rows[0];

    try {
      // This creator function notifies the receiver_id that they got a message.
      await NotificationCreators.messageReceived(receiver_id, newMessage.id, content);
    } catch (notificationError) {
      console.error(`Failed to create message notification for receiver ${receiver_id}:`, notificationError);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      sentMessage: newMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
      error: err.message,
    });
  }
};


export {
    getMessagesByProjectId,
    createMessage 
};
