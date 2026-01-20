import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/storage/secure_storage_service.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) {
    return AuthNotifier(ref.read(authRepositoryProvider));
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
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository) : super(const AuthState()) {
    _init();
  }

  final AuthRepository _repository;

  Future<void> _init() async {
    state = const AuthState(isLoading: true);
    final token = await SecureStorageService.getToken();
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
    state = const AuthState();
  }

  Future<void> refreshUser() async {
    final response = await _repository.getUserData();
    if (response.success && response.data != null) {
      state = AuthState(user: response.data);
    }
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
