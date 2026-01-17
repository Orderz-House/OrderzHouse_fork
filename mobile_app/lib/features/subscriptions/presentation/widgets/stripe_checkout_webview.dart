import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// WebView widget for Stripe checkout flow
/// Monitors navigation to detect success/cancel redirects
class StripeCheckoutWebView extends StatefulWidget {
  final String checkoutUrl;
  final Function(String sessionId) onSuccess;
  final VoidCallback onCancel;
  final Function(String error) onError;

  const StripeCheckoutWebView({
    super.key,
    required this.checkoutUrl,
    required this.onSuccess,
    required this.onCancel,
    required this.onError,
  });

  @override
  State<StripeCheckoutWebView> createState() => _StripeCheckoutWebViewState();
}

class _StripeCheckoutWebViewState extends State<StripeCheckoutWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
            _handleNavigation(url);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
            _handleNavigation(url);
          },
          onWebResourceError: (WebResourceError error) {
            widget.onError('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.checkoutUrl));
  }

  void _handleNavigation(String url) {
    try {
      final uri = Uri.parse(url);
      
      // Check for success redirect
      // Backend redirects to: CLIENT_URL/payment/success?session_id=...
      // Also check for Stripe's success pattern
      if (uri.path.contains('/payment/success') || 
          uri.path.contains('payment/success') ||
          uri.queryParameters.containsKey('session_id')) {
        final sessionId = uri.queryParameters['session_id'];
        
        if (sessionId != null && sessionId.isNotEmpty) {
          widget.onSuccess(sessionId);
          return;
        }
      }

      // Check for cancel redirect
      // Backend redirects to: CLIENT_URL/payment/cancel
      if (uri.path.contains('/payment/cancel') || 
          uri.path.contains('payment/cancel')) {
        widget.onCancel();
        return;
      }
    } catch (e) {
      // If URL parsing fails, check with simple string contains
      if (url.contains('/payment/success') && url.contains('session_id=')) {
        // Extract session_id manually
        final sessionIdMatch = RegExp(r'session_id=([^&]+)').firstMatch(url);
        if (sessionIdMatch != null) {
          widget.onSuccess(sessionIdMatch.group(1)!);
          return;
        }
      }
      
      if (url.contains('/payment/cancel')) {
        widget.onCancel();
        return;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Payment'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            widget.onCancel();
          },
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}
