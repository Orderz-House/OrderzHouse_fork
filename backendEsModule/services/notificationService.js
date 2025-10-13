// services/notificationService.js

import pool from "../models/db.js";

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
  WORK_SUBMITTED: "work_submitted", // NEW: Freelancer submits work
};

// Role-based notification rules
const ROLE_NOTIFICATIONS = {
  1: [ // Admin (role_id = 1) - Receives ALL
    'project_created',
    'offer_submitted',
    'offer_approved',
    'offer_rejected',
    'work_completion_requested',
    'payment_released',
    'freelancer_assigned',
    'freelancer_removed',
    'project_status_changed',
    'assignment_status_changed',
    'escrow_created',
    'escrow_released',
    'user_registered',
    'user_verified',
    'course_enrolled',
    'appointment_scheduled',
    'appointment_cancelled',
    'review_submitted',
    'message_received',
    'task_requested',
    'task_request_accepted',
    'task_request_rejected',
    'task_completed',
    'work_submitted'
  ],
  2: [ // Client (role_id = 2)
    'user_registered',           // Welcome after signup
    'message_received',          // When get chat
    'offer_submitted',           // When receive offer on their project
    'work_submitted',            // When freelancer submits work
    'task_request_accepted',     // When freelancer accepts task request
    'task_request_rejected'      // When freelancer rejects task request
  ],
  3: [ // Freelancer (role_id = 3)
    'project_created',           // When new project posted in their category
    'task_requested',            // When client requests their task
    'task_request_accepted',     // When client accepts their request
    'task_request_rejected',     // When client rejects their request
    'task_completed',            // When client marks task as completed
    'offer_approved',            // When their offer is approved
    'offer_rejected',            // When their offer is rejected
    'freelancer_assigned',       // When assigned to a project
    'freelancer_removed',        // When removed from a project
    'work_completion_requested', // When client requests work completion
    'payment_released',          // When payment is released
    'message_received',          // When they get a chat message
    'appointment_scheduled',     // When appointment is booked
    'appointment_cancelled',     // When appointment is cancelled
    'course_enrolled',           // When admin gives access to course
    'review_submitted'           // When client submits review
  ]
};

/**
 * Create a notification for a single user (role-based filtering)
 */
