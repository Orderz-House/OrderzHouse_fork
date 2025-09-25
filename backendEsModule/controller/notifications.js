import { pool } from "../models/db.js";
import { authentication } from "../middleware/authentication.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationCount,
  createNotification,
  cleanupOldNotifications
} from "../services/notificationService.js";
import { LogCreators, ACTION_TYPES, ENTITY_TYPES } from "../services/loggingService.js";

/**
 * Get notifications for the authenticated user
 * @route GET /notifications
 * @access Private
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    // Validate parameters
    const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Max 100
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    const parsedUnreadOnly = unreadOnly === 'true';

    const notifications = await getUserNotifications(
      userId,
      parsedLimit,
      parsedOffset,
      parsedUnreadOnly
    );

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      true,
      { action: 'get_notifications', count: notifications.length }
    );

    res.json({
      success: true,
      notifications,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        count: notifications.length
      }
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      false,
      { action: 'get_notifications', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

/**
 * Mark a specific notification as read
 * @route PUT /notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const success = await markNotificationAsRead(parseInt(id), userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      true,
      { action: 'mark_notification_read', notificationId: id }
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      false,
      { action: 'mark_notification_read', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 * @route PUT /notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.token?.userId;

    const updatedCount = await markAllNotificationsAsRead(userId);

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      true,
      { action: 'mark_all_notifications_read', count: updatedCount }
    );

    res.json({
      success: true,
      message: `Marked ${updatedCount} notifications as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      false,
      { action: 'mark_all_notifications_read', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
};

/**
 * Get notification count for the authenticated user
 * @route GET /notifications/count
 * @access Private
 */
export const getCount = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { unreadOnly = false } = req.query;

    const parsedUnreadOnly = unreadOnly === 'true';
    const count = await getNotificationCount(userId, parsedUnreadOnly);

    res.json({
      success: true,
      count,
      unreadOnly: parsedUnreadOnly
    });

  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification count'
    });
  }
};

/**
 * Create a test notification (for testing purposes)
 * @route POST /notifications/test
 * @access Private
 */
export const createTestNotification = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { message = 'Test notification' } = req.body;

    const notification = await createNotification(
      userId,
      'test',
      message,
      null,
      'test'
    );

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      true,
      { action: 'create_test_notification', notificationId: notification.id }
    );

    res.json({
      success: true,
      message: 'Test notification created',
      notification
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      false,
      { action: 'create_test_notification', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to create test notification'
    });
  }
};

/**
 * Clean up old notifications (admin only)
 * @route DELETE /notifications/cleanup
 * @access Private (Admin)
 */
export const cleanupNotifications = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { daysOld = 90 } = req.query;

    // Check if user is admin (role_id = 1)
    const { rows: userRows } = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

    if (!userRows.length || userRows[0].role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const parsedDaysOld = Math.max(parseInt(daysOld) || 90, 30); // Minimum 30 days
    const deletedCount = await cleanupOldNotifications(parsedDaysOld);

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.SYSTEM_MAINTENANCE,
      null,
      true,
      { action: 'cleanup_notifications', daysOld: parsedDaysOld, deletedCount }
    );

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old notifications`,
      deletedCount,
      daysOld: parsedDaysOld
    });

  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.SYSTEM_MAINTENANCE,
      null,
      false,
      { action: 'cleanup_notifications', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications'
    });
  }
};

/**
 * Delete a specific notification
 * @route DELETE /notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    // Delete the notification (only if it belongs to the user)
    const { rows } = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [parseInt(id), userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    // Log the action
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      true,
      { action: 'delete_notification', notificationId: id }
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    
    // Log the error
    await LogCreators.projectOperation(
      req.token?.userId,
      ACTION_TYPES.USER_UPDATE,
      null,
      false,
      { action: 'delete_notification', error: error.message }
    );

    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getCount,
  createTestNotification,
  cleanupNotifications,
  deleteNotification
};