import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import 'package:mobile_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_app/core/models/user.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).user;
    final isFreelancer = user?.roleId == 3;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Standard AppBar/Header (like My Projects)
            _ProfileTopBar(),
            
            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(
                  top: 18,
                  left: 20,
                  right: 20,
                  bottom: 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1) Top Profile Header
                    _ProfileHeader(user: user),
                    const SizedBox(height: 18),

                    // 2) Stats Row (placeholder stats - can be replaced with real data)
                    _StatsRow(),
                    const SizedBox(height: 18),

                    // 3) Settings List Card (original items)
                    _SettingsListCard(
                      onEditProfile: () => context.go('/edit-profile'),
                      onSettings: () => context.go('/settings'),
                      onSubscription: () => context.go('/subscription'),
                      showSubscription: isFreelancer,
                    ),
                    const SizedBox(height: 18),

                    // 4) Logout Card (separate card, red accent)
                    _LogoutCard(
                      onLogout: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Logout'),
                            content: const Text('Are you sure you want to logout?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(context, true),
                                child: const Text('Logout'),
                              ),
                            ],
                          ),
                        );

                        if (confirm == true && context.mounted) {
                          await ref.read(authStateProvider.notifier).logout();
                          if (context.mounted) {
                            context.go('/login');
                          }
                        }
                      },
                    ),
                    const SizedBox(height: 18),

                    // 5) Bottom CTA Card (View Plans / Buy Package) - Only for freelancers
                    if (isFreelancer)
                      _UpgradeCard(
                        onViewPlans: () => context.go('/subscription'),
                      ),

                    // Bottom padding for safe area
                    SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
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

// Standard Top Bar (matching My Projects style)
class _ProfileTopBar extends StatelessWidget {
  const _ProfileTopBar();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 20,
        vertical: 12,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Back arrow in white circle button
          if (context.canPop())
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
                icon: const Icon(
                  Icons.chevron_left_rounded,
                  color: Color(0xFF0B0B0F), // Near-black primary
                  size: 20,
                ),
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  }
                },
                padding: EdgeInsets.zero,
              ),
            )
          else
            const SizedBox(width: 40), // Spacer if no back button
          
          // Center: Title
          const Text(
            'Profile',
            style: TextStyle(
              color: Color(0xFF0B0B0F), // Near-black primary
              fontWeight: FontWeight.w600,
              fontSize: 18,
            ),
          ),
          
          // Right: Spacer (no avatar button since we're on Profile page)
          const SizedBox(width: 40), // Balance the left button
        ],
      ),
    );
  }
}

