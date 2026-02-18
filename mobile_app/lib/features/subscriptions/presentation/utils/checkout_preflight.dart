import 'package:url_launcher/url_launcher.dart';

/// Pre-flight check before opening Stripe checkout to avoid net::ERR_NAME_NOT_RESOLVED.
/// Returns null if OK, or an error message to show the user.
Future<String?> checkCanOpenCheckout() async {
  try {
    final uri = Uri.parse('https://checkout.stripe.com');
    final can = await canLaunchUrl(uri);
    if (!can) {
      return 'No internet / DNS issue on this device. Try again on a real device or ensure the emulator has internet.';
    }
  } catch (_) {
    return 'No internet / DNS issue on this device. Try again on a real device or ensure the emulator has internet.';
  }
  return null;
}
