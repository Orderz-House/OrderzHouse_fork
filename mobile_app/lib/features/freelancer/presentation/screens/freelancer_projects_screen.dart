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
import '../../../../shared/widgets/app_gradient_filter_chip.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../widgets/freelancer_project_card.dart';
import '../../../../l10n/app_localizations.dart';

class FreelancerProjectsScreen extends ConsumerStatefulWidget {
  const FreelancerProjectsScreen({super.key});

  @override
  ConsumerState<FreelancerProjectsScreen> createState() => _FreelancerProjectsScreenState();
}

class _FreelancerProjectsScreenState extends ConsumerState<FreelancerProjectsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;
  
  // Store raw project data for additional fields (for future use if needed)
  final Map<int, Map<String, dynamic>> _projectDataMap = {};
  
  // Guard to prevent multiple simultaneous calls
  bool _isFetchingRawData = false;
  bool _hasFetchedRawData = false;

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

  // Fetch and store raw project data (only once per data load)
  Future<void> _fetchRawProjectDataForProjects(List<Project> projects) async {
    // Prevent multiple simultaneous calls
    if (_isFetchingRawData || _hasFetchedRawData) {
      return;
    }
    
    _isFetchingRawData = true;
    
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getMyProjectsRaw();
      
      if (response.success && response.data != null && mounted) {
        setState(() {
          // Store raw data by project ID
          for (var rawProject in response.data!) {
            final projectId = rawProject['id'] as int?;
            if (projectId != null) {
              _projectDataMap[projectId] = rawProject;
            }
          }
          _hasFetchedRawData = true;
        });
      }
    } catch (e) {
      // Silently fail - we'll use fallback logic
    } finally {
      if (mounted) {
        setState(() {
          _isFetchingRawData = false;
        });
      }
    }
  }
  
  // Reset raw data fetch flag when refreshing
  void _onRefresh() {
    setState(() {
      _hasFetchedRawData = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
                _onRefresh();
                ref.invalidate(myProjectsProvider);
                await ref.read(myProjectsProvider.future);
              },
              child: projectsAsync.when(
                data: (projects) {
                  // Fetch and store raw project data (only once)
                  _fetchRawProjectDataForProjects(projects);

                  if (filteredProjects == null || filteredProjects.isEmpty) {
                    return EmptyState(
                      icon: Icons.work_outline,
                      title: _searchController.text.isNotEmpty || _selectedStatus != null
                          ? l10n.noResultsFound
                          : l10n.noProjects,
                      message: _searchController.text.isNotEmpty || _selectedStatus != null
                          ? l10n.noResultsFound
                          : l10n.noProjectsMessage,
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
        items: [
          NavItem(icon: Icons.home, title: l10n.home, route: '/freelancer'),
          NavItem(icon: Icons.work, title: l10n.myProjects, route: '/freelancer/projects'),
          NavItem(icon: Icons.explore, title: l10n.explore, route: '/freelancer/explore'),
          NavItem(icon: Icons.payment, title: l10n.payments, route: '/freelancer/payments'),
          NavItem(icon: Icons.person, title: l10n.profile, route: '/freelancer/profile'),
        ],
      ),
    );
  }

  // 1) Top Bar
  Widget _buildTopBar(BuildContext context, User? user) {
    final l10n = AppLocalizations.of(context)!;
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
            // Left: Back arrow in white circle button
            if (context.canPop())
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
                  color: const Color(0xFF111827), // Black
                  onPressed: () => context.pop(),
                  padding: EdgeInsets.zero,
                ),
              )
            else
              const SizedBox(width: 40), // Spacer if no back button
            
            // Center: Title
            Text(
              l10n.myProjects,
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
      decoration: const BoxDecoration(
        color: Color(0xFFE5E7EB), // Light gray
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
    final l10n = AppLocalizations.of(context)!;
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
                  hintText: l10n.searchProjects,
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

  // 3) Category Chips Row (Active/Pending/Completed) - pill chips matching Explore style
  Widget _buildCategoryChips() {
    final l10n = AppLocalizations.of(context)!;
    final tabs = [l10n.all, l10n.active, l10n.pending, l10n.completed];
    
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
          final isSelected = _selectedStatus == tab || (_selectedStatus == null && tab == l10n.all);
          
          return AppGradientFilterChip(
            label: tab,
            selected: isSelected,
            onTap: () {
              setState(() {
                _selectedStatus = tab == l10n.all ? null : tab;
              });
            },
          );
        },
      ),
    );
  }

  // 4) Projects Grid (clean list - actions moved to Project Details)
  Widget _buildProjectsGrid(BuildContext context, List<Project> projects) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.75, // Matching Explore grid
      ),
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return FreelancerProjectCard(
          project: project,
          projectData: _projectDataMap[project.id],
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

// Removed _ProjectCard - now using ExploreProjectCard widget

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
        childAspectRatio: 0.75, // Matching Explore grid
      ),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16), // Matching Explore card radius
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LoadingShimmer(
                height: 120, // Matching Explore card image height
                width: double.infinity,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(12), // Matching Explore card padding
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LoadingShimmer(width: 120, height: 16),
                    SizedBox(height: 6),
                    LoadingShimmer(width: 100, height: 12),
                    SizedBox(height: 6),
                    LoadingShimmer(width: 80, height: 12),
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
