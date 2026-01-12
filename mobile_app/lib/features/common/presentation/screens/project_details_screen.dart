import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/models/project.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/app_card.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProjectDetailsScreen extends StatelessWidget {
  final Project project;

  const ProjectDetailsScreen({
    required this.project,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final statusColor = _getStatusColor(project.status);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Project Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image
            if (project.coverPic != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: project.coverPic!,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported),
                  ),
                ),
              ),
            const SizedBox(height: AppSpacing.md),

            // Title
            Text(
              project.title,
              style: AppTextStyles.headlineLarge,
            ),
            const SizedBox(height: AppSpacing.sm),

            // Status Badge
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.xs),
                border: Border.all(color: statusColor),
              ),
              child: Text(
                project.status.toUpperCase(),
                style: AppTextStyles.labelSmall.copyWith(
                  color: statusColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Project Info Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(
                    'Type',
                    project.projectType.toUpperCase(),
                  ),
                  const Divider(),
                  _buildInfoRow(
                    'Budget',
                    project.budgetDisplay,
                  ),
                  if (project.durationDays != null) ...[
                    const Divider(),
                    _buildInfoRow(
                      'Duration',
                      '${project.durationDays} days',
                    ),
                  ] else if (project.durationHours != null) ...[
                    const Divider(),
                    _buildInfoRow(
                      'Duration',
                      '${project.durationHours} hours',
                    ),
                  ],
                  const Divider(),
                  _buildInfoRow(
                    'Created',
                    dateFormat.format(project.createdAt),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Description
            Text(
              'Description',
              style: AppTextStyles.headlineMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              project.description,
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(
              color: Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'in_progress':
      case 'active':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
