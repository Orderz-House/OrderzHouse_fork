import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/models/api_response.dart';

class ReferralsRepository {
  final Dio _dio = DioClient.instance;

  /// Get current user's referral information
  Future<ApiResponse<Map<String, dynamic>>> getMyReferrals() async {
    try {
      final response = await _dio.get('/referrals/me');
      
      // Debug logging (remove in production if needed)
      print('GET /referrals/me - Status: ${response.statusCode}');
      print('GET /referrals/me - Response data: ${response.data}');
      
      // Accept both 200 with success field OR 200 with data directly (for backward compatibility)
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        
        // If response has 'success' field, check it; otherwise assume success if status is 200
        final hasSuccess = data['success'];
        if (hasSuccess == null || hasSuccess == true) {
          return ApiResponse(
            success: true,
            data: data,
          );
        }
      }

      return ApiResponse(
        success: false,
        message: (response.data as Map<String, dynamic>?)?['message'] as String? ?? 'Failed to fetch referrals',
      );
    } on DioException catch (e) {
      // Enhanced error logging
      print('GET /referrals/me - DioException: ${e.type}');
      print('GET /referrals/me - Status: ${e.response?.statusCode}');
      print('GET /referrals/me - Message: ${e.message}');
      print('GET /referrals/me - Response data: ${e.response?.data}');
      
      String? errorMessage;
      if (e.response?.data is Map) {
        errorMessage = (e.response?.data as Map<String, dynamic>)['message'] as String?;
      }
      
      return ApiResponse(
        success: false,
        message: errorMessage ?? 'Failed to fetch referrals',
      );
    } catch (e) {
      // Catch any other exceptions (parsing errors, etc.)
      print('GET /referrals/me - Unexpected error: $e');
      return ApiResponse(
        success: false,
        message: 'Unexpected error: ${e.toString()}',
      );
    }
  }

  /// Apply referral code during signup
  Future<ApiResponse<void>> applyReferralCode(String code) async {
    try {
      final response = await _dio.post(
        '/referrals/apply',
        data: {'code': code},
      );
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to apply referral code',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to apply referral code',
      );
    }
  }

  /// Complete referral (called after first paid plan purchase)
  Future<ApiResponse<void>> completeReferral(int referredUserId) async {
    try {
      final response = await _dio.post(
        '/referrals/complete',
        data: {'referredUserId': referredUserId},
      );
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to complete referral',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to complete referral',
      );
    }
  }
}
