import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../features/projects/presentation/pages/stripe_checkout_webview_page.dart';

/// Opens Stripe checkout URL with fallbacks: external app → in-app browser → WebView.
/// Do not rely on [canLaunchUrl]; use [launchUrl] and handle its boolean return.
Future<void> openCheckoutUrl(BuildContext context, String url) async {
  final uri = Uri.tryParse(url);
  if (uri == null || !uri.hasScheme) {
    if (context.mounted) {
      _showFailureSnackbar(context);
    }
    if (kDebugMode) {
      developer.log('StripeCheckoutLauncher: invalid URL', name: 'StripeCheckout');
    }
    return;
  }

  bool launched = false;

  // 1) Try external application (browser app)
  try {
    launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (kDebugMode) {
      developer.log(
        'StripeCheckoutLauncher: externalApplication => $launched',
        name: 'StripeCheckout',
      );
    }
  } catch (e) {
    if (kDebugMode) {
      developer.log(
        'StripeCheckoutLauncher: externalApplication error => $e',
        name: 'StripeCheckout',
      );
    }
  }

  // 2) If failed, try in-app browser (Custom Tabs / SFSafariViewController)
  if (!launched) {
    try {
      launched = await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      if (kDebugMode) {
        developer.log(
          'StripeCheckoutLauncher: inAppBrowserView => $launched',
          name: 'StripeCheckout',
        );
      }
    } catch (e) {
      if (kDebugMode) {
        developer.log(
          'StripeCheckoutLauncher: inAppBrowserView error => $e',
          name: 'StripeCheckout',
        );
      }
    }
  }

  // 3) Fallback: open in-app WebView screen
  if (!launched && context.mounted) {
    if (kDebugMode) {
      developer.log(
        'StripeCheckoutLauncher: fallback to WebView page',
        name: 'StripeCheckout',
      );
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => StripeCheckoutWebViewPage(initialUrl: url),
      ),
    );
    launched = true;
  }

  if (!launched && context.mounted) {
    _showFailureSnackbar(context);
    if (kDebugMode) {
      developer.log(
        'StripeCheckoutLauncher: all options failed',
        name: 'StripeCheckout',
      );
    }
  }
}

void _showFailureSnackbar(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text(
        'Could not open payment page. Please install a browser or try again.',
      ),
      backgroundColor: Colors.red,
    ),
  );
}
