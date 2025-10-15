import pool from "../models/db.js";


export const NOTIFICATION_TYPES = {
  // Project & Offer Lifecycle
  PROJECT_CREATED: "project_created",
  OFFER_SUBMITTED: "offer_submitted",
  OFFER_APPROVED: "offer_approved",
  OFFER_REJECTED: "offer_rejected",
  FREELANCER_ASSIGNED: "freelancer_assigned",
  FREELANCER_REMOVED: "freelancer_removed",
  PROJECT_STATUS_CHANGED: "project_status_changed",

  // Work & Payment Lifecycle
  WORK_SUBMITTED: "work_submitted",
  WORK_APPROVED: "work_approved",
  WORK_REVISION_REQUESTED: "work_revision_requested",
  ESCROW_CREATED: "escrow_created",
  ESCROW_RELEASED: "escrow_released",
  PAYMENT_RELEASED: "payment_released",
  PAYMENT_APPROVED: "payment_approved",
  PAYMENT_REJECTED: "payment_rejected",
  PAYMENT_PENDING: "payment_pending", // For notifying admins

  // Task Lifecycle
  TASK_REQUESTED: "task_requested",
  TASK_REQUEST_ACCEPTED: "task_request_accepted",
  TASK_REQUEST_REJECTED: "task_request_rejected",
  TASK_COMPLETED: "task_completed",
  TASK_NEEDS_APPROVAL: "task_needs_approval",

  // User & System Lifecycle
  USER_REGISTERED: "user_registered",
  USER_VERIFIED: "user_verified",
  USER_VERIFICATION_REJECTED: "user_verification_rejected",
  REVIEW_SUBMITTED: "review_submitted",
  MESSAGE_RECEIVED: "message_received",
  APPOINTMENT_SCHEDULED: "appointment_scheduled",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_REQUESTED: "appointment_requested",
  APPOINTMENT_RESCHEDULED: "appointment_rescheduled",
  APPOINTMENT_COMPLETED: "appointment_completed",
  COURSE_ENROLLED: "course_enrolled",
  SUBSCRIPTION_STATUS_CHANGED: "subscription_status_changed",
  SYSTEM_ANNOUNCEMENT: "system_announcement",
};

/**
 * Role-based rules engine. This is the "brain" that decides which user role
 * is allowed to receive which type of notification.
 */
const ROLE_NOTIFICATIONS = {
  1: Object.values(NOTIFICATION_TYPES), // Admin (role_id = 1) receives all notifications.
  2: [ /* Client */
    NOTIFICATION_TYPES.USER_REGISTERED, NOTIFICATION_TYPES.MESSAGE_RECEIVED, NOTIFICATION_TYPES.OFFER_SUBMITTED,
    NOTIFICATION_TYPES.WORK_SUBMITTED, NOTIFICATION_TYPES.TASK_REQUEST_ACCEPTED, NOTIFICATION_TYPES.TASK_REQUEST_REJECTED,
    NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED, NOTIFICATION_TYPES.WORK_APPROVED, NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
    NOTIFICATION_TYPES.PAYMENT_APPROVED, NOTIFICATION_TYPES.PAYMENT_REJECTED,
  ],
  3: [ /* Freelancer */
    NOTIFICATION_TYPES.PROJECT_CREATED, NOTIFICATION_TYPES.TASK_REQUESTED, NOTIFICATION_TYPES.OFFER_APPROVED,
    NOTIFICATION_TYPES.OFFER_REJECTED, NOTIFICATION_TYPES.FREELANCER_ASSIGNED, NOTIFICATION_TYPES.FREELANCER_REMOVED,
    NOTIFICATION_TYPES.WORK_REVISION_REQUESTED, NOTIFICATION_TYPES.PAYMENT_RELEASED, NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    NOTIFICATION_TYPES.APPOINTMENT_SCHEDULED, NOTIFICATION_TYPES.APPOINTMENT_CANCELLED, NOTIFICATION_TYPES.COURSE_ENROLLED,
    NOTIFICATION_TYPES.REVIEW_SUBMITTED, NOTIFICATION_TYPES.TASK_COMPLETED, NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
    NOTIFICATION_TYPES.USER_VERIFIED, NOTIFICATION_TYPES.USER_VERIFICATION_REJECTED, NOTIFICATION_TYPES.PAYMENT_APPROVED,
    NOTIFICATION_TYPES.PAYMENT_REJECTED, NOTIFICATION_TYPES.APPOINTMENT_REQUESTED, NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED,
    NOTIFICATION_TYPES.APPOINTMENT_COMPLETED, NOTIFICATION_TYPES.SUBSCRIPTION_STATUS_CHANGED,
  ],
};

