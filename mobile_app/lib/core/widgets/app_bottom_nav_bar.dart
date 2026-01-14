import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

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

/// Custom bottom navigation bar - full-width, edge-to-edge, docked at bottom
/// - Full-width container (edge-to-edge) across the phone screen
/// - Attached to the very bottom (no gap, no floating)
/// - Only top corners rounded (big radius), bottom corners = 0
/// - Soft top shadow only
/// - Active item: near-black icon + label, NO background pill
/// - Inactive items: light grey icon + label
class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final List<NavItem> items;
  final ValueChanged<int>? onTap;

  // Color constants
  static const Color activeIconColor = Color(0xFF1A1A1A); // Near-black
  static const Color activeLabelColor = Color(0xFF1A1A1A); // Near-black
  static const Color inactiveColor = Color(0xFFB0B0B0); // Light grey
  static const Color barBackground = Colors.white;

  // Base height for the navigation bar (without safe area padding)
  static const double baseHeight = 85.0;
  // Top corner radius (big rounded corners)
  static const double topCornerRadius = 24.0;

  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.items,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Get bottom padding (safe area / gesture area)
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final totalHeight = baseHeight + bottomPadding;

    return Container(
      width: double.infinity, // Full-width, edge-to-edge
      height: totalHeight,
      decoration: BoxDecoration(
        color: barBackground,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(topCornerRadius),
          topRight: Radius.circular(topCornerRadius),
          bottomLeft: Radius.zero, // No bottom corner radius
          bottomRight: Radius.zero, // No bottom corner radius
        ),
        boxShadow: [
          // Very soft top shadow only (subtle elevation)
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, -2), // Top shadow (negative Y)
            spreadRadius: 0,
          ),
        ],
      ),
      child: SafeArea(
        top: false, // Don't add top padding
        bottom: false, // We handle bottom padding manually
        child: Padding(
          padding: EdgeInsets.only(
            bottom: bottomPadding, // Add bottom padding to fill safe area
          ),
          child: Container(
            height: baseHeight,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(items.length, (index) {
                final item = items[index];
                final isSelected = index == currentIndex;

                return Expanded(
                  child: _NavItemWidget(
                    item: item,
                    isSelected: isSelected,
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
    );
  }
}

/// Individual navigation item widget with smooth animation
class _NavItemWidget extends StatelessWidget {
  final NavItem item;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItemWidget({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = isSelected
        ? AppBottomNavBar.activeIconColor
        : AppBottomNavBar.inactiveColor;
    final labelColor = isSelected
        ? AppBottomNavBar.activeLabelColor
        : AppBottomNavBar.inactiveColor;

    return InkWell(
      onTap: onTap,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(
          horizontal: 8,
          vertical: 8,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon - NO background pill/circle
            Icon(
              item.icon,
              color: iconColor,
              size: 27,
            ),
            const SizedBox(height: 5),
            // Label
            Text(
              item.title,
              style: TextStyle(
                color: labelColor,
                fontSize: 13,
                fontWeight: isSelected
                    ? FontWeight.w500
                    : FontWeight.w400,
                letterSpacing: 0.1,
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
