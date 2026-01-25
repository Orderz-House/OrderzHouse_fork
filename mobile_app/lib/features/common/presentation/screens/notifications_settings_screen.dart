import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_header.dart';

// Notification preferences providers
final masterNotificationsEnabledProvider = StateProvider<bool>((ref) => true);
final projectUpdatesEnabledProvider = StateProvider<bool>((ref) => true);
final messagesEnabledProvider = StateProvider<bool>((ref) => true);
final paymentsEnabledProvider = StateProvider<bool>((ref) => true);
final promotionsEnabledProvider = StateProvider<bool>((ref) => false);

class NotificationsSettingsScreen extends ConsumerWidget {
  const NotificationsSettingsScreen({super.key});

  void _handleBack(BuildContext context) {
    final router = GoRouter.of(context);
    if (router.canPop()) {
      context.pop();
    } else {
      context.go('/settings');
    }
  }

  Future<void> _savePreferences(WidgetRef ref) async {
    // TODO: Implement API call to save preferences
    // await ref.read(userRepositoryProvider).updateNotificationPreferences({
    //   'enabled': ref.read(masterNotificationsEnabledProvider),
    //   'projectUpdates': ref.read(projectUpdatesEnabledProvider),
    //   'messages': ref.read(messagesEnabledProvider),
    //   'payments': ref.read(paymentsEnabledProvider),
    //   'promotions': ref.read(promotionsEnabledProvider),
    // });
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final masterEnabled = ref.watch(masterNotificationsEnabledProvider);
    final projectUpdates = ref.watch(projectUpdatesEnabledProvider);
    final messages = ref.watch(messagesEnabledProvider);
    final payments = ref.watch(paymentsEnabledProvider);
    final promotions = ref.watch(promotionsEnabledProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: l10n.notifications,
              onBack: () => _handleBack(context),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    // Master Toggle Card
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: const [
                          BoxShadow(
                            color: AppColors.shadowColorLight,
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l10n.enableNotifications,
                                  style: AppTextStyles.headlineSmall.copyWith(
                                    color: AppColors.textPrimary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  l10n.notificationsSubtitle,
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Switch(
                            value: masterEnabled,
                            onChanged: (value) {
                              ref.read(masterNotificationsEnabledProvider.notifier).state = value;
                              _savePreferences(ref);
                            },
                            activeThumbColor: AppColors.accentOrange,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // Category toggles (only show if master enabled)
                    if (masterEnabled) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderLight),
                          boxShadow: const [
                            BoxShadow(
                              color: AppColors.shadowColorLight,
                              blurRadius: 8,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _NotificationCategoryTile(
                              title: l10n.projects,
                              subtitle: l10n.noProjectsMessage,
                              value: projectUpdates,
                              onChanged: (value) {
                                ref.read(projectUpdatesEnabledProvider.notifier).state = value;
                                _savePreferences(ref);
                              },
                            ),
                            const Divider(height: 1, color: AppColors.borderLight),
                            _NotificationCategoryTile(
                              title: l10n.messages,
                              subtitle: l10n.noNotificationsMessage,
                              value: messages,
                              onChanged: (value) {
                                ref.read(messagesEnabledProvider.notifier).state = value;
                                _savePreferences(ref);
                              },
                            ),
                            const Divider(height: 1, color: AppColors.borderLight),
                            _NotificationCategoryTile(
                              title: l10n.payments,
                              subtitle: l10n.transactionHistory,
                              value: payments,
                              onChanged: (value) {
                                ref.read(paymentsEnabledProvider.notifier).state = value;
                                _savePreferences(ref);
                              },
                            ),
                            const Divider(height: 1, color: AppColors.borderLight),
                            _NotificationCategoryTile(
                              title: l10n.offers,
                              subtitle: l10n.inviteFriends,
                              value: promotions,
                              onChanged: (value) {
                                ref.read(promotionsEnabledProvider.notifier).state = value;
                                _savePreferences(ref);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationCategoryTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _NotificationCategoryTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.accentOrange,
          ),
        ],
      ),
    );
  }
}
