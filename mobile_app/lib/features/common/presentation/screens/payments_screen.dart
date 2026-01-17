import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/error_state.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/models/payment.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../payments/data/repositories/payments_repository.dart';
import '../../../referrals/presentation/providers/referrals_provider.dart';

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
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
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
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
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
                        color: AppColors.primary, // Coral-red
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

                  // Refer & Earn Card
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildReferAndEarnCard(context, ref),
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

  Widget _buildReferAndEarnCard(BuildContext context, WidgetRef ref) {
    final referralsAsync = ref.watch(myReferralsProvider);
    
    return referralsAsync.when(
      loading: () => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      ),
      error: (error, stack) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
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
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 32),
            const SizedBox(height: 8),
            Text(
              'Failed to load referrals',
              style: TextStyle(
                color: Colors.red.shade700,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => ref.invalidate(myReferralsProvider),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
      data: (data) {
        final referralCode = data['referralCode'] as String? ?? 'N/A';
        final link = data['link'] as String? ?? '';
        final stats = data['stats'] as Map<String, dynamic>? ?? {};
        final rules = data['rules'] as Map<String, dynamic>? ?? {};
        
        final invited = stats['invited'] as int? ?? 0;
        final completed = stats['completed'] as int? ?? 0;
        final earned = (stats['earned'] as num?)?.toDouble() ?? 0.0;
        
        final referrerReward = (rules['referrerReward'] as num?)?.toDouble() ?? 5.0;
        final friendReward = (rules['friendReward'] as num?)?.toDouble() ?? 5.0;
        final currency = rules['currency'] as String? ?? 'JOD';
        
        // Handle case where migration hasn't been run or code is null
        final isMigrationNeeded = referralCode == null || referralCode == 'N/A' || (referralCode.isEmpty && link.isEmpty);
        
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
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
              // Title + Subtitle
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF3B5C).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.card_giftcard_rounded,
                      color: Color(0xFFFF3B5C),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Refer & Earn',
                          style: TextStyle(
                            color: Color(0xFF111827),
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Invite friends and earn rewards',
                          style: TextStyle(
                            color: const Color(0xFF111827).withValues(alpha: 0.6),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              
              // Code box
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFFE5E7EB),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your code',
                            style: TextStyle(
                              color: const Color(0xFF6B7280),
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isMigrationNeeded ? 'Loading...' : referralCode,
                            style: const TextStyle(
                              color: Color(0xFF111827),
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!isMigrationNeeded)
                      IconButton(
                        icon: const Icon(
                          Icons.copy_rounded,
                          color: AppColors.primary,
                          size: 20,
                        ),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: referralCode));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Code copied to clipboard'),
                              duration: Duration(seconds: 2),
                              backgroundColor: Colors.green,
                            ),
                          );
                        },
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Share button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: isMigrationNeeded ? null : () => _shareReferralLink(context, referralCode, link),
                  icon: const Icon(Icons.share_rounded, size: 20),
                  label: const Text('Share Invite'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isMigrationNeeded 
                        ? const Color(0xFF9CA3AF) 
                        : const Color(0xFFFF3B5C),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              // Stats row
              Row(
                children: [
                  Expanded(
                    child: _buildStatItem('Invited', invited.toString()),
                  ),
                  Container(
                    width: 1,
                    height: 40,
                    color: const Color(0xFFE5E7EB),
                  ),
                  Expanded(
                    child: _buildStatItem('Successful', completed.toString()),
                  ),
                  Container(
                    width: 1,
                    height: 40,
                    color: const Color(0xFFE5E7EB),
                  ),
                  Expanded(
                    child: _buildStatItem('Earned', '$earned $currency'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Rules text
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Earn $referrerReward $currency when your friend buys a plan. Friend gets $friendReward $currency discount.',
                  style: TextStyle(
                    color: const Color(0xFF6B7280),
                    fontSize: 12,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFF111827),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: const Color(0xFF6B7280),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
  
  Future<void> _shareReferralLink(BuildContext context, String code, String link) async {
    try {
      final message = 'Join me on OrderzHouse. Use my code $code to get a reward when you subscribe. Link: $link';
      await Share.share(message);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to share: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
                      color: AppColors.primary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 18,
                    color: AppColors.primary,
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
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  color: AppColors.primary,
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
