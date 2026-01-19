import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/project.dart';
import '../../data/repositories/projects_repository.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';

final projectsRepositoryProvider = Provider<ProjectsRepository>((ref) {
  return ProjectsRepository(ref: ref);
});

// Changed from autoDispose to prevent refetch on rebuilds
// Now watches userId to automatically refetch when user changes
final myProjectsProvider =
    FutureProvider<List<Project>>((ref) async {
  final repository = ref.read(projectsRepositoryProvider);
  
  // Watch userId to trigger refetch when user changes (login/logout/switch account)
  final userId = ref.watch(authStateProvider.select((state) => state.userId));
  
  // If no user, return empty list (logged out state)
  if (userId == null) {
    return [];
  }
  
  final response = await repository.getMyProjects();

  if (response.success && response.data != null) {
    return response.data!;
  }

  throw Exception(response.message ?? 'Failed to fetch projects');
});

final exploreProjectsProvider =
    FutureProvider.autoDispose<List<Project>>((ref) async {
  final repository = ref.read(projectsRepositoryProvider);
  
  // Watch userId to trigger refetch when user changes
  final userId = ref.watch(authStateProvider.select((state) => state.userId));
  
  // Get user role from auth state
  final authState = ref.read(authStateProvider);
  final userRoleId = authState.user?.roleId;
  
  // If no user, return empty list
  if (userId == null) {
    return [];
  }
  
  // Get selected category ID (null means "All")
  final selectedCategoryId = ref.watch(selectedExploreCategoryIdProvider);
  
  // Note: Search query can be added later via a separate provider if needed
  
  final response = await repository.fetchExploreProjects(
    query: null, // TODO: Add search query support via provider
    categoryId: selectedCategoryId,
    subCategoryId: null,
    subSubCategoryId: null,
    page: 1,
    limit: 20,
    userRoleId: userRoleId,
  );

  if (response.success && response.data != null) {
    return response.data!;
  }

  throw Exception(response.message ?? 'Failed to fetch explore projects');
});

class ExploreProjectsParams {
  final String? query;
  final int? categoryId;
  final int? subCategoryId;
  final int? subSubCategoryId;
  final int page;
  final int limit;

  ExploreProjectsParams({
    this.query,
    this.categoryId,
    this.subCategoryId,
    this.subSubCategoryId,
    this.page = 1,
    this.limit = 20,
  });

  ExploreProjectsParams copyWith({
    String? query,
    int? categoryId,
    int? subCategoryId,
    int? subSubCategoryId,
    int? page,
    int? limit,
  }) {
    return ExploreProjectsParams(
      query: query ?? this.query,
      categoryId: categoryId ?? this.categoryId,
      subCategoryId: subCategoryId ?? this.subCategoryId,
      subSubCategoryId: subSubCategoryId ?? this.subSubCategoryId,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ExploreProjectsParams &&
        other.query == query &&
        other.categoryId == categoryId &&
        other.subCategoryId == subCategoryId &&
        other.subSubCategoryId == subSubCategoryId &&
        other.page == page &&
        other.limit == limit;
  }

  @override
  int get hashCode {
    return Object.hash(
      query,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      page,
      limit,
    );
  }
}

/// Provider for latest projects (dashboard) - uses explore endpoint with no category filter
final latestProjectsProvider =
    FutureProvider.autoDispose<List<Project>>((ref) async {
  final repository = ref.read(projectsRepositoryProvider);
  
  // Watch userId to trigger refetch when user changes
  final userId = ref.watch(authStateProvider.select((state) => state.userId));
  
  // Get user role from auth state
  final authState = ref.read(authStateProvider);
  final userRoleId = authState.user?.roleId;
  
  // If no user, return empty list
  if (userId == null) {
    return [];
  }
  
  // Fetch all projects (no category filter) with limit 2, sorted by created_at DESC
  final response = await repository.fetchExploreProjects(
    query: null,
    categoryId: null, // No category = fetch all
    subCategoryId: null,
    subSubCategoryId: null,
    page: 1,
    limit: 2, // Only need 2 for dashboard
    userRoleId: userRoleId,
  );

  if (response.success && response.data != null) {
    // Take first 2 (already sorted by created_at DESC from backend)
    return response.data!.take(2).toList();
  }

  throw Exception(response.message ?? 'Failed to fetch latest projects');
});
