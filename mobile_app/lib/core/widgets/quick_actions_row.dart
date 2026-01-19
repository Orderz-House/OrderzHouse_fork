import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Premium quick actions row (5 items)
class QuickActionsRow extends StatelessWidget {
  final List<QuickAction> actions;

  const QuickActionsRow({
    super.key,
    required this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: actions.map((action) => _buildActionItem(action)).toList(),
      ),
    );
  }

  Widget _buildActionItem(QuickAction action) {
    return Flexible(
      child: GestureDetector(
        onTap: action.onTap,
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.border),
                boxShadow: const [
                  BoxShadow(
                    color: AppColors.shadowColorLight,
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                action.icon,
                color: AppColors.accentOrange,
                size: 26,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              action.label,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textPrimary,
                fontSize: 11,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class QuickAction {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });
}
