import 'package:flutter/material.dart';

/// Reusable profile field tile widget matching the reference design
class ProfileFieldTile extends StatelessWidget {
  final String label;
  final String? value;
  final TextEditingController? controller;
  final IconData icon;
  final bool readOnly;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final String? errorText;

  const ProfileFieldTile({
    super.key,
    required this.label,
    this.value,
    this.controller,
    required this.icon,
    this.readOnly = false,
    this.keyboardType,
    this.validator,
    this.onChanged,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    final displayValue = controller?.text.isNotEmpty == true
        ? controller!.text
        : (value ?? '');

    return IntrinsicHeight(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: errorText != null
                ? Colors.red.withValues(alpha: 0.3)
                : const Color(0xFFE5E7EB),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Label
                  Text(
                    label,
                    style: const TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Value/Input
                  if (readOnly || controller == null)
                    Text(
                      displayValue.isEmpty ? '—' : displayValue,
                      style: TextStyle(
                        color: displayValue.isEmpty
                            ? const Color(0xFF9CA3AF)
                            : const Color(0xFF111827),
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.2,
                      ),
                    )
                  else
                    TextFormField(
                      controller: controller,
                      readOnly: readOnly,
                      keyboardType: keyboardType,
                      validator: validator,
                      onChanged: onChanged,
                      style: const TextStyle(
                        color: Color(0xFF111827),
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.2,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        errorBorder: InputBorder.none,
                        focusedErrorBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 0, vertical: 0),
                        isDense: true,
                        hintText: '',
                      ),
                    ),
                  // Error text
                  if (errorText != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      errorText!,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 11,
                        height: 1.2,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Icon (no background, larger size, grey color)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Icon(
                icon,
                color: const Color(0xFF9CA3AF), // Neutral grey for all icons
                size: 24,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
