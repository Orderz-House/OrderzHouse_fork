import 'package:flutter/material.dart';

/// Design tokens - Single source of truth for all colors
/// Based on Explore page "Your Posts" style theme
class AppColors {
  AppColors._();

  // Primary Colors - Coral Red (matching Explore page)
  static const Color primary = Color(0xFFFF4D57); // Coral-red
  static const Color primaryDark = Color(0xFFE8434C); // Pressed/darker
  static const Color primaryLight = Color(0xFFFF6B73); // Lighter variant

  // Secondary Colors (kept for compatibility, but using primary for accent)
  static const Color secondary = Color(0xFFFF4D57);
  static const Color secondaryDark = Color(0xFFE8434C);
  static const Color secondaryLight = Color(0xFFFF6B73);

  // Neutral Colors
  static const Color background = Color(0xFFFFFFFF); // Pure white
  static const Color surface = Color(0xFFFFFFFF); // White (card background)
  static const Color surfaceVariant = Color(0xFFF9FAFB);

  // Text Colors (matching Explore)
  static const Color textPrimary = Color(0xFF111827); // Near-black
  static const Color textSecondary = Color(0xFF6B7280); // Gray
  static const Color textTertiary = Color(0xFF9CA3AF); // Light gray

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  static const Color danger = Color(0xFFEF4444); // For logout/delete actions

  // Border Colors
  static const Color border = Color(0xFFE5E7EB); // Light gray
  static const Color borderLight = Color(0xFFF3F4F6);

  // Chip Colors (matching Explore)
  static const Color chipBg = Color(0xFFFFFFFF); // White background for inactive
  static const Color chipActiveBg = Color(0xFF111827); // Near-black for active
  static const Color chipBorder = Color(0xFFE5E7EB); // Light gray border
  static const Color chipText = Color(0xFF111827); // Black text for inactive
  static const Color chipActiveText = Color(0xFFFFFFFF); // White text for active

  // Icon Colors
  static const Color iconGray = Color(0xFF6B7280); // Gray for inactive icons
  static const Color iconActive = Color(0xFFFF4D57); // Coral-red for active icons
  static const Color iconBlack = Color(0xFF111827); // Near-black for default icons

  // Shadow Colors
  static const Color shadowColor = Color(0x0D000000); // Very light shadow (5% opacity)
  static const Color shadowColorLight = Color(0x05000000); // Lighter shadow (2% opacity)

  // Overlay
  static const Color overlay = Color(0x80000000);

  // Top Glow (subtle pinkish tint)
  static const Color topGlowStart = Color(0x4DFFF5F5); // Very subtle pinkish tint (30% opacity)
  static const Color topGlowEnd = Color(0xFFFFFFFF); // Pure white
}
