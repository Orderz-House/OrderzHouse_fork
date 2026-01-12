import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static String get baseUrl {
    String? url;
    if (dotenv.isInitialized) {
      // Try APP_API_URL first, then BASE_URL, then fallback
      url = dotenv.env['APP_API_URL'] ?? dotenv.env['BASE_URL'];
    }
    
    // Default to Android emulator address on port 5000 (backend default)
    return url ?? 'http://10.0.2.2:5000';
  }

  static String get environment {
    if (dotenv.isInitialized) {
      return dotenv.env['ENV'] ?? 'development';
    }
    return 'development';
  }

  static bool get isProduction => environment == 'production';

  static bool get isDevelopment => environment == 'development';
}
