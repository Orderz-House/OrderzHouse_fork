import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/category.dart';
import '../../../../core/models/user.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/widgets/loading_shimmer.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/explore_project_card.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/gradient_button.dart';
import '../../../../shared/widgets/app_gradient_filter_chip.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../search/presentation/providers/search_provider.dart';
import 'dart:async';

class ExploreProjectsScreen extends ConsumerStatefulWidget {
  final bool readOnly;

  const ExploreProjectsScreen({
    super.key,
    this.readOnly = false,
  });

  @override
  ConsumerState<ExploreProjectsScreen> createState() =>
      _ExploreProjectsScreenState();
}

class _ExploreProjectsScreenState
    extends ConsumerState<ExploreProjectsScreen> {
  final _searchController = TextEditingController();
  final _categoryScrollController = ScrollController();
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _categoryScrollController.dispose();
    super.dispose();
  }

  bool _hasSyncedSharedCategory = false;

  @override
  void initState() {
    super.initState();
  }

  void _refresh() {
    ref.invalidate(exploreProjectsProvider);
    ref.invalidate(exploreCategoriesProvider);
  }

  @override
  Widget build(BuildContext context) {
    final searchQuery = ref.watch(searchQueryProvider);
    final searchResultsAsync = ref.watch(searchResultsProvider);
    final projectsAsync = ref.watch(exploreProjectsProvider);
    final categoriesAsync = ref.watch(exploreCategoriesProvider);
    final selectedCategoryId = ref.watch(selectedExploreCategoryIdProvider);
    final sharedCategoryId = ref.watch(exploreSelectedCategoryIdProvider);
    
    // Show search results if query is not empty, otherwise show normal content
    final isSearching = searchQuery.trim().isNotEmpty;
    
    // Sync shared provider to local provider on first build
    if (!_hasSyncedSharedCategory && sharedCategoryId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          // Set the local provider to match shared state
          ref.read(selectedExploreCategoryIdProvider.notifier).state = sharedCategoryId;
          // Clear shared state after syncing (so it doesn't persist on next visit)
          ref.read(exploreSelectedCategoryIdProvider.notifier).state = null;
          _hasSyncedSharedCategory = true;
        }
      });
    }
    
    // Debug log
    debugPrint('Explore selectedCategoryId=$selectedCategoryId, sharedCategoryId=$sharedCategoryId');
    
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    return AppScaffold(
      body: Column(
          children: [
            // 1) Top Row
            _buildTopRow(context, user),
            
            // 2) Search + Actions Row
            _buildSearchRow(context),
            
            // 3) Content (Search Results OR Normal Content)
            Expanded(
              child: isSearching
                  ? _buildSearchResults(context, searchResultsAsync)
                  : Column(
                      children: [
                        // Horizontal Chips Row
                        _buildCategoryChips(categoriesAsync, selectedCategoryId),
                        // Projects Grid
                        Expanded(
                          child: RefreshIndicator(
                            onRefresh: () async {
                              _refresh();
                              await ref.read(exploreProjectsProvider.future);
                            },
                            child: projectsAsync.when(
                              data: (projects) {
                                if (projects.isEmpty) {
                                  return EmptyState(
                                    icon: Icons.explore_outlined,
                                    title: 'No projects found',
                                    message: selectedCategoryId == null
                                        ? 'Try selecting a category or adjusting your search'
                                        : 'No projects in this category. Try another category.',
                                  );
                                }

                                return _buildProjectsGrid(context, projects);
                              },
                              loading: () => const _LoadingGrid(),
                              error: (error, stackTrace) {
                                final errorMessage = error.toString().replaceAll('Exception: ', '');
                                final is403 = errorMessage.toLowerCase().contains('permission') ||
                                    errorMessage.toLowerCase().contains('access denied') ||
                                    errorMessage.toLowerCase().contains('forbidden');
                                
                                return ErrorState(
                                  message: is403
                                      ? 'You don\'t have permission to view these projects. Please verify your account or log in with a different role.'
                                      : errorMessage,
                                  onRetry: _refresh,
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      floatingActionButton: _buildFloatingActionButton(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  // 1) Top Row
  Widget _buildTopRow(BuildContext context, User? user) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left: Menu/Grid Icon Button (rounded square, like screenshot)
            // If Explore is opened from navigation stack, show back arrow
            // If Explore is a main bottom-nav tab, show menu/grid icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12), // Rounded square
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                icon: context.canPop()
                    ? const Icon(Icons.chevron_left_rounded)
                    : const Icon(Icons.grid_view_rounded), // Menu/grid icon for main tab
                color: const Color(0xFF111827), // Near-black
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  }
                  // If it's a main tab, do nothing (just show the icon)
                },
              ),
            ),
          
            // Center: Title
            Text(
              'Explore',
              style: AppTextStyles.headlineMedium.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.bold,
              ),
            ),
          
            // Right: Avatar
            GestureDetector(
              onTap: () {
                final location = GoRouterState.of(context).uri.path;
                if (location.contains('/client')) {
                  context.go('/client/profile');
                } else {
                  context.go('/freelancer/profile');
                }
              },
              child: user?.profilePicUrl != null && user!.profilePicUrl!.isNotEmpty
                  ? ClipOval(
                      child: CachedNetworkImage(
                        imageUrl: user.profilePicUrl!.startsWith('http')
                            ? user.profilePicUrl!
                            : '${AppConfig.baseUrl}${user.profilePicUrl}',
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        errorWidget: (context, url, error) => _buildAvatarPlaceholder(),
                      ),
                    )
                  : _buildAvatarPlaceholder(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarPlaceholder() {
    return Container(
      width: 40,
      height: 40,
      decoration: const BoxDecoration(
        color: Color(0xFFE5E7EB), // Light gray background
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.person_rounded,
        color: Color(0xFF6B7280), // Gray icon
        size: 24,
      ),
    );
  }

  // 2) Search + Actions Row
  Widget _buildSearchRow(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        children: [
          // Search Field
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (value) {
                  // Debounce search input
                  _debounceTimer?.cancel();
                  _debounceTimer = Timer(const Duration(milliseconds: 350), () {
                    if (mounted) {
                      ref.read(searchQueryProvider.notifier).state = value;
                    }
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Search Projects',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: const Color(0xFF9CA3AF),
                  ),
                  prefixIcon: const Icon(
                    Icons.search_rounded,
                    color: Color(0xFF9CA3AF),
                    size: 20,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.md,
                  ),
                ),
              ),
            ),
          ),
          
          const SizedBox(width: AppSpacing.sm),
          
          // Filter Button
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(
                Icons.tune_rounded,
                color: Color(0xFF111827),
                size: 20,
              ),
              onPressed: () {
                // TODO: Show filter dialog
              },
            ),
          ),
          
          const SizedBox(width: AppSpacing.sm),
          
          // Sort Button
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(
                Icons.swap_vert_rounded,
                color: Color(0xFF111827),
                size: 20,
              ),
              onPressed: () {
                // TODO: Show sort dialog
              },
            ),
          ),
        ],
      ),
    );
  }

  // 3) Horizontal Chips Row
  Widget _buildCategoryChips(
    AsyncValue<List<Category>> categoriesAsync,
    int? selectedCategoryId,
  ) {
    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: categoriesAsync.when(
        data: (categories) {
          // Use real categories if available, otherwise use placeholders
          final chipLabels = categories.isNotEmpty
              ? ['All', ...categories.map((c) => c.name)]
              : ['All', 'Design', 'Writing', 'Development', 'Marketing', 'Video'];

          // Find the index of the selected category chip
          int? selectedIndex;
          if (selectedCategoryId != null && categories.isNotEmpty) {
            try {
              final selectedCategory = categories.firstWhere((c) => c.id == selectedCategoryId);
              selectedIndex = chipLabels.indexOf(selectedCategory.name);
            } catch (e) {
              selectedIndex = null;
            }
          }

          // Scroll to selected chip after build
          if (selectedIndex != null && selectedIndex >= 0) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (_categoryScrollController.hasClients && mounted) {
                // Calculate approximate position (each chip is ~100px wide + spacing)
                final double estimatedPosition = selectedIndex! * 110.0;
                _categoryScrollController.animateTo(
                  estimatedPosition,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              }
            });
          }

          return ListView.separated(
            controller: _categoryScrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            itemCount: chipLabels.length,
            separatorBuilder: (context, index) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) {
              final label = chipLabels[index];
              final isSelected = label == 'All'
                  ? selectedCategoryId == null
                  : categories.isNotEmpty &&
                      categories.any((c) => c.name == label && c.id == selectedCategoryId);

              return AppGradientFilterChip(
                label: label,
                selected: isSelected,
                onTap: () {
                  if (label == 'All') {
                    ref.read(selectedExploreCategoryIdProvider.notifier).state = null;
                  } else if (categories.isNotEmpty) {
                    final category = categories.firstWhere((c) => c.name == label);
                    ref.read(selectedExploreCategoryIdProvider.notifier).state = category.id;
                  }
                  ref.invalidate(exploreProjectsProvider);
                },
              );
            },
          );
        },
        loading: () => ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          itemCount: 5,
          itemBuilder: (context, index) {
            return Container(
              width: 100,
              height: 40,
              margin: const EdgeInsets.only(right: AppSpacing.sm),
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(20),
              ),
            );
          },
        ),
        error: (error, stackTrace) => const SizedBox.shrink(),
      ),
    );
  }

  // 4) Projects Grid (2-column masonry/staggered grid like Pinterest)
  Widget _buildProjectsGrid(BuildContext context, List<Project> projects, {bool shrinkWrap = false}) {
    return MasonryGridView.count(
      shrinkWrap: shrinkWrap,
      physics: shrinkWrap ? const NeverScrollableScrollPhysics() : const AlwaysScrollableScrollPhysics(),
      padding: shrinkWrap ? EdgeInsets.zero : const EdgeInsets.all(AppSpacing.lg),
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return ExploreProjectCard(
          project: project,
          onTap: () {
            context.push(
              '/project/${project.id}',
              extra: project,
            );
          },
          onFavorite: () {
            // TODO: Implement favorite functionality
          },
        );
      },
    );
  }

  // 5) Floating Action Button
  // Search Results UI
  Widget _buildSearchResults(
    BuildContext context,
    AsyncValue<SearchResult> searchResultsAsync,
  ) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(searchResultsProvider);
        await ref.read(searchResultsProvider.future);
      },
      child: searchResultsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        error: (error, stackTrace) => ErrorState(
          message: error.toString().replaceAll('Exception: ', ''),
          onRetry: () => ref.invalidate(searchResultsProvider),
        ),
        data: (searchResult) {
          if (searchResult.isEmpty) {
            return const EmptyState(
              icon: Icons.search_off_rounded,
              title: 'No results found',
              message: 'Try different keywords or check your spelling.',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.md),
                // Categories Section
                if (searchResult.categories.isNotEmpty) ...[
                  Text(
                    'Categories',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SizedBox(
                    height: 50,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: searchResult.categories.length,
                      separatorBuilder: (context, index) => const SizedBox(width: AppSpacing.sm),
                      itemBuilder: (context, index) {
                        final category = searchResult.categories[index];
                        return GestureDetector(
                          onTap: () {
                            // Set category filter and clear search
                            ref.read(exploreSelectedCategoryIdProvider.notifier).state = category.id;
                            ref.read(selectedExploreCategoryIdProvider.notifier).state = category.id;
                            _searchController.clear();
                            ref.read(searchQueryProvider.notifier).state = '';
                            ref.invalidate(exploreProjectsProvider);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.sm,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF111827), // Near-black for active
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Center(
                              child: Text(
                                category.name,
                                style: AppTextStyles.labelMedium.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],
                // Projects Section
                if (searchResult.projects.isNotEmpty) ...[
                  Text(
                    'Projects',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildProjectsGrid(context, searchResult.projects, shrinkWrap: true),
                ],
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFloatingActionButton(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final isClient = location.contains('/client');

    if (!isClient) {
      // Freelancers don't have "Add Project" - return empty
      return const SizedBox.shrink();
    }

    // Calculate proper spacing: bottom nav base height (85) + safe area + gap (12px)
    // Reduced total margin significantly to move button DOWN (closer to bottom nav)
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final bottomNavHeight = 85.0 + bottomPadding;
    const buttonSpacing = 12.0; // Gap between button and bottom nav (10-16px range)
    // Significantly reduce margin to move button DOWN - position it closer to bottom nav
    final totalBottomMargin = bottomNavHeight + buttonSpacing - 113 ; // Reduced by 50px to move DOWN significantly

    return Container(
      margin: EdgeInsets.only(bottom: totalBottomMargin), // Dynamic spacing above bottom nav
      child: PrimaryGradientButton(
        onPressed: () {
          context.go('/create-project');
        },
        label: 'Add Project',
        icon: Icons.add_rounded,
        width: null, // Use intrinsic width (pill shape)
        height: 48,
        borderRadius: 30, // Pill shape
      ),
    );
  }

  Widget? _buildBottomNav(BuildContext context) {
    // Determine current index based on route
    final location = GoRouterState.of(context).uri.path;
    int currentIndex = 2; // Default to explore

    if (location.contains('/client')) {
      if (location.contains('/projects')) {
        currentIndex = 1;
      } else if (location.contains('/explore')) {
        currentIndex = 2;
      } else if (location.contains('/payments')) {
        currentIndex = 3;
      } else if (location.contains('/profile')) {
        currentIndex = 4;
      } else {
        currentIndex = 0;
      }

      return AppBottomNavBar(
        currentIndex: currentIndex,
        items: const [
          NavItem(icon: Icons.home_rounded, title: 'Home', route: '/client'),
          NavItem(icon: Icons.work_outline_rounded, title: 'My Projects', route: '/client/projects'),
          NavItem(icon: Icons.explore_rounded, title: 'Explore', route: '/client/explore'),
          NavItem(icon: Icons.payment_rounded, title: 'Payments', route: '/client/payments'),
          NavItem(icon: Icons.person_outline_rounded, title: 'Profile', route: '/client/profile'),
        ],
      );
    } else if (location.contains('/freelancer')) {
      if (location.contains('/projects')) {
        currentIndex = 1;
      } else if (location.contains('/explore')) {
        currentIndex = 2;
      } else if (location.contains('/payments')) {
        currentIndex = 3;
      } else if (location.contains('/profile')) {
        currentIndex = 4;
      } else {
        currentIndex = 0;
      }

      return AppBottomNavBar(
        currentIndex: currentIndex,
        items: const [
          NavItem(icon: Icons.home_rounded, title: 'Home', route: '/freelancer'),
          NavItem(icon: Icons.work_outline_rounded, title: 'My Projects', route: '/freelancer/projects'),
          NavItem(icon: Icons.explore_rounded, title: 'Explore', route: '/freelancer/explore'),
          NavItem(icon: Icons.payment_rounded, title: 'Payments', route: '/freelancer/payments'),
          NavItem(icon: Icons.person_outline_rounded, title: 'Profile', route: '/freelancer/profile'),
        ],
      );
    }

    return null;
  }
}


// Loading Grid
class _LoadingGrid extends StatelessWidget {
  const _LoadingGrid();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.7,
      ),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LoadingShimmer(
                height: 180,
                width: double.infinity,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LoadingShimmer(width: 120, height: 16),
                    SizedBox(height: AppSpacing.xs),
                    LoadingShimmer(width: 100, height: 12),
                    SizedBox(height: AppSpacing.xs),
                    LoadingShimmer(width: 80, height: 12),
                    Spacer(),
                    LoadingShimmer(width: 60, height: 12),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
