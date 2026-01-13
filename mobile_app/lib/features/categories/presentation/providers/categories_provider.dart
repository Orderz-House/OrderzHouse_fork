import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/category.dart';
import '../../data/repositories/categories_repository.dart';

final categoriesRepositoryProvider = Provider<CategoriesRepository>((ref) {
  return CategoriesRepository();
});

final exploreCategoriesProvider =
    FutureProvider.autoDispose<List<Category>>((ref) async {
  final repository = ref.read(categoriesRepositoryProvider);
  final response = await repository.fetchExploreCategories();

  if (response.success && response.data != null) {
    return response.data!;
  }

  throw Exception(response.message ?? 'Failed to fetch categories');
});

/// Selected category ID for explore projects
/// null means "All" (no category filter)
final selectedExploreCategoryIdProvider =
    StateProvider.autoDispose<int?>((ref) => null);

/// Shared state for selected category when navigating from Dashboard/Home
/// This provider persists across navigation and is used to set the initial filter
final exploreSelectedCategoryIdProvider = StateProvider<int?>((ref) => null);
