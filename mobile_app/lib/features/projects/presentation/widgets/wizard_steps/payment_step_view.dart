import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../../../core/theme/app_spacing.dart';
import '../../../../../../l10n/app_localizations.dart';
import '../../providers/project_wizard_provider.dart';

class PaymentStepView extends ConsumerWidget {
  final Future<void> Function() onSubmit;

  const PaymentStepView({
    super.key,
    required this.onSubmit,
  });

  String _formatProjectType(AppLocalizations l10n, String? type) {
    switch (type) {
      case 'fixed':
        return l10n.projectTypeFixed;
      case 'hourly':
        return l10n.projectTypeHourly;
      case 'bidding':
        return l10n.projectTypeBidding;
      default:
        return l10n.naNotAvailable;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
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
          Text(
            l10n.paymentSummary,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF111827),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            l10n.paymentSummaryDescription,
            style: const TextStyle(
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
                        draft.title ?? l10n.naNotAvailable,
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
                _buildSummaryRow(l10n.projectTypeLabel.replaceAll(' *', ''), _formatProjectType(l10n, draft.projectType)),
                const SizedBox(height: AppSpacing.sm),

                // Amount
                if (amount != null) ...[
                  _buildSummaryRow(l10n.amountLabel, formatter.format(amount)),
                  const SizedBox(height: AppSpacing.sm),
                ],

                // Duration
                _buildSummaryRow(
                  l10n.durationLabel,
                  draft.durationType == 'days'
                      ? l10n.daysCount(draft.durationDays ?? 0)
                      : l10n.hoursCount(draft.durationHours ?? 0),
                ),
                const SizedBox(height: AppSpacing.md),
                const Divider(),
                const SizedBox(height: AppSpacing.md),

                // Total
                if (amount != null)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        l10n.totalLabel,
                        style: const TextStyle(
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
                    l10n.stripePaymentInfo,
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
}
