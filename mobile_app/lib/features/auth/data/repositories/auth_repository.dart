import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../../core/models/user.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_store.dart';
import '../../../../core/config/app_config.dart';

/*
  GOOGLE SIGN-IN CONFIGURATION CHECKLIST:
  ———————————————————————————————————————
  Android:
    - SHA-1 (debug + release) must be added to Google Cloud Console OAuth credentials.
    - Package name must match applicationId in build.gradle.
    - GOOGLE_WEB_CLIENT_ID in .env = Web application client ID from Console.
  iOS:
    - Bundle ID must match Google Cloud Console iOS OAuth client.
    - Info.plist: CFBundleURLTypes with REVERSED_CLIENT_ID (e.g. com.googleusercontent.apps.xxx).
    - GOOGLE_WEB_CLIENT_ID in .env = Web application client ID (used as serverClientId).
  Backend:
    - POST /auth/google accepts { idToken }.
    - GOOGLE_WEB_CLIENT_ID or GOOGLE_CLIENT_ID in backend .env.
*/

class AuthRepository {
  final Dio _dio = DioClient.instance;

  /// Sign in with Google: get idToken, send to backend, store JWT.
  Future<ApiResponse<User>> signInWithGoogle() async {
    try {
      final serverClientId = AppConfig.googleWebClientId;
      if (kDebugMode && (serverClientId == null || serverClientId.isEmpty)) {
        developer.log('GOOGLE_SIGNIN: GOOGLE_WEB_CLIENT_ID is not set in .env', name: 'Auth');
      }

      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        serverClientId: serverClientId,
      );

      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        if (kDebugMode) developer.log('GOOGLE_SIGNIN: User cancelled', name: 'Auth');
        return const ApiResponse(
          success: false,
          message: 'Sign in was cancelled',
        );
      }

      if (kDebugMode) {
        developer.log('GOOGLE_SIGNIN: email=${googleUser.email}', name: 'Auth');
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      final accessToken = googleAuth.accessToken;

      if (kDebugMode) {
        developer.log(
          'GOOGLE_SIGNIN: idToken=${idToken != null ? "${idToken.substring(0, idToken.length < 15 ? idToken.length : 15)}..." : "null"}',
          name: 'Auth',
        );
        developer.log(
          'GOOGLE_SIGNIN: accessToken=${accessToken != null ? "${accessToken.substring(0, accessToken.length < 15 ? accessToken.length : 15)}..." : "null"}',
          name: 'Auth',
        );
      }

      if (idToken == null || idToken.isEmpty) {
        if (kDebugMode) {
          developer.log('GOOGLE_SIGNIN: idToken is null - OAuth config issue (serverClientId?)', name: 'Auth');
        }
        return const ApiResponse(
          success: false,
          message: 'Missing idToken (OAuth config issue). Check GOOGLE_WEB_CLIENT_ID and SHA-1.',
        );
      }

      final response = await _dio.post(
        '/auth/google',
        data: {
          'idToken': idToken,
          if (accessToken != null) 'accessToken': accessToken,
        },
      );

      final data = response.data as Map<String, dynamic>;
      if (data['token'] != null) {
        final token = data['token'] as String;
        await SecureStore.saveAccessToken(token);
        final refreshToken = data['refreshToken'] as String?;
        if (refreshToken != null && refreshToken.isNotEmpty) {
          await SecureStore.saveRefreshToken(refreshToken);
        }

        final rawUser = data['userInfo'] ?? data['user'];
        if (rawUser == null || rawUser is! Map<String, dynamic>) {
          return const ApiResponse(
            success: false,
            message: 'Invalid response from server',
          );
        }
        final userData = Map<String, dynamic>.from(rawUser);
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

      return ApiResponse(
        success: false,
        message: data['message'] as String? ?? 'Google sign in failed',
      );
    } on PlatformException catch (e) {
      if (kDebugMode) {
        developer.log('GOOGLE_SIGNIN PlatformException: ${e.runtimeType} code=${e.code} message=${e.message}', name: 'Auth');
        developer.log('GOOGLE_SIGNIN stack: ${e.stacktrace ?? e.toString()}', name: 'Auth');
      }
      final msg = '${e.code}: ${e.message ?? "Platform error"}';
      return ApiResponse(success: false, message: msg);
    } on DioException catch (e) {
      final backendMsg = e.response?.data is Map
          ? (e.response!.data as Map)['message'] as String?
          : null;
      final msg = backendMsg ?? e.message ?? 'Google sign in failed';
      if (kDebugMode) {
        developer.log('GOOGLE_SIGNIN DioException: ${e.runtimeType} status=${e.response?.statusCode} message=$msg', name: 'Auth');
        developer.log('GOOGLE_SIGNIN response: ${e.response?.data}', name: 'Auth');
      }
      return ApiResponse(success: false, message: msg);
    } catch (e, stack) {
      if (kDebugMode) {
        developer.log('GOOGLE_SIGNIN Exception: ${e.runtimeType} $e', name: 'Auth');
        developer.log('GOOGLE_SIGNIN stack: $stack', name: 'Auth');
      }
      final isCancel = e.toString().toLowerCase().contains('cancel') ||
          e.toString().toLowerCase().contains('sign_in_canceled');
      return ApiResponse(
        success: false,
        message: isCancel ? 'Sign in was cancelled' : 'Google sign in failed: ${e.runtimeType}',
      );
    }
  }

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
        await SecureStore.saveAccessToken(token);
        final refreshToken = data['refreshToken'] as String?;
        if (refreshToken != null && refreshToken.isNotEmpty) {
          await SecureStore.saveRefreshToken(refreshToken);
        }

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
      await SecureStore.saveAccessToken(token);
      final refreshToken = data['refreshToken'] as String?;
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await SecureStore.saveRefreshToken(refreshToken);
      }

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
      final token = await SecureStore.readAccessToken();
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
    await GoogleSignIn().signOut();
    await SecureStore.clearAll();
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
