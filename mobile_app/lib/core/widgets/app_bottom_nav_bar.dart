import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_spacing.dart';

/// Navigation item for bottom navigation bar
class NavItem {
  final String title;
  final IconData icon;
  final String route;

  const NavItem({
    required this.title,
    required this.icon,
    required this.route,
  });
}

/// Custom bottom navigation bar matching the reference image design
/// - Floating rounded container with soft shadow
/// - Icons in circles
/// - Selected tab has pill background
/// - Labels under icons
/// - Purple color scheme
/// - Supports Light/Dark theme
class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final List<NavItem> items;
  final ValueChanged<int>? onTap;

  // Color constants matching the reference image
  static const Color primaryPurple = Color(0xFF6D5DF6);
  static const Color selectedPillBg = Color(0xFFE9E6FF);
  static const Color selectedIconCircleBg = Color(0xFFD9D4FF);
  static const Color unselectedGray = Color(0xFFB0B0B0);

  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.items,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = colorScheme.brightness == Brightness.dark;

    // Use theme-aware colors
    final barBackground = isDark ? colorScheme.surface : Colors.white;
    const selectedColor = primaryPurple;
    // ignore: deprecated_member_use
    final unselectedColor = isDark
        ? colorScheme.onSurface.withOpacity(0.6)
        : unselectedGray;

    return SafeArea(
      bottom: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Container(
            height: 78,
            decoration: BoxDecoration(
              color: barBackground,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                // ignore: deprecated_member_use
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                  spreadRadius: 0,
                ),
                // ignore: deprecated_member_use
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                  spreadRadius: 0,
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(items.length, (index) {
                  final item = items[index];
                  final isSelected = index == currentIndex;

                  return Expanded(
                    child: _NavItemWidget(
                      item: item,
                      isSelected: isSelected,
                      selectedColor: selectedColor,
                      unselectedColor: unselectedColor,
                      selectedPillBg: selectedPillBg,
                      selectedIconCircleBg: selectedIconCircleBg,
                      onTap: () {
                        // Avoid double navigation if user taps the currently selected tab
                        if (index == currentIndex) {
                          return;
                        }

                        // Call custom onTap if provided, otherwise use default navigation
                        if (onTap != null) {
                          onTap!(index);
                        } else {
                          // Default navigation using routes
                          final route = item.route;
                          if (route.isNotEmpty) {
                            context.go(route);
                          }
                        }
                      },
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Individual navigation item widget
class _NavItemWidget extends StatelessWidget {
  final NavItem item;
  final bool isSelected;
  final Color selectedColor;
  final Color unselectedColor;
  final Color selectedPillBg;
  final Color selectedIconCircleBg;
  final VoidCallback onTap;

  const _NavItemWidget({
    required this.item,
    required this.isSelected,
    required this.selectedColor,
    required this.unselectedColor,
    required this.selectedPillBg,
    required this.selectedIconCircleBg,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = isSelected ? selectedColor : unselectedColor;
    final labelColor = isSelected ? selectedColor : unselectedColor;
    final labelWeight = isSelected ? FontWeight.w600 : FontWeight.w400;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? selectedPillBg : Colors.transparent,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon in a circle
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isSelected
                    ? selectedIconCircleBg
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Icon(
                item.icon,
                color: iconColor,
                size: 22,
              ),
            ),
            const SizedBox(height: 3),
            // Label
            Text(
              item.title,
              style: TextStyle(
                color: labelColor,
                fontSize: 11,
                fontWeight: labelWeight,
                letterSpacing: 0.2,
                height: 1.0,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