// =================================================================
// CORE & HELPER FUNCTIONS
// =================================================================

export const createNotification = async (userId, type, message, relatedEntityId = null, entityType = null) => {
  try {
    const { rows: userRows } = await pool.query(`SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`, [userId]);
    if (!userRows.length) return null;

    const roleId = userRows[0].role_id;
    if (!(ROLE_NOTIFICATIONS[roleId] || []).includes(type)) {
      return null;
    }

    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, message, related_entity_id, entity_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, message, relatedEntityId, entityType]
    );
    return rows[0];
  } catch (error) {
    console.error(`Error in createNotification for user ${userId}:`, error);
    throw error;
  }
};

export const createBulkNotifications = async (userIds, type, message, relatedEntityId = null, entityType = null) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];
  const promises = userIds.map(id => createNotification(id, type, message, relatedEntityId, entityType).catch(e => {
    console.error(`Failed to create notification for user ${id} in bulk operation:`, e);
    return null;
  }));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};

const getAdmins = async () => (await pool.query(`SELECT id FROM users WHERE role_id = 1 AND is_deleted = false`)).rows.map(r => r.id);
const getProjectClient = async (projectId) => (await pool.query(`SELECT user_id FROM projects WHERE id = $1`, [projectId])).rows[0]?.user_id || null;
const getFreelancersByCategory = async (categoryId) => (await pool.query(`SELECT u.id FROM users u JOIN freelancer_categories fc ON u.id = fc.freelancer_id WHERE u.role_id = 3 AND fc.category_id = $1 AND u.is_deleted = false`, [categoryId])).rows.map(r => r.id);

// =================================================================
// NOTIFICATION CREATORS (The Public API of this Service)
// =================================================================

