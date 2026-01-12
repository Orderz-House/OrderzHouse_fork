import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/subscription_repository.dart';

export '../../data/repositories/subscription_repository.dart';

final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  return SubscriptionRepository();
});

final subscriptionStatusProvider =
    FutureProvider.autoDispose<SubscriptionStatus>((ref) async {
  final repository = ref.read(subscriptionRepositoryProvider);
  final response = await repository.getSubscriptionStatus();

  if (response.success && response.data != null) {
    return response.data!;
  }

  // Default to not subscribed if check fails
  return SubscriptionStatus(isSubscribed: false);
});
