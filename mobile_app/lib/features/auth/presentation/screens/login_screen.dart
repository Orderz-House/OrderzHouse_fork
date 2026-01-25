import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/gradient_button.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authStateProvider.notifier);
    final success = await authNotifier.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      final user = ref.read(authStateProvider).user;
      // Check if terms need to be accepted
      if (user?.mustAcceptTerms == true) {
        context.go('/accept-terms');
        return;
      }
      final role = ref.read(authStateProvider).userRole;
      if (role == 'freelancer') {
        context.go('/freelancer');
      } else if (role == 'client') {
        context.go('/client');
      }
    } else {
      final error = ref.read(authStateProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Login failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.background, // Pure white
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 16),
                        // Top circle with icon
                        Center(
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: const BoxDecoration(
                              color: Color.fromARGB(255, 255, 215, 182), // Light pink
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.send_rounded,
                              size: 50,
                              color: Color(0xFFEF4444), // Coral-red
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                        // Title
                        Text(
                          l10n.login,
                          style: AppTextStyles.displayMedium.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        // Subtitle
                        Text(
                          l10n.welcomeBack,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: const Color(0xFF6B7280),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.xxl),
                        // Email input
                        _StyledTextField(
                          controller: _emailController,
 
                          hint: l10n.email,

                          prefixIcon: Icons.lock_outline,
                          keyboardType: TextInputType.emailAddress,
                          validator: (value) => Validators.email(value?.trim()),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        // Password input
                        _StyledTextField(
                          controller: _passwordController,
                          hint: l10n.password,
                          prefixIcon: Icons.lock_outline,
                          obscureText: _obscurePassword,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off : Icons.visibility,
                              color: const Color(0xFF9CA3AF),
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          validator: Validators.required,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        // Forget Password link
                        Align(
                          alignment: AlignmentDirectional.centerEnd,
                          child: TextButton(
                            onPressed: () {
                              // Keep existing forget password logic if exists
                              // For now, just a placeholder
                            },
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              l10n.forgotPassword,
                              style: AppTextStyles.bodySmall.copyWith(
                                color: const Color(0xFF6B7280),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        // Sign In button
                        GradientButton(
                          onPressed: authState.isLoading ? null : _handleLogin,
                          label: l10n.login,
                          isLoading: authState.isLoading,
                          height: 52,
                          borderRadius: 30, // Pill shape
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        // Or sign up with divider
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                height: 1,
                                color: const Color(0xFFE5E7EB),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                              child: Text(
                                l10n.orContinueWith,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: const Color(0xFF6B7280),
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 1,
                                color: const Color(0xFFE5E7EB),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        // Social login buttons row (Google, Apple, Facebook)
                        _buildSocialButtonsRow(),
                        const SizedBox(height: AppSpacing.xl),
                        // Bottom link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '${l10n.dontHaveAccount} ',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: const Color(0xFF6B7280),
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                context.go('/register');
                              },
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                l10n.signUp,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color:const Color(0xFFFB923C),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // Social buttons row widget
  Widget _buildSocialButtonsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _SocialIconButton(
          iconWidget: _buildGoogleIcon(),
          onTap: () {
            // Placeholder for Google sign in (keep existing logic)
          },
        ),
        const SizedBox(width: AppSpacing.md),
        _SocialIconButton(
          iconWidget: _buildAppleIcon(),
          onTap: () {
            // Placeholder for Apple sign in
          },
        ),
        const SizedBox(width: AppSpacing.md),
        _SocialIconButton(
          iconWidget: _buildFacebookIcon(),
          onTap: () {
            // Placeholder for Facebook sign in (keep existing logic)
          },
        ),
      ],
    );
  }

  // Helper methods to build social icons
  Widget _buildGoogleIcon() {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4285F4), Color(0xFF34A853)],
        ),
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Center(
        child: Text(
          'G',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildAppleIcon() {
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        color: Color(0xFF000000),
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Icon(
          Icons.apple,
          color: Colors.white,
          size: 16,
        ),
      ),
    );
  }

  Widget _buildFacebookIcon() {
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        color: Color(0xFF1877F2),
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Text(
          'f',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}

// Styled text field matching reference design
class _StyledTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData prefixIcon;
  final bool obscureText;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  const _StyledTextField({
    required this.controller,
    required this.hint,
    required this.prefixIcon,
    this.obscureText = false,
    this.suffixIcon,
    this.keyboardType,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        validator: validator,
        style: AppTextStyles.bodyLarge.copyWith(
          color: const Color(0xFF111827),
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: AppTextStyles.bodyMedium.copyWith(
            color: const Color(0xFF9CA3AF),
          ),
          prefixIcon: Icon(
            prefixIcon,
            color: const Color(0xFF9CA3AF),
            size: 20,
          ),
          suffixIcon: suffixIcon,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: AppColors.primary,
              width: 2,
            ),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.md,
          ),
        ),
      ),
    );
  }
}

// Small rounded-square social icon button (matches reference design)
class _SocialIconButton extends StatelessWidget {
  final Widget iconWidget;
  final VoidCallback onTap;

  const _SocialIconButton({
    required this.iconWidget,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(11), // 10-12 range
          border: Border.all(
            color: const Color(0xFFE5E7EB), // Light grey border
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04), // Very subtle shadow
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: iconWidget,
        ),
      ),
    );
  }
}