export const NotificationCreators = {
  // --- Project & Offer Lifecycle ---
  projectCreated: async (projectId, projectTitle, categoryId) => {
    const freelancerIds = await getFreelancersByCategory(categoryId);
    const adminIds = await getAdmins();
    const message = `New project posted: "${projectTitle}"`;
    await createBulkNotifications([...new Set([...freelancerIds, ...adminIds])], NOTIFICATION_TYPES.PROJECT_CREATED, message, projectId, "project");
  },
  offerSubmitted: async (offerId, projectId, projectTitle, freelancerName) => {
    const clientId = await getProjectClient(projectId);
    const adminIds = await getAdmins();
    const message = `You received a new offer from ${freelancerName} for "${projectTitle}".`;
    await createBulkNotifications([...new Set([clientId, ...adminIds].filter(Boolean))], NOTIFICATION_TYPES.OFFER_SUBMITTED, message, offerId, "offer");
  },
  offerStatusChanged: async (offerId, projectTitle, freelancerId, isApproved) => {
    const type = isApproved ? NOTIFICATION_TYPES.OFFER_APPROVED : NOTIFICATION_TYPES.OFFER_REJECTED;
    const message = isApproved ? `Congratulations! Your offer for "${projectTitle}" has been approved.` : `Your offer for "${projectTitle}" was not accepted.`;
    await createNotification(freelancerId, type, message, offerId, "offer");
  },
  freelancerAssignmentChanged: async (projectId, projectTitle, freelancerId, isAssigned) => {
    const type = isAssigned ? NOTIFICATION_TYPES.FREELANCER_ASSIGNED : NOTIFICATION_TYPES.FREELANCER_REMOVED;
    const message = isAssigned ? `You have been assigned to the project: "${projectTitle}".` : `You have been removed from the project: "${projectTitle}".`;
    await createNotification(freelancerId, type, message, projectId, "project");
  },
  projectStatusChanged: async (projectId, projectTitle, userId, oldStatus, newStatus) => {
    const message = `The status of your project "${projectTitle}" has been updated from ${oldStatus} to ${newStatus}.`;
    await createNotification(userId, NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED, message, projectId, "project");
  },

  // --- Work & Payment Lifecycle ---
  workSubmitted: async (projectId, projectTitle, freelancerName) => {
    const clientId = await getProjectClient(projectId);
    const message = `${freelancerName} has submitted work for your project "${projectTitle}".`;
    await createNotification(clientId, NOTIFICATION_TYPES.WORK_SUBMITTED, message, projectId, "project");
  },
  workStatusChanged: async (projectId, projectTitle, freelancerId, isApproved) => {
    const type = isApproved ? NOTIFICATION_TYPES.WORK_APPROVED : NOTIFICATION_TYPES.WORK_REVISION_REQUESTED;
    const message = isApproved ? `The work for "${projectTitle}" has been approved by the client.` : `The client has requested revisions for your work on "${projectTitle}".`;
    await createNotification(freelancerId, type, message, projectId, "project");
  },
  escrowFunded: async (projectId, projectTitle, freelancerId, amount) => {
    const message = `The client has funded the escrow with $${amount.toFixed(2)} for project "${projectTitle}".`;
    await createNotification(freelancerId, NOTIFICATION_TYPES.ESCROW_CREATED, message, projectId, "project");
  },
  paymentReleased: async (projectId, projectTitle, freelancerId, amount) => {
    const message = `Payment of $${amount.toFixed(2)} has been released for your work on "${projectTitle}".`;
    await createNotification(freelancerId, NOTIFICATION_TYPES.PAYMENT_RELEASED, message, projectId, "project");
  },
  paymentApproved: async (paymentId, projectId, userId, amount) => {
    const message = `Your payment of $${amount.toFixed(2)} has been approved.`;
    await createNotification(userId, NOTIFICATION_TYPES.PAYMENT_APPROVED, message, paymentId, "payment");
  },
  paymentRejected: async (paymentId, projectId, userId) => {
    const message = `Your recent payment submission was rejected. Please check the details and resubmit.`;
    await createNotification(userId, NOTIFICATION_TYPES.PAYMENT_REJECTED, message, paymentId, "payment");
  },
  planPaymentSubmitted: async (paymentId, freelancerName, amount) => {
    const adminIds = await getAdmins();
    const message = `${freelancerName} has submitted proof for a plan payment of $${amount.toFixed(2)}.`;
    await createBulkNotifications(adminIds, NOTIFICATION_TYPES.PAYMENT_PENDING, message, paymentId, "payment");
  },
  projectPaymentSubmitted: async (paymentId, projectTitle, clientName, amount) => {
    const adminIds = await getAdmins();
    const message = `${clientName} has submitted proof for a project payment of $${amount.toFixed(2)} for "${projectTitle}".`;
    await createBulkNotifications(adminIds, NOTIFICATION_TYPES.PAYMENT_PENDING, message, paymentId, "payment");
  },

  // --- Task Lifecycle ---
  taskNeedsApproval: async (taskId, taskTitle, freelancerName) => {
    const adminIds = await getAdmins();
    const message = `New task "${taskTitle}" from ${freelancerName} is pending approval.`;
    await createBulkNotifications(adminIds, NOTIFICATION_TYPES.TASK_NEEDS_APPROVAL, message, taskId, "task");
  },
  taskRequested: async (taskId, taskTitle, freelancerId) => {
    const message = `A client has requested your task: "${taskTitle}".`;
    await createNotification(freelancerId, NOTIFICATION_TYPES.TASK_REQUESTED, message, taskId, "task");
  },
  taskRequestStatusChanged: async (requestId, taskTitle, clientId, isAccepted) => {
    const type = isAccepted ? NOTIFICATION_TYPES.TASK_REQUEST_ACCEPTED : NOTIFICATION_TYPES.TASK_REQUEST_REJECTED;
    const message = isAccepted ? `Your request for the task "${taskTitle}" has been accepted!` : `Your request for the task "${taskTitle}" was rejected.`;
    await createNotification(clientId, type, message, requestId, "task_request");
  },
  taskCompleted: async (taskId, taskTitle, recipientId) => {
    const message = `The task "${taskTitle}" has been marked as completed.`;
    await createNotification(recipientId, NOTIFICATION_TYPES.TASK_COMPLETED, message, taskId, "task");
  },

  // --- User & System Lifecycle ---
  userRegistered: async (userId, userName) => {
    await createNotification(userId, NOTIFICATION_TYPES.USER_REGISTERED, `Welcome to the platform, ${userName}!`, userId, "user");
    const adminIds = await getAdmins();
    await createBulkNotifications(adminIds, NOTIFICATION_TYPES.USER_REGISTERED, `New user registered: ${userName} (ID: ${userId}).`, userId, "user");
  },
  userVerified: async (userId, userName) => {
    const message = `Congratulations, ${userName}! Your account has been verified.`;
    await createNotification(userId, NOTIFICATION_TYPES.USER_VERIFIED, message, userId, "user");
  },
  userVerificationRejected: async (userId, reason) => {
    const message = `Your verification request was not approved. Reason: ${reason}`;
    await createNotification(userId, NOTIFICATION_TYPES.USER_VERIFICATION_REJECTED, message, userId, "user");
  },
  reviewSubmitted: async (reviewId, recipientId, reviewerName) => {
    const message = `You have received a new review from ${reviewerName}.`;
    await createNotification(recipientId, NOTIFICATION_TYPES.REVIEW_SUBMITTED, message, reviewId, "review");
  },
  messageReceived: async (recipientId, messageId, content) => {
    const message = `You have a new message: "${content.substring(0, 50)}..."`;
    await createNotification(recipientId, NOTIFICATION_TYPES.MESSAGE_RECEIVED, message, messageId, "message");
  },
  appointmentRequested: async (appointmentId, date, freelancerName) => {
    const adminIds = await getAdmins();
    const message = `${freelancerName} has requested an appointment for ${new Date(date).toLocaleString()}.`;
    await createBulkNotifications(adminIds, NOTIFICATION_TYPES.APPOINTMENT_REQUESTED, message, appointmentId, "appointment");
  },
  appointmentStatusChanged: async (appointmentId, recipientId, details, isScheduled) => {
    const type = isScheduled ? NOTIFICATION_TYPES.APPOINTMENT_SCHEDULED : NOTIFICATION_TYPES.APPOINTMENT_CANCELLED;
    const message = isScheduled ? `Your appointment ${details} has been scheduled.` : `Your appointment ${details} has been cancelled.`;
    await createNotification(recipientId, type, message, appointmentId, "appointment");
  },
  appointmentRescheduled: async (appointmentId, recipientId, details) => {
    const message = `Your appointment has been rescheduled. New details: ${details}.`;
    await createNotification(recipientId, NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED, message, appointmentId, "appointment");
  },
  appointmentCompleted: async (appointmentId, recipientId, details) => {
    const message = `Your appointment ${details} has been marked as completed.`;
    await createNotification(recipientId, NOTIFICATION_TYPES.APPOINTMENT_COMPLETED, message, appointmentId, "appointment");
  },
  courseEnrolled: async (userId, courseId, courseName) => {
    const message = `You have been successfully enrolled in the course: "${courseName}".`;
    await createNotification(userId, NOTIFICATION_TYPES.COURSE_ENROLLED, message, courseId, "course");
  },
  subscriptionStatusChanged: async (subscriptionId, userId, planName, status) => {
    const message = `Your subscription to the "${planName}" plan is now ${status}.`;
    await createNotification(userId, NOTIFICATION_TYPES.SUBSCRIPTION_STATUS_CHANGED, message, subscriptionId, "subscription");
  },
  systemAnnouncement: async (message, userIds = []) => {
    let recipients = userIds;
    if (recipients.length === 0) {
        recipients = (await pool.query(`SELECT id FROM users WHERE is_deleted = false`)).rows.map(r => r.id);
    }
    await createBulkNotifications(recipients, NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT, message, null, "system");
  },
};

// =================================================================
// DATA ACCESS FUNCTIONS (for use in notificationsController)
// =================================================================

export const getUserNotifications = async (userId, limit = 50, offset = 0, unreadOnly = false) => {
  const query = `SELECT * FROM notifications WHERE user_id = $1 ${unreadOnly ? 'AND read_status = false' : ''} ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const { rowCount } = await pool.query(`UPDATE notifications SET read_status = true WHERE id = $1 AND user_id = $2`, [notificationId, userId]);
  return rowCount > 0;
};

export const markAllNotificationsAsRead = async (userId) => {
  const { rowCount } = await pool.query(`UPDATE notifications SET read_status = true WHERE user_id = $1 AND read_status = false`, [userId]);
  return rowCount;
};

export const getNotificationCount = async (userId, unreadOnly = true) => {
  const { rows } = await pool.query(`SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 ${unreadOnly ? 'AND read_status = false' : ''}`, [userId]);
  return parseInt(rows[0].count, 10);
};

export const cleanupOldNotifications = async (daysOld = 90) => {
  const { rowCount } = await pool.query(`DELETE FROM notifications WHERE read_status = true AND created_at < NOW() - INTERVAL '${parseInt(daysOld)} days'`);
  return rowCount;
};
