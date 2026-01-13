import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/project.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/verify_email_screen.dart';
import '../../features/auth/presentation/screens/verify_otp_screen.dart';
import '../../features/freelancer/presentation/screens/freelancer_home_screen.dart';
import '../../features/freelancer/presentation/screens/freelancer_projects_screen.dart';
import '../../features/client/presentation/screens/client_home_screen.dart';
import '../../features/client/presentation/screens/client_projects_screen.dart';
import '../../features/common/presentation/screens/explore_projects_screen.dart';
import '../../features/common/presentation/screens/project_details_screen.dart';
import '../../features/common/presentation/screens/applicants_screen.dart';
import '../../features/common/presentation/screens/deliveries_screen.dart';
import '../../features/common/presentation/screens/payments_screen.dart';
import '../../features/common/presentation/screens/profile_screen.dart';
import '../../features/common/presentation/screens/edit_profile_screen.dart';
import '../../features/common/presentation/screens/settings_screen.dart';
import '../../features/common/presentation/screens/subscription_screen.dart';
import '../../features/projects/presentation/pages/create_project_wizard_page.dart';
import '../../features/common/presentation/screens/talent_details_screen.dart';
import '../../features/common/presentation/screens/health_check_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/onboarding',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/verify-email',
      builder: (context, state) {
        final email = state.uri.queryParameters['email'] ?? '';
        return VerifyEmailScreen(email: email);
      },
    ),
    GoRoute(
      path: '/verify-otp',
      builder: (context, state) {
        final email = state.uri.queryParameters['email'] ?? '';
        return VerifyOtpScreen(email: email);
      },
    ),
    // Freelancer Routes
    GoRoute(
      path: '/freelancer',
      builder: (context, state) => const FreelancerHomeScreen(),
      routes: [
        GoRoute(
          path: 'projects',
          builder: (context, state) => const FreelancerProjectsScreen(),
        ),
        GoRoute(
          path: 'explore',
          builder: (context, state) => const ExploreProjectsScreen(
            readOnly: false,
          ),
        ),
        GoRoute(
          path: 'payments',
          builder: (context, state) => const PaymentsScreen(),
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: 'notifications',
          name: 'freelancerNotifications',
          builder: (context, state) => const NotificationsPage(),
        ),
      ],
    ),
    // Client Routes
    GoRoute(
      path: '/client',
      builder: (context, state) => const ClientHomeScreen(),
      routes: [
        GoRoute(
          path: 'projects',
          builder: (context, state) => const ClientProjectsScreen(),
        ),
        GoRoute(
          path: 'explore',
          builder: (context, state) => const ExploreProjectsScreen(
            readOnly: true,
          ),
        ),
        GoRoute(
          path: 'payments',
          builder: (context, state) => const PaymentsScreen(),
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: 'notifications',
          name: 'clientNotifications',
          builder: (context, state) => const NotificationsPage(),
        ),
      ],
    ),
    // Common Routes
    GoRoute(
      path: '/project/:id',
      builder: (context, state) {
        // Try to get project from extra, otherwise parse from path
        final project = state.extra;
        if (project != null && project is Project) {
          return ProjectDetailsScreen(project: project);
        }
        final id = int.parse(state.pathParameters['id'] ?? '0');
        // Fallback: create a minimal project object (will need to fetch from API)
        // For now, we'll show an error or fetch it
        return ProjectDetailsScreen(
          project: Project(
            id: id,
            userId: 0,
            title: 'Loading...',
            description: '',
            projectType: 'fixed',
            status: 'pending',
            createdAt: DateTime.now(),
          ),
        );
      },
    ),
    GoRoute(
      path: '/project/:id/applicants',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id'] ?? '0');
        return ApplicantsScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/project/:id/deliveries',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id'] ?? '0');
        return DeliveriesScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/create-project',
      builder: (context, state) => const CreateProjectWizardPage(),
    ),
    GoRoute(
      path: '/talent/:id',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id'] ?? '0');
        return TalentDetailsScreen(freelancerId: id);
      },
    ),
    GoRoute(
      path: '/edit-profile',
      builder: (context, state) => const EditProfileScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/subscription',
      builder: (context, state) => const SubscriptionScreen(),
    ),
    GoRoute(
      path: '/health-check',
      builder: (context, state) => const HealthCheckScreen(),
    ),
  ],
);
