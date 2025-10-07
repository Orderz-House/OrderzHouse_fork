import pool  from "../models/db.js";

/**
 * Notification Service - Handles all system notifications
 * Supports multiple notification types and recipients
 */

// Notification types enum
 const NOTIFICATION_TYPES = {
  PROJECT_CREATED: "project_created",
  OFFER_SUBMITTED: "offer_submitted",
  OFFER_APPROVED: "offer_approved",
  OFFER_REJECTED: "offer_rejected",
  WORK_COMPLETION_REQUESTED: "work_completion_requested",
  PAYMENT_RELEASED: "payment_released",
  FREELANCER_ASSIGNED: "freelancer_assigned",
  FREELANCER_REMOVED: "freelancer_removed",
  PROJECT_STATUS_CHANGED: "project_status_changed",
  ASSIGNMENT_STATUS_CHANGED: "assignment_status_changed",
  ESCROW_CREATED: "escrow_created",
  ESCROW_RELEASED: "escrow_released",
  USER_REGISTERED: "user_registered",
  USER_VERIFIED: "user_verified",
  COURSE_ENROLLED: "course_enrolled",
  APPOINTMENT_SCHEDULED: "appointment_scheduled",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  REVIEW_SUBMITTED: "review_submitted",
  MESSAGE_RECEIVED: "message_received",
  TASK_REQUESTED: "task_requested",
  TASK_REQUEST_ACCEPTED: "task_request_accepted",
  TASK_REQUEST_REJECTED: "task_request_rejected",
  TASK_COMPLETED: "task_completed",
};

/**
 * Create a notification for a single user
 * @param {number} userId - Recipient user ID
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {string} message - Notification message
 * @param {number} relatedEntityId - Related entity ID (project, offer, etc.)
 * @param {string} entityType - Type of related entity
 * @returns {Promise<Object>} Created notification
 */
 const createNotification = async (
  userId,
  type,
  message,
  relatedEntityId = null,
  entityType = null
) => {
  try {
    const query = `
      INSERT INTO notifications (user_id, type, message, related_entity_id, entity_type, read_status, created_at)
      VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      userId,
      type,
      message,
      relatedEntityId,
      entityType,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {Array<number>} userIds - Array of recipient user IDs
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {number} relatedEntityId - Related entity ID
 * @param {string} entityType - Type of related entity
 * @returns {Promise<Array>} Array of created notifications
 */
 const createBulkNotifications = async (
  userIds,
  type,
  message,
  relatedEntityId = null,
  entityType = null
) => {
  try {
    if (!userIds || userIds.length === 0) return [];

    const notifications = [];
    for (const userId of userIds) {
      try {
        const notification = await createNotification(
          userId,
          type,
          message,
          relatedEntityId,
          entityType
        );
        notifications.push(notification);
      } catch (error) {
        console.error(
          `Failed to create notification for user ${userId}:`,
          error
        );
        // Continue with other users even if one fails
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
};

/**
 * Get notifications for a specific user
 * @param {number} userId - User ID
 * @param {number} limit - Number of notifications to return
 * @param {number} offset - Offset for pagination
 * @param {boolean} unreadOnly - Return only unread notifications
 * @returns {Promise<Array>} Array of notifications
 */
 const getUserNotifications = async (
  userId,
  limit = 50,
  offset = 0,
  unreadOnly = false
) => {
  try {
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND read_status = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID (for security)
 * @returns {Promise<boolean>} Success status
 */
 const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const query = `
      UPDATE notifications 
      SET read_status = true 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const { rows } = await pool.query(query, [notificationId, userId]);
    return rows.length > 0;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>} Number of notifications updated
 */
 const markAllNotificationsAsRead = async (userId) => {
  try {
    const query = `
      UPDATE notifications 
      SET read_status = true 
      WHERE user_id = $1 AND read_status = false
      RETURNING id
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows.length;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete old notifications (cleanup utility)
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<number>} Number of notifications deleted
 */
 const cleanupOldNotifications = async (daysOld = 90) => {
  try {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
      AND read_status = true
    `;

    const { rowCount } = await pool.query(query);
    return rowCount;
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    throw error;
  }
};

/**
 * Get notification count for a user
 * @param {number} userId - User ID
 * @param {boolean} unreadOnly - Count only unread notifications
 * @returns {Promise<number>} Notification count
 */
 const getNotificationCount = async (userId, unreadOnly = false) => {
  try {
    let query = `
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = $1
    `;

    const params = [userId];

    if (unreadOnly) {
      query += ` AND read_status = false`;
    }

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count);
  } catch (error) {
    console.error("Error getting notification count:", error);
    throw error;
  }
};


