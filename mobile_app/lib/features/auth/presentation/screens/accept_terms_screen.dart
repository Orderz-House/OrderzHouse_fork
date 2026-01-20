import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/gradient_button.dart';
import '../providers/auth_provider.dart';

class AcceptTermsScreen extends ConsumerStatefulWidget {
  const AcceptTermsScreen({super.key});

  @override
  ConsumerState<AcceptTermsScreen> createState() => _AcceptTermsScreenState();
}

class _AcceptTermsScreenState extends ConsumerState<AcceptTermsScreen> {
  bool _agreed = false;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Block back navigation
      onPopInvoked: (bool didPop) {
        // Prevent back navigation - user must accept terms
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    // No back button - user must accept terms
                    const Spacer(),
                    Text(
                      'Terms & Conditions',
                      style: AppTextStyles.titleLarge.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Terms & Conditions Section
                      _buildSection(
                        title: 'Terms & Conditions',
                        content: _getTermsContent(),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      // Refund Policy Section
                      _buildSection(
                        title: 'Refund Policy',
                        content: _getRefundPolicyContent(),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      // Agreement Checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Checkbox(
                            value: _agreed,
                            onChanged: (value) {
                              setState(() {
                                _agreed = value ?? false;
                              });
                            },
                            activeColor: AppColors.primary,
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(top: 12),
                              child: Text(
                                'I have read and agree to the Terms & Conditions and Refund Policy',
                                style: AppTextStyles.bodyMedium,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
              // Accept Button
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: PrimaryGradientButton(
                  label: 'Accept & Continue',
                  onPressed: _agreed && !_isSubmitting ? _handleAccept : null,
                  isLoading: _isSubmitting,
                  height: 54,
                  borderRadius: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required String content}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.headlineSmall.copyWith(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF111827),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(
            content,
            style: AppTextStyles.bodyMedium.copyWith(
              color: const Color(0xFF374151),
              height: 1.6,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _handleAccept() async {
    setState(() => _isSubmitting = true);

    final authNotifier = ref.read(authStateProvider.notifier);
    final success = await authNotifier.acceptTerms();

    if (!mounted) return;

    if (success) {
      final role = ref.read(authStateProvider).userRole;
      if (role == 'freelancer') {
        context.go('/freelancer');
      } else if (role == 'client') {
        context.go('/client');
      }
    } else {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ref.read(authStateProvider).error ?? 'Failed to accept terms',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _getTermsContent() {
    return '''By using ORDERZHOUSE, you agree to the following terms:

1. Account Responsibility: You are responsible for maintaining the security of your account and password.

2. Service Usage: You agree to use ORDERZHOUSE services in accordance with applicable laws and regulations.

3. Content: You are responsible for all content you post or submit through the platform.

4. Payment: All payments are processed securely. Refunds are subject to our Refund Policy.

5. Prohibited Activities: You may not use ORDERZHOUSE for any illegal or unauthorized purpose.

6. Platform Changes: ORDERZHOUSE reserves the right to modify or discontinue services at any time.

7. Dispute Resolution: Disputes will be resolved according to our dispute resolution process.

8. Limitation of Liability: ORDERZHOUSE acts as an intermediary and is not liable for service provider actions.

9. Account Termination: ORDERZHOUSE may suspend or terminate accounts that violate these terms.

10. Updates: These terms may be updated, and continued use constitutes acceptance of changes.''';
  }

  String _getRefundPolicyContent() {
    return '''Refund Policy – ORDERZHOUSE

At ORDERZHOUSE, we aim to provide a safe and fair marketplace for both Clients and Service Providers. ORDERZHOUSE acts as a digital intermediary that organizes orders, secures payments, and manages disputes. This policy explains how refunds work, with the main principle that approved refunds are returned to the user's ORDERZHOUSE Wallet to be used for future purchases.

1) Definitions
Client: The user who purchases/requests a service.
Service Provider: The user who delivers the requested service.
Order: Any service purchased through ORDERZHOUSE.
Wallet: An in-platform credit balance available for future orders.

2) Payment Holding (Escrow-Style)
When a Client pays for an order, the amount is held within the platform to protect both parties. Funds are released to the Service Provider after delivery confirmation or after the dispute window ends (as applicable by the platform's order status rules).

3) Primary Refund Method (Wallet Credit)
If a refund is approved, the refunded amount (full or partial) is credited to the Client's ORDERZHOUSE Wallet.
Wallet credit can be used immediately for any future order on the platform.
Refunds are not processed as cash-out/off-platform transfers unless ORDERZHOUSE decides otherwise in exceptional cases.

4) Eligible Refund Cases
A Client may request a refund/dispute in the following situations:
- Non-delivery of the service within the agreed timeframe without a valid reason.
- Delivery that is materially not as described in the service listing.
- The Service Provider refuses to proceed or stops working without completing the agreed scope.
- Order cancellation before work begins, depending on the order status.
- Duplicate charge or payment processing error.

5) Non-Refundable / Not Covered Cases
Refunds may be declined in these cases:
- The service was delivered as agreed and the issue is based on personal preference.
- Incorrect or incomplete requirements provided by the Client.
- Highly customized services where work has already started without a valid reason.
- Dispute period expired without a submitted claim.

6) How to Submit a Dispute
Go to My Orders → Select order → Open Dispute / Request Refund.
Provide clear details and evidence if available.

7) Dispute Review Timeline (21 Days)
ORDERZHOUSE issues a final decision within a maximum of 21 days.
Approved refunds are credited to the Wallet after review (or earlier if resolved sooner).

8) Partial Refunds
Partial refunds may apply when part of the service is delivered correctly.
The refund amount is determined based on evidence and assessment.

9) Abuse & Fraud Prevention
ORDERZHOUSE may reject abusive requests, suspend accounts, or take action to protect the platform.

10) Support
Contact support with order number, dispute reason, and evidence.''';
  }
}
