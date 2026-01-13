import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/models/api_response.dart';
import '../../../../core/models/payment.dart';

class PaymentsRepository {
  final Dio _dio = DioClient.instance;

  /// Get client payment history
  Future<ApiResponse<List<Payment>>> getClientPayments() async {
    try {
      final response = await _dio.get('/payments/client/history');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        
        // Parse array from various possible keys
        List<dynamic> items = [];
        if (data['payments'] != null && data['payments'] is List) {
          items = data['payments'] as List;
        } else if (data['data'] != null && data['data'] is List) {
          items = data['data'] as List;
        } else if (data['transactions'] != null && data['transactions'] is List) {
          items = data['transactions'] as List;
        } else if (data['items'] != null && data['items'] is List) {
          items = data['items'] as List;
        } else if (data is List) {
          items = data;
        }

        final payments = items
            .map((item) => Payment.fromJson(item as Map<String, dynamic>))
            .toList();

        return ApiResponse(
          success: true,
          data: payments,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to fetch payments',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to fetch payments',
      );
    }
  }

  /// Get freelancer wallet transactions
  Future<ApiResponse<List<Payment>>> getFreelancerTransactions() async {
    try {
      final response = await _dio.get('/payments/freelancer/wallet/transactions');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        
        // Parse array from various possible keys
        List<dynamic> items = [];
        if (data['transactions'] != null && data['transactions'] is List) {
          items = data['transactions'] as List;
        } else if (data['data'] != null && data['data'] is List) {
          items = data['data'] as List;
        } else if (data['payments'] != null && data['payments'] is List) {
          items = data['payments'] as List;
        } else if (data['items'] != null && data['items'] is List) {
          items = data['items'] as List;
        } else if (data is List) {
          items = data;
        }

        final transactions = items
            .map((item) => Payment.fromJson(item as Map<String, dynamic>))
            .toList();

        return ApiResponse(
          success: true,
          data: transactions,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to fetch transactions',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to fetch transactions',
      );
    }
  }

  /// Get freelancer wallet balance
  Future<ApiResponse<double>> getFreelancerBalance() async {
    try {
      final response = await _dio.get('/payments/freelancer/wallet');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final balance = (response.data['balance'] as num?)?.toDouble() ?? 0.0;
        return ApiResponse(
          success: true,
          data: balance,
        );
      }

      return ApiResponse(
        success: false,
        message: response.data['message'] as String? ?? 'Failed to fetch balance',
      );
    } on DioException catch (e) {
      return ApiResponse(
        success: false,
        message: e.response?.data['message'] as String? ?? 'Failed to fetch balance',
      );
    }
  }
}
