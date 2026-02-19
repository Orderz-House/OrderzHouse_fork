import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static String get baseUrl {
    String? url;
    if (dotenv.isInitialized) {
      url = dotenv.env['APP_API_URL'] ?? dotenv.env['BASE_URL'];
    }
    // When not set in .env: Android emulator use 10.0.2.2; iOS simulator use 127.0.0.1; physical device use LAN IP (e.g. http://192.168.x.x:5000) or set APP_API_URL in .env
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

  /// Google OAuth Web Client ID (for server-side verification).
  /// Set GOOGLE_WEB_CLIENT_ID in .env.
  static String? get googleWebClientId {
    if (dotenv.isInitialized) {
      return dotenv.env['GOOGLE_WEB_CLIENT_ID'];
    }
    return null;
  }

  /// Company subscription survey URL (offline payment / Subscribe from Company).
  /// Set COMPANY_SUBSCRIBE_URL in .env, e.g. https://appointments.battechno.com/survey
  static String get companySubscribeUrl {
    if (dotenv.isInitialized) {
      final url = dotenv.env['COMPANY_SUBSCRIBE_URL'];
      if (url != null && url.isNotEmpty) return url;
    }
    return 'https://appointments.battechno.com/survey';
  }
}
