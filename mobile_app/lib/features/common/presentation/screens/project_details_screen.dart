import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/models/project.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/config/app_config.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../projects/data/repositories/projects_repository.dart';
import '../../../offers/data/repositories/offers_repository.dart';

// Providers
final offersRepositoryProvider = Provider<OffersRepository>((ref) {
  return OffersRepository();
});

final projectsRepositoryProvider = Provider<ProjectsRepository>((ref) {
  return ProjectsRepository(ref: ref);
});

class ProjectDetailsScreen extends ConsumerStatefulWidget {
  final Project project;

  const ProjectDetailsScreen({
    required this.project,
    super.key,
  });

  @override
  ConsumerState<ProjectDetailsScreen> createState() => _ProjectDetailsScreenState();
}

class _ProjectDetailsScreenState extends ConsumerState<ProjectDetailsScreen> {
  bool _hasApplied = false;
  bool _isLoading = false;
  bool _isCheckingApplied = true;

  @override
  void initState() {
    super.initState();
    _checkIfApplied();
  }

  Future<void> _checkIfApplied() async {
    final authState = ref.read(authStateProvider);
    final user = authState.user;
    final isFreelancer = user?.roleId == 3;

    if (!isFreelancer) {
      setState(() => _isCheckingApplied = false);
      return;
    }

    final projectTypeLower = widget.project.projectType.toLowerCase();
    final isBidding = projectTypeLower == 'bidding';

    try {
      if (isBidding) {
        // Check pending offer
        final offersRepo = ref.read(offersRepositoryProvider);
        final response = await offersRepo.checkMyPendingOffer(widget.project.id);
        if (mounted) {
          setState(() {
            _hasApplied = response.data ?? false;
            _isCheckingApplied = false;
          });
        }
      } else {
        // Check assignment
        final projectsRepo = ref.read(projectsRepositoryProvider);
        final response = await projectsRepo.checkIfAssigned(widget.project.id);
        if (mounted) {
          setState(() {
            _hasApplied = response.data ?? false;
            _isCheckingApplied = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasApplied = false;
          _isCheckingApplied = false;
        });
      }
    }
  }

  Future<void> _handleSendOffer(double bidAmount, String? proposal) async {
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final offersRepo = ref.read(offersRepositoryProvider);
      final response = await offersRepo.sendOffer(
        projectId: widget.project.id,
        bidAmount: bidAmount,
        proposal: proposal,
      );

      if (mounted) {
        if (response.success) {
          setState(() {
            _hasApplied = true;
            _isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Offer sent successfully'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
        } else {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Failed to send offer'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send offer: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _handleApply() async {
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final projectsRepo = ref.read(projectsRepositoryProvider);
      final response = await projectsRepo.applyForProject(
        projectId: widget.project.id,
        message: null,
      );

      if (mounted) {
        if (response.success) {
          setState(() {
            _hasApplied = true;
            _isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Application submitted successfully'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
        } else {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Failed to apply to project'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to apply: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  void _showSendOfferModal() {
    final bidAmountController = TextEditingController();
    final proposalController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Send Offer',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: bidAmountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                ],
                decoration: InputDecoration(
                  labelText: 'Bid Amount (JOD)',
                  hintText: '0.00',
                  prefixIcon: const Icon(Icons.attach_money_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Bid amount is required';
                  }
                  final amount = double.tryParse(value);
                  if (amount == null || amount <= 0) {
                    return 'Bid amount must be greater than 0';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: proposalController,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Proposal (Optional)',
                  hintText: 'Add a message to your offer...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : () {
                          if (formKey.currentState!.validate()) {
                            final bidAmount = double.parse(bidAmountController.text);
                            final proposal = proposalController.text.trim().isEmpty
                                ? null
                                : proposalController.text.trim();
                            Navigator.pop(context);
                            _handleSendOffer(bidAmount, proposal);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6D5FFD),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Send Offer',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final statusColor = _getStatusColor(widget.project.status);
    
    // Build image URL
    final imageUrl = widget.project.coverPic != null && widget.project.coverPic!.isNotEmpty
        ? (widget.project.coverPic!.startsWith('http')
            ? widget.project.coverPic!
            : '${AppConfig.baseUrl}${widget.project.coverPic}')
        : null;

    // Get duration text
    String durationText = 'N/A';
    if (widget.project.durationDays != null) {
      durationText = '${widget.project.durationDays} ${widget.project.durationDays == 1 ? 'day' : 'days'}';
    } else if (widget.project.durationHours != null) {
      durationText = '${widget.project.durationHours} ${widget.project.durationHours == 1 ? 'hour' : 'hours'}';
    }

    // Check if current user is freelancer (role_id == 3)
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final isFreelancer = user?.roleId == 3;
    
    // Determine button label and action based on project type
    final projectTypeLower = widget.project.projectType.toLowerCase();
    final isBidding = projectTypeLower == 'bidding';
    final isFixed = projectTypeLower == 'fixed';
    final isHourly = projectTypeLower == 'hourly';
    
    // Determine button label (null if project type is unknown)
    String? buttonLabel;
    if (_hasApplied) {
      buttonLabel = 'Already Applied';
    } else if (isBidding) {
      buttonLabel = 'Send Offer';
    } else if (isFixed || isHourly) {
      buttonLabel = 'Apply';
    }
    
    // Show button only for freelancers, and only if project type is known (bidding/fixed/hourly)
    final hasValidProjectType = isBidding || isFixed || isHourly;
    final shouldShowButton = isFreelancer && hasValidProjectType;
    
    // DEBUG: Log values to check condition
    debugPrint("ProjectDetails roleId=${user?.roleId}, projectType=${widget.project.projectType}, shouldShowButton=$shouldShowButton, buttonLabel=$buttonLabel, hasApplied=$_hasApplied");

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
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
                    const Color(0xFF6D5FFD).withValues(alpha: 0.12),
                    Colors.white,
                  ],
                  stops: const [0.0, 0.25],
                ),
              ),
            ),
          ),
          // Content layer
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Custom Header
                SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        // Back button in circle
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.chevron_left_rounded),
                            color: const Color(0xFF6D5FFD), // Primary lavender
                            onPressed: () {
                              // Safe back navigation
                              if (context.canPop()) {
                                context.pop();
                              } else {
                                // Fallback: navigate to explore/home
                                context.go('/client/explore');
                              }
                            },
                          ),
                        ),
                        const Spacer(),
                        // Title
                        const Text(
                          'Project Details',
                          style: TextStyle(
                            color: Color(0xFF111827),
                            fontWeight: FontWeight.w600,
                            fontSize: 18,
                          ),
                        ),
                        const Spacer(),
                        const SizedBox(width: 40), // Balance the back button
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Hero Image
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      children: [
                        // Image or placeholder
                        Container(
                          width: double.infinity,
                          height: 240,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: imageUrl != null
                              ? CachedNetworkImage(
                                  imageUrl: imageUrl,
                                  width: double.infinity,
                                  height: 240,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: [
                                          const Color(0xFF6D5FFD).withValues(alpha: 0.8),
                                          const Color(0xFF6D5FFD).withValues(alpha: 0.6),
                                        ],
                                      ),
                                    ),
                                    child: const Center(
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => _buildImagePlaceholder(),
                                )
                              : _buildImagePlaceholder(),
                        ),
                        // Status chip overlay (bottom-left)
                        Positioned(
                          bottom: 12,
                          left: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              widget.project.status.toUpperCase(),
                              style: AppTextStyles.labelSmall.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Title + Price row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title (left, flexible)
                      Expanded(
                        child: Text(
                          widget.project.title,
                          style: AppTextStyles.headlineMedium.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.bold,
                            fontSize: 24,
                            height: 1.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Price badge (right)
                      if (widget.project.budgetDisplay != 'Negotiable')
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6D5FFD),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6D5FFD).withValues(alpha: 0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Text(
                            widget.project.budgetDisplay,
                            style: AppTextStyles.labelLarge.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                const SizedBox(height: 5),

                // Project type + Created date row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6D5FFD).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF6D5FFD).withValues(alpha: 0.3),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          widget.project.projectType.toUpperCase(),
                          style: AppTextStyles.labelSmall.copyWith(
                            color: const Color(0xFF6D5FFD),
                            fontWeight: FontWeight.w600,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        dateFormat.format(widget.project.createdAt),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF6B7280),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Info Grid (2x2)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 8,
                    childAspectRatio: 1.5,
                    children: [
                      _buildInfoCard(
                        icon: Icons.category_rounded,
                        label: 'Type',
                        value: widget.project.projectType.toUpperCase(),
                      ),
                      _buildInfoCard(
                        icon: Icons.account_balance_wallet_rounded,
                        label: 'Budget',
                        value: widget.project.budgetDisplay,
                      ),
                      _buildInfoCard(
                        icon: Icons.schedule_rounded,
                        label: 'Duration',
                        value: durationText,
                      ),
                      _buildInfoCard(
                        icon: Icons.calendar_today_rounded,
                        label: 'Created',
                        value: dateFormat.format(widget.project.createdAt),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Description Card
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.description_rounded,
                              color: Color(0xFF6D5FFD),
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Description',
                              style: AppTextStyles.titleMedium.copyWith(
                                color: const Color(0xFF111827),
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.project.description,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: const Color(0xFF374151),
                            fontSize: 14,
                            height: 1.6,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: shouldShowButton && buttonLabel != null
          ? SafeArea(
              top: false,
              bottom: true,
              child: Builder(
                builder: (context) {
                  final label = buttonLabel!;
                  return _buildBottomActionButton(
                    context,
                    label,
                    isBidding,
                    widget.project.id,
                  );
                },
              ),
            )
          : null,
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: double.infinity,
      height: 240,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF6D5FFD).withValues(alpha: 0.8),
            const Color(0xFF6D5FFD).withValues(alpha: 0.6),
          ],
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.work_outline_rounded,
          color: Colors.white,
          size: 64,
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF6D5FFD).withValues(alpha: 0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(
            icon,
            color: const Color(0xFF6D5FFD),
            size: 24,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSmall.copyWith(
                  color: const Color(0xFF6B7280),
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
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
        return const Color(0xFF6D5FFD); // Use primary color for active
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  // Bottom Action Button for Freelancer Projects
  Widget _buildBottomActionButton(
    BuildContext context,
    String label,
    bool isBidding,
    int projectId,
  ) {
    final isDisabled = _hasApplied || _isLoading || _isCheckingApplied;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Container(
        width: double.infinity,
        height: 54,
        decoration: BoxDecoration(
          gradient: isDisabled
              ? null
              : const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF6D5FFD), // Primary lavender
                    Color(0xFF8B7FFD), // Slightly lighter lavender
                  ],
                ),
          color: isDisabled ? Colors.grey.shade300 : null,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isDisabled
              ? null
              : [
                  BoxShadow(
                    color: const Color(0xFF6D5FFD).withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isDisabled
                ? null
                : () {
                    if (isBidding) {
                      _showSendOfferModal();
                    } else {
                      _handleApply();
                    }
                  },
            borderRadius: BorderRadius.circular(20),
            child: Center(
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(
                      label,
                      style: TextStyle(
                        color: isDisabled ? Colors.grey.shade700 : Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
