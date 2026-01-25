import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_header.dart';

class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  void _handleBack(BuildContext context) {
    final router = GoRouter.of(context);
    if (router.canPop()) {
      context.pop();
    } else {
      context.go('/client/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: l10n.termsAndConditions,
              onBack: () => _handleBack(context),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Last Updated
              Text(
                'Last updated: ${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Acceptance of Terms
              const _SectionCard(
                number: 1,
                title: 'Acceptance of Terms',
                children: [
                  _SectionParagraph(
                    'By accessing and using this platform, you accept and agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'We reserve the right to modify these terms at any time. Your continued use of the platform after changes constitutes acceptance of the modified terms.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Accounts
              const _SectionCard(
                number: 2,
                title: 'Accounts',
                children: [
                  _SectionParagraph(
                    'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'You must:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Provide accurate and complete information'),
                  _BulletPoint('Keep your account information up to date'),
                  _BulletPoint('Notify us immediately of any unauthorized use'),
                  _BulletPoint('Be at least 18 years old or have parental consent'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // User Responsibilities
              const _SectionCard(
                number: 3,
                title: 'User Responsibilities',
                children: [
                  _SectionParagraph(
                    'Users agree to:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Comply with all applicable laws and regulations'),
                  _BulletPoint('Not engage in fraudulent, harmful, or illegal activities'),
                  _BulletPoint('Respect intellectual property rights of others'),
                  _BulletPoint('Not interfere with or disrupt the platform\'s operation'),
                  _BulletPoint('Provide accurate project descriptions and deliverables'),
                  _BulletPoint('Complete projects and payments in good faith'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Projects & Deliverables
              const _SectionCard(
                number: 4,
                title: 'Projects & Deliverables',
                children: [
                  _SectionParagraph(
                    'Clients are responsible for clearly describing project requirements and expectations. Freelancers are responsible for delivering work that meets agreed-upon specifications.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'Disputes regarding deliverables should be resolved through the platform\'s dispute resolution process. We may, but are not obligated to, assist in resolving disputes.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Payments & Fees
              const _SectionCard(
                number: 5,
                title: 'Payments & Fees',
                children: [
                  _SectionParagraph(
                    'All payments are processed securely through third-party payment processors. We charge platform fees as disclosed at the time of transaction.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'Payment terms:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Clients pay upfront or upon milestone completion as agreed'),
                  _BulletPoint('Funds are held in escrow until project completion and approval'),
                  _BulletPoint('Refunds are processed according to our refund policy'),
                  _BulletPoint('All fees are non-refundable unless otherwise stated'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Disputes
              const _SectionCard(
                number: 6,
                title: 'Disputes',
                children: [
                  _SectionParagraph(
                    'If a dispute arises between users, both parties should attempt to resolve it through direct communication. If resolution is not possible, users may request platform mediation.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'Our dispute resolution process is designed to be fair and impartial. Decisions are final and binding. We reserve the right to suspend or terminate accounts involved in fraudulent disputes.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Termination
              const _SectionCard(
                number: 7,
                title: 'Termination',
                children: [
                  _SectionParagraph(
                    'Either party may terminate an account at any time, subject to completion of active projects and payment obligations.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or otherwise harm the platform or its users.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Limitation of Liability
              const _SectionCard(
                number: 8,
                title: 'Limitation of Liability',
                children: [
                  _SectionParagraph(
                    'To the maximum extent permitted by law, our platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from use of our services.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'We facilitate connections between clients and freelancers but are not a party to agreements between users. Users are solely responsible for their agreements and deliverables.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Contact
              const _SectionCard(
                number: 9,
                title: 'Contact',
                children: [
                  _SectionParagraph(
                    'For questions about these Terms & Conditions, please contact us at:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'Email: legal@orderzhouse.com',
                    isBold: true,
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'We will respond to your inquiry within a reasonable timeframe.',
                  ),
                ],
              ),

                // Bottom padding for safe area
                SizedBox(height: MediaQuery.of(context).padding.bottom + AppSpacing.lg),
              ],
            ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final int number;
  final String title;
  final List<Widget> children;

  const _SectionCard({
    required this.number,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowColorLight,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.accentOrange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '$number',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.accentOrange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.headlineMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...children,
        ],
      ),
    );
  }
}

class _SectionParagraph extends StatelessWidget {
  final String text;
  final bool isBold;

  const _SectionParagraph(
    this.text, {
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.textSecondary,
        fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
        height: 1.6,
      ),
    );
  }
}

class _BulletPoint extends StatelessWidget {
  final String text;

  const _BulletPoint(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 8, right: AppSpacing.sm),
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: AppColors.textSecondary,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }
}