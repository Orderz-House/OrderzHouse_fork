import 'package:flutter/material.dart';

/// Bottom sheet matching web PaymentMethodChooser.jsx:
/// - Subscribe Now (online / Stripe)
/// - Subscribe from Company (offline → survey)
void showPaymentMethodChooserSheet({
  required BuildContext context,
  required VoidCallback onSubscribeNow,
  required VoidCallback onSubscribeFromCompany,
}) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + MediaQuery.of(context).padding.bottom),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Choose Payment Method',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0B0B0F),
              ),
            ),
            const SizedBox(height: 24),
            // Subscribe Now (online)
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  onSubscribeNow();
                },
                icon: const Icon(Icons.credit_card_rounded, size: 22),
                label: const Text('Subscribe Now'),
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF028090),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Subscribe from Company (offline)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  onSubscribeFromCompany();
                },
                icon: const Icon(Icons.business_rounded, size: 22),
                label: const Text('Subscribe from Company'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF0B0B0F),
                  side: const BorderSide(color: Color(0xFF028090), width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '* Annual account verification fee: 25 JD.',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade700,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
