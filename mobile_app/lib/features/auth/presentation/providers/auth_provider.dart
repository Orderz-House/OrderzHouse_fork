import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/storage/secure_store.dart';
import '../../../../core/cache/cache_service.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// Incremented on login/logout so user-scoped providers can refresh without being invalidated from AuthNotifier.
/// Prevents CircularDependencyError: do NOT call ref.invalidate() on providers that depend on auth from inside AuthNotifier.
final authEpochProvider = StateProvider<int>((ref) => 0);

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) {
    return AuthNotifier(ref.read(authRepositoryProvider), ref);
  },
);

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;
  String? get userRole => user?.role;
  int? get userId => user?.id;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._ref) : super(const AuthState()) {
    _init();
  }

  final AuthRepository _repository;
  final Ref _ref;

  Future<void> _init() async {
    state = const AuthState(isLoading: true);
    final token = await SecureStore.readAccessToken();
    if (token != null) {
      final response = await _repository.getUserData();
      if (response.success && response.data != null) {
        state = AuthState(user: response.data);
        return;
      }
    }
    state = const AuthState();
  }

  Future<bool> login(String email, String password) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.login(email: email, password: password);
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
      // Signal user-scoped providers to refresh (no ref.invalidate to avoid CircularDependencyError)
      _ref.read(authEpochProvider.notifier).state++;
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }

  Future<bool> verifyOtp(String email, String otp) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.verifyOtp(email: email, otp: otp);
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
      _ref.read(authEpochProvider.notifier).state++;
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }

  Future<bool> register({
    required int roleId,
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phoneNumber,
    required String country,
    required String username,
    List<int>? categoryIds,
    String? referralCode,
  }) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.register(
      roleId: roleId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      country: country,
      username: username,
      categoryIds: categoryIds,
      referralCode: referralCode,
    );
    state = AuthState(error: response.message);
    return response.success;
  }

  Future<bool> verifyEmail(String email, String otp) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.verifyEmail(email: email, otp: otp);
    state = AuthState(error: response.message);
    return response.success;
  }

  Future<void> logout() async {
    await _repository.logout();
    await CacheService.clearAll();
    // Signal user-scoped providers to refresh (no ref.invalidate to avoid CircularDependencyError)
    _ref.read(authEpochProvider.notifier).state++;
    state = const AuthState();
  }

  Future<void> refreshUser() async {
    final response = await _repository.getUserData();
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
    }
  }

  Future<bool> acceptTerms() async {
    final response = await _repository.acceptTerms();
    if (response.success) {
      // Refresh user data to get updated terms status
      await refreshUser();
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }

  Future<bool> deleteAccount({String? reason}) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.deleteAccount(reason: reason);
    if (response.success) {
      // Clear tokens and logout
      await logout();
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }
}
