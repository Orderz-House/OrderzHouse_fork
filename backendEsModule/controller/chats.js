import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

/* =======================================================================
   🔧 HELPERS
======================================================================= */
async function getSystemSenderId() {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE role_id = 1 AND is_deleted = false ORDER BY id ASC LIMIT 1`
  );
  return rows[0]?.id || null;
}

async function isAdmin(userId) {
  if (!userId) return false;
  const { rows } = await pool.query(
    `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
    [userId]
  );
  return rows[0]?.role_id === 1;
}

async function getProjectParticipants(projectId) {
  const { rows } = await pool.query(
    `SELECT user_id, assigned_freelancer_id FROM projects WHERE id = $1 AND is_deleted = false`,
    [projectId]
  );
  if (!rows.length) return [];
  const { user_id, assigned_freelancer_id } = rows[0];
  return [user_id, assigned_freelancer_id].filter(Boolean);
}

async function getTaskParticipants(taskId) {
  const { rows } = await pool.query(
    `SELECT freelancer_id, assigned_client_id FROM tasks WHERE id = $1`,
    [taskId]
  );
  if (!rows.length) return [];
  const { freelancer_id, assigned_client_id } = rows[0];
  return [freelancer_id, assigned_client_id].filter(Boolean);
}

async function isChatAllowed(projectId, taskId) {
  const disallowed = [
    "pending",
    "pending_payment",
    "pending_approval",
    "pending_acceptance",
    "rejected",
    "not_chosen",
    "completed",
    "terminated"
  ];
  try {
    if (projectId) {
      const { rows } = await pool.query(
        `SELECT status, completion_status FROM projects WHERE id = $1 AND is_deleted = false`,
        [projectId]
      );
      if (!rows.length) return false;
      const { status, completion_status } = rows[0];
      return !(disallowed.includes(status) || disallowed.includes(completion_status));
    }
    if (taskId) {
      const { rows } = await pool.query(`SELECT status FROM tasks WHERE id = $1`, [taskId]);
      if (!rows.length) return false;
      const { status } = rows[0];
      return !disallowed.includes(status);
    }
    return false;
  } catch (err) {
    console.error("❌ Error in isChatAllowed:", err.message);
    return false;
  }
}

/* =======================================================================
   🚫 FORBIDDEN PATTERNS
======================================================================= */
const forbiddenPatterns = [
  /\b\d{5,}\b/g,
  /\+\d{1,3}\s?\d{5,}/g,
  /\b\S+@\S+\.\S+\b/g,
  /\b(telegram|whatsapp|snapchat|snap|instagram|insta|facebook|fb|meta|tiktok|discord|imo|viber|skype|linkedin|line|wechat|signal|messenger|pinterest|reddit|threads)\b/gi,
  /\b(تلجرام|تيليجرام|واتساب|واتس|سناب|انستا|انستقرام|فيس|فيسبوك|تيك\s?توك|ديسكورد|ايمو|فايبر|سكايب|لينكد|لينكدان|وي\s?تشات|سيجنال|ماسنجر|بنترست|ريديت|ثريدز)\b/gi,
  /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi,
  /\b\.com\b|\b\.net\b|\b\.org\b|\b\.io\b|\b\.me\b|\b\.co\b|\b\.ly\b|\b\.app\b|\b\.site\b/gi,
  /@[a-zA-Z0-9._-]{3,}/g,
  /\buser(name)?\b\s*[:=]\s*[a-zA-Z0-9._-]{3,}/gi,
  /\b(اسم المستخدم|يوزر|ايدي|معرّف|معرف)\b\s*[:=]?\s*[a-zA-Z0-9._-]{3,}/gi,
  /\b(tel|mob|mobile|phone|contact|call|whats|wa|insta|ig|snap|fb|tg|tele|disc|dc|tt|mail|gmail|hotmail|outlook|yahoo|number)\b/gi,
  /\b(تلفون|رقم|جوال|موبايل|اتصل|تواصل|واتس|انستا|سناب|فيس|رقمى|رقمي|رقم الهاتف|بريد|ايميل|الإيميل|البريد الإلكتروني)\b/gi,
  /\b(dm|direct\s?message|pm|private\s?message|text\s?me|message\s?me|reach\s?me|contact\s?me)\b/gi,
  /\b(راسلني|كلمني|تواصل معي|ارسل لي|ابعثلي|كلمنى خاص|حدثني خاص|خاصني|ابعث خاص|راسلني خاص)\b/gi
];

/* =======================================================================
   💬 GET PROJECT MESSAGES
======================================================================= */
export const getMessagesByProjectId = async (req, res) => {
  const { projectId } = req.params;
  const requesterId = req.token?.userId;

  try {
    const projectCheck = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectCheck.rows.length)
      return res.status(404).json({ success: false, message: "Project not found" });

    if (!(await isAdmin(requesterId))) {
      const participants = await getProjectParticipants(projectId);
      if (!participants.length)
        return res.status(403).json({ success: false, message: "No participants found" });
      if (!participants.includes(requesterId))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    const sql = `
      SELECT
        m.id, m.sender_id, m.receiver_id, m.project_id, m.task_id,
        m.content, m.image_url, m.is_read, m.time_sent, m.is_system,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'username', u.username,
          'email', u.email,
          'avatar', u.profile_pic_url
        ) AS sender
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.project_id = $1
      ORDER BY m.time_sent ASC
    `;
    const { rows } = await pool.query(sql, [projectId]);
    return res.status(200).json({
      success: true,
      messages: rows || [],
      count: rows?.length || 0
    });
  } catch (err) {
    console.error("❌ Error in getMessagesByProjectId:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching project messages",
      error: err.message
    });
  }
};

