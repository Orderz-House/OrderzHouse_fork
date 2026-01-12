import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import 'package:mobile_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_app/core/models/user.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).user;

    return Scaffold(
      body: Stack(
        children: [
          // Ambient background lighting with gradient blobs
          _AmbientBackground(),
          // Main content
          SafeArea(
            child: Column(
              children: [
                // AppBar
                _CustomAppBar(),
                // Scrollable content
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        const SizedBox(height: AppSpacing.lg),
                        // Profile header section
                        _ProfileHeader(user: user),
                        const SizedBox(height: AppSpacing.xl),
                        // Settings card (main list)
                        _SettingsCard(
                          onEditProfile: () => context.go('/edit-profile'),
                          onSettings: () => context.go('/settings'),
                          onSubscription: () => context.go('/subscription'),
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
                        const SizedBox(height: AppSpacing.xl),
                        // "Want to access more features?" section
                        _UpgradeCard(
                          onViewPlans: () => context.go('/subscription'),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Ambient background with gradient blobs
class _AmbientBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFAF9FF), // Very subtle cool-lavender tint at top
            Color(0xFFFFFFFF), // Pure white
            Color(0xFFFFFFFF), // Pure white
          ],
        ),
      ),
      child: Stack(
        children: [
          // Top-left gradient blob
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF6B6CF6).withOpacity(0.08), // Soft periwinkle
                    const Color(0xFF6B6CF6).withOpacity(0.03),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Top-right gradient blob
          Positioned(
            top: -80,
            right: -120,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF6B6CF6).withOpacity(0.06), // Soft periwinkle
                    const Color(0xFF6B6CF6).withOpacity(0.02),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Bottom-left gradient blob
          Positioned(
            bottom: -150,
            left: -80,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF6B6CF6).withOpacity(0.05), // Soft periwinkle
                    const Color(0xFF6B6CF6).withOpacity(0.01),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Custom AppBar
class _CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      systemOverlayStyle: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark, // Dark icons for light background
        statusBarBrightness: Brightness.light,
      ),
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_ios_rounded,
          color: Color(0xFF111827),
          size: 20,
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      centerTitle: true,
      title: Text(
        'Manage Account',
        style: AppTextStyles.headlineMedium.copyWith(
          color: const Color(0xFF111827),
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
    );
  }
}

// Profile header section
class _ProfileHeader extends StatelessWidget {
  final User? user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          // Circular avatar with soft shadow
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6B6CF6).withOpacity(0.12), // Soft periwinkle shadow
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 40,
              backgroundColor: const Color(0xFFEEF0FF), // Very light lavender
              backgroundImage: user?.profilePicUrl != null
                  ? NetworkImage(user!.profilePicUrl!)
                  : null,
              child: user?.profilePicUrl == null
                  ? const Icon(
                      Icons.person_rounded,
                      size: 40,
                      color: Color(0xFF6B6CF6), // Soft periwinkle
                    )
                  : null,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Name and subtitle
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.displayName ?? 'User',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: const Color(0xFF111827),
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: const Color(0xFF6B7280),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Settings card with menu items
class _SettingsCard extends StatelessWidget {
  final VoidCallback onEditProfile;
  final VoidCallback onSettings;
  final VoidCallback onSubscription;
  final VoidCallback onLogout;

  const _SettingsCard({
    required this.onEditProfile,
    required this.onSettings,
    required this.onSubscription,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFE9EAF7), // Very light grey-lavender border
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6B6CF6).withOpacity(0.06), // Soft periwinkle shadow
            blurRadius: 20,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Column(
        children: [
          _ProfileMenuItem(
            icon: Icons.edit_rounded,
            title: 'Edit Profile',
            onTap: onEditProfile,
          ),
          const _MenuDivider(),
          _ProfileMenuItem(
            icon: Icons.settings_rounded,
            title: 'Settings',
            onTap: onSettings,
          ),
          const _MenuDivider(),
          _ProfileMenuItem(
            icon: Icons.subscriptions_rounded,
            title: 'Subscription',
            onTap: onSubscription,
          ),
          const _MenuDivider(),
          _ProfileMenuItem(
            icon: Icons.logout_rounded,
            title: 'Logout',
            onTap: onLogout,
            isLogout: true,
          ),
        ],
      ),
    );
  }
}

// Reusable menu item widget with micro-interactions
class _ProfileMenuItem extends StatefulWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final bool isLogout;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.isLogout = false,
  });

  @override
  State<_ProfileMenuItem> createState() => _ProfileMenuItemState();
}

class _ProfileMenuItemState extends State<_ProfileMenuItem>
    with SingleTickerProviderStateMixin {
  bool _isPressed = false;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _isPressed = true);
        _controller.forward();
      },
      onTapUp: (_) {
        setState(() => _isPressed = false);
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () {
        setState(() => _isPressed = false);
        _controller.reverse();
      },
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            color: _isPressed
                ? const Color(0xFF6B6CF6).withOpacity(0.05) // Very subtle accent tint
                : Colors.transparent,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.md + 2,
            ),
            child: Row(
              children: [
                // Circular icon background
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: widget.isLogout
                        ? const Color(0xFFFEECEC) // Very light red for logout
                        : const Color(0xFFEEF0FF), // Very light lavender
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.icon,
                    size: 22,
                    color: widget.isLogout
                        ? const Color(0xFFEF4444) // Soft red for logout
                        : const Color(0xFF6B6CF6), // Soft periwinkle for other items
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                // Title text
                Expanded(
                  child: Text(
                    widget.title,
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: widget.isLogout
                          ? const Color(0xFFEF4444) // Soft red for logout
                          : const Color(0xFF111827), // Near-black for other items
                      fontWeight: FontWeight.w500,
                      fontSize: 16,
                    ),
                  ),
                ),
                // Chevron arrow
                Icon(
                  Icons.chevron_right_rounded,
                  color: widget.isLogout
                      ? const Color(0xFFEF4444) // Soft red for logout
                      : const Color(0xFF6B6CF6), // Soft periwinkle for other items
                  size: 22,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Custom divider widget
class _MenuDivider extends StatelessWidget {
  const _MenuDivider();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Divider(
        height: 1,
        thickness: 1,
        indent: 44 + AppSpacing.md, // Align with content (icon + spacing)
        color: const Color(0xFFF1F2FB), // Ultra light divider
      ),
    );
  }
}

// Upgrade card section (matches reference design)
class _UpgradeCard extends StatelessWidget {
  final VoidCallback onViewPlans;

  const _UpgradeCard({required this.onViewPlans});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: const Color(0xFFF6F3FF), // Soft lavender background
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6B6CF6).withValues(alpha: 0.08), // Soft periwinkle shadow
            blurRadius: 20,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Column(
        children: [
          // Centered text
          Text(
            'Want to access more features?',
            style: AppTextStyles.bodyMedium.copyWith(
              color: const Color(0xFF111827),
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.md),
          // Large rounded pill button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onViewPlans,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6D5FFD), // Primary purple
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.xl,
                  vertical: AppSpacing.md,
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
