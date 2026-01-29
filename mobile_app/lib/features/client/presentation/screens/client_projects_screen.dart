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
import '../../../../core/widgets/gradient_fab.dart';
import '../../../../shared/widgets/app_gradient_filter_chip.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../widgets/client_project_card.dart';
import '../../../../l10n/app_localizations.dart';

class ClientProjectsScreen extends ConsumerStatefulWidget {
  const ClientProjectsScreen({super.key});

  @override
  ConsumerState<ClientProjectsScreen> createState() => _ClientProjectsScreenState();
}

class _ClientProjectsScreenState extends ConsumerState<ClientProjectsScreen> {
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
      // Silently fail
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

    // Get unique statuses from projects for chips
    final statuses = projectsAsync.value?.map((p) => p.status).toSet().toList() ?? [];
    final allStatuses = [l10n.all, ...statuses];

    // Filter projects based on search and selected status
    List<Project>? filteredProjects;
    if (projectsAsync.value != null) {
      filteredProjects = projectsAsync.value!.where((project) {
        final matchesSearch = _searchController.text.isEmpty ||
            project.title.toLowerCase().contains(_searchController.text.toLowerCase()) ||
            project.description.toLowerCase().contains(_searchController.text.toLowerCase());
        final matchesStatus = _selectedStatus == null ||
            _selectedStatus == 'All' ||
            project.status == _selectedStatus;
        return matchesSearch && matchesStatus;
      }).toList();
    }

    // Calculate bottom offset for floating button
    // Note: Scaffold body already stops above bottomNavigationBar, so we don't add nav bar height
    final safe = MediaQuery.of(context).padding.bottom; // iPhone safe area
    const gap = 0.0; // Very small gap above the bottom edge (almost touching nav bar)
    final buttonBottomOffset = safe + gap;

    // Calculate bottom padding for content (to prevent overlap with button)
    final contentBottomPadding = safe + 80.0;

    return AppScaffold(
      body: Column(
        children: [
          // 1) Top Bar
          _buildTopBar(context, user),
          
          // 2) Search + Actions Row
          _buildSearchRow(context),
          
          // 3) Category Chips Row
          _buildCategoryChips(allStatuses),
          
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

                  return _buildProjectsGrid(context, filteredProjects, bottomPadding: contentBottomPadding);
                },
                loading: () => _LoadingGrid(bottomPadding: contentBottomPadding),
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
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GradientFab(
          onPressed: () => context.go('/create-project'),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: 1,
        items: [
          NavItem(icon: Icons.home_outlined, title: l10n.home, route: '/client'),
          NavItem(icon: Icons.work_outline, title: l10n.myProjects, route: '/client/projects'),
          NavItem(icon: Icons.explore_outlined, title: l10n.explore, route: '/client/explore'),
          NavItem(icon: Icons.payments_outlined, title: l10n.payments, route: '/client/payments'),
          NavItem(icon: Icons.person_outline, title: l10n.profile, route: '/client/profile'),
        ],
      ),
    );
  }

  // 1) Top Bar (matching Explore style)
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
                  icon: const Icon(
                    Icons.chevron_left_rounded,
                    color: Color(0xFF111827), // Black
                    size: 20,
                  ),
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
                color: const Color(0xFF111827), // Black
                fontWeight: FontWeight.bold,
              ),
            ),
            
            // Right: Avatar
            GestureDetector(
              onTap: () {
                context.go('/client/profile');
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

  // 3) Category Chips Row (pill chips matching Explore style)
  Widget _buildCategoryChips(List<String> statuses) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: statuses.length,
        separatorBuilder: (context, index) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (context, index) {
          final status = statuses[index];
          final isSelected = _selectedStatus == status || (_selectedStatus == null && status == l10n.all);
          
          return AppGradientFilterChip(
            label: status,
            selected: isSelected,
            onTap: () {
              setState(() {
                _selectedStatus = status == 'All' ? null : status;
              });
            },
          );
        },
      ),
    );
  }

  // 4) Projects Grid (clean list - actions moved to Project Details)
  Widget _buildProjectsGrid(BuildContext context, List<Project> projects, {double bottomPadding = 0}) {
    return GridView.builder(
      padding: EdgeInsets.only(
        top: AppSpacing.lg,
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        bottom: bottomPadding,
      ),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.75, // Matching Explore grid
      ),
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return ClientProjectCard(
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
  final double bottomPadding;
  
  const _LoadingGrid({this.bottomPadding = 0});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: EdgeInsets.only(
        top: AppSpacing.lg,
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        bottom: bottomPadding,
      ),
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
