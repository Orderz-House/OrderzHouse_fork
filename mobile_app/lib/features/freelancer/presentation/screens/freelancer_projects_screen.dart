import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/models/project.dart';
import '../../../../core/models/user.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/widgets/loading_shimmer.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class FreelancerProjectsScreen extends ConsumerStatefulWidget {
  const FreelancerProjectsScreen({super.key});

  @override
  ConsumerState<FreelancerProjectsScreen> createState() => _FreelancerProjectsScreenState();
}

class _FreelancerProjectsScreenState extends ConsumerState<FreelancerProjectsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Check if project matches selected status
  bool _matchesStatus(Project project, String? selectedTabStatus) {
    if (selectedTabStatus == null || selectedTabStatus == 'All') return true;
    
    final projectStatus = project.status.toLowerCase();
    final tabStatus = selectedTabStatus.toLowerCase();
    
    switch (tabStatus) {
      case 'active':
        return ['in_progress', 'active', 'running', 'started'].contains(projectStatus);
      case 'pending':
        return projectStatus == 'pending';
      case 'completed':
        return projectStatus == 'completed';
      default:
        return project.status == selectedTabStatus;
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(myProjectsProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    // Filter projects based on search and selected status
    List<Project>? filteredProjects;
    if (projectsAsync.value != null) {
      filteredProjects = projectsAsync.value!.where((project) {
        final matchesSearch = _searchController.text.isEmpty ||
            project.title.toLowerCase().contains(_searchController.text.toLowerCase()) ||
            project.description.toLowerCase().contains(_searchController.text.toLowerCase());
        final matchesStatus = _matchesStatus(project, _selectedStatus);
        return matchesSearch && matchesStatus;
      }).toList();
    }

    return AppScaffold(
      body: Column(
        children: [
          // 1) Top Bar
          _buildTopBar(context, user),
          
          // 2) Search + Actions Row
          _buildSearchRow(context),
          
          // 3) Category Chips Row (Active/Pending/Completed)
          _buildCategoryChips(),
          
          // 4) Projects Grid
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(myProjectsProvider);
                await ref.read(myProjectsProvider.future);
              },
              child: projectsAsync.when(
                data: (projects) {
                  if (filteredProjects == null || filteredProjects.isEmpty) {
                    return EmptyState(
                      icon: Icons.work_outline,
                      title: _searchController.text.isNotEmpty || _selectedStatus != null
                          ? 'No projects found'
                          : 'No projects yet',
                      message: _searchController.text.isNotEmpty || _selectedStatus != null
                          ? 'Try adjusting your search or filters'
                          : 'Your assigned projects will appear here',
                    );
                  }

                  return _buildProjectsGrid(context, filteredProjects);
                },
                loading: () => const _LoadingGrid(),
                error: (error, stackTrace) => ErrorState(
                  message: error.toString().replaceAll('Exception: ', ''),
                  onRetry: () {
                    ref.invalidate(myProjectsProvider);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: 1,
        items: const [
          NavItem(icon: Icons.home, title: 'Home', route: '/freelancer'),
          NavItem(icon: Icons.work, title: 'My Projects', route: '/freelancer/projects'),
          NavItem(icon: Icons.explore, title: 'Explore', route: '/freelancer/explore'),
          NavItem(icon: Icons.payment, title: 'Payments', route: '/freelancer/payments'),
          NavItem(icon: Icons.person, title: 'Profile', route: '/freelancer/profile'),
        ],
      ),
    );
  }

  // 1) Top Bar
  Widget _buildTopBar(BuildContext context, User? user) {
    return SafeArea(
      bottom: false,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left: Back button
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                color: const Color(0xFF6D5FFD),
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/freelancer/home');
                  }
                },
              ),
            ),
            
            // Center: Title
            Text(
              'My Projects',
              style: AppTextStyles.headlineMedium.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.bold,
              ),
            ),
            
            // Right: Avatar
            GestureDetector(
              onTap: () {
                context.go('/freelancer/profile');
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
                onChanged: (_) => setState(() {}),
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

  // 3) Category Chips Row (Active/Pending/Completed)
  Widget _buildCategoryChips() {
    final tabs = ['All', 'Active', 'Pending', 'Completed'];
    
    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: tabs.length,
        separatorBuilder: (context, index) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (context, index) {
          final tab = tabs[index];
          final isSelected = _selectedStatus == tab || (_selectedStatus == null && tab == 'All');
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedStatus = tab == 'All' ? null : tab;
              });
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
                  tab,
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
      ),
    );
  }

  // 4) Projects Grid
  Widget _buildProjectsGrid(BuildContext context, List<Project> projects) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.85,
      ),
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return _ProjectCard(
          project: project,
          onTap: () {
            context.push(
              '/project/${project.id}',
              extra: project,
            );
          },
        );
      },
    );
  }
}

// Project Card (reused from Client - same component)
class _ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;

  const _ProjectCard({
    required this.project,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
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
            // Image with favorite icon overlay
            SizedBox(
              height: 120,
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
                            height: 120,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              height: 120,
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
                              height: 120,
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
                            height: 120,
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

            // Content section
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title and Price row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title (left, flexible)
                      Expanded(
                        child: Text(
                          project.title,
                          style: AppTextStyles.titleMedium.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            height: 1.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Price (right) - only show if not "Negotiable"
                      if (project.budgetDisplay != 'Negotiable')
                        Text(
                          project.budgetDisplay,
                          style: AppTextStyles.labelMedium.copyWith(
                            color: const Color(0xFF6D5FFD),
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                  
                  const SizedBox(height: 6),
                  
                  // Description (1-2 lines)
                  Text(
                    project.description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFF6B7280),
                      fontSize: 11,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
        childAspectRatio: 0.75,
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
                height: 140,
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
