import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/project.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/cache/cache_service.dart';
import '../../data/repositories/projects_repository.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';
import '../../../search/presentation/providers/search_provider.dart';

final projectsRepositoryProvider = Provider<ProjectsRepository>((ref) {
  return ProjectsRepository(ref: ref);
});

/// Provider for fetching a single project by ID
/// Tries to find it in myProjects first, then shows error if not found
final projectByIdProvider = FutureProvider.autoDispose.family<Project?, int>((ref, projectId) async {
  final repository = ref.read(projectsRepositoryProvider);
  
  // Try to find in my projects
  final myProjectsResponse = await repository.getMyProjectsRaw(limit: 1000);
  if (myProjectsResponse.success && myProjectsResponse.data != null) {
    final projectData = myProjectsResponse.data!.firstWhere(
      (p) => (p['id'] as int?) == projectId,
      orElse: () => {},
    );
    
    if (projectData.isNotEmpty) {
      try {
        return Project.fromJson(projectData);
      } catch (e) {
        if (AppConfig.isDevelopment) {
          print('❌ Failed to parse project $projectId: $e');
        }
        return null;
      }
    }
  }
  
  // Not found in my projects - return null (will show error)
  return null;
});

// In-memory cache for my projects (instant access)
final _myProjectsCacheProvider = StateProvider<List<Project>?>((ref) => null);

// Changed from autoDispose to prevent refetch on rebuilds
// Now watches userId to automatically refetch when user changes
// Uses stale-while-revalidate: returns cached data immediately, then fetches fresh
final myProjectsProvider =
    FutureProvider<List<Project>>((ref) async {
  final repository = ref.read(projectsRepositoryProvider);
  ref.watch(authEpochProvider);
  final userId = ref.watch(authStateProvider.select((state) => state.userId));

  if (userId == null) {
    ref.read(_myProjectsCacheProvider.notifier).state = [];
    return [];
  }
  
  // 1. Check in-memory cache first (instant)
  final cached = ref.read(_myProjectsCacheProvider);
  if (cached != null) {
    // Return cached immediately, but continue fetching fresh data
    // The provider will update when fresh data arrives
  }
  
  // 2. Try to load from persistent cache
  final cacheKey = 'my_projects_$userId';
  final persistentCache = await CacheService.getList<Project>(
    cacheKey,
    (json) => Project.fromJson(json),
  );
  
  if (persistentCache != null && persistentCache.isNotEmpty) {
    // Update in-memory cache
    ref.read(_myProjectsCacheProvider.notifier).state = persistentCache;
    // Return cached immediately, continue fetching fresh
  }
  
  // 3. Fetch fresh data (this will update the provider when done)
  try {
    final response = await repository.getMyProjects();

    if (response.success && response.data != null) {
      // Save to both caches
      ref.read(_myProjectsCacheProvider.notifier).state = response.data!;
      await CacheService.setList(
        cacheKey,
        response.data!,
        (project) => project.toJson(),
      );
      return response.data!;
    }

    // If fetch fails, return cached data if available
    if (persistentCache != null && persistentCache.isNotEmpty) {
      return persistentCache;
    }
    if (cached != null && cached.isNotEmpty) {
      return cached;
    }

    throw Exception(response.message ?? 'Failed to fetch projects');
  } catch (e) {
    // Return cached data on error if available
    if (persistentCache != null && persistentCache.isNotEmpty) {
      return persistentCache;
    }
    if (cached != null && cached.isNotEmpty) {
      return cached;
    }
    rethrow;
  }
});

// In-memory cache for explore projects
final _exploreProjectsCacheProvider = StateProvider.autoDispose<Map<String, List<Project>>>((ref) => {});

/// Last successful explore projects list. Show this while refetching to avoid flicker.
/// Updated when exploreProjectsProvider emits data; not autoDispose so it survives navigation.
final exploreProjectsLastDataProvider = StateProvider<List<Project>?>((ref) => null);

