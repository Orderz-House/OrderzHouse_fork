import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/models/signup_payload.dart';
import '../../../../core/storage/secure_store.dart';
import '../../../../core/cache/cache_service.dart';
import '../../../../core/routing/route_tracker.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// In-memory pending signup payload (set after OTP requested, cleared after verify-and-register or logout).
final pendingSignupPayloadProvider = StateProvider<SignupPayload?>((ref) => null);

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
  /// True while restoring session on app startup; router should show splash and not redirect to login.
  final bool isChecking;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.isChecking = false,
    this.error,
  });

  bool get isAuthenticated => user != null;
  String? get userRole => user?.role;
  int? get userId => user?.id;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._ref) : super(const AuthState(isChecking: true)) {
    restoreSession();
  }

  final AuthRepository _repository;
  final Ref _ref;

  /// Restore session from secure storage on app startup.
  /// Sets isChecking false and either authenticated (with user) or unauthenticated.
  Future<void> restoreSession() async {
    final token = await SecureStore.readAccessToken();
    if (token == null) {
      state = const AuthState();
      return;
    }
    final response = await _repository.getUserData();
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
      return;
    }
    // Token invalid or expired; if we had refresh we could try here
    state = const AuthState();
  }

  Future<bool> login(String email, String password) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.login(email: email, password: password);
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
      _ref.read(authEpochProvider.notifier).state++;
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }

  /// Sign in with Google. Updates state and invalidates user-scoped providers via authEpoch.
  Future<bool> loginWithGoogle() async {
    state = const AuthState(isLoading: true);
    final response = await _repository.signInWithGoogle();
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
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

  /// Step A: Request signup OTP only. Does NOT create user. Caller should store payload and navigate to verify-email.
  Future<bool> startSignup(SignupPayload payload) async {
    state = const AuthState(isLoading: true);
    final response = await _repository.requestSignupOtp(payload.email);
    state = AuthState(error: response.message);
    return response.success;
  }

  /// Step B: Verify OTP and create user. Uses pending payload from pendingSignupPayloadProvider. Saves token and sets user on success.
  Future<bool> verifyOtpAndCompleteSignup(String code) async {
    final payload = _ref.read(pendingSignupPayloadProvider);
    if (payload == null) {
      state = const AuthState(error: 'Session expired. Please start signup again.');
      return false;
    }
    state = const AuthState(isLoading: true);
    final response = await _repository.verifyAndRegister(payload: payload, otp: code);
    if (response.success && response.data != null) {
      _ref.read(pendingSignupPayloadProvider.notifier).state = null;
      state = AuthState(user: response.data);
      _ref.read(authEpochProvider.notifier).state++;
      return true;
    }
    state = AuthState(error: response.message);
    return false;
  }

  /// Resend OTP for signup (e.g. from verify-email screen). Only needs email.
  Future<bool> resendSignupOtp(String email) async {
    final response = await _repository.requestSignupOtp(email);
    if (!response.success) {
      state = AuthState(error: response.message);
    }
    return response.success;
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
    await RouteTracker.clearLastRoute();
    _ref.read(pendingSignupPayloadProvider.notifier).state = null;
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
