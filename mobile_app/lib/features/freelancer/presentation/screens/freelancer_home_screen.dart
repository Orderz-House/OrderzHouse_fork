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
import '../../../common/presentation/screens/payments_screen.dart';

/// Premium Freelancer Home Dashboard
/// Data sources:
/// - User info: authStateProvider
/// - Projects: myProjectsProvider (for counts), exploreProjectsProvider (for recommendations)
/// - Latest projects: latestProjectsProvider
/// - Balance: balanceFromHistoryProvider (from payments history API)
class FreelancerHomeScreen extends ConsumerWidget {
  const FreelancerHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myProjectsAsync = ref.watch(myProjectsProvider);
    final latestProjectsAsync = ref.watch(latestProjectsProvider);
    final balanceAsync = ref.watch(balanceFromHistoryProvider);

    return AppScaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myProjectsProvider);
          ref.invalidate(latestProjectsProvider);
          ref.invalidate(balanceFromHistoryProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.md),

              // A) TOP HEADER
              const HomeHeader(
                roleRoute: '/freelancer',
              ),

              const SizedBox(height: AppSpacing.lg),

              // B) SEARCH BAR
              HomeSearchBar(
                hintText: 'Search projects, categories',
                onFilterTap: () {
                  // TODO: Show filter dialog
                },
              ),

              const SizedBox(height: AppSpacing.xl),

              // C) HERO ACTION CARD
              _buildHeroCard(context, ref, myProjectsAsync, balanceAsync),

              const SizedBox(height: AppSpacing.xl),

              // D) QUICK ACTIONS ROW
              _buildQuickActions(context),

              const SizedBox(height: AppSpacing.xl),

              // F) MAIN LIST SECTION: Recommended Projects
              SectionTitleRow(
                title: 'Recommended Projects',
                onSeeAllTap: () {
                  context.go('/freelancer/explore');
                },
              ),

              const SizedBox(height: AppSpacing.md),

              _buildRecommendedProjects(context, latestProjectsAsync),

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNavBar(
        currentIndex: 0,
        items: [
          NavItem(
              icon: Icons.home_rounded, title: 'Home', route: '/freelancer'),
          NavItem(
              icon: Icons.work_outline_rounded,
              title: 'My Projects',
              route: '/freelancer/projects'),
          NavItem(
              icon: Icons.explore_rounded,
              title: 'Explore',
              route: '/freelancer/explore'),
          NavItem(
              icon: Icons.payment_rounded,
              title: 'Payments',
              route: '/freelancer/payments'),
          NavItem(
              icon: Icons.person_outline_rounded,
              title: 'Profile',
              route: '/freelancer/profile'),
        ],
      ),
    );
  }

  Widget _buildHeroCard(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<Project>> myProjectsAsync,
    AsyncValue<Map<String, dynamic>> balanceAsync,
  ) {
    // Get balance and currency from payment history
    final balanceData = balanceAsync.when(
      data: (data) => data,
      loading: () => {'balance': 0.0, 'currency': 'JOD'},
      error: (_, __) => {'balance': 0.0, 'currency': 'JOD'},
    );
    final balance = balanceData['balance'] as double;
    final currency = balanceData['currency'] as String;

    // Calculate KPIs from myProjects data
    final activeProjects = myProjectsAsync.when(
      data: (projects) =>
          projects.where((p) => p.status == 'in_progress').length,
      loading: () => 0,
      error: (_, __) => 0,
    );

    final pendingReviews = myProjectsAsync.when(
      data: (projects) =>
          projects.where((p) => p.status == 'pending_review').length,
      loading: () => 0,
      error: (_, __) => 0,
    );

    // Unread messages count (placeholder, should come from messages provider if available)
    const unreadMessages = 0;

    return HomeHeroCardV2(
      chipLabel: 'This Month',
      iconData: Icons.account_balance_wallet_outlined,
      onIconTap: () {
        context.go('/freelancer/payments');
      },
      title: 'Your Balance',
      bigNumber: '$currency ${balance.toStringAsFixed(2)}',
      subtitle: 'Available to withdraw',
      kpis: [
        HeroKpiV2(value: activeProjects, label: 'Active'),
        HeroKpiV2(value: pendingReviews, label: 'Reviews'),
        const HeroKpiV2(value: unreadMessages, label: 'Messages'),
      ],
      ctaLabel: 'View Earnings',
      onCtaTap: () {
        context.go('/freelancer/payments');
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return QuickActionsRow(
      actions: [
        QuickAction(
          icon: Icons.search_rounded,
          label: 'Browse',
          onTap: () {
            context.go('/freelancer/explore');
          },
        ),
        QuickAction(
          icon: Icons.description_outlined,
          label: 'Proposals',
          onTap: () {
            context.go('/freelancer/projects');
          },
        ),
        QuickAction(
          icon: Icons.chat_bubble_outline_rounded,
          label: 'Messages',
          onTap: () {
            // TODO: Navigate to messages screen when available
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Messages coming soon')),
            );
          },
        ),
        QuickAction(
          icon: Icons.file_upload_outlined,
          label: 'Deliveries',
          onTap: () {
            // Navigate to deliveries (via projects screen)
            context.go('/freelancer/projects');
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
                leading: const Icon(Icons.payment_rounded,
                    color: AppColors.accentOrange),
                title: const Text('Payments'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/freelancer/payments');
                },
              ),
              ListTile(
                leading: const Icon(Icons.notifications_outlined,
                    color: AppColors.accentOrange),
                title: const Text('Notifications'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/freelancer/notifications');
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

  Widget _buildRecommendedProjects(
    BuildContext context,
    AsyncValue<List<Project>> projectsAsync,
  ) {
    return projectsAsync.when(
      loading: () => _buildLoadingSkeleton(),
      error: (err, stack) => _buildErrorState(context),
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

  Widget _buildErrorState(BuildContext context) {
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
            Consumer(
              builder: (context, ref, child) {
                return ElevatedButton(
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
    );
  }

  Widget _buildEmptyState(BuildContext context) {
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
              'No projects available',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton(
              onPressed: () {
                context.go('/freelancer/explore');
              },
              child: const Text('Explore Projects'),
            ),
          ],
        ),
      ),
    );
  }
}