final exploreProjectsProvider =
    FutureProvider.autoDispose<List<Project>>((ref) async {
  final repository = ref.read(projectsRepositoryProvider);
  ref.watch(authEpochProvider);
  final userId = ref.watch(authStateProvider.select((state) => state.userId));
  final authState = ref.read(authStateProvider);
  final userRoleId = authState.user?.roleId;

  if (userId == null) {
    return [];
  }
  
  // Get selected category ID (null means "All")
  final selectedCategoryId = ref.watch(selectedExploreCategoryIdProvider);
  
  // Get sortBy option (defaults to 'newest')
  final String sortBy = ref.watch(exploreSortByProvider);
  
  // Get search query from search provider
  final searchQuery = ref.watch(searchQueryProvider);
  final query = searchQuery.trim().isNotEmpty ? searchQuery.trim() : null;
  
  // Create cache key from filters
  final cacheKey = 'explore_${userId}_${selectedCategoryId ?? 'all'}_${sortBy}_${query ?? 'noquery'}';
  
  if (AppConfig.isDevelopment) {
    print('🔍 [exploreProjectsProvider] Fetching with: categoryId=$selectedCategoryId, query=$query, sortBy=$sortBy');
  }
  
  // 1. Check in-memory cache first (instant)
  final inMemoryCache = ref.read(_exploreProjectsCacheProvider);
  final cached = inMemoryCache[cacheKey];
  if (cached != null && cached.isNotEmpty) {
    // Return cached immediately, continue fetching fresh
  }
  
  // 2. Try persistent cache
  final persistentCache = await CacheService.getList<Project>(
    cacheKey,
    (json) => Project.fromJson(json),
  );
  
  if (persistentCache != null && persistentCache.isNotEmpty) {
    // Update in-memory cache
    ref.read(_exploreProjectsCacheProvider.notifier).update((state) {
      return {...state, cacheKey: persistentCache};
    });
    // Return cached immediately, continue fetching fresh
  }
  
  // 3. Fetch fresh data
  try {
    final response = await repository.fetchExploreProjects(
      query: query,
      categoryId: selectedCategoryId,
      subCategoryId: null,
      subSubCategoryId: null,
      page: 1,
      limit: 20,
      userRoleId: userRoleId,
      sortBy: sortBy,
    );

    if (response.success && response.data != null) {
      if (AppConfig.isDevelopment) {
        print('✅ [exploreProjectsProvider] Fetched ${response.data!.length} projects');
      }
      
      // Save to both caches
      ref.read(_exploreProjectsCacheProvider.notifier).update((state) {
        return {...state, cacheKey: response.data!};
      });
      await CacheService.setList(
        cacheKey,
        response.data!,
        (project) => project.toJson(),
      );
      
      return response.data!;
    }

    // If fetch fails, return cached data if available
    if (persistentCache != null && persistentCache.isNotEmpty) {
      return persistentCache;
    }
    if (cached != null && cached.isNotEmpty) {
      return cached;
    }

    throw Exception(response.message ?? 'Failed to fetch explore projects');
  } catch (e) {
    // Return cached data on error if available
    if (persistentCache != null && persistentCache.isNotEmpty) {
      return persistentCache;
    }
    if (cached != null && cached.isNotEmpty) {
      return cached;
    }
    rethrow;
  }
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
  ref.watch(authEpochProvider);
  final userId = ref.watch(authStateProvider.select((state) => state.userId));
  final authState = ref.read(authStateProvider);
  final userRoleId = authState.user?.roleId;

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

/// Profile stats computed from user's projects
/// Automatically refreshes when user changes (account switching)
class ProfileStats {
  final int total;
  final int active;
  final int completed;

  const ProfileStats({
    required this.total,
    required this.active,
    required this.completed,
  });

  factory ProfileStats.empty() => const ProfileStats(total: 0, active: 0, completed: 0);
}

/// Workspace tab enum
enum WorkspaceTab { actionRequired, active }

/// Provider for selected workspace tab
final workspaceTabProvider = StateProvider<WorkspaceTab>((ref) => WorkspaceTab.actionRequired);

/// Provider for workspace items (max 5) - filtered from myProjectsProvider
/// Automatically refreshes when user changes or tab changes
final workspaceItemsProvider = Provider<AsyncValue<List<Project>>>((ref) {
  final projectsAsync = ref.watch(myProjectsProvider);
  final selectedTab = ref.watch(workspaceTabProvider);
  final authState = ref.read(authStateProvider);
  final isFreelancer = authState.user?.roleId == 3;
  
  return projectsAsync.when(
    data: (projects) {
      List<Project> filtered;
      
      if (selectedTab == WorkspaceTab.actionRequired) {
        // Action Required tab
        if (isFreelancer) {
          // Freelancer: pending delivery, revision requested, etc.
          filtered = projects.where((p) {
            final status = p.status.toLowerCase();
            return status == 'pending_review' ||
                   status == 'revision_requested' ||
                   status == 'pending_delivery' ||
                   status == 'changes_requested';
          }).toList();
        } else {
          // Client: pending review (freelancer submitted), pending offers
          filtered = projects.where((p) {
            final status = p.status.toLowerCase();
            return status == 'pending_review' ||
                   status == 'pending' ||
                   status == 'pending_approval';
          }).toList();
        }
      } else {
        // Active tab
        filtered = projects.where((p) {
          final status = p.status.toLowerCase();
          return status == 'active' ||
                 status == 'in_progress' ||
                 status == 'in-progress' ||
                 status == 'not_started';
        }).toList();
      }
      
      // Sort by updatedAt/createdAt (most recent first) and limit to 5
      filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      final limited = filtered.take(5).toList();
      
      return AsyncValue.data(limited);
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});

/// Provider for profile stats - derived from myProjectsProvider
/// Watches userId so it auto-refreshes on account switch
final profileStatsProvider = Provider<AsyncValue<ProfileStats>>((ref) {
  final projectsAsync = ref.watch(myProjectsProvider);
  
  return projectsAsync.when(
    data: (projects) {
      // Count by status
      int activeCount = 0;
      int completedCount = 0;
      
      for (final project in projects) {
        final status = project.status.toLowerCase();
        
        // Active statuses
        if (status == 'active' || 
            status == 'in_progress' || 
            status == 'in-progress' ||
            status == 'pending' ||
            status == 'not_started' ||
            status == 'pending_review') {
          activeCount++;
        }
        // Completed status
        else if (status == 'completed' || status == 'done' || status == 'finished') {
          completedCount++;
        }
      }
      
      return AsyncValue.data(ProfileStats(
        total: projects.length,
        active: activeCount,
        completed: completedCount,
      ));
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stack) => AsyncValue.error(error, stack),
  );
});
