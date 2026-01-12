import 'package:dio/dio.dart';
import '../../../../core/models/category.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/app_config.dart';

class CategoriesRepository {
  final Dio _dio = DioClient.instance;

  /// Fetch explore categories (public categories for projects)
  /// Endpoint: GET /category (same as web frontend)
  /// Response: { success: true, data: [...] }
  Future<ApiResponse<List<Category>>> fetchExploreCategories() async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /category');
      }

      final response = await _dio.get('/category');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /category');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Final URL: ${response.requestOptions.uri}');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Response data length: ${response.data?.toString().length ?? 0} chars');
      }

      return _parseCategoriesResponse(response);
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /category');
        // ignore: avoid_print
        print('❌ ERROR => Type: ${e.type}');
        // ignore: avoid_print
        print('❌ ERROR => Final URL: ${e.requestOptions.uri}');
        // ignore: avoid_print
        print('❌ ERROR => Message: ${e.message}');
        if (e.error != null) {
          // ignore: avoid_print
          print('❌ ERROR => Error: ${e.error}');
        }
        if (e.response != null) {
          // ignore: avoid_print
          print('❌ ERROR => Status Code: ${e.response?.statusCode}');
          // ignore: avoid_print
          print('❌ ERROR => Response Data: ${e.response?.data}');
        }
      }

      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ??
            _getErrorMessage(e),
        error: e.response?.data as Map<String, dynamic>?,
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /category: $e');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch categories: ${e.toString()}',
      );
    }
  }

  /// Parse categories from response (handles both response formats)
  ApiResponse<List<Category>> _parseCategoriesResponse(Response response) {
    final data = response.data as Map<String, dynamic>;

    // Handle response format: { success: true, data: [...] } (from /category)
    List<dynamic>? categoriesList;

    if (data['data'] != null && data['data'] is List) {
      categoriesList = data['data'] as List<dynamic>;
    } else if (data['categories'] != null && data['categories'] is List) {
      categoriesList = data['categories'] as List<dynamic>;
    } else if (response.data is List) {
      categoriesList = response.data as List<dynamic>;
    }

    if (categoriesList == null || categoriesList.isEmpty) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('⚠️ RESPONSE: No categories found in response');
      }
      return ApiResponse(
        success: true,
        data: [],
        message: 'No categories available',
      );
    }

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('📊 Categories raw count: ${categoriesList.length}');
    }

    final categories = <Category>[];
    for (var i = 0; i < categoriesList.length; i++) {
      try {
        final json = categoriesList[i] as Map<String, dynamic>;
        final category = Category.fromJson(json);
        categories.add(category);
      } catch (e) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ Failed to parse category at index $i: $e');
          // ignore: avoid_print
          print('⚠️ Category data: ${categoriesList[i]}');
        }
        // Skip invalid categories but continue processing others
      }
    }

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('✅ Parsed ${categories.length}/${categoriesList.length} categories successfully');
      // ignore: avoid_print
      print('📊 Categories final count: ${categories.length}');
    }

    return ApiResponse(
      success: true,
      data: categories,
      message: 'Categories fetched successfully',
    );
  }

  String _getErrorMessage(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Check your internet connection.';
      case DioExceptionType.sendTimeout:
        return 'Request timeout. Please try again.';
      case DioExceptionType.receiveTimeout:
        return 'Response timeout. Please try again.';
      case DioExceptionType.badResponse:
        if (e.response?.statusCode == 500) {
          return 'Server error. Please try again later.';
        }
        return 'Server error. Please try again later.';
      case DioExceptionType.cancel:
        return 'Request cancelled.';
      case DioExceptionType.unknown:
        return 'Network error. Check your connection.';
      default:
        return 'Failed to fetch categories.';
    }
  }
}
