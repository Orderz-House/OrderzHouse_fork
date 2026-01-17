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

        final user = User.fromJson(data['userInfo'] as Map<String, dynamic>);
        return ApiResponse(
          success: true,
          message: data['message'] as String?,
          data: user,
        );
      }

      // OTP required
      return const ApiResponse(
        success: false,
        message: 'OTP required',
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

      final user = User.fromJson(data['userInfo'] as Map<String, dynamic>);
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
      final user = User.fromJson(response.data['user'] as Map<String, dynamic>);
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

  Future<void> logout() async {
    await SecureStorageService.clearAll();
  }
}
