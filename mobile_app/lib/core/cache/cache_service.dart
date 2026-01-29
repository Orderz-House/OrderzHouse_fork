import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Cache service for storing and retrieving cached data
/// Uses SharedPreferences for persistence across app restarts
class CacheService {
  static const String _cachePrefix = 'app_cache_';
  static const String _cacheTimestampPrefix = 'app_cache_ts_';
  static const Duration _defaultCacheDuration = Duration(hours: 1);

  /// Get cached data by key
  static Future<T?> get<T>(String key, T Function(Map<String, dynamic>) fromJson) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final timestampKey = '$_cacheTimestampPrefix$key';
      
      final cachedData = prefs.getString(cacheKey);
      final timestamp = prefs.getInt(timestampKey);
      
      if (cachedData == null || timestamp == null) {
        return null;
      }
      
      // Check if cache is expired
      final cacheAge = DateTime.now().difference(DateTime.fromMillisecondsSinceEpoch(timestamp));
      if (cacheAge > _defaultCacheDuration) {
        // Cache expired, but return it anyway for stale-while-revalidate
        // The caller will use it while fetching fresh data
      }
      
      final jsonData = json.decode(cachedData) as Map<String, dynamic>;
      return fromJson(jsonData);
    } catch (e) {
      print('❌ [CacheService] Error getting cache for $key: $e');
      return null;
    }
  }

  /// Get cached list data by key
  static Future<List<T>?> getList<T>(String key, T Function(Map<String, dynamic>) fromJson) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final timestampKey = '$_cacheTimestampPrefix$key';
      
      final cachedData = prefs.getString(cacheKey);
      final timestamp = prefs.getInt(timestampKey);
      
      if (cachedData == null || timestamp == null) {
        return null;
      }
      
      final jsonData = json.decode(cachedData) as List<dynamic>;
      return jsonData.map((item) => fromJson(item as Map<String, dynamic>)).toList();
    } catch (e) {
      print('❌ [CacheService] Error getting cache list for $key: $e');
      return null;
    }
  }

  /// Set cached data (for freezed models with toJson)
  static Future<void> set<T>(String key, T data, Map<String, dynamic> Function(T) toJson) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final timestampKey = '$_cacheTimestampPrefix$key';
      
      final jsonData = toJson(data);
      final jsonString = json.encode(jsonData);
      
      await prefs.setString(cacheKey, jsonString);
      await prefs.setInt(timestampKey, DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      print('❌ [CacheService] Error setting cache for $key: $e');
    }
  }

  /// Set cached list data (for freezed models with toJson)
  static Future<void> setList<T>(String key, List<T> data, Map<String, dynamic> Function(T) toJson) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final timestampKey = '$_cacheTimestampPrefix$key';
      
      final jsonData = data.map((item) => toJson(item)).toList();
      final jsonString = json.encode(jsonData);
      
      await prefs.setString(cacheKey, jsonString);
      await prefs.setInt(timestampKey, DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      print('❌ [CacheService] Error setting cache list for $key: $e');
    }
  }

  /// Clear cache for a specific key
  static Future<void> clear(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final timestampKey = '$_cacheTimestampPrefix$key';
      
      await prefs.remove(cacheKey);
      await prefs.remove(timestampKey);
    } catch (e) {
      print('❌ [CacheService] Error clearing cache for $key: $e');
    }
  }

  /// Clear all cache
  static Future<void> clearAll() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      
      for (final key in keys) {
        if (key.startsWith(_cachePrefix) || key.startsWith(_cacheTimestampPrefix)) {
          await prefs.remove(key);
        }
      }
    } catch (e) {
      print('❌ [CacheService] Error clearing all cache: $e');
    }
  }
}
