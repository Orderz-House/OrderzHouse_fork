import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AppNotification {
  final int id;
  final String title;
  final String? body;
  final String? type;
  final int? referenceId;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.title,
    this.body,
    this.type,
    this.referenceId,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      title: json['title'] as String? ?? json['notification_title'] as String? ?? 'Notification',
      body: json['body'] as String? ?? json['message'] as String? ?? json['notification_body'] as String?,
      type: json['type'] as String? ?? json['notification_type'] as String?,
      referenceId: json['reference_id'] as int? ?? json['referenceId'] as int?,
      isRead: json['is_read'] as bool? ?? json['read_status'] as bool? ?? json['isRead'] as bool? ?? false,
      createdAt: _dateTimeFromJson(json['created_at'] ?? json['createdAt']),
    );
  }

  static DateTime _dateTimeFromJson(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) {
      return DateTime.tryParse(value) ?? DateTime.now();
    }
    if (value is int) {
      return DateTime.fromMillisecondsSinceEpoch(value * 1000);
    }
    return DateTime.now();
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 7) {
      return DateFormat('MMM dd, yyyy').format(createdAt);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'Just now';
    }
  }

  IconData get iconData {
    if (type == null) return Icons.notifications_outlined;
    
    switch (type!.toLowerCase()) {
      case 'project_created':
      case 'project_status_changed':
        return Icons.work_outline_rounded;
      case 'offer_submitted':
      case 'offer_approved':
      case 'offer_rejected':
        return Icons.local_offer_outlined;
      case 'payment_released':
      case 'payment_approved':
      case 'payment_rejected':
      case 'payment_pending':
        return Icons.payment_outlined;
      case 'work_submitted':
      case 'work_approved':
      case 'work_revision_requested':
        return Icons.task_outlined;
      case 'message_received':
        return Icons.chat_bubble_outline_rounded;
      default:
        return Icons.notifications_outlined;
    }
  }
}
