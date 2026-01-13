import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/models/payment.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../payments/data/repositories/payments_repository.dart';

// Provider for payments repository
final paymentsRepositoryProvider = Provider<PaymentsRepository>((ref) {
  return PaymentsRepository();
});

// Provider for payments data
final paymentsProvider = FutureProvider.family<List<Payment>, int>((ref, roleId) async {
  final repository = ref.read(paymentsRepositoryProvider);
  
  if (roleId == 2) {
    // Client
    final response = await repository.getClientPayments();
    return response.data ?? [];
  } else if (roleId == 3) {
    // Freelancer
    final response = await repository.getFreelancerTransactions();
    return response.data ?? [];
  }
  
  return [];
});

// Provider for freelancer balance
final freelancerBalanceProvider = FutureProvider<double>((ref) async {
  final repository = ref.read(paymentsRepositoryProvider);
  final response = await repository.getFreelancerBalance();
  return response.data ?? 0.0;
});

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).user;
    final roleId = user?.roleId ?? 0;
    final isClient = roleId == 2;
    final isFreelancer = roleId == 3;

    // Fetch payments/transactions
    final paymentsAsync = ref.watch(paymentsProvider(roleId));
    
    // Fetch freelancer balance if needed
    final balanceAsync = isFreelancer
        ? ref.watch(freelancerBalanceProvider)
        : const AsyncValue<double>.data(0.0);

    return AppScaffold(
      body: paymentsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6D5FFD)),
          ),
        ),
        error: (error, stack) => ErrorState(
          message: error.toString(),
          onRetry: () => ref.invalidate(paymentsProvider(roleId)),
        ),
        data: (transactions) {
          return balanceAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6D5FFD)),
              ),
            ),
            error: (_, __) => _buildContent(
              context,
              ref,
              transactions,
              0.0,
              isClient,
              isFreelancer,
              roleId,
              user?.email ?? '',
            ),
            data: (balance) => _buildContent(
              context,
              ref,
              transactions,
              isFreelancer ? balance : transactions.fold(0.0, (sum, tx) => sum + tx.amount),
              isClient,
              isFreelancer,
              roleId,
              user?.email ?? '',
            ),
          );
        },
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    List<Payment> transactions,
    double displayBalance,
    bool isClient,
    bool isFreelancer,
    int roleId,
    String userEmail,
  ) {
    // Get recent transactions (limit to 10)
    final recentTransactions = transactions.take(10).toList();

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(paymentsProvider(roleId));
        if (isFreelancer) {
          ref.invalidate(freelancerBalanceProvider);
        }
      },
      color: const Color(0xFF6D5FFD),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    // Back button in circle
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.chevron_left_rounded),
                        color: const Color(0xFF6D5FFD), // Primary lavender
                        onPressed: () {
                          // Safe back navigation
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            // Fallback: navigate to explore/home based on role
                            final user = ref.read(authStateProvider).user;
                            final userRoleId = user?.roleId ?? 0;
                            if (userRoleId == 2) {
                              context.go('/client/explore');
                            } else if (userRoleId == 3) {
                              context.go('/freelancer/home');
                            } else {
                              context.go('/client/explore');
                            }
                          }
                        },
                      ),
                    ),
                    const Spacer(),
                    // Title
                    const Text(
                      'Payments',
                      style: TextStyle(
                        color: Color(0xFF111827),
                        fontWeight: FontWeight.w600,
                        fontSize: 18,
                      ),
                    ),
                    const Spacer(),
                    const SizedBox(width: 40), // Balance the back button
                  ],
                ),
              ),
            ),

                  const SizedBox(height: 24),

                  // Top Balance Section (Hero)
                  _buildBalanceHero(
                    context,
                    displayBalance,
                    isClient,
                  ),

                  const SizedBox(height: 24),

                  // Action/Info Card (Gradient Card)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildGradientCard(context, userEmail),
                  ),

                  const SizedBox(height: 32),

                  // Recent Activity Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildRecentActivitySection(
                      context,
                      recentTransactions,
                      isClient,
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
  }

  Widget _buildBalanceHero(BuildContext context, double balance, bool isClient) {
    final numberFormat = NumberFormat.currency(
      symbol: '',
      decimalDigits: 2,
    );
    final formattedBalance = numberFormat.format(balance);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Label
          Text(
            isClient ? 'Total Spent' : 'Available Balance',
            style: const TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          // Large amount
          Text(
            '$formattedBalance JOD',
            style: const TextStyle(
              color: Color(0xFF111827),
              fontSize: 42,
              fontWeight: FontWeight.bold,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 12),
          // Trend/Update text
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Updated today',
                style: TextStyle(
                  color: Color(0xFF6B7280),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGradientCard(BuildContext context, String userEmail) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFF3E5F5), // Light lavender
            Color(0xFFFFE0B2), // Light orange
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon + Title row
          Row(
            children: [
              // Decorative circle with icon
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.verified_user_rounded,
                  color: Color(0xFF6D5FFD),
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              // Title + Subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Secure your account',
                      style: TextStyle(
                        color: Color(0xFF111827),
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Keep your payment information safe',
                      style: TextStyle(
                        color: const Color(0xFF111827).withValues(alpha: 0.7),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Address/Email pill row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    userEmail.isNotEmpty ? userEmail : 'No email available',
                    style: const TextStyle(
                      color: Color(0xFF111827),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(
                    Icons.copy_rounded,
                    size: 18,
                    color: Color(0xFF6D5FFD),
                  ),
                  onPressed: () {
                    if (userEmail.isNotEmpty) {
                      Clipboard.setData(ClipboardData(text: userEmail));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Email copied to clipboard'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    }
                  },
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // CTA Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // Navigate to subscription/plans screen if exists
                // For now, just show a message
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('View Plans feature coming soon'),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6D5FFD),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.share_rounded, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'View Plans',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivitySection(
    BuildContext context,
    List<Payment> transactions,
    bool isClient,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recent Activity',
              style: TextStyle(
                color: Color(0xFF111827),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to details if exists, otherwise no-op
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('View all transactions'),
                  ),
                );
              },
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'View Details',
                    style: TextStyle(
                      color: Color(0xFF6D5FFD),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 18,
                    color: Color(0xFF6D5FFD),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Transactions list
        if (transactions.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 32.0),
            child: Center(
              child: Text(
                'No recent transactions',
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 14,
                ),
              ),
            ),
          )
        else
          ...transactions.map(
            (payment) => _buildTransactionCard(payment, isClient),
          ),
      ],
    );
  }

  Widget _buildTransactionCard(Payment payment, bool isClient) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final isIncome = isClient
        ? false // Client always pays (expense)
        : (payment.type?.toLowerCase() == 'credit');
    
    final amountColor = isIncome ? Colors.green : Colors.red;
    final amountPrefix = isIncome ? '+' : '-';

    // Get display name/title
    String displayName = 'Transaction';
    if (isClient) {
      displayName = payment.projectTitle ?? 
                   (payment.purpose != null ? payment.purpose!.toUpperCase() : 'Payment');
    } else {
      displayName = payment.note ?? 
                   (payment.type != null ? payment.type!.toUpperCase() : 'Transaction');
    }

    // Get initials for avatar
    String initials = 'T';
    if (displayName.isNotEmpty) {
      final words = displayName.split(' ');
      if (words.length >= 2) {
        initials = '${words[0][0]}${words[1][0]}'.toUpperCase();
      } else if (words[0].isNotEmpty) {
        initials = words[0][0].toUpperCase();
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE5E7EB),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF6D5FFD).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  color: Color(0xFF6D5FFD),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Name + Date
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  displayName,
                  style: const TextStyle(
                    color: Color(0xFF111827),
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  dateFormat.format(payment.createdAt),
                  style: const TextStyle(
                    color: Color(0xFF9CA3AF),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Amount
          Text(
            '$amountPrefix${payment.amount.toStringAsFixed(2)} JOD',
            style: TextStyle(
              color: amountColor,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
