import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Full-screen WebView fallback when url_launcher cannot open Stripe checkout.
/// Shows "Stripe Checkout" AppBar with close/back button.
class StripeCheckoutWebViewPage extends StatefulWidget {
  final String initialUrl;

  const StripeCheckoutWebViewPage({
    super.key,
    required this.initialUrl,
  });

  @override
  State<StripeCheckoutWebViewPage> createState() =>
      _StripeCheckoutWebViewPageState();
}

class _StripeCheckoutWebViewPageState extends State<StripeCheckoutWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _isLoading = true),
          onPageFinished: (_) => setState(() => _isLoading = false),
        ),
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Stripe Checkout'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
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
