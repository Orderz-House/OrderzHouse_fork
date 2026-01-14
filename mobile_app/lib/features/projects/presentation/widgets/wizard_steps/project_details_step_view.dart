import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../../core/theme/app_spacing.dart';
import '../../../../../../features/categories/data/repositories/categories_repository.dart';
import '../../../../../../features/categories/presentation/providers/categories_provider.dart';
import '../../providers/project_wizard_provider.dart';

class ProjectDetailsStepView extends ConsumerStatefulWidget {
  final VoidCallback onNext;

  const ProjectDetailsStepView({
    super.key,
    required this.onNext,
  });

  @override
  ConsumerState<ProjectDetailsStepView> createState() =>
      _ProjectDetailsStepViewState();
}

class _ProjectDetailsStepViewState
    extends ConsumerState<ProjectDetailsStepView> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _budgetController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _budgetMinController = TextEditingController();
  final _budgetMaxController = TextEditingController();
  final _durationDaysController = TextEditingController();
  final _durationHoursController = TextEditingController();
  final _skillsController = TextEditingController();

  List<Map<String, dynamic>>? _subSubCategories;
  bool _loadingSubSubCategories = false;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  void _loadInitialData() {
    final draft = ref.read(projectWizardProvider);
    _titleController.text = draft.title ?? '';
    _descriptionController.text = draft.description ?? '';
    if (draft.budget != null) _budgetController.text = draft.budget.toString();
    if (draft.hourlyRate != null) {
      _hourlyRateController.text = draft.hourlyRate.toString();
    }
    if (draft.budgetMin != null) {
      _budgetMinController.text = draft.budgetMin.toString();
    }
    if (draft.budgetMax != null) {
      _budgetMaxController.text = draft.budgetMax.toString();
    }
    if (draft.durationDays != null) {
      _durationDaysController.text = draft.durationDays.toString();
    }
    if (draft.durationHours != null) {
      _durationHoursController.text = draft.durationHours.toString();
    }
    if (draft.preferredSkills.isNotEmpty) {
      _skillsController.text = draft.preferredSkills.join(', ');
    }

    if (draft.categoryId != null) {
      _loadSubCategories(draft.categoryId!);
    }
    if (draft.subCategoryId != null && draft.categoryId != null) {
      _loadSubSubCategories(draft.categoryId!, draft.subCategoryId!);
    }
  }

  Future<void> _loadSubCategories(int categoryId) async {
    // Load sub-sub-categories directly by category ID
    setState(() {
      _loadingSubSubCategories = true;
    });
    
    try {
      final repository = CategoriesRepository();
      final response = await repository.fetchSubSubCategoriesByCategoryId(categoryId);
      if (response.success && response.data != null) {
        setState(() {
          _subSubCategories = response.data;
        });
      }
    } catch (e) {
      // Handle error silently
    } finally {
      setState(() {
        _loadingSubSubCategories = false;
      });
    }
  }

  Future<void> _loadSubSubCategories(int categoryId, int subCategoryId) async {
    setState(() {
      _loadingSubSubCategories = true;
    });
    
    try {
      final repository = CategoriesRepository();
      final response = await repository.fetchSubSubCategories(subCategoryId);
      if (response.success && response.data != null) {
        setState(() {
          _subSubCategories = response.data;
        });
      }
    } catch (e) {
      // Handle error silently
    } finally {
      setState(() {
        _loadingSubSubCategories = false;
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _budgetController.dispose();
    _hourlyRateController.dispose();
    _budgetMinController.dispose();
    _budgetMaxController.dispose();
    _durationDaysController.dispose();
    _durationHoursController.dispose();
    _skillsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(projectWizardProvider);
    final categoriesAsync = ref.watch(exploreCategoriesProvider);
    final errors = draft.validateStep1();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          TextFormField(
            controller: _titleController,
            decoration: InputDecoration(
              labelText: 'Project Title *',
              hintText: 'Enter project title (10-100 characters)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              errorText: errors['title'],
            ),
            maxLength: 100,
            onChanged: (value) {
              ref.read(projectWizardProvider.notifier).updateTitle(value);
            },
          ),
          const SizedBox(height: AppSpacing.md),

          // Description
          TextFormField(
            controller: _descriptionController,
            decoration: InputDecoration(
              labelText: 'Description *',
              hintText: 'Describe your project (100-2000 characters)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              errorText: errors['description'],
            ),
            maxLines: 6,
            maxLength: 2000,
            onChanged: (value) {
              ref.read(projectWizardProvider.notifier).updateDescription(value);
            },
          ),
          const SizedBox(height: AppSpacing.md),

          // Category
          categoriesAsync.when(
            data: (categories) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Category *',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                DropdownButtonFormField<int>(
                  initialValue: draft.categoryId,
                  decoration: InputDecoration(
                    hintText: 'Select category',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    errorText: errors['categoryId'],
                  ),
                  items: categories.map((cat) {
                    return DropdownMenuItem(
                      value: cat.id,
                      child: Text(cat.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      ref.read(projectWizardProvider.notifier).updateCategory(
                            value,
                            null,
                            null,
                          );
                      _loadSubCategories(value);
                    }
                  },
                ),
              ],
            ),
            loading: () => const CircularProgressIndicator(),
            error: (_, __) => const Text('Failed to load categories'),
          ),

          const SizedBox(height: AppSpacing.md),

          // Sub-Sub-Category
          if (draft.categoryId != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sub-Sub-Category *',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                _loadingSubSubCategories
                    ? const Center(child: CircularProgressIndicator())
                    : DropdownButtonFormField<int>(
                        initialValue: draft.subSubCategoryId,
                        decoration: InputDecoration(
                          hintText: 'Select sub-sub-category',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          errorText: errors['subSubCategoryId'],
                        ),
                        items: _subSubCategories?.map((ssc) {
                              return DropdownMenuItem(
                                value: ssc['id'] as int,
                                child: Text(ssc['name'] as String),
                              );
                            }).toList() ??
                            [],
                        onChanged: (value) {
                          if (value != null) {
                            ref.read(projectWizardProvider.notifier).updateCategory(
                                  draft.categoryId,
                                  draft.subCategoryId,
                                  value,
                                );
                          }
                        },
                      ),
              ],
            ),

          const SizedBox(height: AppSpacing.md),

          // Project Type
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Project Type *',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              DropdownButtonFormField<String>(
                initialValue: draft.projectType,
                decoration: InputDecoration(
                  hintText: 'Select project type',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  errorText: errors['projectType'],
                ),
                items: const [
                  DropdownMenuItem(value: 'fixed', child: Text('Fixed Price')),
                  DropdownMenuItem(value: 'hourly', child: Text('Hourly Rate')),
                  DropdownMenuItem(value: 'bidding', child: Text('Bidding')),
                ],
                onChanged: (value) {
                  ref.read(projectWizardProvider.notifier).updateProjectType(value);
                },
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Budget fields based on project type
          if (draft.projectType == 'fixed') ...[
            TextFormField(
              controller: _budgetController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
              decoration: InputDecoration(
                labelText: 'Budget (JOD) *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                errorText: errors['budget'],
              ),
              onChanged: (value) {
                final budget = double.tryParse(value);
                ref.read(projectWizardProvider.notifier).updateBudget(budget);
              },
            ),
          ] else if (draft.projectType == 'hourly') ...[
            TextFormField(
              controller: _hourlyRateController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
              decoration: InputDecoration(
                labelText: 'Hourly Rate (JOD) *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                errorText: errors['hourlyRate'],
              ),
              onChanged: (value) {
                final rate = double.tryParse(value);
                ref.read(projectWizardProvider.notifier).updateHourlyRate(rate);
              },
            ),
          ] else if (draft.projectType == 'bidding') ...[
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _budgetMinController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
                    decoration: InputDecoration(
                      labelText: 'Min Budget (JOD) *',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      errorText: errors['budgetMin'],
                    ),
                    onChanged: (value) {
                      final min = double.tryParse(value);
                      ref.read(projectWizardProvider.notifier).updateBiddingBudget(
                            min,
                            draft.budgetMax,
                          );
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: TextFormField(
                    controller: _budgetMaxController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
                    decoration: InputDecoration(
                      labelText: 'Max Budget (JOD) *',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      errorText: errors['budgetMax'],
                    ),
                    onChanged: (value) {
                      final max = double.tryParse(value);
                      ref.read(projectWizardProvider.notifier).updateBiddingBudget(
                            draft.budgetMin,
                            max,
                          );
                    },
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Duration Type
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Duration Type *',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              DropdownButtonFormField<String>(
                initialValue: draft.durationType,
                decoration: InputDecoration(
                  hintText: 'Select duration type',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  errorText: errors['durationType'],
                ),
                items: const [
                  DropdownMenuItem(value: 'days', child: Text('Days')),
                  DropdownMenuItem(value: 'hours', child: Text('Hours')),
                ],
                onChanged: (value) {
                  ref.read(projectWizardProvider.notifier).updateDuration(
                        value,
                        value == 'days' ? draft.durationDays : null,
                        value == 'hours' ? draft.durationHours : null,
                      );
                },
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Duration value
          if (draft.durationType == 'days') ...[
            TextFormField(
              controller: _durationDaysController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                labelText: 'Duration (Days) *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                errorText: errors['durationDays'],
              ),
              onChanged: (value) {
                final days = int.tryParse(value);
                ref.read(projectWizardProvider.notifier).updateDuration(
                      'days',
                      days,
                      null,
                    );
              },
            ),
          ] else if (draft.durationType == 'hours') ...[
            TextFormField(
              controller: _durationHoursController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                labelText: 'Duration (Hours) *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                errorText: errors['durationHours'],
              ),
              onChanged: (value) {
                final hours = int.tryParse(value);
                ref.read(projectWizardProvider.notifier).updateDuration(
                      'hours',
                      null,
                      hours,
                    );
              },
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Preferred Skills
          TextFormField(
            controller: _skillsController,
            decoration: InputDecoration(
              labelText: 'Preferred Skills (comma-separated)',
              hintText: 'e.g., Flutter, Design, Marketing',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: (value) {
              final skills = value
                  .split(',')
                  .map((s) => s.trim())
                  .where((s) => s.isNotEmpty)
                  .toList();
              ref.read(projectWizardProvider.notifier).updatePreferredSkills(skills);
            },
          ),
        ],
      ),
    );
  }
}