// Specific notification creators for common scenarios
 const NotificationCreators = {
  /**
   * Notify when a new project is created
   */
  projectCreated: async (projectId, projectTitle, clientId, categoryId) => {
    try {
      // Get freelancers who have this category
      const { rows: freelancers } = await pool.query(
        `
      SELECT u.id 
      FROM users u
      JOIN freelancer_categories fc 
        ON u.id = fc.freelancer_id
      WHERE u.role_id = 3
        AND fc.category_id = $1
        AND u.is_deleted = false
      `,
        [categoryId]
      );

      const freelancerIds = freelancers.map((f) => f.id);
      const message = `New project "${projectTitle}" has been posted in your category`;

      return await createBulkNotifications(
        freelancerIds,
        NOTIFICATION_TYPES.PROJECT_CREATED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating project created notifications:", error);
      throw error;
    }
  },

  /**
   * Notify when an offer is submitted
   */
  offerSubmitted: async (offerId, projectId, freelancerId, clientId) => {
    try {
      // Get project details
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const message = `New offer submitted for project "${projectTitle}"`;

      // Notify client
      return await createNotification(
        clientId,
        NOTIFICATION_TYPES.OFFER_SUBMITTED,
        message,
        offerId,
        "offer"
      );
    } catch (error) {
      console.error("Error creating offer submitted notification:", error);
      throw error;
    }
  },

  /**
   * Notify when an offer is approved/rejected
   */
  offerStatusChanged: async (
    offerId,
    projectId,
    freelancerId,
    clientId,
    isApproved
  ) => {
    try {
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const type = isApproved
        ? NOTIFICATION_TYPES.OFFER_APPROVED
        : NOTIFICATION_TYPES.OFFER_REJECTED;
      const message = isApproved
        ? `Your offer for project "${projectTitle}" has been approved!`
        : `Your offer for project "${projectTitle}" has been rejected.`;

      // Notify freelancer
      return await createNotification(
        freelancerId,
        type,
        message,
        offerId,
        "offer"
      );
    } catch (error) {
      console.error("Error creating offer status change notification:", error);
      throw error;
    }
  },

  /**
   * Notify when work completion is requested
   */
  workCompletionRequested: async (projectId, freelancerId, clientId) => {
    try {
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const message = `Work completion requested for project "${projectTitle}"`;

      // Notify client
      return await createNotification(
        clientId,
        NOTIFICATION_TYPES.WORK_COMPLETION_REQUESTED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating work completion notification:", error);
      throw error;
    }
  },

  /**
   * Notify when payment is released
   */
  paymentReleased: async (projectId, freelancerId, clientId, amount) => {
    try {
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const message = `Payment of $${amount} has been released for project "${projectTitle}"`;

      // Notify freelancer
      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.PAYMENT_RELEASED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating payment released notification:", error);
      throw error;
    }
  },

  /**
   * Notify when freelancer is assigned/removed
   */
  freelancerAssignmentChanged: async (
    projectId,
    freelancerId,
    clientId,
    isAssigned
  ) => {
    try {
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const type = isAssigned
        ? NOTIFICATION_TYPES.FREELANCER_ASSIGNED
        : NOTIFICATION_TYPES.FREELANCER_REMOVED;
      const message = isAssigned
        ? `You have been assigned to project "${projectTitle}"`
        : `You have been removed from project "${projectTitle}"`;

      // Notify freelancer
      return await createNotification(
        freelancerId,
        type,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error(
        "Error creating freelancer assignment notification:",
        error
      );
      throw error;
    }
  },
    /**
   * Notify freelancer when their task is requested
   */
  taskRequested: async (taskId, clientId, freelancerId, taskTitle) => {
    try {
      const message = `Your task "${taskTitle}" has been requested by a client.`;
      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.TASK_REQUESTED,
        message,
        taskId,
        "task"
      );
    } catch (error) {
      console.error("Error creating task requested notification:", error);
      throw error;
    }
  },

  /**
   * Notify client when freelancer accepts or rejects their request
   */
  taskRequestStatusChanged: async (requestId, clientId, taskTitle, isAccepted) => {
    try {
      const message = isAccepted
        ? `Your request for the task "${taskTitle}" has been accepted!`
        : `Your request for the task "${taskTitle}" was rejected.`;

      const type = isAccepted
        ? NOTIFICATION_TYPES.TASK_REQUEST_ACCEPTED
        : NOTIFICATION_TYPES.TASK_REQUEST_REJECTED;

      return await createNotification(
        clientId,
        type,
        message,
        requestId,
        "task_request"
      );
    } catch (error) {
      console.error("Error creating task request status notification:", error);
      throw error;
    }
  },

  /**
   * Notify freelancer when client marks task as completed
   */
  taskCompleted: async (taskId, freelancerId, taskTitle) => {
    try {
      const message = `The task "${taskTitle}" has been marked as completed.`;
      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.TASK_COMPLETED,
        message,
        taskId,
        "task"
      );
    } catch (error) {
      console.error("Error creating task completed notification:", error);
      throw error;
    }
  },

};


export {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  cleanupOldNotifications,
  getNotificationCount,
  NOTIFICATION_TYPES,
  NotificationCreators
};
