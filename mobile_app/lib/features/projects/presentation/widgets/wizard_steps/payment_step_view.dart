import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../../../core/theme/app_spacing.dart';
import '../../providers/project_wizard_provider.dart';

class PaymentStepView extends ConsumerWidget {
  final Future<void> Function() onSubmit;

  const PaymentStepView({
    super.key,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(projectWizardProvider);

    // Calculate amount based on project type
    double? amount;
    if (draft.projectType == 'fixed' && draft.budget != null) {
      amount = draft.budget;
    } else if (draft.projectType == 'hourly' && draft.hourlyRate != null) {
      // Minimum 3 hours for hourly projects
      amount = draft.hourlyRate! * 3;
    }

    final formatter = NumberFormat.currency(symbol: 'JOD ', decimalDigits: 2);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Payment Summary',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF111827),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Review your project details and proceed to payment.',
            style: TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Summary Card
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Project Title
                Row(
                  children: [
                    const Icon(
                      Icons.work_outline,
                      color: Color(0xFF6D5FFD),
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        draft.title ?? 'N/A',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          color: Color(0xFF111827),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                const Divider(),
                const SizedBox(height: AppSpacing.md),

                // Project Type
                _buildSummaryRow('Project Type', _formatProjectType(draft.projectType)),
                const SizedBox(height: AppSpacing.sm),

                // Amount
                if (amount != null) ...[
                  _buildSummaryRow('Amount', formatter.format(amount)),
                  const SizedBox(height: AppSpacing.sm),
                ],

                // Duration
                _buildSummaryRow(
                  'Duration',
                  draft.durationType == 'days'
                      ? '${draft.durationDays} days'
                      : '${draft.durationHours} hours',
                ),
                const SizedBox(height: AppSpacing.md),
                const Divider(),
                const SizedBox(height: AppSpacing.md),

                // Total
                if (amount != null)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Color(0xFF111827),
                        ),
                      ),
                      Text(
                        formatter.format(amount),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Color(0xFF6D5FFD),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Payment Info
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFF6D5FFD).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: Color(0xFF6D5FFD),
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'You will be redirected to Stripe to complete the payment securely.',
                    style: TextStyle(
                      color: const Color(0xFF6D5FFD).withValues(alpha: 0.9),
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 14,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.w500,
            color: Color(0xFF111827),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  String _formatProjectType(String? type) {
    switch (type) {
      case 'fixed':
        return 'Fixed Price';
      case 'hourly':
        return 'Hourly Rate';
      case 'bidding':
        return 'Bidding';
      default:
        return 'N/A';
    }
  }
}
