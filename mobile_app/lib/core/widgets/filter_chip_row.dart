import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';

/// Reusable filter chip row widget
class FilterChipRow extends StatelessWidget {
  final List<String> options;
  final String selectedValue;
  final ValueChanged<String> onSelected;
  final String label;

  const FilterChipRow({
    super.key,
    required this.options,
    required this.selectedValue,
    required this.onSelected,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          Text(
            '$label:',
            style: AppTextStyles.labelMedium.copyWith(
              color: const Color(0xFF6B7280),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 8),
          ...options.map((option) {
            final isSelected = option.toLowerCase() == selectedValue.toLowerCase();
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(
                  option == 'all' ? 'All' : option.toUpperCase(),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: isSelected
                        ? Colors.white
                        : const Color(0xFF6D5FFD),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) onSelected(option);
                },
                selectedColor: const Color(0xFF6D5FFD),
                backgroundColor: Colors.white,
                side: BorderSide(
                  color: isSelected
                      ? const Color(0xFF6D5FFD)
                      : const Color(0xFFE5E7EB),
                  width: 1.5,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
