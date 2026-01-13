import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';
import '../../../notifications/presentation/providers/notifications_provider.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/category.dart';

class FreelancerHomeScreen extends ConsumerWidget {
  const FreelancerHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(exploreCategoriesProvider);
    final latestProjectsAsync = ref.watch(latestProjectsProvider);

    return AppScaffold(
      body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1) TOP BAR
              _buildTopBar(context),

              const SizedBox(height: AppSpacing.md),

              // 2) SECTION 1: Featured Banner
              _buildFeaturedBanner(context),

              const SizedBox(height: AppSpacing.xl),

              // 3) SECTION 2: Popular Categories
              _buildCategoriesSection(context, categoriesAsync),

              const SizedBox(height: AppSpacing.xl),

              // 4) SECTION 3: Latest Projects
              _buildLatestProjectsSection(context, latestProjectsAsync),

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: 0,
        items: const [
          NavItem(icon: Icons.home_rounded, title: 'Home', route: '/freelancer'),
          NavItem(icon: Icons.work_outline_rounded, title: 'My Projects', route: '/freelancer/projects'),
          NavItem(icon: Icons.explore_rounded, title: 'Explore', route: '/freelancer/explore'),
          NavItem(icon: Icons.payment_rounded, title: 'Payments', route: '/freelancer/payments'),
          NavItem(icon: Icons.person_outline_rounded, title: 'Profile', route: '/freelancer/profile'),
        ],
      ),
    );
  }

  // 1) TOP BAR
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Column(
        children: [
          // Logo + Icons Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo/Icon
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF6D5FFD),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.work_outline_rounded,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              // Right Icons
              Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.favorite_outline_rounded,
                      color: Color(0xFF111827),
                      size: 24,
                    ),
                    onPressed: () {
                      // TODO: Navigate to favorites
                    },
                  ),
                  Consumer(
                    builder: (context, ref, child) {
                      final unreadCountAsync = ref.watch(unreadCountProvider);
                      final unreadCount = unreadCountAsync.valueOrNull ?? 0;
                      
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.notifications_none,
                              color: Color(0xFF111827),
                              size: 24,
                            ),
                            onPressed: () {
                              context.push('/freelancer/notifications');
                            },
                          ),
                          if (unreadCount > 0)
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 16,
                                  minHeight: 16,
                                ),
                                child: Text(
                                  unreadCount > 9 ? '9+' : '$unreadCount',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Search Field
          Row(
            children: [
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
                    decoration: InputDecoration(
                      hintText: 'Search projects, categories',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(
                        color: const Color(0xFF9CA3AF),
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: Color(0xFF9CA3AF),
                        size: 20,
                      ),
                      suffixIcon: IconButton(
                        icon: const Icon(
                          Icons.tune_rounded,
                          color: Color(0xFF9CA3AF),
                          size: 20,
                        ),
                        onPressed: () {
                          // TODO: Show filter dialog
                        },
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
            ],
          ),
        ],
      ),
    );
  }

  // 2) SECTION 1: Featured Banner
  Widget _buildFeaturedBanner(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Card
          GestureDetector(
            onTap: () {
              context.go('/freelancer/explore');
            },
            child: Container(
              width: double.infinity,
              height: 160,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF6D5FFD),
                    Color(0xFF8B5CF6),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  // Left Content
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Find top projects fast',
                          style: AppTextStyles.headlineSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'Browse projects and apply now',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.lg,
                            vertical: AppSpacing.sm,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Browse Projects',
                                style: AppTextStyles.labelLarge.copyWith(
                                  color: const Color(0xFF6D5FFD),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                color: Color(0xFF6D5FFD),
                                size: 16,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Right Illustration (Placeholder)
                  Positioned(
                    right: 0,
                    top: 0,
                    bottom: 0,
                    child: Container(
                      width: 120,
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(20),
                          bottomRight: Radius.circular(20),
                        ),
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.work_rounded,
                          color: Colors.white,
                          size: 60,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 3) SECTION 2: Popular Categories
  Widget _buildCategoriesSection(
    BuildContext context,
    AsyncValue<List<Category>> categoriesAsync,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Categories Row
          categoriesAsync.when(
            loading: () => _buildCategoriesSkeleton(),
            error: (err, stack) => Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Text(
                  'Failed to load categories',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ),
            ),
            data: (categories) {
              // Show all categories in horizontal scroll
              if (categories.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Text(
                      'No categories available',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                );
              }

              return SizedBox(
                height: 100,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    const double itemGap = 18;
                    return Align(
                      alignment: Alignment.center,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(minWidth: constraints.maxWidth),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              for (int i = 0; i < categories.length; i++) ...[
                                if (i > 0) SizedBox(width: itemGap),
                                _buildCategoryChip(context, categories[i]),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(BuildContext context, Category category) {
    return Consumer(
      builder: (context, ref, child) {
        return GestureDetector(
          onTap: () {
            // Set selected category in shared provider
            ref.read(exploreSelectedCategoryIdProvider.notifier).state = category.id;
            context.go('/freelancer/explore');
          },
          child: IntrinsicWidth(
            child: Column(
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE9E6FF),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: category.imageUrl != null &&
                          category.imageUrl!.isNotEmpty &&
                          AppConfig.baseUrl.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: CachedNetworkImage(
                            imageUrl: category.imageUrl!.startsWith('http')
                                ? category.imageUrl!
                                : '${AppConfig.baseUrl}${category.imageUrl}',
                            fit: BoxFit.cover,
                            errorWidget: (context, url, error) => _buildCategoryIcon(category.name),
                          ),
                        )
                      : _buildCategoryIcon(category.name),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  category.name,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: const Color(0xFF111827),
                    fontSize: 11,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.visible,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCategoryIcon(String categoryName) {
    IconData icon;
    final nameLower = categoryName.toLowerCase();
    if (nameLower.contains('design')) {
      icon = Icons.palette_rounded;
    } else if (nameLower.contains('development') ||
        nameLower.contains('programming') ||
        nameLower.contains('code')) {
      icon = Icons.code_rounded;
    } else if (nameLower.contains('writing') ||
        nameLower.contains('content')) {
      icon = Icons.edit_rounded;
    } else if (nameLower.contains('marketing')) {
      icon = Icons.trending_up_rounded;
    } else {
      icon = Icons.category_rounded;
    }

    return Center(
      child: Icon(
        icon,
        color: const Color(0xFF6D5FFD),
        size: 32,
      ),
    );
  }

  Widget _buildCategoriesSkeleton() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(3, (index) {
        return Column(
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(18),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Container(
              width: 70,
              height: 12,
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ],
        );
      }),
    );
  }

  // 4) SECTION 3: Latest Projects
  Widget _buildLatestProjectsSection(
    BuildContext context,
    AsyncValue<List<Project>> projectsAsync,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Latest Projects',
                style: AppTextStyles.headlineMedium.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  context.go('/freelancer/explore');
                },
                child: Text(
                  'See All >',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: const Color(0xFF6D5FFD),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Projects Grid
          projectsAsync.when(
            loading: () => _buildProjectsSkeleton(),
            error: (err, stack) => Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Text(
                      'Failed to load projects',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Consumer(
                      builder: (context, ref, child) {
                        return TextButton(
                          onPressed: () {
                            ref.invalidate(latestProjectsProvider);
                          },
                          child: const Text('Retry'),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            data: (projects) {
              if (projects.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Text(
                      'No projects available',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                );
              }

              // Show only first 2 projects
              final displayProjects = projects.take(2).toList();
              return Row(
                children: [
                  Expanded(
                    child: _buildProjectCard(context, displayProjects[0]),
                  ),
                  if (displayProjects.length > 1) ...[
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _buildProjectCard(context, displayProjects[1]),
                    ),
                  ] else ...[
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Container(), // Empty space for second card
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProjectCard(BuildContext context, Project project) {
    final budget = project.budget ??
        project.budgetMax ??
        project.budgetMin ??
        0.0;

    return GestureDetector(
      onTap: () {
        context.push('/project/${project.id}', extra: project);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
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
                      height: 120,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorWidget: (context, url, error) => Container(
                        height: 120,
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
                      height: 120,
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

            // Content
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    project.title,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: const Color(0xFF111827),
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Text(
                        '\$${budget.toStringAsFixed(2)}',
                        style: AppTextStyles.titleSmall.copyWith(
                          color: const Color(0xFF6D5FFD),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProjectsSkeleton() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 200,
            decoration: BoxDecoration(
              color: const Color(0xFFE5E7EB),
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Container(
            height: 200,
            decoration: BoxDecoration(
              color: const Color(0xFFE5E7EB),
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
      ],
    );
  }
}
