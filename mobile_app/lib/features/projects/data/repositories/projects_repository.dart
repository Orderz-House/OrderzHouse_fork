import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/app_config.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProjectsRepository {
  final Dio _dio = DioClient.instance;
  final Ref? _ref;

  ProjectsRepository({Ref? ref}) : _ref = ref;

  /// Get user's projects (client or freelancer)
  /// Endpoint: GET /projects/myprojects
  /// Response: { success: true, projects: [...] } or { projects: [...] } or { data: [...] }
  Future<ApiResponse<List<Project>>> getMyProjects({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /projects/myprojects');
        // ignore: avoid_print
        print('📡 REQUEST[GET] => Query: page=$page, limit=$limit');
      }

      final response = await _dio.get(
        '/projects/myprojects',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => PATH: /projects/myprojects');
        // ignore: avoid_print
        print('✅ RESPONSE[${response.statusCode}] => Data length: ${response.data?.toString().length ?? 0} chars');
      }

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
        return ApiResponse(
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
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('❌ ERROR[${e.response?.statusCode ?? 'null'}] => PATH: /projects/myprojects');
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
        print('❌ UNEXPECTED ERROR => /projects/myprojects: $e');
      }

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
  }) async {
    try {
      // Determine user role
      final roleId = userRoleId ?? _getCurrentUserRole();
      final isFreelancer = roleId == 3;
      final isClient = roleId == 2;

      String? endpoint;
      Map<String, dynamic> queryParams = {
        'page': page,
        'limit': limit,
      };

      if (query != null && query.isNotEmpty) {
        queryParams['search'] = query;
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
        return ApiResponse(
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
    // Try authenticated endpoint first
    try {
      if (AppConfig.isDevelopment) {
        // ignore: avoid_print
        print('📡 REQUEST[GET] => PATH: /projects/category/$categoryId (authenticated)');
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
            print('📡 REQUEST[GET] => Final URL: ${_dio.options.baseUrl}/projects/public/category/$categoryId');
          }

          final fallbackResponse = await _dio.get(
            '/projects/public/category/$categoryId',
            queryParameters: queryParams,
          );

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
      return ApiResponse(
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
        return ApiResponse(
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
        return ApiResponse(
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
      return ApiResponse(
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

    if (AppConfig.isDevelopment) {
      // ignore: avoid_print
      print('✅ EXPLORE: Fetched ${allProjects.length} projects from ${categoryIds.length} categories');
      // ignore: avoid_print
      print('📊 Final projects count for "All": ${allProjects.length}');
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

      return ApiResponse(
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
        return ApiResponse(
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