// 1) Top Profile Header
class _ProfileHeader extends StatelessWidget {
  final User? user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left: Circular Avatar
        ClipOval(
          child: user?.profilePicUrl != null && user!.profilePicUrl!.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: user!.profilePicUrl!.startsWith('http')
                      ? user!.profilePicUrl!
                      : '${AppConfig.baseUrl}${user!.profilePicUrl}',
                  width: 76,
                  height: 76,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => _buildAvatarPlaceholder(),
                )
              : _buildAvatarPlaceholder(),
        ),
        const SizedBox(width: 16),
        // Right: Name, Username, Email
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Name (bold)
              Text(
                user?.displayName ?? 'User Name',
                style: AppTextStyles.headlineMedium.copyWith(
                  color: const Color(0xFF0F1115), // Near-black primary
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              // Username/handle (smaller, gray)
              Text(
                '@${user?.username ?? 'username'}',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: const Color(0xFF8B8F97), // Secondary gray
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              // Email
              Text(
                user?.email ?? 'user@example.com',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: const Color(0xFF8B8F97), // Secondary gray
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAvatarPlaceholder() {
    return Container(
      width: 76,
      height: 76,
      decoration: BoxDecoration(
        color: const Color(0xFFE5E7EB), // Light gray
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.person_rounded,
        color: Color(0xFF8B8F97), // Gray icon
        size: 40,
      ),
    );
  }
}

// 2) Stats Row (placeholder - can be replaced with real user stats)
class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _StatItem(number: '0', label: 'Projects'),
        _StatItem(number: '0', label: 'Completed'),
        _StatItem(number: '0', label: 'Active'),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String number;
  final String label;

  const _StatItem({
    required this.number,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          number,
          style: AppTextStyles.headlineMedium.copyWith(
            color: const Color(0xFF0F1115), // Near-black primary
            fontWeight: FontWeight.bold,
            fontSize: 24,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTextStyles.bodyMedium.copyWith(
            color: const Color(0xFF8B8F97), // Secondary gray
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}

// 3) Settings List Card (original items: Edit Profile, Settings, Subscription)
class _SettingsListCard extends StatelessWidget {
  final VoidCallback onEditProfile;
  final VoidCallback onSettings;
  final VoidCallback onSubscription;
  final bool showSubscription;

  const _SettingsListCard({
    required this.onEditProfile,
    required this.onSettings,
    required this.onSubscription,
    this.showSubscription = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _SettingsListItem(
            icon: Icons.edit_rounded,
            label: 'Edit Profile',
            onTap: onEditProfile,
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.settings_rounded,
            label: 'Settings',
            onTap: onSettings,
          ),
          if (showSubscription) ...[
            const _SettingsDivider(),
            _SettingsListItem(
              icon: Icons.subscriptions_rounded,
              label: 'Subscription',
              onTap: onSubscription,
            ),
          ],
        ],
      ),
    );
  }
}

class _SettingsListItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingsListItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            // Left: Gray/neutral icon (no background)
            Icon(
              icon,
              color: const Color(0xFF8B8F97), // Neutral gray
              size: 22,
            ),
            const SizedBox(width: 16),
            // Middle: Label
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: const Color(0xFF0F1115), // Near-black primary
                  fontWeight: FontWeight.w400,
                  fontSize: 16,
                ),
              ),
            ),
            // Right: Chevron (near-black)
            Icon(
              Icons.chevron_right_rounded,
              color: const Color(0xFF0F1115), // Near-black primary
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsDivider extends StatelessWidget {
  const _SettingsDivider();

  @override
  Widget build(BuildContext context) {
    return const Divider(
      height: 1,
      thickness: 1,
      indent: 54, // Icon (22) + spacing (16) + padding (16) = 54
      color: Color(0xFFEEF0F3), // Light gray divider
    );
  }
}

// 4) Logout Card (separate card, red accent)
class _LogoutCard extends StatelessWidget {
  final VoidCallback onLogout;

  const _LogoutCard({required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onLogout,
        child: Container(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Left: Red icon (no background)
              Icon(
                Icons.logout_rounded,
                color: const Color(0xFFFF3B30), // Secondary red
                size: 22,
              ),
              const SizedBox(width: 16),
              // Middle: Label (red)
              Expanded(
                child: Text(
                  'Logout',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: const Color(0xFFFF3B30), // Secondary red
                    fontWeight: FontWeight.w400,
                    fontSize: 16,
                  ),
                ),
              ),
              // Right: Chevron (red)
              Icon(
                Icons.chevron_right_rounded,
                color: const Color(0xFFFF3B30), // Secondary red
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 5) Upgrade/Plans CTA Card
class _UpgradeCard extends StatelessWidget {
  final VoidCallback onViewPlans;

  const _UpgradeCard({required this.onViewPlans});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Text
          Text(
            'Want to access more features?',
            style: AppTextStyles.bodyMedium.copyWith(
              color: const Color(0xFF0F1115), // Near-black primary
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          // Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onViewPlans,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF3B30), // Secondary red
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30), // Pill shape
                ),
                elevation: 0,
              ),
              child: Text(
                'View Plans',
                style: AppTextStyles.labelLarge.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
