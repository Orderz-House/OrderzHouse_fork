import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// Settings state providers
final notificationsEnabledProvider = StateProvider<bool>((ref) => true);
final twoFactorEnabledProvider = StateProvider<bool>((ref) => false);

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final primaryColor = AppColors.primary;
    final notificationsEnabled = ref.watch(notificationsEnabledProvider);
    final twoFactorEnabled = ref.watch(twoFactorEnabledProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    return AppScaffold(
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Custom Header
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    // Back button in circle
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
                        color: primaryColor,
                        onPressed: () {
                          // Safe back navigation
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            // Fallback: navigate to profile/home based on role
                            final userRoleId = user?.roleId ?? 0;
                            if (userRoleId == 2) {
                              context.go('/client/profile');
                            } else if (userRoleId == 3) {
                              context.go('/freelancer/profile');
                            } else {
                              context.go('/client/profile');
                            }
                          }
                        },
                      ),
                    ),
                    const Spacer(),
                    // Title
                    const Text(
                      'Settings',
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

            const SizedBox(height: 24),

            // Settings Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Notifications Setting
                    _buildSettingTile(
                      context: context,
                      icon: Icons.notifications_outlined,
                      title: 'Notifications',
                      subtitle: 'Receive push notifications',
                      trailing: Switch(
                        value: notificationsEnabled,
                        onChanged: (value) {
                          ref.read(notificationsEnabledProvider.notifier).state = value;
                        },
                        activeColor: primaryColor,
                      ),
                    ),
                    
                    // Divider
                    Divider(
                      height: 1,
                      thickness: 1,
                      color: Colors.grey.shade200,
                      indent: 72,
                    ),

                    // Two-Factor Authentication Setting
                    _buildSettingTile(
                      context: context,
                      icon: Icons.security_outlined,
                      title: 'Two-Factor Authentication',
                      subtitle: 'Add an extra layer of security',
                      trailing: Switch(
                        value: twoFactorEnabled,
                        onChanged: (value) {
                          ref.read(twoFactorEnabledProvider.notifier).state = value;
                        },
                        activeColor: primaryColor,
                      ),
                    ),
                    
                    // Divider
                    Divider(
                      height: 1,
                      thickness: 1,
                      color: Colors.grey.shade200,
                      indent: 72,
                    ),

                    // Change Password Setting
                    _buildSettingTile(
                      context: context,
                      icon: Icons.lock_outline_rounded,
                      title: 'Change Password',
                      subtitle: 'Update your account password',
                      trailing: Icon(
                        Icons.chevron_right_rounded,
                        color: Colors.grey.shade400,
                        size: 24,
                      ),
                      onTap: () {
                        // Navigate to change password screen
                        // TODO: Replace with actual route when implemented
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Change password feature coming soon'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required BuildContext context,
    required IconData icon,
    required String title,
    String? subtitle,
    required Widget trailing,
    VoidCallback? onTap,
  }) {
    final primaryColor = AppColors.primary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            // Icon in soft circle
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            // Title and subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: const Color(0xFF111827),
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Colors.grey.shade600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Trailing widget (Switch or Chevron)
            trailing,
          ],
        ),
      ),
    );
  }
}
