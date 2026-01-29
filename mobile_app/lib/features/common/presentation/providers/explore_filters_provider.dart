import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/project.dart';
import '../../../projects/presentation/providers/projects_provider.dart';

/// Filter state for Explore (client-side filtering). Matches web SubSideBar logic.
class ExploreFilterState {
  final String sort;
  final String projectType;
  final String budgetFilter;
  final String durationFilter;

  const ExploreFilterState({
    this.sort = 'newest',
    this.projectType = 'all',
    this.budgetFilter = 'all',
    this.durationFilter = 'all',
  });

  ExploreFilterState copyWith({
    String? sort,
    String? projectType,
    String? budgetFilter,
    String? durationFilter,
  }) {
    return ExploreFilterState(
      sort: sort ?? this.sort,
      projectType: projectType ?? this.projectType,
      budgetFilter: budgetFilter ?? this.budgetFilter,
      durationFilter: durationFilter ?? this.durationFilter,
    );
  }

  static const ExploreFilterState defaults = ExploreFilterState();
}

final exploreFiltersProvider =
    StateNotifierProvider<ExploreFiltersNotifier, ExploreFilterState>((ref) {
  return ExploreFiltersNotifier();
});

class ExploreFiltersNotifier extends StateNotifier<ExploreFilterState> {
  ExploreFiltersNotifier() : super(ExploreFilterState.defaults);

  void setSort(String value) => state = state.copyWith(sort: value);
  void setProjectType(String value) => state = state.copyWith(projectType: value);
  void setBudgetFilter(String value) => state = state.copyWith(budgetFilter: value);
  void setDurationFilter(String value) => state = state.copyWith(durationFilter: value);
  void reset() => state = ExploreFilterState.defaults;
}

/// Returns budget value in JOD for filtering (single representative value).
double _getBudgetForFilter(Project p) {
  if (p.projectType == 'fixed' && p.budget != null) return p.budget!;
  if (p.projectType == 'hourly' && p.hourlyRate != null) return p.hourlyRate! * 3;
  if (p.projectType == 'bidding') {
    final min = p.budgetMin ?? 0;
    final max = p.budgetMax ?? min;
    return (min + max) / 2;
  }
  return p.budget ?? 0;
}

/// Returns duration in days (hours converted to days).
double? _getDurationInDays(Project p) {
  if (p.durationDays != null) return p.durationDays!.toDouble();
  if (p.durationHours != null) return p.durationHours! / 24;
  return null;
}

bool _passesProjectType(Project p, String filter) {
  if (filter == 'all') return true;
  return p.projectType == filter;
}

bool _passesBudget(Project p, String filter) {
  if (filter == 'all') return true;
  final budget = _getBudgetForFilter(p);
  switch (filter) {
    case 'lessThan50':
      return budget < 50;
    case '50To200':
      return budget >= 50 && budget <= 200;
    case 'above200':
      return budget > 200;
    default:
      return true;
  }
}

bool _passesDuration(Project p, String filter) {
  if (filter == 'all') return true;
  final days = _getDurationInDays(p);
  if (days == null) return true;
  switch (filter) {
    case 'short':
      return days <= 7;
    case 'medium':
      return days >= 8 && days <= 30;
    case 'long':
      return days > 30;
    default:
      return true;
  }
}

int _compareSort(Project a, Project b, String sort) {
  switch (sort) {
    case 'oldest':
      return a.createdAt.compareTo(b.createdAt);
    case 'budget_high_to_low':
      return _getBudgetForFilter(b).compareTo(_getBudgetForFilter(a));
    case 'budget_low_to_high':
      return _getBudgetForFilter(a).compareTo(_getBudgetForFilter(b));
    case 'newest':
    default:
      return b.createdAt.compareTo(a.createdAt);
  }
}

/// Filtered + sorted list. Depends only on exploreProjectsProvider and exploreFiltersProvider.
/// Does NOT invalidate any provider; no circular dependency.
final filteredExploreProjectsProvider =
    Provider<AsyncValue<List<Project>>>((ref) {
  final projectsAsync = ref.watch(exploreProjectsProvider);
  final filters = ref.watch(exploreFiltersProvider);

  return projectsAsync.when(
    data: (list) {
      final filtered = list.where((p) {
        if (!_passesProjectType(p, filters.projectType)) return false;
        if (!_passesBudget(p, filters.budgetFilter)) return false;
        if (!_passesDuration(p, filters.durationFilter)) return false;
        return true;
      }).toList();
      filtered.sort((a, b) => _compareSort(a, b, filters.sort));
      return AsyncValue.data(filtered);
    },
    loading: () => AsyncValue.loading(),
    error: (err, st) => AsyncValue.error(err, st),
  );
});
