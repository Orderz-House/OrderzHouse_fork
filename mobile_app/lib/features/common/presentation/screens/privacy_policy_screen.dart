import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_header.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
              title: l10n.privacyPolicy,
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

              // Information We Collect
              const _SectionCard(
                title: '1. Information We Collect',
                children: [
                  _SectionParagraph(
                    'We collect information that you provide directly to us, such as when you create an account, post a project, apply to projects, or contact us for support.',
                  ),
                  SizedBox(height: AppSpacing.md),
                  _SectionParagraph(
                    'Types of information we may collect include:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Account information (name, email, profile picture)'),
                  _BulletPoint('Project details and descriptions'),
                  _BulletPoint('Payment information (processed securely via third-party payment processors)'),
                  _BulletPoint('Communications and messages between users'),
                  _BulletPoint('Usage data and analytics'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // How We Use Information
              const _SectionCard(
                title: '2. How We Use Information',
                children: [
                  _SectionParagraph(
                    'We use the information we collect to:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Provide, maintain, and improve our services'),
                  _BulletPoint('Process transactions and send related information'),
                  _BulletPoint('Send technical notices, updates, and support messages'),
                  _BulletPoint('Respond to your comments and questions'),
                  _BulletPoint('Monitor and analyze trends, usage, and activities'),
                  _BulletPoint('Detect, prevent, and address technical issues'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Sharing & Third Parties
              const _SectionCard(
                title: '3. Sharing & Third Parties',
                children: [
                  _SectionParagraph(
                    'We do not sell your personal information. We may share your information only in the following circumstances:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('With other users as necessary to provide our services (e.g., displaying your profile on projects)'),
                  _BulletPoint('With service providers who assist us in operating our platform (payment processors, hosting, analytics)'),
                  _BulletPoint('If required by law or to protect our rights and the safety of our users'),
                  _BulletPoint('In connection with a business transfer or merger'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Data Retention
              const _SectionCard(
                title: '4. Data Retention',
                children: [
                  _SectionParagraph(
                    'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'When you delete your account, we will delete or anonymize your personal information, subject to certain exceptions such as legal obligations or dispute resolution.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Security
              const _SectionCard(
                title: '5. Security',
                children: [
                  _SectionParagraph(
                    'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.',
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Your Rights
              const _SectionCard(
                title: '6. Your Rights',
                children: [
                  _SectionParagraph(
                    'You have the right to:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _BulletPoint('Access and update your personal information'),
                  _BulletPoint('Delete your account and associated data'),
                  _BulletPoint('Opt out of certain communications'),
                  _BulletPoint('Request a copy of your data'),
                  _BulletPoint('File a complaint with relevant data protection authorities'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Contact
              const _SectionCard(
                title: '7. Contact',
                children: [
                  _SectionParagraph(
                    'If you have any questions about this Privacy Policy, please contact us at:',
                  ),
                  SizedBox(height: AppSpacing.sm),
                  _SectionParagraph(
                    'Email: info@battechno.com',
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
  final String title;
  final List<Widget> children;

  const _SectionCard({
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
          Text(
            title,
            style: AppTextStyles.headlineMedium.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
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