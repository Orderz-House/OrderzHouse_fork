import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Key for storing locale preference
const String _localeKey = 'app_locale';

/// Supported locales
class AppLocales {
  static const Locale english = Locale('en');
  static const Locale arabic = Locale('ar');
  
  static const List<Locale> supported = [english, arabic];
  
  /// Check if locale is RTL
  static bool isRtl(Locale locale) => locale.languageCode == 'ar';
}

/// Locale state notifier for managing app language
class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(AppLocales.english) {
    _loadSavedLocale();
  }
  
  /// Load saved locale from SharedPreferences
  Future<void> _loadSavedLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedLocale = prefs.getString(_localeKey);
      if (savedLocale != null) {
        state = Locale(savedLocale);
      }
    } catch (e) {
      debugPrint('Error loading saved locale: $e');
    }
  }
  
  /// Change app locale and persist
  Future<void> setLocale(Locale locale) async {
    if (state == locale) return;
    
    state = locale;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localeKey, locale.languageCode);
    } catch (e) {
      debugPrint('Error saving locale: $e');
    }
  }
  
  /// Toggle between English and Arabic
  Future<void> toggleLocale() async {
    final newLocale = state.languageCode == 'en' 
        ? AppLocales.arabic 
        : AppLocales.english;
    await setLocale(newLocale);
  }
  
  /// Check if current locale is Arabic (RTL)
  bool get isArabic => state.languageCode == 'ar';
  
  /// Check if current locale is RTL
  bool get isRtl => AppLocales.isRtl(state);
}

/// Provider for locale state
final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

/// Provider for checking if current locale is RTL
final isRtlProvider = Provider<bool>((ref) {
  final locale = ref.watch(localeProvider);
  return AppLocales.isRtl(locale);
});