/* =======================================================================
   💬 GET TASK MESSAGES
======================================================================= */
export const getMessagesByTaskId = async (req, res) => {
  const { taskId } = req.params;
  const requesterId = req.token?.userId;

  try {
    const taskCheck = await pool.query(`SELECT id FROM tasks WHERE id = $1`, [taskId]);
    if (!taskCheck.rows.length)
      return res.status(404).json({ success: false, message: "Task not found" });

    if (!(await isAdmin(requesterId))) {
      const participants = await getTaskParticipants(taskId);
      if (!participants.length)
        return res.status(403).json({ success: false, message: "No participants found" });
      if (!participants.includes(requesterId))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    const sql = `
      SELECT
        m.id, m.sender_id, m.receiver_id, m.project_id, m.task_id,
        m.content, m.image_url, m.is_read, m.time_sent, m.is_system,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'username', u.username,
          'email', u.email,
          'avatar', u.profile_pic_url
        ) AS sender
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.task_id = $1
      ORDER BY m.time_sent ASC
    `;
    const { rows } = await pool.query(sql, [taskId]);
    return res.status(200).json({
      success: true,
      messages: rows || [],
      count: rows?.length || 0
    });
  } catch (err) {
    console.error("❌ Error in getMessagesByTaskId:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching task messages",
      error: err.message
    });
  }
};

/* =======================================================================
   📨 CREATE MESSAGE
======================================================================= */
export const createMessage = async (req, res) => {
  const sender_id = req.token?.userId;
  const {
    project_id = null,
    task_id = null,
    receiver_id = null,
    content,
    image_url = null
  } = req.body;

  if (!sender_id || !content)
    return res.status(400).json({ success: false, message: "sender_id and content required" });

  const hasProject = !!project_id;
  const hasTask = !!task_id;
  if (hasProject === hasTask)
    return res.status(400).json({ success: false, message: "Provide either project_id or task_id, not both" });

  try {
    const allowed = await isChatAllowed(project_id, task_id);
    if (!allowed)
      return res.status(403).json({ success: false, message: "Chat is not allowed for this status" });

    const violation = forbiddenPatterns.some((pat) => pat.test(content));
    if (violation) {
      if (hasProject)
        await pool.query(`UPDATE projects SET status = 'terminated', updated_at = NOW() WHERE id = $1`, [project_id]);
      else
        await pool.query(`UPDATE tasks SET status = 'terminated', updated_at = NOW() WHERE id = $1`, [task_id]);

      const systemSenderId = (await getSystemSenderId()) || sender_id;
      const systemMessage =
        "⚠️ This chat has been locked due to a violation of OrderzHouse Community Standards.";

      const insertSys = hasProject
        ? `INSERT INTO messages (sender_id, project_id, content, is_system) VALUES ($1, $2, $3, TRUE)`
        : `INSERT INTO messages (sender_id, task_id, content, is_system) VALUES ($1, $2, $3, TRUE)`;

      await pool.query(insertSys, [systemSenderId, hasProject ? project_id : task_id, systemMessage]);

      if (global.io) {
        const room = hasTask ? `task:${task_id}` : `project:${project_id}`;
        global.io.to(room).emit("chat:system_message", { message: systemMessage });
      }

      return res.status(403).json({
        success: false,
        message: "Chat locked due to violation"
      });
    }

    const insertSql = hasProject
      ? `INSERT INTO messages (sender_id, receiver_id, project_id, content, image_url, is_system)
         VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *`
      : `INSERT INTO messages (sender_id, receiver_id, task_id, content, image_url, is_system)
         VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *`;

    const { rows } = await pool.query(insertSql, [
      sender_id,
      receiver_id,
      hasProject ? project_id : task_id,
      content,
      image_url
    ]);

    const newMessage = rows[0];
    if (global.io) {
      const room = hasTask ? `task:${task_id}` : `project:${project_id}`;
      global.io.to(room).emit("chat:new_message", { message: newMessage });
    }

    return res.status(201).json({ success: true, message: "Message sent", sentMessage: newMessage });
  } catch (err) {
    console.error("❌ Error in createMessage:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
      error: err.message
    });
  }
};

/* =======================================================================
   🧠 ADMIN GET ALL
======================================================================= */
export const getAllChatsForAdmin = async (req, res) => {
  const requesterId = req.token?.userId;
  try {
    if (!(await isAdmin(requesterId)))
      return res.status(403).json({ success: false, message: "Access denied (admin only)" });

    const sql = `
      SELECT 
        m.id, m.sender_id, m.receiver_id, m.project_id, m.task_id,
        m.content, m.image_url, m.is_read, m.time_sent, m.is_system,
        COALESCE(p.title, t.title) AS related_title,
        CASE
          WHEN m.project_id IS NOT NULL THEN 'project'
          WHEN m.task_id IS NOT NULL THEN 'task'
          ELSE 'direct'
        END AS chat_type,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'username', u.username,
          'email', u.email,
          'avatar', u.profile_pic_url
        ) AS sender
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      LEFT JOIN projects p ON p.id = m.project_id
      LEFT JOIN tasks t ON t.id = m.task_id
      ORDER BY m.time_sent DESC
      LIMIT 500
    `;
    const { rows } = await pool.query(sql);
    return res.status(200).json({ success: true, count: rows.length, messages: rows });
  } catch (err) {
    console.error("❌ Error in getAllChatsForAdmin:", err.message);
    return res.status(500).json({ success: false, message: "Server error while fetching chats", error: err.message });
  }
};