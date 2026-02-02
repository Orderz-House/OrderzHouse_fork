import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/config/app_config.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../models/change_request_model.dart';

class ProjectsRepository {
  final Dio _dio = DioClient.instance;
  final _api = ApiClient.instance;
  final Ref? _ref;

  ProjectsRepository({Ref? ref}) : _ref = ref;

  /// Get user's projects as raw JSON (for additional fields)
  /// Endpoint: GET /projects/myprojects
  /// Returns raw project data including completion_status, change_request_message, etc.
  Future<ApiResponse<List<Map<String, dynamic>>>> getMyProjectsRaw({
    int page = 1,
    int limit = 20,
    String? statusKey,
  }) async {
    try {
      final params = <String, dynamic>{'page': page, 'limit': limit};
      if (statusKey != null && statusKey.isNotEmpty) params['status'] = statusKey;
      // Logging is handled by LoggingInterceptor, no need to duplicate here
      final response = await _dio.get(
        '/projects/myprojects',
        queryParameters: params,
      );

      final data = response.data as Map<String, dynamic>;
      List<dynamic>? projectsList;

      if (data['projects'] != null && data['projects'] is List) {
        projectsList = data['projects'] as List<dynamic>;
      } else if (data['data'] != null) {
        if (data['data'] is List) {
          projectsList = data['data'] as List<dynamic>;
        } else if (data['data'] is Map && data['data']['projects'] is List) {
          projectsList = (data['data'] as Map<String, dynamic>)['projects'] as List<dynamic>;
        }
      } else if (data['rows'] != null && data['rows'] is List) {
        projectsList = data['rows'] as List<dynamic>;
      } else if (response.data is List) {
        projectsList = response.data as List<dynamic>;
      }

      if (projectsList == null || projectsList.isEmpty) {
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No projects found',
        );
      }

      final rawProjects = projectsList
          .map((e) => e as Map<String, dynamic>)
          .toList();

      return ApiResponse(
        success: true,
        data: rawProjects,
        message: 'Projects fetched successfully',
      );
    } on DioException catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch projects',
      );
    } catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch projects: ${e.toString()}',
      );
    }
  }

  /// Get user's projects (client or freelancer)
  /// Endpoint: GET /projects/myprojects
  /// [statusKey] optional filter e.g. "in_progress" for client workspace In progress tab
  /// Response: { success: true, projects: [...] } or { projects: [...] } or { data: [...] }
  Future<ApiResponse<List<Project>>> getMyProjects({
    int page = 1,
    int limit = 20,
    String? statusKey,
  }) async {
    try {
      // Logging is handled by LoggingInterceptor, no need to duplicate here
      final response = await _api.getMyProjects(
        page: page,
        limit: limit,
        statusKey: statusKey,
      );

      final data = response.data as Map<String, dynamic>;

      // Handle multiple response formats:
      // 1. { success: true, projects: [...] }
      // 2. { projects: [...] }
      // 3. { data: [...] }
      // 4. { data: { projects: [...] } }
      // 5. Just an array [...]
      List<dynamic>? projectsList;

      if (data['projects'] != null && data['projects'] is List) {
        projectsList = data['projects'] as List<dynamic>;
      } else if (data['data'] != null) {
        if (data['data'] is List) {
          projectsList = data['data'] as List<dynamic>;
        } else if (data['data'] is Map && data['data']['projects'] is List) {
          projectsList = (data['data'] as Map<String, dynamic>)['projects'] as List<dynamic>;
        }
      } else if (data['rows'] != null && data['rows'] is List) {
        projectsList = data['rows'] as List<dynamic>;
      } else if (response.data is List) {
        projectsList = response.data as List<dynamic>;
      }

      if (projectsList == null || projectsList.isEmpty) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ RESPONSE: No projects found in response');
        }
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No projects found',
        );
      }

      final projects = <Project>[];
      for (var i = 0; i < projectsList.length; i++) {
        try {
          final json = projectsList[i] as Map<String, dynamic>;
          final project = Project.fromJson(json);
          projects.add(project);
        } catch (e) {
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('⚠️ Failed to parse project at index $i: $e');
            // ignore: avoid_print
            print('⚠️ Project data: ${projectsList[i]}');
          }
          // Skip invalid projects but continue processing others
        }
      }

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ Parsed ${projects.length}/${projectsList.length} projects successfully');
      }

      return ApiResponse(
        success: true,
        data: projects,
        message: 'Projects fetched successfully',
      );
    } on DioException catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ??
            _getErrorMessage(e),
        error: e.response?.data as Map<String, dynamic>?,
      );
    } catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch projects: ${e.toString()}',
      );
    }
  }

  /// Get current user role from auth provider
  /// Returns: 2 for client, 3 for freelancer, null if not available
  int? _getCurrentUserRole() {
    final ref = _ref;
    if (ref == null) return null;
    try {
      final authState = ref.read(authStateProvider);
      return authState.user?.roleId;
    } catch (e) {
      return null;
    }
  }

  /// Fetch explore projects (role-based endpoint selection)
  /// Freelancer: Use public endpoints so they can view without subscription
  ///   - GET /projects/public/category/:categoryId (Public)
  ///   - Or fetch all categories and combine
  /// Client: GET /projects/public/category/:categoryId (Public)
  /// Based on web frontend: freelancers can see projects via public endpoints
  Future<ApiResponse<List<Project>>> fetchExploreProjects({
    String? query,
    int? categoryId,
    int? subCategoryId,
    int? subSubCategoryId,
    int page = 1,
    int limit = 20,
    int? userRoleId,
    String sortBy = 'newest',
  }) async {
    try {
      // Determine user role
      final roleId = userRoleId ?? _getCurrentUserRole();
      final isFreelancer = roleId == 3;
      final isClient = roleId == 2;

      String? endpoint;
      final Map<String, dynamic> queryParams = {
        'page': page,
        'limit': limit,
      };

      if (query != null && query.isNotEmpty) {
        queryParams['search'] = query;
        if (AppConfig.isDevelopment) {
          print('✅ [fetchExploreProjects] Added search param: "$query"');
        }
      } else {
        if (AppConfig.isDevelopment) {
          print('⚠️ [fetchExploreProjects] No search query (query=$query)');
        }
      }

      // Always send sortBy (defaults to 'newest' if empty)
      final finalSortBy = sortBy.trim().isNotEmpty ? sortBy : 'newest';
      queryParams['sortBy'] = finalSortBy;
      if (AppConfig.isDevelopment) {
        print('✅ [fetchExploreProjects] Added sortBy param: "$finalSortBy"');
      }

      if (AppConfig.isDevelopment) {
        print('📊 [fetchExploreProjects] Final queryParams before request: $queryParams');
      }

      // Use authenticated endpoint first (with token if available), fallback to public
      // Primary: GET /projects/category/:categoryId (with Authorization)
      // Fallback: GET /projects/public/category/:categoryId (if auth fails)
      if (subSubCategoryId != null) {
        endpoint = '/projects/public/subsubcategory/$subSubCategoryId';
      } else if (subCategoryId != null) {
        endpoint = '/projects/public/subcategory/$subCategoryId';
      } else if (categoryId != null) {
        // Try authenticated endpoint first, fallback to public
        return await _fetchProjectsByCategoryWithFallback(categoryId, queryParams);
      } else {
        // No category specified (user selected "All")
        // Fetch from all categories and combine
        // Note: search and sortBy are already in queryParams
        return await _fetchAllCategoriesProjects(queryParams);
      }

      // At this point, endpoint is guaranteed to be non-null
      final finalEndpoint = endpoint;

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: $finalEndpoint');
        // ignore: avoid_print
        print('📡 REQUEST[GET] => Query: $queryParams');
        // ignore: avoid_print
        print('📡 REQUEST[GET] => User Role: ${isFreelancer ? "freelancer" : isClient ? "client" : "unknown"}');
      }

      final response = await _dio.get(
        finalEndpoint,
        queryParameters: queryParams,
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: $finalEndpoint');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Final URL: ${response.requestOptions.uri}');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Response data length: ${response.data?.toString().length ?? 0} chars');
      }

      final data = response.data as Map<String, dynamic>;

      // Based on API_MAP.md, response format is: { success: true, projects: [...] }
      // But handle multiple formats for robustness
      List<dynamic>? projectsList;

      if (data['projects'] != null && data['projects'] is List) {
        projectsList = data['projects'] as List<dynamic>;
      } else if (data['data'] != null) {
        if (data['data'] is List) {
          projectsList = data['data'] as List<dynamic>;
        } else if (data['data'] is Map && data['data']['projects'] is List) {
          projectsList = (data['data'] as Map<String, dynamic>)['projects'] as List<dynamic>;
        }
      } else if (data['rows'] != null && data['rows'] is List) {
        projectsList = data['rows'] as List<dynamic>;
      } else if (response.data is List) {
        projectsList = response.data as List<dynamic>;
      }

      if (projectsList == null || projectsList.isEmpty) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ RESPONSE: No projects found in response');
          // ignore: avoid_print
          print('📊 Explore projects count: 0');
        }
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No projects found',
        );
      }

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📊 Explore projects raw count: ${projectsList.length}');
      }

      final projects = <Project>[];
      for (var i = 0; i < projectsList.length; i++) {
        try {
          final json = projectsList[i] as Map<String, dynamic>;
          final project = Project.fromJson(json);
          projects.add(project);
        } catch (e) {
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('⚠️ Failed to parse explore project at index $i: $e');
            final projectData = projectsList[i] as Map<String, dynamic>;
            final projectId = projectData['id'];
            // ignore: avoid_print
            print('⚠️ Project ID: $projectId, Raw data: ${projectsList[i]}');
          }
          // Skip invalid projects but continue processing others
        }
      }

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ Parsed ${projects.length}/${projectsList.length} explore projects successfully');
        // ignore: avoid_print
        print('📊 Explore projects final count: ${projects.length}');
      }

      return ApiResponse(
        success: true,
        data: projects,
        message: 'Projects fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: explore projects');
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
        print('❌ UNEXPECTED ERROR => explore projects: $e');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch projects: ${e.toString()}',
      );
    }
  }

  /// Fetch projects by category with fallback
  /// Primary: GET /projects/category/:categoryId (with Authorization)
  /// Fallback: GET /projects/public/category/:categoryId
  Future<ApiResponse<List<Project>>> _fetchProjectsByCategoryWithFallback(
    int categoryId,
    Map<String, dynamic> queryParams,
  ) async {
    if (AppConfig.isDevelopment) {
      print('📡 [fetchExploreProjects] Query params: $queryParams');
    }
    // Try authenticated endpoint first
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /projects/category/$categoryId (authenticated)');
        // ignore: avoid_print
        print('📡 REQUEST[GET] => Query params: $queryParams');
        final fullUrl = '${_dio.options.baseUrl}/projects/category/$categoryId?${Uri(queryParameters: queryParams.map((k, v) => MapEntry(k.toString(), v.toString()))).query}';
        // ignore: avoid_print
        print('📡 REQUEST[GET] => Final URL: $fullUrl');
      }

      // Build full URL for logging
      final uri = Uri(
        path: '/projects/category/$categoryId',
        queryParameters: queryParams.map((k, v) => MapEntry(k.toString(), v?.toString() ?? '')),
      );
      
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 [fetchProjectsByCategoryWithFallback] About to send request');
        // ignore: avoid_print
        print('📡 Query params map: $queryParams');
        // ignore: avoid_print
        print('📡 Full URL would be: ${_dio.options.baseUrl}$uri');
      }

      final response = await _dio.get(
        '/projects/category/$categoryId',
        queryParameters: queryParams,
      );
      
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ REQUEST SENT => Actual URL: ${response.requestOptions.uri}');
        // ignore: avoid_print
        print('✅ REQUEST SENT => Query params in request: ${response.requestOptions.queryParameters}');
        // ignore: avoid_print
        print('✅ REQUEST SENT => Has search: ${response.requestOptions.queryParameters.containsKey('search')}');
        // ignore: avoid_print
        print('✅ REQUEST SENT => Has sortBy: ${response.requestOptions.queryParameters.containsKey('sortBy')}');
      }

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/category/$categoryId');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Final URL: ${response.requestOptions.uri}');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Response data length: ${response.data?.toString().length ?? 0} chars');
      }

      return _parseProjectsResponse(response);
    } on DioException catch (e) {
      // If authenticated endpoint fails (401/403/404), try public endpoint
      if (e.response?.statusCode == 401 || 
          e.response?.statusCode == 403 || 
          e.response?.statusCode == 404) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ Authenticated endpoint failed (${e.response?.statusCode}), trying public: /projects/public/category/$categoryId');
        }

        try {
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('📡 REQUEST[GET] => PATH: /projects/public/category/$categoryId (public fallback)');
            // ignore: avoid_print
            print('📡 REQUEST[GET] => Query params: $queryParams');
            final fullUrl = '${_dio.options.baseUrl}/projects/public/category/$categoryId?${Uri(queryParameters: queryParams.map((k, v) => MapEntry(k.toString(), v.toString()))).query}';
            // ignore: avoid_print
            print('📡 REQUEST[GET] => Final URL: $fullUrl');
          }

          // Build full URL for logging
          final fallbackUri = Uri(
            path: '/projects/public/category/$categoryId',
            queryParameters: queryParams.map((k, v) => MapEntry(k.toString(), v?.toString() ?? '')),
          );
          
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('📡 [fetchProjectsByCategoryWithFallback] About to send fallback request');
            // ignore: avoid_print
            print('📡 Query params map: $queryParams');
            // ignore: avoid_print
            print('📡 Full URL would be: ${_dio.options.baseUrl}$fallbackUri');
          }

          final fallbackResponse = await _dio.get(
            '/projects/public/category/$categoryId',
            queryParameters: queryParams,
          );
          
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('✅ REQUEST SENT => Actual URL: ${fallbackResponse.requestOptions.uri}');
            // ignore: avoid_print
            print('✅ REQUEST SENT => Query params in request: ${fallbackResponse.requestOptions.queryParameters}');
            // ignore: avoid_print
            print('✅ REQUEST SENT => Has search: ${fallbackResponse.requestOptions.queryParameters.containsKey('search')}');
            // ignore: avoid_print
            print('✅ REQUEST SENT => Has sortBy: ${fallbackResponse.requestOptions.queryParameters.containsKey('sortBy')}');
          }

          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('✅ RESPONSE[${fallbackResponse.statusCode}] => PATH: /projects/public/category/$categoryId');
            // ignore: avoid_print
            print('✅ RESPONSE[${fallbackResponse.statusCode}] => Final URL: ${fallbackResponse.requestOptions.uri}');
            // ignore: avoid_print
            print('✅ RESPONSE[${fallbackResponse.statusCode}] => Response data length: ${fallbackResponse.data?.toString().length ?? 0} chars');
          }

          return _parseProjectsResponse(fallbackResponse);
        } on DioException catch (fallbackError) {
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('❌ ERROR[${fallbackError.response?.statusCode ?? 'null'}] => PATH: /projects/public/category/$categoryId');
            // ignore: avoid_print
            print('❌ ERROR => Final URL: ${fallbackError.requestOptions.uri}');
            // ignore: avoid_print
            print('❌ ERROR => Response Data: ${fallbackError.response?.data}');
          }

          return ApiResponse(
            success: false,
            data: [],
            message: fallbackError.response?.data?['message'] as String? ??
                'Failed to fetch projects',
            error: fallbackError.response?.data as Map<String, dynamic>?,
          );
        }
      }

      // For other errors, return immediately
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/category/$categoryId');
        // ignore: avoid_print
        print('❌ ERROR => Final URL: ${e.requestOptions.uri}');
        // ignore: avoid_print
        print('❌ ERROR => Response Data: ${e.response?.data}');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ??
            _getErrorMessage(e),
        error: e.response?.data as Map<String, dynamic>?,
      );
    }
  }

  /// Parse projects from response
  ApiResponse<List<Project>> _parseProjectsResponse(Response response) {
    final data = response.data as Map<String, dynamic>;

    // Handle response format: { success: true, projects: [...] }
    List<dynamic>? projectsList;

    if (data['projects'] != null && data['projects'] is List) {
      projectsList = data['projects'] as List<dynamic>;
    } else if (data['data'] != null && data['data'] is List) {
      projectsList = data['data'] as List<dynamic>;
    } else if (response.data is List) {
      projectsList = response.data as List<dynamic>;
    }

    if (projectsList == null || projectsList.isEmpty) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('⚠️ RESPONSE: No projects found in response');
      }
      return const ApiResponse(
        success: true,
        data: [],
        message: 'No projects found',
      );
    }

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('📊 Projects raw count: ${projectsList.length}');
    }

    final projects = <Project>[];
    for (var i = 0; i < projectsList.length; i++) {
      try {
        final json = projectsList[i] as Map<String, dynamic>;
        final project = Project.fromJson(json);
        projects.add(project);
      } catch (e) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ Failed to parse project at index $i: $e');
          // ignore: avoid_print
          print('⚠️ Project data: ${projectsList[i]}');
        }
        // Skip invalid projects but continue processing others
      }
    }

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('✅ Parsed ${projects.length}/${projectsList.length} projects successfully');
    }

    return ApiResponse(
      success: true,
      data: projects,
      message: 'Projects fetched successfully',
    );
  }

  /// Fetch projects from all categories (for "All" selection)
  /// This requires categories to be loaded first
  Future<ApiResponse<List<Project>>> _fetchAllCategoriesProjects(
    Map<String, dynamic> queryParams,
  ) async {
    if (AppConfig.isDevelopment) {
      print('📡 [fetchAllCategoriesProjects] Query params: $queryParams');
    }
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 EXPLORE: Fetching all categories for "All" selection...');
      }

      // Get all categories from /category/ endpoint (same as web)
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /category/ (for "All" selection)');
        // ignore: avoid_print
        print('📡 REQUEST[GET] => Final URL: ${_dio.options.baseUrl}/category/');
      }

      final categoriesResponse = await _dio.get('/category/');
      
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${categoriesResponse.statusCode}] => PATH: /category/');
        // ignore: avoid_print
        print('✅ RESPONSE[${categoriesResponse.statusCode}] => Final URL: ${categoriesResponse.requestOptions.uri}');
        // ignore: avoid_print
        print('✅ RESPONSE[${categoriesResponse.statusCode}] => Response data length: ${categoriesResponse.data?.toString().length ?? 0} chars');
      }

      final categoriesData = categoriesResponse.data as Map<String, dynamic>;
      final categories = categoriesData['data'] as List<dynamic>? ?? 
                         categoriesData['categories'] as List<dynamic>? ?? [];

      if (categories.isEmpty) {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ EXPLORE: No categories found');
        }
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No categories available',
        );
      }

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 EXPLORE: Found ${categories.length} categories, fetching projects from all...');
      }

      // Extract category IDs
      final categoryIds = <int>[];
      for (final category in categories) {
        try {
          final categoryId = (category as Map<String, dynamic>)['id'] as int?;
          if (categoryId != null) {
            categoryIds.add(categoryId);
          }
        } catch (e) {
          // Skip invalid categories
        }
      }

      if (categoryIds.isEmpty) {
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No valid categories found',
        );
      }

      return await _fetchProjectsFromCategoryIds(categoryIds, queryParams);
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ EXPLORE ERROR: Failed to fetch categories for "All" selection');
        // ignore: avoid_print
        print('❌ ERROR => Status Code: ${e.response?.statusCode}');
        // ignore: avoid_print
        print('❌ ERROR => Response Data: ${e.response?.data}');
      }
      // Do NOT silently fallback - return error
      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch categories. Please try selecting a specific category.',
        error: e.response?.data as Map<String, dynamic>?,
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ EXPLORE ERROR: $e');
      }
      return const ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch projects. Please try selecting a specific category.',
      );
    }
  }

  /// Helper method to fetch projects from a list of category IDs
  /// Uses authenticated endpoint first, then public fallback
  Future<ApiResponse<List<Project>>> _fetchProjectsFromCategoryIds(
    List<int> categoryIds,
    Map<String, dynamic> queryParams,
  ) async {
    final allProjects = <Project>[];
    
    // Fetch projects from each category and combine
    for (final categoryId in categoryIds) {
      // Try authenticated endpoint first, then public
      try {
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('📡 REQUEST[GET] => PATH: /projects/category/$categoryId (for "All")');
          // ignore: avoid_print
          print('📡 REQUEST[GET] => Final URL: ${_dio.options.baseUrl}/projects/category/$categoryId');
        }

        final response = await _dio.get(
          '/projects/category/$categoryId',
          queryParameters: queryParams,
        );

        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/category/$categoryId');
          // ignore: avoid_print
          print('✅ RESPONSE[${response.statusCode}] => Response data length: ${response.data?.toString().length ?? 0} chars');
        }

        final parsed = _parseProjectsResponse(response);
        if (parsed.success && parsed.data != null) {
          allProjects.addAll(parsed.data!);
        }
      } on DioException catch (e) {
        // If auth fails, try public endpoint
        if (e.response?.statusCode == 401 || 
            e.response?.statusCode == 403 || 
            e.response?.statusCode == 404) {
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('⚠️ Authenticated endpoint failed (${e.response?.statusCode}), trying public: /projects/public/category/$categoryId');
          }

          try {
            if (AppConfig.isDevelopment) {
              // ignore: avoid_print
              print('📡 REQUEST[GET] => PATH: /projects/public/category/$categoryId (public fallback for "All")');
              // ignore: avoid_print
              print('📡 REQUEST[GET] => Final URL: ${_dio.options.baseUrl}/projects/public/category/$categoryId');
            }

            final publicResponse = await _dio.get(
              '/projects/public/category/$categoryId',
              queryParameters: queryParams,
            );

            if (AppConfig.isDevelopment) {
              // ignore: avoid_print
              print('✅ RESPONSE[${publicResponse.statusCode}] => PATH: /projects/public/category/$categoryId');
              // ignore: avoid_print
              print('✅ RESPONSE[${publicResponse.statusCode}] => Response data length: ${publicResponse.data?.toString().length ?? 0} chars');
            }

            final parsed = _parseProjectsResponse(publicResponse);
            if (parsed.success && parsed.data != null) {
              allProjects.addAll(parsed.data!);
            }
          } on DioException catch (e2) {
            // Continue with next category if both fail
            if (AppConfig.isDevelopment) {
              // ignore: avoid_print
              print('❌ ERROR[${e2.response?.statusCode ?? 'null'}] => PATH: /projects/public/category/$categoryId');
              // ignore: avoid_print
              print('❌ ERROR => Response Data: ${e2.response?.data}');
            }
          } catch (e2) {
            if (AppConfig.isDevelopment) {
              // ignore: avoid_print
              print('⚠️ EXPLORE: Failed to fetch from category $categoryId (both endpoints): $e2');
            }
          }
        } else {
          // Continue with next category if other error
          if (AppConfig.isDevelopment) {
            // ignore: avoid_print
            print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/category/$categoryId');
            // ignore: avoid_print
            print('❌ ERROR => Response Data: ${e.response?.data}');
          }
        }
      } catch (e) {
        // Continue with next category if one fails
        if (AppConfig.isDevelopment) {
          // ignore: avoid_print
          print('⚠️ EXPLORE: Failed to fetch from category $categoryId: $e');
        }
      }
    }

    // Sort combined results if sortBy is provided (since we fetched from multiple categories)
    final sortBy = queryParams['sortBy'] as String?;
    if (sortBy != null && sortBy.isNotEmpty) {
      switch (sortBy.toLowerCase()) {
        case 'newest':
          allProjects.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          break;
        case 'price_low_to_high':
          allProjects.sort((a, b) {
            final aPrice = a.projectType == 'fixed' 
                ? (a.budget ?? 999999) 
                : a.projectType == 'hourly' 
                    ? (a.hourlyRate ?? 999999)
                    : (a.budgetMin ?? 999999);
            final bPrice = b.projectType == 'fixed' 
                ? (b.budget ?? 999999) 
                : b.projectType == 'hourly' 
                    ? (b.hourlyRate ?? 999999)
                    : (b.budgetMin ?? 999999);
            return aPrice.compareTo(bPrice);
          });
          break;
        case 'price_high_to_low':
          allProjects.sort((a, b) {
            final aPrice = a.projectType == 'fixed' 
                ? (a.budget ?? 0) 
                : a.projectType == 'hourly' 
                    ? (a.hourlyRate ?? 0)
                    : (a.budgetMax ?? 0);
            final bPrice = b.projectType == 'fixed' 
                ? (b.budget ?? 0) 
                : b.projectType == 'hourly' 
                    ? (b.hourlyRate ?? 0)
                    : (b.budgetMax ?? 0);
            return bPrice.compareTo(aPrice);
          });
          break;
      }
    }

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('✅ EXPLORE: Fetched ${allProjects.length} projects from ${categoryIds.length} categories');
      // ignore: avoid_print
      print('📊 Final projects count for "All": ${allProjects.length}, sortBy: $sortBy');
    }

    return ApiResponse(
      success: true,
      data: allProjects,
      message: 'Projects fetched successfully',
    );
  }

  /// Apply for a project
  /// Endpoint: POST /projects/:projectId/apply
  /// Requires: freelancer, verified, subscribed
  Future<ApiResponse<void>> applyForProject({
    required int projectId,
    String? message,
  }) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /projects/$projectId/apply');
        // ignore: avoid_print
        print('📡 REQUEST[POST] => Body: ${message != null ? {'message': message} : {}}');
      }

      final response = await _dio.post(
        '/projects/$projectId/apply',
        data: message != null ? {'message': message} : {},
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/$projectId/apply');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Data: ${response.data}');
      }

      return ApiResponse(
        success: true,
        message: response.data['message'] as String? ?? 'Application submitted successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/apply');
        // ignore: avoid_print
        print('❌ ERROR => Type: ${e.type}');
        // ignore: avoid_print
        print('❌ ERROR => Final URL: ${e.requestOptions.uri}');
        // ignore: avoid_print
        print('❌ ERROR => Message: ${e.message}');
        if (e.response != null) {
          // ignore: avoid_print
          print('❌ ERROR => Status Code: ${e.response?.statusCode}');
          // ignore: avoid_print
          print('❌ ERROR => Response Data: ${e.response?.data}');
        }
      }

      final errorMessage = e.response?.data?['message'] as String?;
      final statusCode = e.response?.statusCode;

      // Check if error is subscription-related
      final isSubscriptionError = statusCode == 403 ||
          statusCode == 402 ||
          (errorMessage?.toLowerCase().contains('subscription') ?? false) ||
          (errorMessage?.toLowerCase().contains('subscribe') ?? false) ||
          (errorMessage?.toLowerCase().contains('plan') ?? false);

      return ApiResponse(
        success: false,
        message: errorMessage ?? 'Failed to apply to project',
        error: {
          'statusCode': statusCode,
          'isSubscriptionError': isSubscriptionError,
          ...?e.response?.data as Map<String, dynamic>?,
        },
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/$projectId/apply: $e');
      }

      return ApiResponse(
        success: false,
        message: 'Failed to apply to project: ${e.toString()}',
      );
    }
  }

  /// Get assignment details for freelancer on a specific project
  /// Endpoint: GET /assignments/:projectId/my-assignment
  /// Response: { success: true, assignment: {...} }
  Future<ApiResponse<Map<String, dynamic>?>> getMyAssignment(int projectId) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /assignments/$projectId/my-assignment');
      }

      final response = await _dio.get('/assignments/$projectId/my-assignment');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /assignments/$projectId/my-assignment');
      }

      final data = response.data as Map<String, dynamic>;
      final assignment = data['assignment'] as Map<String, dynamic>?;

      return ApiResponse(
        success: true,
        data: assignment,
        message: 'Assignment fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /assignments/$projectId/my-assignment');
      }

      // If 404, no assignment exists
      if (e.response?.statusCode == 404) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'No assignment found',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch assignment',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /assignments/$projectId/my-assignment: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to fetch assignment: ${e.toString()}',
      );
    }
  }

  /// Check if freelancer is assigned/applied to a project
  /// Endpoint: GET /assignments/:projectId/check
  /// Response: { success: true, is_assigned: boolean }
  Future<ApiResponse<bool>> checkIfAssigned(int projectId) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /assignments/$projectId/check');
      }

      final response = await _dio.get('/assignments/$projectId/check');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /assignments/$projectId/check');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Data: ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      final isAssigned = data['is_assigned'] as bool? ?? false;

      return ApiResponse(
        success: true,
        data: isAssigned,
        message: 'Check completed',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /assignments/$projectId/check');
        // ignore: avoid_print
        print('❌ ERROR => Response Data: ${e.response?.data}');
      }

      // If 404 or other error, assume not assigned
      return ApiResponse(
        success: true,
        data: false,
        message: e.response?.data?['message'] as String?,
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /assignments/$projectId/check: $e');
      }

      return const ApiResponse(
        success: true,
        data: false,
        message: 'Failed to check assignment',
      );
    }
  }

  /// Create a new project
  /// Endpoint: POST /projects
  /// Content-Type: multipart/form-data
  Future<ApiResponse<Map<String, dynamic>>> createProject({
    required int categoryId,
    int? subCategoryId,
    required int subSubCategoryId,
    required String title,
    required String description,
    required String projectType,
    double? budget,
    double? hourlyRate,
    double? budgetMin,
    double? budgetMax,
    required String durationType,
    int? durationDays,
    int? durationHours,
    List<String>? preferredSkills,
    String? coverPicPath, // File path for multipart
  }) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /projects');
      }

      final formData = FormData();
      
      // Add text fields
      formData.fields.addAll([
        MapEntry('category_id', categoryId.toString()),
        if (subCategoryId != null) MapEntry('sub_category_id', subCategoryId.toString()),
        MapEntry('sub_sub_category_id', subSubCategoryId.toString()),
        MapEntry('title', title),
        MapEntry('description', description),
        MapEntry('project_type', projectType),
        if (budget != null) MapEntry('budget', budget.toString()),
        if (hourlyRate != null) MapEntry('hourly_rate', hourlyRate.toString()),
        if (budgetMin != null) MapEntry('budget_min', budgetMin.toString()),
        if (budgetMax != null) MapEntry('budget_max', budgetMax.toString()),
        MapEntry('duration_type', durationType),
        if (durationDays != null) MapEntry('duration_days', durationDays.toString()),
        if (durationHours != null) MapEntry('duration_hours', durationHours.toString()),
      ]);
      
      // Add preferred_skills as array (each skill as separate entry)
      if (preferredSkills != null && preferredSkills.isNotEmpty) {
        for (final skill in preferredSkills) {
          formData.fields.add(MapEntry('preferred_skills[]', skill));
        }
      }
      
      // Add cover pic file
      if (coverPicPath != null) {
        formData.files.add(
          MapEntry(
            'cover_pic',
            await MultipartFile.fromFile(coverPicPath, filename: 'cover.jpg'),
          ),
        );
      }

      final response = await _dio.post('/projects', data: formData);

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return ApiResponse(
          success: true,
          data: data['project'] as Map<String, dynamic>? ?? data,
          message: 'Project created successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: {},
        message: data['message'] as String? ?? 'Failed to create project',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects');
        // ignore: avoid_print
        print('❌ ERROR => Message: ${e.message}');
      }

      return ApiResponse(
        success: false,
        data: {},
        message: e.response?.data?['message'] as String? ?? 'Failed to create project',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects: $e');
      }

      return ApiResponse(
        success: false,
        data: {},
        message: 'Failed to create project: ${e.toString()}',
      );
    }
  }

  /// Upload project files
  /// Endpoint: POST /projects/:projectId/files
  Future<ApiResponse<void>> uploadProjectFiles(
    int projectId,
    List<String> filePaths,
  ) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /projects/$projectId/files');
      }

      final formData = FormData();
      for (var i = 0; i < filePaths.length; i++) {
        formData.files.add(
          MapEntry(
            'project_files',
            await MultipartFile.fromFile(filePaths[i], filename: 'file_$i'),
          ),
        );
      }

      final response = await _dio.post('/projects/$projectId/files', data: formData);

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/$projectId/files');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Files uploaded successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to upload files',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/files');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to upload files',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/$projectId/files: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to upload files: ${e.toString()}',
      );
    }
  }

  /// Create Stripe checkout session for project
  /// Endpoint: POST /stripe/project-checkout-session
  Future<ApiResponse<String>> createProjectCheckoutSession(
    Map<String, dynamic> projectData,
  ) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /stripe/project-checkout-session');
      }

      final response = await _dio.post('/stripe/project-checkout-session', data: projectData);

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /stripe/project-checkout-session');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['url'] != null) {
        return ApiResponse(
          success: true,
          data: data['url'] as String,
          message: 'Checkout session created',
        );
      }

      return ApiResponse(
        success: false,
        data: '',
        message: data['error'] as String? ?? 'Failed to create checkout session',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /stripe/project-checkout-session');
      }

      return ApiResponse(
        success: false,
        data: '',
        message: e.response?.data?['error'] as String? ?? 'Failed to create checkout session',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /stripe/project-checkout-session: $e');
      }

      return ApiResponse(
        success: false,
        data: '',
        message: 'Failed to create checkout session: ${e.toString()}',
      );
    }
  }

  /// Request project changes (client)
  /// Endpoint: POST /projects/{projectId}/request-changes
  /// Body: { "message": "<string>" }
  Future<ApiResponse<void>> requestProjectChanges({
    required int projectId,
    required String message,
  }) async {
    try {
      if (AppConfig.isDevelopment) {
        print('📡 REQUEST[POST] => PATH: /projects/$projectId/request-changes');
        print('📦 BODY: { "message": "$message" }');
      }

      final response = await _dio.post(
        '/projects/$projectId/request-changes',
        data: {'message': message},
      );

      if (AppConfig.isDevelopment) {
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/$projectId/request-changes');
      }

      final data = response.data as Map<String, dynamic>;
      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Change request sent successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to send change request',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/request-changes');
        print('Response: ${e.response?.data}');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to send change request',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ UNEXPECTED ERROR => /projects/$projectId/request-changes: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to send change request: ${e.toString()}',
      );
    }
  }

  /// Get change requests for a project (freelancer)
  /// Endpoint: GET /projects/{projectId}/change-requests
  /// Response: { success: true, requests: [...] } or { items: [...] } or { data: [...] }
  Future<ApiResponse<List<ChangeRequest>>> getProjectChangeRequests(int projectId) async {
    try {
      if (AppConfig.isDevelopment) {
        print('📡 REQUEST[GET] => PATH: /projects/$projectId/change-requests');
      }

      final response = await _api.getChangeRequests(projectId);

      if (AppConfig.isDevelopment) {
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/$projectId/change-requests');
        print('📦 Response data: ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      
      // Handle different response shapes: requests, items, or data itself being a List
      List<dynamic>? itemsList;
      if (data['requests'] != null && data['requests'] is List) {
        itemsList = data['requests'] as List<dynamic>;
      } else if (data['items'] != null && data['items'] is List) {
        itemsList = data['items'] as List<dynamic>;
      } else if (data['data'] != null && data['data'] is List) {
        itemsList = data['data'] as List<dynamic>;
      } else if (response.data is List) {
        itemsList = response.data as List<dynamic>;
      }

      if (itemsList == null || itemsList.isEmpty) {
        if (AppConfig.isDevelopment) {
          print('ℹ️ No change requests found (empty or null list)');
        }
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No change requests found',
        );
      }

      final changeRequests = itemsList
          .map((json) => ChangeRequest.fromJson(json as Map<String, dynamic>))
          .toList();

      if (AppConfig.isDevelopment) {
        print('✅ Parsed ${changeRequests.length} change requests');
      }

      return ApiResponse(
        success: true,
        data: changeRequests,
        message: 'Change requests fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/change-requests');
        print('Response: ${e.response?.data}');
      }

      // Handle 404 as empty list (not an error)
      if (e.response?.statusCode == 404) {
        return const ApiResponse(
          success: true,
          data: [],
          message: 'No change requests found',
        );
      }

      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch change requests',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        print('❌ UNEXPECTED ERROR => /projects/$projectId/change-requests: $e');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch change requests: ${e.toString()}',
      );
    }
  }

  /// Mark change requests as read/seen for current user (optional backend).
  /// If backend has PATCH /projects/:projectId/change-requests/mark-read, it will be called; otherwise no-op.
  Future<void> markChangeRequestsRead(int projectId, {List<int>? ids, DateTime? lastSeenAt}) async {
    try {
      await _api.markChangeRequestsRead(projectId);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404 || e.response?.statusCode == 501) return;
      if (AppConfig.isDevelopment) {
        print('⚠️ markChangeRequestsRead: ${e.message}');
      }
    } catch (_) {}
  }

  /// Deliver project (freelancer)
  /// Endpoint: POST /projects/{projectId}/deliver
  /// FormData key: "project_files" (multiple files)
  Future<ApiResponse<void>> deliverProject(int projectId, List<String> filePaths) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /projects/$projectId/deliver');
      }

      final formData = FormData();
      for (var i = 0; i < filePaths.length; i++) {
        formData.files.add(
          MapEntry(
            'project_files',
            await MultipartFile.fromFile(filePaths[i], filename: 'file_$i'),
          ),
        );
      }

      final response = await _dio.post('/projects/$projectId/deliver', data: formData);

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/$projectId/deliver');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Project delivered successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to deliver project',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/deliver');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to deliver project',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/$projectId/deliver: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to deliver project: ${e.toString()}',
      );
    }
  }

  /// Get project deliveries (for client review)
  /// Endpoint: GET /projects/{projectId}/deliveries
  Future<ApiResponse<List<Map<String, dynamic>>>> getProjectDeliveries(int projectId) async {
    try {
      // Logging is handled by LoggingInterceptor, no need to duplicate here
      final response = await _dio.get('/projects/$projectId/deliveries');

      final data = response.data as Map<String, dynamic>;
      final items = data['deliveries'] ?? data['data'] ?? [];
      final list = (items is List) ? items : [];

      return ApiResponse(
        success: true,
        data: list.map((e) => e as Map<String, dynamic>).toList(),
        message: 'Deliveries fetched successfully',
      );
    } on DioException catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch deliveries',
      );
    } catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch deliveries: ${e.toString()}',
      );
    }
  }

  /// Approve delivery (client)
  /// Endpoint: PUT /projects/{projectId}/approve
  Future<ApiResponse<void>> approveDelivery(int projectId) async {
    try {
      // Logging is handled by LoggingInterceptor, no need to duplicate here
      final response = await _dio.put(
        '/projects/$projectId/approve',
        data: {'action': 'approve'},
      );

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Delivery approved successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to approve delivery',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/$projectId/approve');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to approve delivery',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/$projectId/approve: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to approve delivery: ${e.toString()}',
      );
    }
  }

  /// Request changes (client)
  /// Endpoint: POST /projects/{projectId}/request-changes
  Future<ApiResponse<void>> requestChanges(int projectId, String message) async {
    try {
      // Logging is handled by LoggingInterceptor, no need to duplicate here
      final response = await _dio.post(
        '/projects/$projectId/request-changes',
        data: {'message': message},
      );

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Change request sent successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to send change request',
      );
    } on DioException catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to send change request',
      );
    } catch (e) {
      // Error logging is handled by LoggingInterceptor, no need to duplicate here
      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to send change request: ${e.toString()}',
      );
    }
  }

  /// Get offers for a project (client - bidding projects)
  /// Endpoint: GET /offers/project/{projectId}/offers
  Future<ApiResponse<List<Map<String, dynamic>>>> getProjectOffers(int projectId) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /offers/project/$projectId/offers');
      }

      final response = await _dio.get('/offers/project/$projectId/offers');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /offers/project/$projectId/offers');
      }

      final data = response.data as Map<String, dynamic>;
      final items = data['offers'] ?? data['data'] ?? [];
      final list = (items is List) ? items : [];

      return ApiResponse(
        success: true,
        data: list.map((e) => e as Map<String, dynamic>).toList(),
        message: 'Offers fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /offers/project/$projectId/offers');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch offers',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /offers/project/$projectId/offers: $e');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch offers: ${e.toString()}',
      );
    }
  }

  /// Approve or reject an offer (client)
  /// Endpoint: POST /offers/offers/approve-reject
  Future<ApiResponse<void>> approveRejectOffer(int offerId, String action) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /offers/offers/approve-reject');
      }

      final response = await _dio.post(
        '/offers/offers/approve-reject',
        data: {
          'offer_id': offerId,
          'action': action, // 'accept' or 'reject'
        },
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /offers/offers/approve-reject');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Offer action completed successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to process offer',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /offers/offers/approve-reject');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to process offer',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /offers/offers/approve-reject: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to process offer: ${e.toString()}',
      );
    }
  }

  /// Get applications for a project (client - fixed/hourly projects)
  /// Endpoint: GET /projects/project/{projectId}/applications
  Future<ApiResponse<List<Map<String, dynamic>>>> getProjectApplications(int projectId) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /projects/project/$projectId/applications');
      }

      final response = await _dio.get('/projects/project/$projectId/applications');

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/project/$projectId/applications');
      }

      final data = response.data as Map<String, dynamic>;
      final items = data['applications'] ?? data['data'] ?? [];
      final list = (items is List) ? items : [];

      return ApiResponse(
        success: true,
        data: list.map((e) => e as Map<String, dynamic>).toList(),
        message: 'Applications fetched successfully',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/project/$projectId/applications');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: e.response?.data?['message'] as String? ?? 'Failed to fetch applications',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/project/$projectId/applications: $e');
      }

      return ApiResponse(
        success: false,
        data: [],
        message: 'Failed to fetch applications: ${e.toString()}',
      );
    }
  }

  /// Accept or reject an application (client)
  /// Endpoint: POST /projects/applications/decision
  Future<ApiResponse<void>> acceptRejectApplication(int assignmentId, int projectId, String action) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[POST] => PATH: /projects/applications/decision');
      }

      final response = await _dio.post(
        '/projects/applications/decision',
        data: {
          'assignmentId': assignmentId,
          'projectId': projectId,
          'action': action, // 'accept' or 'reject'
        },
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/applications/decision');
      }

      final data = response.data as Map<String, dynamic>;

      if (data['success'] == true) {
        return const ApiResponse(
          success: true,
          data: null,
          message: 'Application action completed successfully',
        );
      }

      return ApiResponse(
        success: false,
        data: null,
        message: data['message'] as String? ?? 'Failed to process application',
      );
    } on DioException catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/applications/decision');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: e.response?.data?['message'] as String? ?? 'Failed to process application',
      );
    } catch (e) {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ UNEXPECTED ERROR => /projects/applications/decision: $e');
      }

      return ApiResponse(
        success: false,
        data: null,
        message: 'Failed to process application: ${e.toString()}',
      );
    }
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
        if (e.response?.statusCode == 403) {
          return 'Access denied. Please verify your account and subscribe.';
        }
        return 'Server error. Please try again later.';
      case DioExceptionType.cancel:
        return 'Request cancelled.';
      case DioExceptionType.unknown:
        return 'Network error. Check your connection.';
      default:
        return 'Failed to fetch projects.';
    }
  }
}
