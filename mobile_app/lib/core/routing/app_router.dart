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
import '../../features/common/presentation/screens/help_faq_screen.dart';
import '../../features/common/presentation/screens/privacy_policy_screen.dart';
import '../../features/common/presentation/screens/terms_conditions_screen.dart';
import '../../features/common/presentation/screens/delete_account_screen.dart';
import '../../features/auth/presentation/screens/change_password_screen.dart';
import '../../features/common/presentation/screens/my_content_screen.dart';
import '../../features/common/presentation/screens/support_screen.dart';
import '../../features/common/presentation/screens/notifications_settings_screen.dart';
import '../../features/common/presentation/screens/security_center_screen.dart';
import '../../features/projects/presentation/pages/create_project_wizard_page.dart';
import '../../features/common/presentation/screens/talent_details_screen.dart';
import '../../features/common/presentation/screens/health_check_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/auth/presentation/screens/accept_terms_screen.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/common/presentation/screens/language_selection_screen.dart';

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
    GoRoute(
      path: '/accept-terms',
      builder: (context, state) => const AcceptTermsScreen(),
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
        // Parse deep-link query parameters for notification navigation
        final openApplicants = state.uri.queryParameters['openApplicants'] == 'true';
        final openReceiveModal = state.uri.queryParameters['openReceiveModal'] == 'true';
        final showDeliveries = state.uri.queryParameters['showDeliveries'] == 'true';
        
        // Try to get project from extra, otherwise parse from path
        final project = state.extra;
        if (project != null && project is Project) {
          return ProjectDetailsScreen(
            project: project,
            openApplicants: openApplicants,
            openReceiveModal: openReceiveModal,
            showDeliveries: showDeliveries,
          );
        }
        final id = int.parse(state.pathParameters['id'] ?? '0');
        // Fallback: create a minimal project object (will need to fetch from API)
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
          openApplicants: openApplicants,
          openReceiveModal: openReceiveModal,
          showDeliveries: showDeliveries,
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
      path: '/change-password',
      builder: (context, state) => const ChangePasswordScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/subscription',
      redirect: (context, state) {
        // Guard: Check user role - redirect handled in SubscriptionScreen
        // This allows the screen to handle the check with proper provider access
        return null;
      },
      builder: (context, state) => const SubscriptionScreen(),
    ),
    GoRoute(
      path: '/health-check',
      builder: (context, state) => const HealthCheckScreen(),
    ),
    GoRoute(
      path: '/help-faq',
      builder: (context, state) => const HelpFaqScreen(),
    ),
    GoRoute(
      path: '/privacy-policy',
      builder: (context, state) => const PrivacyPolicyScreen(),
    ),
    GoRoute(
      path: '/terms-conditions',
      builder: (context, state) => const TermsConditionsScreen(),
    ),
    GoRoute(
      path: '/settings/delete-account',
      builder: (context, state) => const DeleteAccountScreen(),
    ),
    GoRoute(
      path: '/settings/my-content',
      builder: (context, state) => const MyContentScreen(),
    ),
    GoRoute(
      path: '/support',
      builder: (context, state) => const SupportScreen(),
    ),
    GoRoute(
      path: '/settings/notifications',
      builder: (context, state) => const NotificationsSettingsScreen(),
    ),
    GoRoute(
      path: '/settings/security',
      builder: (context, state) => const SecurityCenterScreen(),
    ),
    GoRoute(
      path: '/settings/language',
      builder: (context, state) => const LanguageSelectionScreen(),
    ),
  ],
);
