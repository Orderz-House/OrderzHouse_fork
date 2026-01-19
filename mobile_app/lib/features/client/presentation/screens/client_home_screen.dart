import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/home_header.dart';
import '../../../../core/widgets/home_search_bar.dart';
import '../../../../core/widgets/home_hero_card_v2.dart';
import '../../../../core/widgets/quick_actions_row.dart';
import '../../../../core/widgets/home_project_card.dart';
import '../../../../core/widgets/section_title_row.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../../core/models/project.dart';

/// Premium Client Home Dashboard
/// Data sources:
/// - User info: authStateProvider
/// - Projects: myProjectsProvider (for counts and workspace)
/// - Latest projects: latestProjectsProvider (for inspiration)
class ClientHomeScreen extends ConsumerStatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  ConsumerState<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends ConsumerState<ClientHomeScreen> {
  String _selectedTab = 'action'; // 'action' or 'active'

  @override
  Widget build(BuildContext context) {
    final myProjectsAsync = ref.watch(myProjectsProvider);
    final latestProjectsAsync = ref.watch(latestProjectsProvider);

    return AppScaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myProjectsProvider);
          ref.invalidate(latestProjectsProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.md),

              // A) TOP HEADER
              const HomeHeader(
                roleRoute: '/client',
              ),

              const SizedBox(height: 8),

              // B) SEARCH BAR
              HomeSearchBar(
                hintText: 'Search freelancers, categories',
                onFilterTap: () {
                  // TODO: Show filter dialog
                },
              ),

              const SizedBox(height: AppSpacing.xl),

              // C) HERO ACTION CARD
              _buildHeroCard(context, ref, myProjectsAsync),

              const SizedBox(height: AppSpacing.xl),

              // D) QUICK ACTIONS ROW
              _buildQuickActions(context),

              const SizedBox(height: AppSpacing.xl),

              // F) MAIN LIST SECTION: Your Workspace
              SectionTitleRow(
                title: 'Your Workspace',
                onSeeAllTap: () {
                  context.go('/client/projects');
                },
              ),

              const SizedBox(height: AppSpacing.md),

              // Tabs: Action Required / Active
              _buildWorkspaceTabs(),

              const SizedBox(height: AppSpacing.md),

              _buildWorkspaceContent(context, myProjectsAsync),

              const SizedBox(height: AppSpacing.xl),

              // G) INSPIRATION SECTION
              SectionTitleRow(
                title: 'Get Inspired',
                onSeeAllTap: () {
                  context.go('/client/explore');
                },
              ),

              const SizedBox(height: AppSpacing.md),

