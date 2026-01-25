import 'package:dio/dio.dart';
import '../../../../core/models/user.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage_service.dart';

class AuthRepository {
  final Dio _dio = DioClient.instance;

  Future<ApiResponse<User>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/users/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data as Map<String, dynamic>;

      if (data['token'] != null) {
        final token = data['token'] as String;
        await SecureStorageService.saveToken(token);

        final userData = data['userInfo'] as Map<String, dynamic>;
        // Include terms acceptance fields
        if (data['must_accept_terms'] != null) {
          userData['must_accept_terms'] = data['must_accept_terms'];
        }
        if (data['terms_version_required'] != null) {
          userData['terms_version_required'] = data['terms_version_required'];
        }
        final user = User.fromJson(userData);
        return ApiResponse(
          success: true,
          message: data['message'] as String?,
          data: user,
        );
      }

      // No token - treat as login failure (not OTP)
      // OTP is only for registration, not login
      return ApiResponse(
        success: false,
        message: data['message'] as String? ?? 'Login failed. Please check your credentials.',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Login failed',
      );
    }
  }

  Future<ApiResponse<User>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        '/users/verify-otp',
        data: {
          'email': email,
          'otp': otp,
        },
      );

      final data = response.data as Map<String, dynamic>;
      final token = data['token'] as String;
      await SecureStorageService.saveToken(token);

      final userData = data['userInfo'] as Map<String, dynamic>;
      // Include terms acceptance fields
      if (data['must_accept_terms'] != null) {
        userData['must_accept_terms'] = data['must_accept_terms'];
      }
      if (data['terms_version_required'] != null) {
        userData['terms_version_required'] = data['terms_version_required'];
      }
      final user = User.fromJson(userData);
      return ApiResponse(
        success: true,
        message: data['message'] as String?,
        data: user,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'OTP verification failed',
      );
    }
  }

  Future<ApiResponse<void>> register({
    required int roleId,
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phoneNumber,
    required String country,
    required String username,
    List<int>? categoryIds,
    String? referralCode,
  }) async {
    try {
      final data = {
        'role_id': roleId,
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'password': password,
        'phone_number': phoneNumber,
        'country': country,
        'username': username,
      };

      if (categoryIds != null && categoryIds.isNotEmpty) {
        data['category_ids'] = categoryIds;
      }
      
      if (referralCode != null && referralCode.trim().isNotEmpty) {
        data['referral_code'] = referralCode.trim().toUpperCase();
      }

      final response = await _dio.post('/users/register', data: data);

      return ApiResponse(
        success: response.statusCode == 201,
        message: response.data['message'] as String?,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Registration failed',
      );
    }
  }

  Future<ApiResponse<void>> verifyEmail({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        '/users/verify-email',
        data: {
          'email': email,
          'otp': otp,
        },
      );

      return ApiResponse(
        success: response.statusCode == 200,
        message: response.data['message'] as String?,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Email verification failed',
      );
    }
  }

  Future<ApiResponse<User>> getUserData() async {
    try {
      final response = await _dio.get('/users/getUserdata');
      final userData = response.data['user'] as Map<String, dynamic>;
      // Include terms acceptance fields
      if (response.data['must_accept_terms'] != null) {
        userData['must_accept_terms'] = response.data['must_accept_terms'];
      }
      if (response.data['terms_version_required'] != null) {
        userData['terms_version_required'] = response.data['terms_version_required'];
      }
      final user = User.fromJson(userData);
      return ApiResponse(
        success: true,
        data: user,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to fetch user data',
      );
    }
  }

  Future<ApiResponse<void>> acceptTerms() async {
    try {
      final response = await _dio.post('/auth/accept-terms');
      return ApiResponse(
        success: response.statusCode == 200,
        message: response.data['message'] as String?,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to accept terms',
      );
    }
  }

  Future<ApiResponse<void>> deleteAccount({String? reason}) async {
    try {
      print('🔍 [DeleteAccount] Request: PUT /users/deactivate, reason=$reason');
      final response = await _dio.put(
        '/users/deactivate',
        data: reason != null ? {'reason': reason} : {},
      );
      
      print('✅ [DeleteAccount] Response[${response.statusCode}]: ${response.data}');
      
      return ApiResponse(
        success: response.statusCode == 200 && response.data['success'] == true,
        message: response.data['message'] as String? ?? 'Account deleted successfully',
      );
    } on DioException catch (e) {
      print('❌ [DeleteAccount] Error[${e.response?.statusCode}]: ${e.response?.data}');
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to delete account',
      );
    }
  }

  Future<ApiResponse<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final token = await SecureStorageService.getToken();
      if (token == null) {
        return const ApiResponse(
          success: false,
          message: 'Authentication required. Please login.',
        );
      }

      final response = await _dio.patch(
        '/auth/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return ApiResponse(
        success: response.statusCode == 200,
        message: response.data['message'] as String? ?? 'Password changed successfully',
      );
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      String message = 'Failed to change password';
      
      if (statusCode == 400 || statusCode == 401) {
        message = e.response?.data['message'] as String? ?? 'Current password is incorrect';
      } else if (statusCode == 500) {
        message = e.response?.data['message'] as String? ?? 'Server error. Please try again.';
      }
      
      return ApiResponse(
        success: false,
        message: message,
      );
    }
  }

  Future<void> logout() async {
    await SecureStorageService.clearAll();
  }

  // ==================== Forgot Password Flow ====================

  /// Request OTP for password reset
  Future<ApiResponse<void>> requestPasswordResetOtp({
    required String email,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/forgot-password',
        data: {'email': email},
      );

      return ApiResponse(
        success: response.statusCode == 200 || response.statusCode == 201,
        message: response.data['message'] as String? ?? 'OTP sent to your email',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to send OTP. Please try again.',
      );
    }
  }

  /// Verify OTP for password reset
  Future<ApiResponse<String?>> verifyPasswordResetOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/verify-reset-otp',
        data: {
          'email': email,
          'otp': otp,
        },
      );

      // Backend may return a reset token
      final resetToken = response.data['resetToken'] as String?;

      return ApiResponse(
        success: response.statusCode == 200,
        message: response.data['message'] as String? ?? 'OTP verified successfully',
        data: resetToken,
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Invalid OTP. Please try again.',
      );
    }
  }

  /// Reset password with email, OTP, and new password
  Future<ApiResponse<void>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/reset-password',
        data: {
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        },
      );

      return ApiResponse(
        success: response.statusCode == 200,
        message: response.data['message'] as String? ?? 'Password reset successfully',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to reset password. Please try again.',
      );
    }
  }

  /// Resend OTP for password reset
  Future<ApiResponse<void>> resendPasswordResetOtp({
    required String email,
  }) async {
    // This can reuse the requestPasswordResetOtp method
    return requestPasswordResetOtp(email: email);
  }
}
