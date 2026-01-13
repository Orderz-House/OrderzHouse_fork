import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/models/notification_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../providers/notifications_provider.dart';

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return AppScaffold(
      body: Column(
        children: [
          // Header
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: Row(
                children: [
                  // Back button
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.chevron_left_rounded),
                      color: const Color(0xFF6D5FFD), // Primary lavender
                      onPressed: () {
                        if (context.canPop()) {
                          context.pop();
                        } else {
                          // Fallback: navigate to home based on role
                          final location = GoRouterState.of(context).uri.path;
                          if (location.contains('/client')) {
                            context.go('/client');
                          } else if (location.contains('/freelancer')) {
                            context.go('/freelancer');
                          } else {
                            context.go('/client');
                          }
                        }
                      },
                    ),
                  ),
                  const Spacer(),
                  // Title
                  const Text(
                    'Notifications',
                    style: TextStyle(
                      color: Color(0xFF111827),
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 40), // Balance the back button
                ],
              ),
            ),
          ),
          // Content
          Expanded(
            child: notificationsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6D5FFD)),
                ),
              ),
              error: (error, stackTrace) => ErrorState(
                message: error.toString().replaceAll('Exception: ', ''),
                onRetry: () => ref.invalidate(notificationsProvider),
              ),
              data: (notifications) {
                if (notifications.isEmpty) {
                  return const EmptyState(
                    icon: Icons.notifications_none_rounded,
                    title: 'No notifications yet',
                    message: 'You\'ll see notifications here when you receive them.',
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(notificationsProvider);
                    ref.invalidate(unreadCountProvider);
                  },
                  color: const Color(0xFF6D5FFD),
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.md,
                    ),
                    itemCount: notifications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final notification = notifications[index];
                      return _buildNotificationCard(context, ref, notification);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
  ) {
    return InkWell(
      onTap: () => _handleNotificationTap(context, ref, notification),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          border: notification.isRead
              ? null
              : Border.all(
                  color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
                  width: 1,
                ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFF6D5FFD).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                notification.iconData,
                color: const Color(0xFF6D5FFD),
                size: 24,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: AppTextStyles.bodyLarge.copyWith(
                            fontWeight: notification.isRead
                                ? FontWeight.normal
                                : FontWeight.w600,
                            color: const Color(0xFF111827),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!notification.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF6D5FFD),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  if (notification.body != null && notification.body!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      notification.body!,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    notification.timeAgo,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleNotificationTap(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
  ) async {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await ref.read(
          markNotificationAsReadProvider(notification.id).future,
        );
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to mark notification as read: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }
    }

    // Navigate based on type and referenceId
    if (notification.type != null && notification.referenceId != null) {
      final type = notification.type!.toLowerCase();
      final refId = notification.referenceId!;

      if (type.contains('project')) {
        // Navigate to project details
        if (context.mounted) {
          context.push('/project/$refId');
        }
      } else if (type.contains('offer')) {
        // Navigate to offers/projects screen
        // For now, just show a message
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Offer details screen not implemented yet'),
            ),
          );
        }
      } else if (type.contains('payment')) {
        // Navigate to payments screen
        final location = GoRouterState.of(context).uri.path;
        if (context.mounted) {
          if (location.contains('/client')) {
            context.push('/client/payments');
          } else if (location.contains('/freelancer')) {
            context.push('/freelancer/payments');
          } else {
            context.push('/client/payments');
          }
        }
      } else if (type.contains('message')) {
        // Navigate to chat/messages
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Messages screen not implemented yet'),
            ),
          );
        }
      }
    }
  }
}