              _buildInspirationProjects(context, latestProjectsAsync),

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNavBar(
        currentIndex: 0,
        items: [
          NavItem(icon: Icons.home_rounded, title: 'Home', route: '/client'),
          NavItem(
              icon: Icons.work_outline_rounded,
              title: 'My Projects',
              route: '/client/projects'),
          NavItem(
              icon: Icons.explore_rounded,
              title: 'Explore',
              route: '/client/explore'),
          NavItem(
              icon: Icons.payment_rounded,
              title: 'Payments',
              route: '/client/payments'),
          NavItem(
              icon: Icons.person_outline_rounded,
              title: 'Profile',
              route: '/client/profile'),
        ],
      ),
    );
  }

  Widget _buildHeroCard(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<Project>> myProjectsAsync,
  ) {
    return HomeHeroCardV2(
      chipLabel: 'Action Center',
      iconData: Icons.work_outline_rounded,
      onIconTap: () {
        context.go('/client/projects');
      },
      title: 'Manage your projects',
      subtitle: 'Track offers, deliveries and payments',
      ctaLabel: 'Post a Project',
      ctaIcon: Icons.add_rounded,
      onCtaTap: () {
        context.go('/create-project');
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return QuickActionsRow(
      actions: [
        QuickAction(
          icon: Icons.add_circle_outline_rounded,
          label: 'Post',
          onTap: () {
            context.go('/create-project');
          },
        ),
        QuickAction(
          icon: Icons.work_outline_rounded,
          label: 'Projects',
          onTap: () {
            context.go('/client/projects');
          },
        ),
        QuickAction(
          icon: Icons.people_outline_rounded,
          label: 'Proposals',
          onTap: () {
            context.go('/client/projects');
          },
        ),
        QuickAction(
          icon: Icons.payment_outlined,
          label: 'Payments',
          onTap: () {
            context.go('/client/payments');
          },
        ),
        QuickAction(
          icon: Icons.more_horiz_rounded,
          label: 'More',
          onTap: () {
            _showMoreBottomSheet(context);
          },
        ),
      ],
    );
  }

  void _showMoreBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'More Actions',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              ListTile(
                leading: const Icon(Icons.explore_outlined,
                    color: AppColors.accentOrange),
                title: const Text('Explore Freelancers'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/client/explore');
                },
              ),
              ListTile(
                leading: const Icon(Icons.notifications_outlined,
                    color: AppColors.accentOrange),
                title: const Text('Notifications'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/client/notifications');
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings_outlined,
                    color: AppColors.accentOrange),
                title: const Text('Settings'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/settings');
                },
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWorkspaceTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        children: [
          _buildTabChip('Action Required', 'action'),
          const SizedBox(width: AppSpacing.md),
          _buildTabChip('Active', 'active'),
        ],
      ),
    );
  }

  Widget _buildTabChip(String label, String value) {
    final isSelected = _selectedTab == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedTab = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [
                    AppColors.gradientStart,
                    AppColors.gradientEnd,
                  ],
                )
              : null,
          color: isSelected ? null : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.transparent : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.bodyMedium.copyWith(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildWorkspaceContent(
    BuildContext context,
    AsyncValue<List<Project>> myProjectsAsync,
  ) {
    return myProjectsAsync.when(
      loading: () => _buildLoadingSkeleton(),
      error: (err, stack) => _buildErrorState(context, 'myProjects'),
      data: (projects) {
        List<Project> filteredProjects;

        if (_selectedTab == 'action') {
          // Action Required: pending_review, pending (with proposals), completed
          filteredProjects = projects
              .where((p) =>
                  p.status == 'pending_review' ||
                  p.status == 'pending' ||
                  p.status == 'completed')
              .toList();
        } else {
          // Active: in_progress
          filteredProjects =
              projects.where((p) => p.status == 'in_progress').toList();
        }

        if (filteredProjects.isEmpty) {
          return _buildEmptyWorkspace(context);
        }

        return SizedBox(
          height: 220,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            scrollDirection: Axis.horizontal,
            itemCount: filteredProjects.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, index) {
              final project = filteredProjects[index];
              return HomeProjectCard(
                project: project,
                onTap: () {
                  context.push('/project/${project.id}', extra: project);
                },
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildInspirationProjects(
    BuildContext context,
    AsyncValue<List<Project>> projectsAsync,
  ) {
    return projectsAsync.when(
      loading: () => _buildLoadingSkeleton(),
      error: (err, stack) => _buildErrorState(context, 'latest'),
      data: (projects) {
        if (projects.isEmpty) {
          return _buildEmptyState(context);
        }

        return SizedBox(
          height: 220,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            scrollDirection: Axis.horizontal,
            itemCount: projects.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, index) {
              final project = projects[index];
              return HomeProjectCard(
                project: project,
                onTap: () {
                  context.push('/project/${project.id}', extra: project);
                },
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildLoadingSkeleton() {
    return SizedBox(
      height: 220,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, index) {
          return Container(
            width: 280,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(18),
            ),
          );
        },
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String providerKey) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Center(
        child: Column(
          children: [
            const Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: AppColors.error,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Failed to load projects',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton(
              onPressed: () {
                if (providerKey == 'myProjects') {
                  ref.invalidate(myProjectsProvider);
                } else {
                  ref.invalidate(latestProjectsProvider);
                }
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyWorkspace(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Center(
        child: Column(
          children: [
            const Icon(
              Icons.work_outline_rounded,
              size: 48,
              color: AppColors.iconGray,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              _selectedTab == 'action'
                  ? 'No actions required'
                  : 'No active projects',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton(
              onPressed: () {
                context.go('/create-project');
              },
              child: const Text('Post a Project'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Center(
        child: Column(
          children: [
            const Icon(
              Icons.lightbulb_outline_rounded,
              size: 48,
              color: AppColors.iconGray,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Explore to get inspired',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
