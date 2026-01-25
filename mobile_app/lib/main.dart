import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';
import 'core/network/health_check_service.dart';
import 'core/config/app_config.dart';
import 'core/providers/locale_provider.dart';

void main() async {
  // Step 1: Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  // Step 2: Load environment variables (gracefully handle missing .env file)
  try {
    await dotenv.load(fileName: '.env');
    // ignore: avoid_print
    print('✅ Environment variables loaded successfully');
  } catch (e) {
    // .env file not found - initialize with empty data to avoid NotInitializedError
    // ignore: avoid_print
    print('⚠️ Warning: .env file not found, using defaults');
    dotenv.testLoad(fileInput: '');
  }
  
  // Step 3: Log baseUrl for debugging
  // ignore: avoid_print
  print('🌐 API Base URL: ${AppConfig.baseUrl}');
  
  // Step 4: Perform health check (non-blocking)
  HealthCheckService.ping().then((result) {
    if (result.success) {
      // ignore: avoid_print
      print('✅ ${result.message}');
    } else {
      // ignore: avoid_print
      print('❌ ${result.message}');
    }
  }).catchError((error) {
    // ignore: avoid_print
    print('❌ Health check error: $error');
  });
  
  // Step 5: Run app (only once)
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch locale for automatic updates
    final locale = ref.watch(localeProvider);
    
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'OrderzHouse',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
      
      // Localization configuration
      locale: locale,
      supportedLocales: AppLocales.supported,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
