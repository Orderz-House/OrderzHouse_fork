import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/category.dart';
import '../../../../core/models/user.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/widgets/loading_shimmer.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../subscriptions/presentation/providers/subscription_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _refresh() {
    ref.invalidate(exploreProjectsProvider);
    ref.invalidate(exploreCategoriesProvider);
    ref.invalidate(subscriptionStatusProvider);
  }

  Future<void> _handleApply(Project project) async {
    // Check subscription status
    final subscriptionAsync = ref.read(subscriptionStatusProvider);
    
    SubscriptionStatus subscriptionStatus;
    if (subscriptionAsync.hasValue) {
      subscriptionStatus = subscriptionAsync.value!;
    } else if (subscriptionAsync.isLoading) {
      // Wait for subscription status
      subscriptionStatus = await subscriptionAsync.when(
        data: (status) => status,
        loading: () => SubscriptionStatus(isSubscribed: false),
        error: (_, __) => SubscriptionStatus(isSubscribed: false),
      );
    } else {
      // Error or no data - assume not subscribed
      subscriptionStatus = SubscriptionStatus(isSubscribed: false);
    }

    if (!subscriptionStatus.isSubscribed) {
      // Show paywall
      _showPaywallModal(context, project);
      return;
    }

    // User is subscribed, proceed with apply
    await _applyToProject(project);
  }

  Future<void> _applyToProject(Project project) async {
    final repository = ref.read(projectsRepositoryProvider);
    
    // Show loading
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    try {
      final response = await repository.applyForProject(
        projectId: project.id,
      );

      if (!mounted) return;
      Navigator.of(context).pop(); // Close loading dialog

      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message ?? 'Application submitted successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        // Check if error is subscription-related
        final errorData = response.error;
        final isSubscriptionError = errorData?['isSubscriptionError'] == true;

        if (isSubscriptionError) {
          // Show paywall even if subscription check passed (server-side validation)
          _showPaywallModal(context, project);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Failed to apply to project'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.of(context).pop(); // Close loading dialog
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to apply: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showPaywallModal(BuildContext context, Project project) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.lock_outline,
                    size: 32,
                    color: Color(0xFF6D5FFD),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      'Subscription Required',
                      style: AppTextStyles.headlineMedium,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'To apply for projects, you need an active subscription.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Subscribe now to unlock the ability to apply for projects and access premium features.',
                style: AppTextStyles.bodySmall.copyWith(
                  color: const Color(0xFF6B7280),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Close modal
                  context.push('/subscription');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6D5FFD),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.md,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.subscriptions, size: 20),
                    SizedBox(width: AppSpacing.sm),
                    Text('Subscribe Now'),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Maybe Later'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(exploreProjectsProvider);
    final categoriesAsync = ref.watch(exploreCategoriesProvider);
    final selectedCategoryId = ref.watch(selectedExploreCategoryIdProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F3FF), // Light lavender background
      body: SafeArea(
        child: Column(
          children: [
            // 1) Top Row
            _buildTopRow(context, user),
            
            // 2) Search + Actions Row
            _buildSearchRow(context),
            
            // 3) Horizontal Chips Row
            _buildCategoryChips(categoriesAsync, selectedCategoryId),
            
            // 4) Projects Grid
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
      // 5) Floating Action Button
      floatingActionButton: _buildFloatingActionButton(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  // 1) Top Row
  Widget _buildTopRow(BuildContext context, User? user) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Grid/Menu Icon
          IconButton(
            icon: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.grid_view_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            onPressed: () {
              // TODO: Open menu/drawer
            },
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
    );
  }

  Widget _buildAvatarPlaceholder() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFFE9E6FF),
        shape: BoxShape.circle,
        border: Border.all(
          color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: const Icon(
        Icons.person_rounded,
        color: Color(0xFF6D5FFD),
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
                  // TODO: Implement search with debounce
                  ref.invalidate(exploreProjectsProvider);
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

          return ListView.separated(
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

              return GestureDetector(
                onTap: () {
                  if (label == 'All') {
                    ref.read(selectedExploreCategoryIdProvider.notifier).state = null;
                  } else if (categories.isNotEmpty) {
                    final category = categories.firstWhere((c) => c.name == label);
                    ref.read(selectedExploreCategoryIdProvider.notifier).state = category.id;
                  }
                  ref.invalidate(exploreProjectsProvider);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF6D5FFD)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF6D5FFD)
                          : const Color(0xFF6D5FFD).withValues(alpha: 0.3),
                      width: 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: Text(
                      label,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: isSelected
                            ? Colors.white
                            : const Color(0xFF6D5FFD),
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
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

  // 4) Projects Grid (2-column masonry-like)
  Widget _buildProjectsGrid(BuildContext context, List<Project> projects) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.65, // Adjusted for compact cards matching reference
      ),
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return _ProjectCard(
          project: project,
          readOnly: widget.readOnly,
          onTap: () {
            context.push(
              '/project/${project.id}',
              extra: project,
            );
          },
          onApply: widget.readOnly
              ? null
              : () => _handleApply(project),
        );
      },
    );
  }

  // 5) Floating Action Button
  Widget _buildFloatingActionButton(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final isClient = location.contains('/client');

    if (!isClient) {
      // Freelancers don't have "Add Project" - return empty
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 80), // Space above bottom nav
      child: ElevatedButton(
        onPressed: () {
          context.go('/create-project');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6D5FFD),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          elevation: 4,
          shadowColor: const Color(0xFF6D5FFD).withValues(alpha: 0.3),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.add_rounded, size: 20),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'Add Project',
              style: AppTextStyles.labelLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
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

// Project Card (2-column grid style - matches reference image)
// FIXED: No overflow, compact design matching reference
class _ProjectCard extends StatelessWidget {
  final Project project;
  final bool readOnly;
  final VoidCallback onTap;
  final VoidCallback? onApply;

  const _ProjectCard({
    required this.project,
    required this.readOnly,
    required this.onTap,
    this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    // Fixed image height for consistency (no varying heights to prevent overflow)
    const double imageHeight = 140.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image with favorite icon overlay (FIXED HEIGHT)
            SizedBox(
              height: imageHeight,
              width: double.infinity,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(18),
                      topRight: Radius.circular(18),
                    ),
                    child: project.coverPic != null &&
                            project.coverPic!.isNotEmpty &&
                            AppConfig.baseUrl.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: project.coverPic!.startsWith('http')
                                ? project.coverPic!
                                : '${AppConfig.baseUrl}${project.coverPic}',
                            height: imageHeight,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              height: imageHeight,
                              width: double.infinity,
                              color: const Color(0xFFE9E6FF),
                              child: const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6D5FFD)),
                                ),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              height: imageHeight,
                              width: double.infinity,
                              color: const Color(0xFFE9E6FF),
                              child: const Center(
                                child: Icon(
                                  Icons.work_outline_rounded,
                                  color: Color(0xFF6D5FFD),
                                  size: 40,
                                ),
                              ),
                            ),
                          )
                        : Container(
                            height: imageHeight,
                            width: double.infinity,
                            color: const Color(0xFFE9E6FF),
                            child: const Center(
                              child: Icon(
                                Icons.work_outline_rounded,
                                color: Color(0xFF6D5FFD),
                                size: 40,
                              ),
                            ),
                          ),
                  ),
                  // Favorite icon overlay (top-left)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.star_outline_rounded,
                        color: Color(0xFF111827),
                        size: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content section (FIXED STRUCTURE - no overflow)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title (bold, 1 line) - FIXED HEIGHT
                  SizedBox(
                    height: 18, // Fixed height for single line
                    child: Text(
                      project.title,
                      style: AppTextStyles.titleMedium.copyWith(
                        color: const Color(0xFF111827),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        height: 1.0,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 6),
                  
                  // Description (small grey, 2 lines) - FIXED HEIGHT
                  SizedBox(
                    height: 28, // Fixed height for 2 lines (11px * 1.3 * 2)
                    child: Text(
                      project.description,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                        fontSize: 11,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  
                  const SizedBox(height: 10),
                  
                  // Stats Row (FIXED HEIGHT - no overflow)
                  SizedBox(
                    height: 16, // Fixed height for stats row
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildStatItem(
                          Icons.visibility_outlined,
                          '0',
                          size: 12,
                        ),
                        const SizedBox(width: 8),
                        _buildStatItem(
                          Icons.favorite_outline_rounded,
                          '0',
                          size: 12,
                        ),
                        const SizedBox(width: 8),
                        _buildStatItem(
                          Icons.share_outlined,
                          '0',
                          size: 12,
                        ),
                        const Spacer(),
                        // 3-dots menu
                        GestureDetector(
                          onTap: () {
                            // TODO: Show menu options
                          },
                          child: const Icon(
                            Icons.more_vert_rounded,
                            color: Color(0xFF6B7280),
                            size: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String value, {double size = 12}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: size,
          color: const Color(0xFF6B7280),
        ),
        const SizedBox(width: 3),
        Text(
          value,
          style: AppTextStyles.labelSmall.copyWith(
            color: const Color(0xFF6B7280),
            fontSize: 10,
            height: 1.0,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
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
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const LoadingShimmer(
                height: 180,
                width: double.infinity,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const LoadingShimmer(width: 120, height: 16),
                    const SizedBox(height: AppSpacing.xs),
                    const LoadingShimmer(width: 100, height: 12),
                    const SizedBox(height: AppSpacing.xs),
                    const LoadingShimmer(width: 80, height: 12),
                    const Spacer(),
                    const LoadingShimmer(width: 60, height: 12),
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
