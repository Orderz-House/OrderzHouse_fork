import 'package:flutter/material.dart';
import '../../../../core/widgets/empty_state.dart';

class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payments'),
      ),
      body: EmptyState(
        icon: Icons.payment_outlined,
        title: 'No payments yet',
        message: 'Your payment history will appear here',
      ),
    );
  }
}
