import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<AuthState>(authStateProvider, (previous, next) {
      if (next.isLoading) return;

      if (next.isAuthenticated) {
        final role = next.userRole;
        if (role == 'freelancer') {
          context.go('/freelancer');
        } else if (role == 'client') {
          context.go('/client');
        } else {
          context.go('/onboarding');
        }
      } else {
        // Redirect to onboarding instead of login (onboarding will show login/register buttons)
        context.go('/onboarding');
      }
    });

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            Text(
              'OrderzHouse',
              style: AppTextStyles.displayMedium.copyWith(
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
