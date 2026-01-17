import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/models/api_response.dart';

class ReferralsRepository {
  final Dio _dio = DioClient.instance;

  /// Get current user's referral information
  Future<ApiResponse<Map<String, dynamic>>> getMyReferrals() async {
    try {
      final response = await _dio.get('/referrals/me');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        return ApiResponse(
          success: true,
          data: response.data as Map<String, dynamic>,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to fetch referrals',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to fetch referrals',
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
