import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/widgets/loading_shimmer.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../plans/presentation/providers/plans_provider.dart';
import '../../../../core/models/plan.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  int _selectedTab = 0; // 0 = Plans, 1 = FAQ (UI only)

  @override
  Widget build(BuildContext context) {
    final plansAsync = ref.watch(plansProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F3FF), // Soft lavender background
      appBar: _buildAppBar(),
      body: SafeArea(
        child: Column(
          children: [
            // B) Pill Segmented Control (centered, under AppBar)
            _buildPillSegmentedControl(),

            // C) Section Header Row
            _buildSectionHeader(),

            // D) Main Content (Big Container with Plans)
            Expanded(
              child: plansAsync.when(
                loading: () => const Center(child: LoadingShimmer()),
                error: (err, stack) => Center(
                  child: ErrorState(
                    message: err.toString(),
                    onRetry: () => ref.invalidate(plansProvider),
                  ),
                ),
                data: (plans) {
                  if (plans.isEmpty) {
                    return EmptyState(
                      icon: Icons.subscriptions_outlined,
                      title: 'No active subscriptions',
                      message: 'Subscribe to a plan to access premium features',
                      action: PrimaryButton(
                        label: 'View Plans',
                        onPressed: () {
                          ref.invalidate(plansProvider);
                        },
                      ),
                    );
                  }

                  return _buildPlansContent(plans);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // A) Top AppBar (exactly like reference)
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_ios_rounded,
          color: Color(0xFF111827),
          size: 20,
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Text(
        'Subscriptions',
        style: AppTextStyles.headlineMedium.copyWith(
          color: const Color(0xFF111827),
          fontWeight: FontWeight.bold,
        ),
      ),
      centerTitle: true,
      actions: [
        IconButton(
          icon: const Icon(
            Icons.more_vert_rounded,
            color: Color(0xFF111827),
            size: 24,
          ),
          onPressed: () {
            // TODO: Show menu options
          },
        ),
      ],
      backgroundColor: const Color(0xFFF6F3FF), // Very light lavender/white
      elevation: 0, // Flat, no shadow
      automaticallyImplyLeading: false,
    );
  }

  // B) Pill Segmented Control (centered, compact)
  Widget _buildPillSegmentedControl() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildPill(
            label: 'Plans',
            icon: Icons.credit_card_rounded,
            isSelected: _selectedTab == 0,
            onTap: () => setState(() => _selectedTab = 0),
          ),
          const SizedBox(width: AppSpacing.sm),
          _buildPill(
            label: 'FAQ',
            icon: Icons.help_outline_rounded,
            isSelected: _selectedTab == 1,
            onTap: () => setState(() => _selectedTab = 1),
          ),
        ],
      ),
    );
  }

  Widget _buildPill({
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF6D5FFD) // Filled lavender/purple
              : Colors.white, // White background
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF6D5FFD)
                : const Color(0xFFE9E6FF), // Light border
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected
                  ? Colors.white
                  : const Color(0xFF6B7280),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: AppTextStyles.labelMedium.copyWith(
                color: isSelected
                    ? Colors.white
                    : const Color(0xFF6B7280),
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // C) Section Header Row (title on left, chip on right)
  Widget _buildSectionHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Plans',
            style: AppTextStyles.titleLarge.copyWith(
              color: const Color(0xFF111827),
              fontWeight: FontWeight.w600,
            ),
          ),
          // Small rounded chip with icon + number
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 5,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFFF6F3FF), // Light lavender
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFFE9E6FF),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.account_balance_wallet_rounded,
                  size: 14,
                  color: const Color(0xFF6D5FFD),
                ),
                const SizedBox(width: 5),
                Text(
                  '0', // Placeholder number
                  style: AppTextStyles.labelMedium.copyWith(
                    color: const Color(0xFF6D5FFD),
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // D) Big Rounded Container with Plan Rows
  Widget _buildPlansContent(List<Plan> plans) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        children: [
          // Big Rounded Container with Soft Lavender Background
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.xl),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFFF6F3FF), // Soft lavender
              borderRadius: BorderRadius.circular(26),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6D5FFD).withValues(alpha: 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                // Plan Rows
                ...plans.asMap().entries.map((entry) {
                  final index = entry.key;
                  final plan = entry.value;
                  final isLast = index == plans.length - 1;

                  return Column(
                    children: [
                      _buildPlanRow(plan),
                      if (!isLast) ...[
                        const SizedBox(height: AppSpacing.sm),
                        Divider(
                          color: const Color(0xFFE9E6FF).withValues(alpha: 0.5),
                          height: 1,
                          thickness: 1,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                      ],
                    ],
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanRow(Plan plan) {
    final durationLabel = plan.planType == 'monthly'
        ? '${plan.duration} Month'
        : plan.planType == 'yearly'
            ? '${plan.duration} Year'
            : plan.planType;

    return InkWell(
      onTap: () {
        // Keep the same onTap action as before
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('You chose the ${plan.name} plan! (Placeholder)'),
          ),
        );
        // TODO: Implement actual subscription logic/navigation
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6D5FFD).withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Side: Name + Description
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    plan.name,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: const Color(0xFF111827),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (plan.description != null && plan.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      plan.description!,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(width: AppSpacing.md),

            // Right Side: Price + Badge
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Price
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${plan.price}',
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: const Color(0xFF111827),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'JD',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 6),

                // Badge (Duration/Plan Type)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE9E6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    durationLabel,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: const Color(0xFF6D5FFD),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
