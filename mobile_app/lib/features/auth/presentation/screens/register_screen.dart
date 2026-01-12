import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/models/category.dart';
import '../providers/auth_provider.dart';
import '../../../categories/presentation/providers/categories_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _countryController = TextEditingController();
  final _usernameController = TextEditingController();

  int? _selectedRole;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  int _currentStep = 0; // Visual step (0-3 for Client, 0-4 for Freelancer)
  List<int> _selectedCategories = []; // Selected category IDs for Freelancer

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    _countryController.dispose();
    _usernameController.dispose();
    super.dispose();
  }

  // Get total step count based on role
  int get _totalSteps => _selectedRole == 3 ? 5 : 4; // Freelancer = 5, Client = 4

  // Get actual step content type based on visual step and role
  String _getStepType(int visualStep) {
    if (_selectedRole == 3) {
      // Freelancer: 0=Role, 1=Categories, 2=Name, 3=Account, 4=Contact
      switch (visualStep) {
        case 0:
          return 'role';
        case 1:
          return 'categories';
        case 2:
          return 'name';
        case 3:
          return 'account';
        case 4:
          return 'contact';
        default:
          return 'role';
      }
    } else {
      // Client: 0=Role, 1=Name, 2=Account, 3=Contact
      switch (visualStep) {
        case 0:
          return 'role';
        case 1:
          return 'name';
        case 2:
          return 'account';
        case 3:
          return 'contact';
        default:
          return 'role';
      }
    }
  }

  bool _validateStep(int step) {
    final stepType = _getStepType(step);
    
    switch (stepType) {
      case 'role':
        if (_selectedRole == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please select a role')),
          );
          return false;
        }
        return true;
      case 'categories':
        if (_selectedRole == 3 && _selectedCategories.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please select at least one category')),
          );
          return false;
        }
        return true;
      case 'name':
        final firstNameValid = Validators.required(_firstNameController.text, fieldName: 'First name') == null;
        final lastNameValid = Validators.required(_lastNameController.text, fieldName: 'Last name') == null;
        if (!firstNameValid || !lastNameValid) {
          _formKey.currentState?.validate();
          return false;
        }
        return true;
      case 'account':
        final usernameValid = Validators.required(_usernameController.text, fieldName: 'Username') == null;
        final emailValid = Validators.email(_emailController.text) == null;
        final passwordValid = Validators.password(_passwordController.text) == null;
        final confirmPasswordValid = Validators.match(_confirmPasswordController.text, _passwordController.text, fieldName: 'Password') == null;
        if (!usernameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
          _formKey.currentState?.validate();
          return false;
        }
        return true;
      case 'contact':
        final phoneValid = Validators.required(_phoneController.text, fieldName: 'Phone number') == null;
        final countryValid = Validators.required(_countryController.text, fieldName: 'Country') == null;
        if (!phoneValid || !countryValid) {
          _formKey.currentState?.validate();
          return false;
        }
        return true;
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_validateStep(_currentStep)) {
      if (_currentStep < _totalSteps - 1) {
        setState(() {
          _currentStep++;
        });
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  Future<void> _handleRegister() async {
    // Validate all steps before submitting
    bool allValid = true;
    for (int i = 0; i < _totalSteps; i++) {
      if (!_validateStep(i)) {
        allValid = false;
        if (i != _currentStep) {
          setState(() {
            _currentStep = i;
          });
        }
        break;
      }
    }

    if (!allValid) return;
    if (!_formKey.currentState!.validate()) return;
    if (_selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a role')),
      );
      return;
    }

    // Validate categories for Freelancer
    if (_selectedRole == 3 && _selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one category')),
      );
      return;
    }

    final authNotifier = ref.read(authStateProvider.notifier);
    final success = await authNotifier.register(
      roleId: _selectedRole!,
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      phoneNumber: _phoneController.text.trim(),
      country: _countryController.text.trim(),
      username: _usernameController.text.trim(),
      categoryIds: _selectedRole == 3 ? _selectedCategories : null,
    );

    if (!mounted) return;

    if (success) {
      context.go(
        '/verify-email?email=${Uri.encodeComponent(_emailController.text.trim())}',
      );
    } else {
      final error = ref.read(authStateProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F1FF), // Very light lavender
      body: SafeArea(
        child: Column(
          children: [
            // Step indicator at top
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  // Step text (dynamic based on role)
                  Text(
                    'Step ${_currentStep + 1} of $_totalSteps',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  // Progress bars (dynamic count)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_totalSteps, (index) {
                      final isActive = index <= _currentStep;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Container(
                          width: isActive ? 40 : 20,
                          height: 4,
                          decoration: BoxDecoration(
                            color: isActive ? const Color(0xFF6D5FFD) : const Color(0xFFE5E7EB),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
            // Form content (scrollable)
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: AppSpacing.xl),
                      // Top circle with icon
                      Center(
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8E9E9), // Light pink
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.send_rounded,
                            size: 50,
                            color: Color(0xFF6D5FFD), // Primary purple
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      // Title
                      Text(
                        'Sign Up',
                        style: AppTextStyles.displayMedium.copyWith(
                          color: const Color(0xFF111827),
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      // Subtitle
                      Text(
                        _getStepSubtitle(),
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: const Color(0xFF6B7280),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      // Step content
                      _buildStepContent(),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
            ),
            // Bottom buttons (pinned)
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // "Already have an account? Sign In" link
                  InkWell(
                    onTap: () {
                      context.go('/login');
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already have an account? ',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: const Color(0xFF6B7280),
                            ),
                          ),
                          Text(
                            'Sign In',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: const Color(0xFF6D5FFD),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  // Buttons row
                  Row(
                    children: [
                      // Back button (show on steps > 0)
                      if (_currentStep > 0)
                        Expanded(
                          child: SizedBox(
                            height: 52,
                            child: OutlinedButton(
                              onPressed: _previousStep,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF6D5FFD),
                                side: const BorderSide(
                                  color: Color(0xFF6D5FFD),
                                  width: 2,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(26),
                                ),
                              ),
                              child: Text(
                                'Back',
                                style: AppTextStyles.labelLarge.copyWith(
                                  color: const Color(0xFF6D5FFD),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                        ),
                      if (_currentStep > 0) const SizedBox(width: AppSpacing.md),
                      // Next/Sign Up button
                      Expanded(
                        flex: _currentStep > 0 ? 1 : 1,
                        child: SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: authState.isLoading
                                ? null
                                : (_currentStep == _totalSteps - 1 ? _handleRegister : _nextStep),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6D5FFD),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(26),
                              ),
                              shadowColor: const Color(0xFF6D5FFD).withOpacity(0.3),
                            ),
                            child: authState.isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : Text(
                                    _currentStep == _totalSteps - 1 ? 'Sign Up' : 'Next',
                                    style: AppTextStyles.labelLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 16,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getStepSubtitle() {
    final stepType = _getStepType(_currentStep);
    switch (stepType) {
      case 'role':
        return 'Choose your role';
      case 'categories':
        return 'Select your categories';
      case 'name':
        return 'Enter your name';
      case 'account':
        return 'Create your account';
      case 'contact':
        return 'Add your contact information';
      default:
        return 'Please complete all steps';
    }
  }

  Widget _buildStepContent() {
    final stepType = _getStepType(_currentStep);
    switch (stepType) {
      case 'role':
        return _buildStep1Role();
      case 'categories':
        return _buildStepCategories();
      case 'name':
        return _buildStepName();
      case 'account':
        return _buildStepAccount();
      case 'contact':
        return _buildStepContact();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildStep1Role() {
    return Row(
      children: [
        Expanded(
          child: _RoleCard(
            role: 'Client',
            icon: Icons.business_center_rounded,
            value: 2,
            isSelected: _selectedRole == 2,
            onTap: () {
              setState(() {
                _selectedRole = 2;
                // Reset to step 0 if role changes
                if (_currentStep > 0) {
                  _currentStep = 0;
                }
                // Clear categories if switching from Freelancer
                _selectedCategories = [];
              });
            },
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _RoleCard(
            role: 'Freelancer',
            icon: Icons.laptop_mac_rounded,
            value: 3,
            isSelected: _selectedRole == 3,
            onTap: () {
              setState(() {
                _selectedRole = 3;
                // Reset to step 0 if role changes
                if (_currentStep > 0) {
                  _currentStep = 0;
                }
              });
            },
          ),
        ),
      ],
    );
  }

  Widget _buildStepCategories() {
    final categoriesAsync = ref.watch(exploreCategoriesProvider);

    return categoriesAsync.when(
      data: (categories) {
        if (categories.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Text(
                'No categories available',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: const Color(0xFF6B7280),
                ),
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Helper text
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Text(
                'Select at least one category',
                style: AppTextStyles.bodySmall.copyWith(
                  color: const Color(0xFF6B7280),
                ),
              ),
            ),
            // Categories grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 2.2,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
              ),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                final isSelected = _selectedCategories.contains(category.id);
                return _CategoryCard(
                  category: category,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedCategories.remove(category.id);
                      } else {
                        _selectedCategories.add(category.id);
                      }
                    });
                  },
                );
              },
            ),
          ],
        );
      },
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.xl),
          child: CircularProgressIndicator(
            color: Color(0xFF6D5FFD),
          ),
        ),
      ),
      error: (error, stackTrace) => Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            children: [
              Text(
                'Failed to load categories',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: const Color(0xFFEF4444),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(exploreCategoriesProvider);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6D5FFD),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepName() {
    return Column(
      children: [
        _StyledTextField(
          controller: _firstNameController,
          hint: 'First Name',
          prefixIcon: Icons.person_outline,
          validator: (v) => Validators.required(v, fieldName: 'First name'),
        ),
        const SizedBox(height: AppSpacing.md),
        _StyledTextField(
          controller: _lastNameController,
          hint: 'Last Name',
          prefixIcon: Icons.person_outline,
          validator: (v) => Validators.required(v, fieldName: 'Last name'),
        ),
      ],
    );
  }

  Widget _buildStepAccount() {
    return Column(
      children: [
        _StyledTextField(
          controller: _usernameController,
          hint: 'Username',
          prefixIcon: Icons.person_outline,
          validator: (v) => Validators.required(v, fieldName: 'Username'),
        ),
        const SizedBox(height: AppSpacing.md),
        _StyledTextField(
          controller: _emailController,
          hint: 'Email',
          prefixIcon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
          validator: Validators.email,
        ),
        const SizedBox(height: AppSpacing.md),
        _StyledTextField(
          controller: _passwordController,
          hint: 'Password',
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
          validator: Validators.password,
        ),
        const SizedBox(height: AppSpacing.md),
        _StyledTextField(
          controller: _confirmPasswordController,
          hint: 'Confirm Password',
          prefixIcon: Icons.lock_outline,
          obscureText: _obscureConfirmPassword,
          suffixIcon: IconButton(
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
              color: const Color(0xFF9CA3AF),
            ),
            onPressed: () {
              setState(() {
                _obscureConfirmPassword = !_obscureConfirmPassword;
              });
            },
          ),
          validator: (v) => Validators.match(
            v,
            _passwordController.text,
            fieldName: 'Password',
          ),
        ),
      ],
    );
  }

  Widget _buildStepContact() {
    return Column(
      children: [
        _StyledTextField(
          controller: _phoneController,
          hint: 'Phone Number',
          prefixIcon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          validator: (v) => Validators.required(v, fieldName: 'Phone number'),
        ),
        const SizedBox(height: AppSpacing.md),
        _StyledTextField(
          controller: _countryController,
          hint: 'Country',
          prefixIcon: Icons.location_on_outlined,
          validator: (v) => Validators.required(v, fieldName: 'Country'),
        ),
      ],
    );
  }
}

// Role selection card
class _RoleCard extends StatelessWidget {
  final String role;
  final IconData icon;
  final int value;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.role,
    required this.icon,
    required this.value,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(17),
      child: Container(
        constraints: const BoxConstraints(
          minHeight: 120,
          maxHeight: 130,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 14,
        ),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF8F6FF) : const Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(17),
          border: Border.all(
            color: isSelected ? const Color(0xFF6D5FFD) : const Color(0xFFF0F0F0),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF6D5FFD).withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                    spreadRadius: 0,
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                    spreadRadius: 0,
                  ),
                ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon
            Icon(
              icon,
              size: 28,
              color: isSelected ? const Color(0xFF6D5FFD) : const Color(0xFFB0B0B0),
            ),
            const SizedBox(height: 8),
            // Role title
            Text(
              role,
              style: AppTextStyles.bodyMedium.copyWith(
                fontSize: 14.5,
                color: isSelected ? const Color(0xFF111827) : const Color(0xFF6B7280),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            // Radio indicator
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF6D5FFD) : const Color(0xFFD1D5DB),
                  width: 1.5,
                ),
                color: isSelected ? const Color(0xFF6D5FFD) : Colors.transparent,
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(
                        Icons.check,
                        size: 10,
                        color: Colors.white,
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

// Category selection card
class _CategoryCard extends StatelessWidget {
  final Category category;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.category,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF8F6FF) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF6D5FFD) : const Color(0xFFE5E7EB),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF6D5FFD).withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                    spreadRadius: 0,
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                    spreadRadius: 0,
                  ),
                ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                category.name,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: isSelected ? const Color(0xFF111827) : const Color(0xFF6B7280),
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (isSelected)
              const Padding(
                padding: EdgeInsets.only(left: AppSpacing.sm),
                child: Icon(
                  Icons.check_circle,
                  color: Color(0xFF6D5FFD),
                  size: 20,
                ),
              ),
          ],
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
            color: Colors.black.withOpacity(0.05),
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
              color: Color(0xFF6D5FFD),
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