const createNotification = async (
  userId,
  type,
  message,
  relatedEntityId = null,
  entityType = null
) => {
  try {
    // Get user's role
    const { rows: userRows } = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

    if (!userRows.length) return null; // User not found or deleted

    const roleId = userRows[0].role_id;

    // Check if this notification type is allowed for this role
    const allowedTypes = ROLE_NOTIFICATIONS[roleId] || [];
    if (!allowedTypes.includes(type)) {
      return null; // Skip notification for this role
    }

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
 * Create notifications for multiple users (role-based filtering)
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
        
        if (notification) { // Only add if notification was created
          notifications.push(notification);
        }
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

/**
 * Get freelancers by category (using your exact table structure)
 */
const getFreelancersByCategory = async (categoryId) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT u.id 
      FROM users u
      JOIN freelancer_categories fc 
        ON u.id = fc.freelancer_id
      WHERE u.role_id = 3  -- Freelancer role
        AND fc.category_id = $1
        AND u.is_deleted = false
      `,
      [categoryId]
    );
    
    // Return array of freelancer IDs
    return rows.map(row => row.id);
  } catch (error) {
    console.error("Error fetching freelancers by category:", error);
    throw error;
  }
};

/**
 * Get client of a project (helper function)
 */
const getProjectClient = async (projectId) => {
  try {
    const { rows } = await pool.query(
      `SELECT client_id FROM projects WHERE id = $1`,
      [projectId]
    );
    return rows[0]?.client_id || null;
  } catch (error) {
    console.error("Error fetching project client:", error);
    throw error;
  }
};

/**
 * Get client of a task (helper function)
 */
const getTaskClient = async (taskId) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.client_id 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );
    return rows[0]?.client_id || null;
  } catch (error) {
    console.error("Error fetching task client:", error);
    throw error;
  }
};

// Specific notification creators
const NotificationCreators = {
  /**
   * Notify freelancers when a new project is created (category-based)
   */
  projectCreated: async (projectId, projectTitle, clientId, categoryId) => {
    try {
      // Get freelancers who have this category
      const freelancerIds = await getFreelancersByCategory(categoryId);
      
      if (freelancerIds.length === 0) return [];

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
   * Notify client when freelancer submits work on project/task
   */
  workSubmitted: async (projectId, taskId, freelancerId, clientIds = null) => {
    try {
      let clientIdsArray = clientIds;
      
      // If clientIds not provided, get from project
      if (!clientIdsArray) {
        if (taskId) {
          const clientId = await getTaskClient(taskId);
          if (clientId) clientIdsArray = [clientId];
        } else if (projectId) {
          const clientId = await getProjectClient(projectId);
          if (clientId) clientIdsArray = [clientId];
        }
      }

      if (!clientIdsArray || clientIdsArray.length === 0) return [];

      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId || taskId ? await getTaskClient(taskId) : null]
      );

      if (projectRows.length === 0) return [];

      const projectTitle = projectRows[0].title;
      const message = `Freelancer has submitted work for project "${projectTitle}"`;

      return await createBulkNotifications(
        clientIdsArray,
        NOTIFICATION_TYPES.WORK_SUBMITTED,
        message,
        projectId || taskId,
        taskId ? "task" : "project"
      );
    } catch (error) {
      console.error("Error creating work submitted notification:", error);
      throw error;
    }
  },

  /**
   * Notify when an offer is submitted
   */
  offerSubmitted: async (offerId, projectId, freelancerId, clientId) => {
    try {
      const { rows: projectRows } = await pool.query(
        `SELECT title FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectRows.length === 0) return;

      const projectTitle = projectRows[0].title;
      const message = `New offer submitted for project "${projectTitle}"`;

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

  /**
   * Notify when project status changes
   */
  projectStatusChanged: async (projectId, projectTitle, clientId, oldStatus, newStatus) => {
    try {
      const message = `Project "${projectTitle}" status changed from "${oldStatus}" to "${newStatus}"`;

      return await createNotification(
        clientId,
        NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating project status change notification:", error);
      throw error;
    }
  },

  /**
   * Notify when assignment status changes
   */
  assignmentStatusChanged: async (projectId, freelancerId, clientId, oldStatus, newStatus) => {
    try {
      const message = `Assignment status changed from "${oldStatus}" to "${newStatus}"`;

      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.ASSIGNMENT_STATUS_CHANGED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating assignment status change notification:", error);
      throw error;
    }
  },

  /**
   * Notify when escrow is created
   */
  escrowCreated: async (projectId, freelancerId, clientId, amount) => {
    try {
      const message = `Escrow account created with $${amount} for project`;

      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.ESCROW_CREATED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating escrow created notification:", error);
      throw error;
    }
  },

  /**
   * Notify when escrow is released
   */
  escrowReleased: async (projectId, freelancerId, clientId, amount) => {
    try {
      const message = `Escrow funds of $${amount} have been released`;

      return await createNotification(
        freelancerId,
        NOTIFICATION_TYPES.ESCROW_RELEASED,
        message,
        projectId,
        "project"
      );
    } catch (error) {
      console.error("Error creating escrow released notification:", error);
      throw error;
    }
  },

  /**
   * Notify when user is registered
   */
  userRegistered: async (userId, userName) => {
    try {
      const message = `Welcome, ${userName}! You've successfully registered.`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.USER_REGISTERED,
        message,
        userId,
        "user"
      );
    } catch (error) {
      console.error("Error creating user registered notification:", error);
      throw error;
    }
  },

  /**
   * Notify when user is verified
   */
  userVerified: async (userId, userName) => {
    try {
      const message = `${userName} has been verified!`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.USER_VERIFIED,
        message,
        userId,
        "user"
      );
    } catch (error) {
      console.error("Error creating user verified notification:", error);
      throw error;
    }
  },

  /**
   * Notify when freelancer enrolls in course
   */
  courseEnrolled: async (userId, courseId, courseName) => {
    try {
      const message = `You've enrolled in "${courseName}"`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.COURSE_ENROLLED,
        message,
        courseId,
        "course"
      );
    } catch (error) {
      console.error("Error creating course enrolled notification:", error);
      throw error;
    }
  },

  /**
   * Notify when appointment is scheduled
   */
  appointmentScheduled: async (userId, appointmentId, appointmentDetails) => {
    try {
      const message = `Appointment scheduled: ${appointmentDetails}`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.APPOINTMENT_SCHEDULED,
        message,
        appointmentId,
        "appointment"
      );
    } catch (error) {
      console.error("Error creating appointment scheduled notification:", error);
      throw error;
    }
  },

  /**
   * Notify when appointment is cancelled
   */
  appointmentCancelled: async (userId, appointmentId, appointmentDetails) => {
    try {
      const message = `Appointment cancelled: ${appointmentDetails}`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
        message,
        appointmentId,
        "appointment"
      );
    } catch (error) {
      console.error("Error creating appointment cancelled notification:", error);
      throw error;
    }
  },

  /**
   * Notify when review is submitted
   */
  reviewSubmitted: async (userId, reviewId, reviewDetails) => {
    try {
      const message = `Review submitted: ${reviewDetails}`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.REVIEW_SUBMITTED,
        message,
        reviewId,
        "review"
      );
    } catch (error) {
      console.error("Error creating review submitted notification:", error);
      throw error;
    }
  },

  /**
   * Notify when message is received
   */
  messageReceived: async (userId, messageId, messageContent) => {
    try {
      const message = `New message: ${messageContent.substring(0, 50)}...`;

      return await createNotification(
        userId,
        NOTIFICATION_TYPES.MESSAGE_RECEIVED,
        message,
        messageId,
        "message"
      );
    } catch (error) {
      console.error("Error creating message received notification:", error);
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