import 'package:dio/dio.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/app_config.dart';

class SubscriptionStatus {
  final bool isSubscribed;
  final int? planId;
  final DateTime? expiresAt;
  final String? planName;
  final String? status;

  SubscriptionStatus({
    required this.isSubscribed,
    this.planId,
    this.expiresAt,
    this.planName,
    this.status,
  });
}

class SubscriptionRepository {
  final Dio _dio = DioClient.instance;

  /// Get freelancer's subscription status
  /// Endpoint: GET /plans/subscription/me (based on web frontend usage)
  /// If endpoint doesn't exist, returns not subscribed
  Future<ApiResponse<SubscriptionStatus>> getSubscriptionStatus() async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /plans/subscription/me');
      }

      final response = await _dio.get('/plans/subscription/me');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /plans/subscription/me');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Data: ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      
      // Handle response format: { success: true, subscription: {...} } or { subscription: {...} }
      final subscriptionData = data['subscription'] as Map<String, dynamic>? ?? data;
      
      final status = subscriptionData['status'] as String? ?? 'inactive';
      final isActive = status.toLowerCase() == 'active';
      
      DateTime? expiresAt;
      if (subscriptionData['end_date'] != null) {
        try {
          expiresAt = DateTime.parse(subscriptionData['end_date'] as String);
        } catch (e) {
          // Ignore parse errors
        }
      }

      final subscriptionStatus = SubscriptionStatus(
        isSubscribed: isActive && expiresAt != null && expiresAt.isAfter(DateTime.now()),
        planId: subscriptionData['plan_id'] as int?,
        expiresAt: expiresAt,
        planName: subscriptionData['plan_name'] as String?,
        status: status,
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📊 Subscription Status: isSubscribed=${subscriptionStatus.isSubscribed}, planId=${subscriptionStatus.planId}');
      }

      return ApiResponse(
        success: true,
        data: subscriptionStatus,
        message: 'Subscription status fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /plans/subscription/me');
        // ignore: avoid_print
        print('❌ ERROR => Type: ${e.type}');
        // ignore: avoid_print
        print('❌ ERROR => URI: ${e.requestOptions.uri}');
        // ignore: avoid_print
        print('❌ ERROR => Message: ${e.message}');
        if (e.response != null) {
          // ignore: avoid_print
          print('❌ ERROR => Status Code: ${e.response?.statusCode}');
          // ignore: avoid_print
          print('❌ ERROR => Response Data: ${e.response?.data}');
        }
      }

      // If 404, endpoint doesn't exist or no subscription - assume not subscribed
      if (e.response?.statusCode == 404) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ Subscription endpoint not found or no subscription - assuming not subscribed');
        }
        return ApiResponse(
          success: true,
          data: SubscriptionStatus(isSubscribed: false),
          message: 'No active subscription',
        );
      }

      // For other errors, return not subscribed (safe default)
      return ApiResponse(
        success: true,
        data: SubscriptionStatus(isSubscribed: false),
        message: 'Unable to check subscription status',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /plans/subscription/me: $e');
      }

      // Safe default: assume not subscribed
      return ApiResponse(
        success: true,
        data: SubscriptionStatus(isSubscribed: false),
        message: 'Unable to check subscription status',
      );
    }
  }
}
