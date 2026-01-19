import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/project_wizard_provider.dart';
import '../widgets/wizard_steps/project_details_step_view.dart';
import '../widgets/wizard_steps/project_cover_step_view.dart';
import '../widgets/wizard_steps/project_files_step_view.dart';
import '../widgets/wizard_steps/payment_step_view.dart';
import '../../data/repositories/projects_repository.dart';
import 'package:url_launcher/url_launcher.dart';

class CreateProjectWizardPage extends ConsumerStatefulWidget {
  const CreateProjectWizardPage({super.key});

  @override
  ConsumerState<CreateProjectWizardPage> createState() =>
      _CreateProjectWizardPageState();
}

class _CreateProjectWizardPageState
    extends ConsumerState<CreateProjectWizardPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    final draft = ref.read(projectWizardProvider);
    
    // Validate current step before proceeding
    final errors = draft.validateStep(_currentStep);
    if (errors.isNotEmpty) {
      // Show first error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errors.values.first),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 3),
        ),
      );
      return; // Block navigation
    }
    
    // Only proceed if validation passes
    if (_currentStep < _getTotalSteps() - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep++;
      });
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep--;
      });
    }
  }

  int _getTotalSteps() {
    final draft = ref.read(projectWizardProvider);
    return draft.needsPayment ? 4 : 3;
  }

  Future<void> _handleSubmit() async {
    final draft = ref.read(projectWizardProvider);
    final repository = ProjectsRepository();

    // Validate all steps before final submission
    final step1Errors = draft.validateStep1();
    final step2Errors = draft.validateStep2();
    final step3Errors = draft.validateStep3();
    
    if (step1Errors.isNotEmpty || step2Errors.isNotEmpty || step3Errors.isNotEmpty) {
      // Show first error found
      final allErrors = <String, String>{};
      allErrors.addAll(step1Errors);
      allErrors.addAll(step2Errors);
      allErrors.addAll(step3Errors);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(allErrors.values.first),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 3),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // If bidding: create project immediately
      if (draft.projectType == 'bidding') {
        // Create project
        final createResponse = await repository.createProject(
          categoryId: draft.categoryId!,
          subCategoryId: draft.subCategoryId,
          subSubCategoryId: draft.subSubCategoryId!,
          title: draft.title!,
          description: draft.description!,
          projectType: draft.projectType!,
          budget: draft.budget,
          hourlyRate: draft.hourlyRate,
          budgetMin: draft.budgetMin,
          budgetMax: draft.budgetMax,
          durationType: draft.durationType!,
          durationDays: draft.durationDays,
          durationHours: draft.durationHours,
          preferredSkills: draft.preferredSkills.isNotEmpty
              ? draft.preferredSkills
              : null,
          coverPicPath: draft.coverPic?.path,
        );

        if (!createResponse.success || createResponse.data == null) {
          throw Exception(createResponse.message ?? 'Failed to create project');
        }

        final projectId = createResponse.data!['id'] as int;

        // Upload files if any
        if (draft.projectFiles.isNotEmpty) {
          final filePaths = draft.projectFiles.map((f) => f.path).toList();
          final uploadResponse =
              await repository.uploadProjectFiles(projectId, filePaths);

          if (!uploadResponse.success) {
            // Project created but files failed - show warning
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      'Project created but failed to upload files: ${uploadResponse.message}'),
                  backgroundColor: AppColors.accentOrange,
                ),
              );
            }
          }
        }

        // Success
        if (mounted) {
          ref.read(projectWizardProvider.notifier).reset();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Project created successfully'),
              backgroundColor: Colors.green,
            ),
          );
          context.go('/client');
        }
      } else {
        // Fixed/Hourly: Create Stripe checkout session
        final projectData = {
          'category_id': draft.categoryId,
          'sub_category_id': draft.subCategoryId,
          'sub_sub_category_id': draft.subSubCategoryId,
          'title': draft.title,
          'description': draft.description,
          'project_type': draft.projectType,
          'budget': draft.budget,
          'hourly_rate': draft.hourlyRate,
          'duration_type': draft.durationType,
          'duration_days': draft.durationDays,
          'duration_hours': draft.durationHours,
          'preferred_skills': draft.preferredSkills,
        };

        final checkoutResponse =
            await repository.createProjectCheckoutSession(projectData);

        if (!checkoutResponse.success || checkoutResponse.data == null) {
          throw Exception(
              checkoutResponse.message ?? 'Failed to create checkout session');
        }

        final checkoutUrl = checkoutResponse.data!;

        // Open Stripe checkout URL
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          throw Exception('Could not launch checkout URL');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  String _getActionButtonLabel() {
    final draft = ref.read(projectWizardProvider);
    final totalSteps = _getTotalSteps();

    if (_currentStep == totalSteps - 1) {
      if (draft.projectType == 'bidding') {
        return 'Create Project';
      } else {
        return 'Pay with Stripe';
      }
    }
    return 'Continue';
  }

  @override
  Widget build(BuildContext context) {
    final draft = ref.read(projectWizardProvider);
    final totalSteps = _getTotalSteps();

    return AppScaffold(
      body: Column(
        children: [
          // Header
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.md,
              ),
              child: Row(
                children: [
                  // Back button
                  IconButton(
                    icon: const Icon(
                      Icons.chevron_left_rounded,
                      size: 28,
                    ),
                    color: AppColors.accentOrange,
                    onPressed: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/client');
                      }
                    },
                  ),
                  const Spacer(),
                  // Title
                  const Text(
                    'Create Project',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 48), // Balance
                ],
              ),
            ),
          ),

          // Progress Indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(totalSteps, (index) {
                final isActive = index == _currentStep;
                final isCompleted = index < _currentStep;
                return Expanded(
                  child: Container(
                    margin: EdgeInsets.only(
                      right: index < totalSteps - 1 ? AppSpacing.xs : 0,
                    ),
                    height: 4,
                    decoration: BoxDecoration(
                      color: isActive || isCompleted
                          ? AppColors.accentOrange
                          : AppColors.borderLight,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Steps Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                ProjectDetailsStepView(
                  onNext: _nextStep, // _nextStep now validates internally
                ),
                ProjectCoverStepView(onNext: _nextStep), // _nextStep now validates internally
                ProjectFilesStepView(
                  onNext: draft.needsPayment ? _nextStep : null, // _nextStep now validates internally
                ),
                if (draft.needsPayment)
                  PaymentStepView(onSubmit: _handleSubmit),
              ],
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: EdgeInsets.only(
              left: AppSpacing.md,
              right: AppSpacing.md,
              top: AppSpacing.md,
              bottom: AppSpacing.md + MediaQuery.of(context).padding.bottom,
            ),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadowColorLight,
                  blurRadius: 8,
                  offset: Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                // Back Button
                Expanded(
                  child: OutlinedButton(
                    onPressed: _currentStep > 0 && !_isSubmitting
                        ? _previousStep
                        : null,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      side: BorderSide(
                        color: _currentStep > 0
                            ? AppColors.border
                            : AppColors.borderLight,
                      ),
                      foregroundColor: AppColors.textPrimary,
                    ),
                    child: const Text(
                      'Back',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                // Continue/Create/Pay Button
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.gradientStart,
                          AppColors.gradientEnd,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ElevatedButton(
                      onPressed: _isSubmitting
                          ? null
                          : (_currentStep == totalSteps - 1
                              ? _handleSubmit
                              : _nextStep),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              _getActionButtonLabel(),
                              style: const TextStyle(
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
          ),
        ],
      ),
    );
  }
}
