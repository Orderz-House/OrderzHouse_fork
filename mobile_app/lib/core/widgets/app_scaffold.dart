import 'package:flutter/material.dart';

/// Reusable scaffold wrapper with white background and subtle top gradient glow
/// This is the ONLY place where the background gradient is defined
class AppScaffold extends StatelessWidget {
  final Widget body;
  final String? title;
  final bool showAppBar;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final bool extendBodyBehindAppBar;
  final bool useSafeArea;

  const AppScaffold({
    super.key,
    required this.body,
    this.title,
    this.showAppBar = false,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.extendBodyBehindAppBar = true,
    this.useSafeArea = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      appBar: showAppBar
          ? (appBar ??
              AppBar(
                title: title != null ? Text(title!) : null,
                backgroundColor: Colors.transparent,
                elevation: 0,
              ))
          : null,
      body: Stack(
        children: [
          // Background gradient layer (top glow only)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF6D5FFD).withValues(alpha: 0.12), // Light lavender at top
                    Colors.white, // Pure white at bottom
                  ],
                  stops: const [0.0, 0.25], // Fades to white within ~25% of height
                ),
              ),
            ),
          ),
          // Content layer
          if (useSafeArea)
            SafeArea(child: body)
          else
            body,
        ],
      ),
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
      floatingActionButtonLocation: floatingActionButtonLocation,
    );
  }
}
