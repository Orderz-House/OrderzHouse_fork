import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

/**
 * Get all messages in a project chat
 */
export const getMessagesByProjectId = async (req, res) => {
  const { projectId } = req.params;
  try {
    const query = `
      SELECT 
        m.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'username', u.username,
          'email', u.email,
          'avatar', u.profile_pic_url
        ) AS sender
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.project_id = $1
      ORDER BY m.time_sent ASC
    `;
    const { rows } = await pool.query(query, [projectId]);
    res.status(200).json({ success: true, messages: rows });
  } catch (error) {
    console.error("Error getting project messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get all messages in a task chat
 */
export const getMessagesByTaskId = async (req, res) => {
  const { taskId } = req.params;
  try {
    const query = `
      SELECT 
        m.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'username', u.username,
          'email', u.email,
          'avatar', u.profile_pic_url
        ) AS sender
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.task_id = $1
      ORDER BY m.time_sent ASC
    `;
    const { rows } = await pool.query(query, [taskId]);
    res.status(200).json({ success: true, messages: rows });
  } catch (error) {
    console.error("Error getting task messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Create a new message (project or task)
 */
export const createMessage = async (req, res) => {
  const sender_id = req.token?.userId;
  const { project_id = null, task_id = null, receiver_id = null, content, image_url = null } = req.body;

  if (!sender_id || !content) {
    return res.status(400).json({
      success: false,
      message: "sender_id (token) and content are required.",
    });
  }

  const hasProject = !!project_id;
  const hasTask = !!task_id;
  if (hasProject === hasTask) {
    return res.status(400).json({
      success: false,
      message: "Provide exactly one of project_id or task_id.",
    });
  }

  try {
    // ====== Insert Message ======
    const insertSql = hasProject
      ? `INSERT INTO messages (sender_id, receiver_id, project_id, content, image_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`
      : `INSERT INTO messages (sender_id, receiver_id, task_id, content, image_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const { rows } = await pool.query(insertSql, [
      sender_id,
      receiver_id,
      hasProject ? project_id : task_id,
      content,
      image_url,
    ]);
    const newMessage = rows[0];

    // ====== Notifications ======
    try {
      const notifiedIds = new Set();

      // 1️⃣ Direct receiver
      if (receiver_id) {
        await NotificationCreators.messageReceived(receiver_id, newMessage.id, newMessage.content);
        notifiedIds.add(receiver_id);
      }

      // 2️⃣ Task chat → notify freelancer and client
      if (hasTask) {
        const { rows } = await pool.query(
          `SELECT freelancer_id, assigned_client_id FROM tasks WHERE id = $1`,
          [task_id]
        );
        if (rows.length > 0) {
          const { freelancer_id, assigned_client_id } = rows[0];
          const participants = [freelancer_id, assigned_client_id].filter(
            (id) => id && id !== sender_id
          );
          for (const uid of participants) {
            if (!notifiedIds.has(uid)) {
              await NotificationCreators.messageReceived(uid, newMessage.id, newMessage.content);
              notifiedIds.add(uid);
            }
          }
        }
      }

      // 3️⃣ Project chat → notify client and assigned freelancers
      if (hasProject) {
        const clientQuery = `SELECT user_id FROM projects WHERE id = $1`;
        const clientRes = await pool.query(clientQuery, [project_id]);
        const clientId = clientRes.rows[0]?.user_id;

        let freelancerIds = [];
        try {
          const { rows } = await pool.query(
            `SELECT freelancer_id FROM project_freelancers WHERE project_id = $1`,
            [project_id]
          );
          freelancerIds = rows.map((r) => r.freelancer_id);
        } catch {}

        const participants = [clientId, ...freelancerIds].filter((id) => id && id !== sender_id);

        for (const uid of participants) {
          if (!notifiedIds.has(uid)) {
            await NotificationCreators.messageReceived(uid, newMessage.id, newMessage.content);
            notifiedIds.add(uid);
          }
        }
      }
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr);
    }

    // ====== Real-time emit (optional) ======
    if (global.io) {
      const room = hasTask ? `task:${task_id}` : `project:${project_id}`;
      global.io.to(room).emit("chat:new_message", { message: newMessage });
    }

    // ====== Response ======
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
