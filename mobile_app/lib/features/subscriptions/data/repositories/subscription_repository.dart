import 'package:dio/dio.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/app_config.dart';

class SubscriptionRepository {
  final Dio _dio = DioClient.instance;

  /// Create Stripe checkout session for subscription
  /// Endpoint: POST /stripe/create-checkout-session
  /// Body: { plan_id: number, user_id: number }
  /// Response: { url: string }
  Future<ApiResponse<String>> createCheckoutSession({
    required int planId,
    required int userId,
  }) async {
    try {
      if (AppConfig.isDevelopment) {
        print('📡 REQUEST[POST] => PATH: /stripe/create-checkout-session');
        print('📡 REQUEST[POST] => Body: { plan_id: $planId, user_id: $userId }');
      }

      final response = await _dio.post(
        '/stripe/create-checkout-session',
        data: {
          'plan_id': planId,
          'user_id': userId,
        },
      );

      if (AppConfig.isDevelopment) {
        print('✅ RESPONSE[${response.statusCode}] => PATH: /stripe/create-checkout-session');
        print('✅ RESPONSE[${response.statusCode}] => Data: ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      final checkoutUrl = data['url'] as String?;

      if (checkoutUrl == null || checkoutUrl.isEmpty) {
        return const ApiResponse(
          success: false,
          data: '',
          message: 'No checkout URL received from server',
        );
      }

      return ApiResponse(
        success: true,
        data: checkoutUrl,
        message: 'Checkout session created successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /stripe/create-checkout-session');
        print('❌ ERROR => Type: ${e.type}');
        print('❌ ERROR => Message: ${e.message}');
        if (e.response != null) {
          print('❌ ERROR => Status Code: ${e.response?.statusCode}');
          print('❌ ERROR => Response Data: ${e.response?.data}');
        }
      }

      return ApiResponse(
        success: false,
        data: '',
        message: e.response?.data is Map
            ? (e.response?.data as Map<String, dynamic>)['error'] as String?
            : 'Failed to create checkout session',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ UNEXPECTED ERROR => /stripe/create-checkout-session: $e');
      }

      return ApiResponse(
        success: false,
        data: '',
        message: 'Failed to create checkout session: ${e.toString()}',
      );
    }
  }

  /// Confirm Stripe checkout session
  /// Endpoint: GET /stripe/confirm?session_id=...
  /// Response: { ok: true } or { ok: false, error: string }
  Future<ApiResponse<bool>> confirmCheckoutSession(String sessionId) async {
    try {
      if (AppConfig.isDevelopment) {
        print('📡 REQUEST[GET] => PATH: /stripe/confirm?session_id=$sessionId');
      }

      final response = await _dio.get(
        '/stripe/confirm',
        queryParameters: {'session_id': sessionId},
      );

      if (AppConfig.isDevelopment) {
        print('✅ RESPONSE[${response.statusCode}] => PATH: /stripe/confirm');
        print('✅ RESPONSE[${response.statusCode}] => Data: ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      final ok = data['ok'] as bool? ?? false;

      if (ok) {
        return const ApiResponse(
          success: true,
          data: true,
          message: 'Payment confirmed successfully',
        );
      } else {
        final error = data['error'] as String? ?? 'Payment confirmation failed';
        return ApiResponse(
          success: false,
          data: false,
          message: error,
        );
      }
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /stripe/confirm');
        print('❌ ERROR => Type: ${e.type}');
        print('❌ ERROR => Message: ${e.message}');
        if (e.response != null) {
          print('❌ ERROR => Status Code: ${e.response?.statusCode}');
          print('❌ ERROR => Response Data: ${e.response?.data}');
        }
      }

      String? errorMessage;
      if (e.response?.data is Map) {
        errorMessage = (e.response?.data as Map<String, dynamic>)['error'] as String?;
      }

      return ApiResponse(
        success: false,
        data: false,
        message: errorMessage ?? 'Failed to confirm payment',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ UNEXPECTED ERROR => /stripe/confirm: $e');
      }

      return ApiResponse(
        success: false,
        data: false,
        message: 'Failed to confirm payment: ${e.toString()}',
      );
    }
  }
}
