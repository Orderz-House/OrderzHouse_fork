import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Lightweight, non-sensitive app settings only.
/// Do NOT store tokens or secrets here — use [SecureStorageService] / secure_store.
class AppPrefs {
  AppPrefs._();

  static const String _localeKey = 'app_locale';
  static const String _themeModeKey = 'app_theme_mode';
  static const String _onboardingSeenKey = 'onboarding_seen';
  static const String _lastRouteKey = 'last_route';
  static const String _pendingStripeFilePathsKey = 'pending_stripe_file_paths';

  static SharedPreferences? _prefs;
  static bool _initDone = false;

  static Future<void> init() async {
    if (_initDone) return;
    _prefs = await SharedPreferences.getInstance();
    _initDone = true;
  }

  static Future<SharedPreferences> get _instance async {
    if (_prefs != null) return _prefs!;
    await init();
    return _prefs!;
  }

  // ——— Language (en / ar) ———
  static Future<String?> getLanguageCode() async {
    final prefs = await _instance;
    return prefs.getString(_localeKey);
  }

  static Future<void> setLanguageCode(String code) async {
    final prefs = await _instance;
    await prefs.setString(_localeKey, code);
  }

  // ——— Theme mode ———
  static Future<ThemeMode> getThemeMode() async {
    final prefs = await _instance;
    final index = prefs.getInt(_themeModeKey);
    if (index == null) return ThemeMode.system;
    if (index >= 0 && index <= 2) return ThemeMode.values[index];
    return ThemeMode.system;
  }

  static Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await _instance;
    await prefs.setInt(_themeModeKey, mode.index);
  }

  // ——— Onboarding seen ———
  static Future<bool> getOnboardingSeen() async {
    final prefs = await _instance;
    return prefs.getBool(_onboardingSeenKey) ?? false;
  }

  static Future<void> setOnboardingSeen(bool value) async {
    final prefs = await _instance;
    await prefs.setBool(_onboardingSeenKey, value);
  }

  // ——— Last visited route (for post-restore navigation) ———
  static Future<String?> getLastRoute() async {
    final prefs = await _instance;
    return prefs.getString(_lastRouteKey);
  }

  static Future<void> setLastRoute(String path) async {
    final prefs = await _instance;
    await prefs.setString(_lastRouteKey, path);
  }

  static Future<void> clearLastRoute() async {
    final prefs = await _instance;
    await prefs.remove(_lastRouteKey);
  }

  // ——— Pending file paths for upload after Stripe success (deep link) ———
  static Future<void> setPendingStripeFilePaths(List<String> paths) async {
    final prefs = await _instance;
    await prefs.setStringList(_pendingStripeFilePathsKey, paths);
  }

  static Future<List<String>> getPendingStripeFilePaths() async {
    final prefs = await _instance;
    return prefs.getStringList(_pendingStripeFilePathsKey) ?? [];
  }

  static Future<void> clearPendingStripeFilePaths() async {
    final prefs = await _instance;
    await prefs.remove(_pendingStripeFilePathsKey);
  }
}
