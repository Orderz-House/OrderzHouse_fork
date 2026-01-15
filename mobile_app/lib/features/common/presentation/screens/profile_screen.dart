import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import 'package:mobile_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_app/core/models/user.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // Local state for dark mode toggle (TODO: connect to actual theme state if available)
  bool _isDarkMode = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).user;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        bottom: false,
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

              // 2) Stats Row
              _StatsRow(),
              const SizedBox(height: 18),

              // 3) Two Action Buttons
              _ActionButtonsRow(),
              const SizedBox(height: 18),

              // 4) Dark Mode Toggle Card
              _DarkModeCard(
                isDarkMode: _isDarkMode,
                onToggle: (value) {
                  setState(() {
                    _isDarkMode = value;
                  });
                  // TODO: Connect to actual theme state management
                },
              ),
              const SizedBox(height: 18),

              // 5) Settings List Card
              _SettingsListCard(),
              const SizedBox(height: 18),

              // 6) Logout Card
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

              // Bottom padding for safe area
              SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
            ],
          ),
        ),
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
        // Right: Name, Username, Email, Bio
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
              const SizedBox(height: 6),
              // Bio (short line, gray) - using placeholder since User model doesn't have bio field
              Text(
                'Creative designer passionate about digital art', // TODO: Add bio field to User model if needed
                style: AppTextStyles.bodySmall.copyWith(
                  color: const Color(0xFF8B8F97), // Secondary gray
                  fontSize: 13,
                ),
                maxLines: 2,
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

// 2) Stats Row
class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _StatItem(number: '24', label: 'Post'),
        _StatItem(number: '12', label: 'Collections'),
        _StatItem(number: '8', label: 'Shares'),
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

// 3) Two Action Buttons Row
class _ActionButtonsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionButton(
            label: 'Import Post',
            onTap: () {
              // TODO: Implement import post functionality
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionButton(
            label: 'Export Post',
            onTap: () {
              // TODO: Implement export post functionality
            },
          ),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: const Color(0xFFEEF0F3), // Very light gray border
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTextStyles.labelMedium.copyWith(
              color: const Color(0xFF0F1115), // Near-black primary
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}

// 4) Dark Mode Toggle Card
class _DarkModeCard extends StatelessWidget {
  final bool isDarkMode;
  final ValueChanged<bool> onToggle;

  const _DarkModeCard({
    required this.isDarkMode,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F6F8), // Very light gray background
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Dark Mode',
            style: AppTextStyles.bodyLarge.copyWith(
              color: const Color(0xFF0F1115), // Near-black primary
              fontWeight: FontWeight.w500,
              fontSize: 16,
            ),
          ),
          Switch(
            value: isDarkMode,
            onChanged: onToggle,
            activeColor: const Color(0xFFFF3B30), // Secondary red
            activeTrackColor: const Color(0xFFFF3B30).withOpacity(0.5),
          ),
        ],
      ),
    );
  }
}

// 5) Settings List Card
class _SettingsListCard extends StatelessWidget {
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
            icon: Icons.recommend_rounded,
            label: 'Recommend to a Friend',
            onTap: () {
              // TODO: Implement recommend functionality
            },
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.school_rounded,
            label: 'App Tutorial',
            onTap: () {
              // TODO: Navigate to app tutorial
            },
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.privacy_tip_rounded,
            label: 'Privacy Policy',
            onTap: () {
              // TODO: Navigate to privacy policy
            },
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.description_rounded,
            label: 'Terms and Conditions',
            onTap: () {
              // TODO: Navigate to terms and conditions
            },
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.help_outline_rounded,
            label: 'Frequently Asked Questions',
            onTap: () {
              // TODO: Navigate to FAQ
            },
          ),
          const _SettingsDivider(),
          _SettingsListItem(
            icon: Icons.info_outline_rounded,
            label: 'Version 1.2',
            onTap: null, // No action for version
            showChevron: false, // No chevron for version
          ),
        ],
      ),
    );
  }
}

class _SettingsListItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool showChevron;

  const _SettingsListItem({
    required this.icon,
    required this.label,
    this.onTap,
    this.showChevron = true,
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
            // Left: Red icon (no background)
            Icon(
              icon,
              color: const Color(0xFFFF3B30), // Secondary red
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
            if (showChevron)
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

// 6) Logout Card
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
              // Middle: Label
              Expanded(
                child: Text(
                  'Log Out',
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
      ),
    );
  }
}
