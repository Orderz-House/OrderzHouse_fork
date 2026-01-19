import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import '../../../../core/models/project.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_gradients.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/gradient_button.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../projects/data/repositories/projects_repository.dart';
import '../../../projects/presentation/providers/projects_provider.dart';
import '../../../offers/data/repositories/offers_repository.dart';
import '../../../freelancer/presentation/widgets/change_requests_bottom_sheet.dart';
import '../../../freelancer/presentation/widgets/deliver_modal.dart';
import '../../../client/presentation/widgets/review_delivery_bottom_sheet.dart';
import '../../../client/presentation/widgets/offers_bottom_sheet.dart';
import '../../../client/presentation/widgets/applications_bottom_sheet.dart';

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
  
  // Store raw project data for additional fields
  Map<String, dynamic>? _projectData;
  
  // Assignment data
  Map<String, dynamic>? _assignment;
  bool _isLoadingAssignment = true;
  
  // Local state for pending deliveries (freelancer)
  bool _pendingLocal = false;
  
  // Store offers and applications data (client)
  List<Map<String, dynamic>> _offers = [];
  List<Map<String, dynamic>> _applications = [];
  Map<String, int>? _offersStats; // pending/accepted/rejected counts
  
  // Deliveries data
  List<Map<String, dynamic>> _deliveries = [];
  bool _isLoadingDeliveries = false;

  @override
  void initState() {
    super.initState();
    _checkIfApplied();
    _fetchRawProjectData();
    _fetchAssignment(); // This will call _fetchDeliveriesIfNeeded() after assignment loads
  }
  
  // Fetch deliveries if user is owner or assigned freelancer
  Future<void> _fetchDeliveriesIfNeeded() async {
    // Check ownership and assignment
    final authState = ref.read(authStateProvider);
    final currentUserId = authState.user?.id;
    final isOwnerCheck = currentUserId != null && widget.project.userId == currentUserId;
    
    // Check if assigned (need to check assignment data)
    bool isAssignedCheck = false;
    if (_assignment != null && currentUserId != null) {
      final assignmentFreelancerId = _assignment!['freelancer_id'] as int?;
      final assignmentStatus = (_assignment!['assignment_status'] ?? _assignment!['status'] ?? '').toString().toLowerCase();
      isAssignedCheck = assignmentFreelancerId == currentUserId && ['active', 'assigned', 'accepted'].contains(assignmentStatus);
    }
    
    if (!isOwnerCheck && !isAssignedCheck) {
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (_isLoadingDeliveries) {
      return;
    }
    
    setState(() {
      _isLoadingDeliveries = true;
    });
    
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getProjectDeliveries(widget.project.id);
      
      if (mounted && response.success && response.data != null) {
        setState(() {
          _deliveries = response.data!;
          _isLoadingDeliveries = false;
        });
      } else if (mounted) {
        setState(() {
          _isLoadingDeliveries = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingDeliveries = false;
        });
      }
    }
  }
  
  // Normalize status key (completion_status takes precedence, fallback to status)
  String get _statusKey {
    final completionStatus = (_projectData?['completion_status'] ?? '').toString().toLowerCase();
    final status = (_projectData?['status'] ?? widget.project.status ?? '').toString().toLowerCase();
    return completionStatus.isNotEmpty ? completionStatus : status;
  }
  
  // Fetch assignment details
  Future<void> _fetchAssignment() async {
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getMyAssignment(widget.project.id);
      
      if (mounted) {
        setState(() {
          _assignment = response.data;
          _isLoadingAssignment = false;
        });
        
        // Fetch deliveries after assignment is loaded
        _fetchDeliveriesIfNeeded();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _assignment = null;
          _isLoadingAssignment = false;
        });
        
        // Still try to fetch deliveries (might be owner)
        _fetchDeliveriesIfNeeded();
      }
    }
  }
  
  // Compute visibility booleans
  bool get _isOwner {
    final authState = ref.read(authStateProvider);
    final currentUserId = authState.user?.id;
    return currentUserId != null && widget.project.userId == currentUserId;
  }
  
  bool get _isFreelancerRole {
    final authState = ref.read(authStateProvider);
    return authState.user?.roleId == 3; // FREELANCER_ROLE_ID
  }
  
  bool get _isClientRole {
    final authState = ref.read(authStateProvider);
    return authState.user?.roleId == 2; // CLIENT_ROLE_ID
  }
  
  bool get _isAssignedToMe {
    if (_assignment == null) return false;
    final authState = ref.read(authStateProvider);
    final currentUserId = authState.user?.id;
    if (currentUserId == null) return false;
    
    final assignmentFreelancerId = _assignment!['freelancer_id'] as int?;
    final assignmentStatus = (_assignment!['assignment_status'] ?? _assignment!['status'] ?? '').toString().toLowerCase();
    
    final isMyAssignment = assignmentFreelancerId == currentUserId;
    final isActiveStatus = ['active', 'assigned', 'accepted'].contains(assignmentStatus);
    
    return isMyAssignment && isActiveStatus;
  }
  
  bool get _isAssignedToSomeone {
    if (_assignment == null) return false;
    final assignmentStatus = (_assignment!['assignment_status'] ?? _assignment!['status'] ?? '').toString().toLowerCase();
    return ['active', 'assigned', 'accepted'].contains(assignmentStatus);
  }
  
  // Should show freelancer actions section
  bool get _shouldShowFreelancerActions {
    return _isFreelancerRole && !_isOwner && _isAssignedToMe;
  }
  
  // Should show client actions section (Receive + Applicants buttons)
  bool get _shouldShowClientActions {
    return _isOwner && _isClientRole;
  }
  
  // Should show client action bar (Receive + Applicants)
  bool get _shouldShowClientActionBar {
    return _isOwner && _isClientRole;
  }
  
  // Check if project is completed
  bool get _isProjectCompleted {
    final status = widget.project.status.toLowerCase();
    final completionStatus = _statusKey.toLowerCase();
    return status == 'completed' || completionStatus == 'completed';
  }
  
  // Should show sticky Apply/Send Offer CTA
  bool get _shouldShowStickyCTA {
    if (!_isFreelancerRole || _isOwner || _isAssignedToMe || _isAssignedToSomeone) {
      return false;
    }
    
    final projectStatus = widget.project.status.toLowerCase();
    final isOpen = ['open', 'active', 'pending', 'in_progress'].contains(projectStatus);
    
    return isOpen;
  }
  
  // Fetch raw project data for additional fields
  Future<void> _fetchRawProjectData() async {
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getMyProjectsRaw();
      
      if (response.success && response.data != null) {
        final project = response.data!.firstWhere(
          (p) => (p['id'] as int?) == widget.project.id,
          orElse: () => {},
        );
        if (project.isNotEmpty) {
          setState(() {
            _projectData = project;
          });
        }
      }
    } catch (e) {
      // Silently fail
    }
  }
  
  // Check if project has notifications (freelancer/owner)
  bool _hasNotifications() {
    final changeRequestMessage = _projectData?['change_request_message'] as String? ?? '';
    final unresolvedCount = _projectData?['change_requests_unresolved_count'] as int? ?? 0;
    return changeRequestMessage.trim().isNotEmpty || unresolvedCount > 0;
  }
  
  // Should show client review actions (Approve + Request Change)
  bool get _shouldShowClientReviewActions {
    if (!_isOwner) return false;
    return _statusKey == 'pending_review' || _deliveries.isNotEmpty;
  }
  
  // Should show freelancer deliver button
  bool get _shouldShowFreelancerDeliver {
    if (!_isAssignedToMe) return false;
    return ['in_progress', 'not_started'].contains(_statusKey);
  }
  
  // Should show freelancer waiting status
  bool get _shouldShowFreelancerWaiting {
    if (!_isAssignedToMe) return false;
    return _statusKey == 'pending_review' || (_pendingLocal && _statusKey != 'completed');
  }
  
  // Fetch offers for a project (client)
  Future<void> _fetchOffers() async {
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getProjectOffers(widget.project.id);
      
      if (response.success && response.data != null) {
        setState(() {
          _offers = response.data!;
          // Calculate stats
          int pending = 0, accepted = 0, rejected = 0;
          for (var offer in response.data!) {
            final status = (offer['status'] ?? 'pending').toString().toLowerCase();
            if (status == 'pending' || status == 'pending_client_approval') {
              pending++;
            } else if (status == 'accepted' || status == 'approved') {
              accepted++;
            } else if (status == 'rejected' || status == 'declined') {
              rejected++;
            }
          }
          _offersStats = {
            'pending': pending,
            'accepted': accepted,
            'rejected': rejected,
            'total': response.data!.length,
          };
        });
      }
    } catch (e) {
      // Silently fail
    }
  }

  // Fetch applications for a project (client)
  Future<void> _fetchApplications() async {
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.getProjectApplications(widget.project.id);
      
      if (response.success && response.data != null) {
        setState(() {
          _applications = response.data!;
        });
      }
    } catch (e) {
      // Silently fail
    }
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
          
          // Refresh assignment after sending offer
          _fetchAssignment();

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
          
          // Refresh assignment after applying
          _fetchAssignment();

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
              GradientButton(
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
                label: 'Send Offer',
                isLoading: _isLoading,
                height: 54,
                borderRadius: 18,
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
    // Note: Actual visibility is controlled by _shouldShowStickyCTA which checks assignment
    final shouldShowButton = isFreelancer && hasValidProjectType;

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
                    AppColors.primary.withValues(alpha: 0.12),
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
                            color: AppColors.primary, // Coral-red
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
                                          AppColors.primary.withValues(alpha: 0.8),
                                          AppColors.primary.withValues(alpha: 0.6),
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
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.3),
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
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          widget.project.projectType.toUpperCase(),
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.primary,
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
                              color: AppColors.primary,
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

                // Add bottom padding to prevent content from being hidden under bottom bar
                SizedBox(
                  height: MediaQuery.of(context).padding.bottom + 80, // Space for bottom bar
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(context, isFreelancer, isBidding, shouldShowButton, buttonLabel),
    );
  }
  
  // Build Actions Section (role-based, with assignment check) - DEPRECATED: Actions moved to bottom bar
  Widget _buildActionsSection(BuildContext context, bool isFreelancer, bool isBidding) {
    // This method is no longer used - actions are in bottom bar
    return const SizedBox.shrink();
  }
  
  // Build bottom bar (Actions or Apply/Send Offer CTA)
  Widget? _buildBottomBar(BuildContext context, bool isFreelancer, bool isBidding, bool shouldShowButton, String? buttonLabel) {
    // Wait for assignment and deliveries to load
    if (_isLoadingAssignment || _isLoadingDeliveries) {
      return null;
    }
    
    // Debug logs
    if (AppConfig.isDevelopment) {
      debugPrint('🔍 ProjectDetails Bottom Bar Visibility:');
      debugPrint('  isOwner: $_isOwner');
      debugPrint('  isClientRole: $_isClientRole');
      debugPrint('  isFreelancerRole: $_isFreelancerRole');
      debugPrint('  isAssignedToMe: $_isAssignedToMe');
      debugPrint('  statusKey: $_statusKey');
      debugPrint('  deliveries.length: ${_deliveries.length}');
      debugPrint('  shouldShowClientActionBar: $_shouldShowClientActionBar');
      debugPrint('  shouldShowFreelancerActions: $_shouldShowFreelancerActions');
      debugPrint('  shouldShowStickyCTA: $_shouldShowStickyCTA');
    }
    
    // Show Client Action Bar (Receive + Applicants) for all client-owned projects
    if (_shouldShowClientActionBar) {
      return _buildClientActionBar(context);
    }
    
    // Show Freelancer Actions (Deliver or Waiting status) if assigned
    if (_shouldShowFreelancerActions) {
      return _buildFreelancerActionsBottomBar(context);
    }
    
    // Show Apply/Send Offer CTA if applicable (not owner, not assigned)
    if (_shouldShowStickyCTA) {
      final label = isBidding ? 'Send Offer' : 'Apply';
      return SafeArea(
        top: false,
        bottom: true,
        child: _buildBottomActionButton(
          context,
          label,
          isBidding,
          widget.project.id,
        ),
      );
    }
    
    return null;
  }
  
  // Build Client Action Bar (Receive + Applicants OR Files + Request Changes)
  Widget _buildClientActionBar(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        child: _isProjectCompleted
            ? _buildCompletedActionsRow(context)
            : _buildActiveActionsRow(context),
      ),
    );
  }
  
  // Build Active Actions Row (Applicants + Receive) - for in-progress projects
  Widget _buildActiveActionsRow(BuildContext context) {
    return Row(
      children: [
        // Applicants button (left, outlined)
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _openApplications(context),
            icon: const Icon(Icons.people_outline_rounded, size: 20),
            label: const Text('Applicants'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textPrimary,
              side: BorderSide(color: AppColors.border),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Receive button (right, gradient)
        Expanded(
          child: PrimaryGradientButton(
            onPressed: () => _openReceivePanel(context),
            label: 'Receive',
            icon: Icons.download_rounded,
            height: 48,
            borderRadius: 12,
            width: double.infinity,
          ),
        ),
      ],
    );
  }
  
  // Build Completed Actions Row (Request Changes + Files) - for completed projects
  Widget _buildCompletedActionsRow(BuildContext context) {
    return Row(
      children: [
        // Request Changes button (left, outlined) - optional for post-completion changes
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _openRequestChangesModal(context),
            icon: const Icon(Icons.edit_rounded, size: 20),
            label: const Text('Request Changes'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textPrimary,
              side: BorderSide(color: AppColors.border),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(28),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Files button (right, gradient primary)
        Expanded(
          child: PrimaryGradientButton(
            onPressed: () => _openFilesView(context),
            label: 'Files',
            icon: Icons.folder_outlined,
            height: 52,
            borderRadius: 28,
            width: double.infinity,
          ),
        ),
      ],
    );
  }
  
  // Build Client Review Bottom Bar (Approve + Request Change) - DEPRECATED: Now shown in Receive panel
  Widget _buildClientReviewBottomBar(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        child: Row(
          children: [
            // Request Change button (left, outlined)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _openRequestChangesModal(context),
                icon: const Icon(Icons.edit_rounded, size: 20),
                label: const Text('Request Change'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF111827),
                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Approve button (right, filled)
            Expanded(
              child: PrimaryGradientButton(
                onPressed: () => _handleApproveDelivery(context),
                label: 'Approve',
                icon: Icons.check_circle_rounded,
                height: 48,
                borderRadius: 12,
                width: double.infinity,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Build Freelancer Actions Bottom Bar (Deliver or Waiting status)
  Widget _buildFreelancerActionsBottomBar(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        child: _shouldShowFreelancerDeliver
            ? GradientButton(
                onPressed: () => _openDeliverModal(context),
                label: 'Deliver Work',
                icon: Icons.send_rounded,
                height: 48,
                borderRadius: 12,
              )
            : _shouldShowFreelancerWaiting
                ? Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFF59E0B).withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.hourglass_empty_rounded,
                          color: Color(0xFFF59E0B),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Waiting for client review',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: const Color(0xFFF59E0B),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )
                : _statusKey == 'completed'
                    ? Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF10B981).withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.check_circle_rounded,
                              color: Color(0xFF10B981),
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Approved ✅',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: const Color(0xFF10B981),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox.shrink(),
      ),
    );
  }
  
  // Open change requests (freelancer)
  Future<void> _openChangeRequests(BuildContext context) async {
    final repository = ref.read(projectsRepositoryProvider);
    List<Map<String, dynamic>> requests = [];
    bool isLoading = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          if (isLoading && requests.isEmpty) {
            repository.getChangeRequests(widget.project.id).then((response) {
              if (response.success && response.data != null) {
                setModalState(() {
                  requests = response.data!;
                  isLoading = false;
                });
              } else {
                final changeRequestMessage = _projectData?['change_request_message'] as String?;
                final changeRequestAt = _projectData?['change_request_at'];
                if (changeRequestMessage != null && changeRequestMessage.isNotEmpty) {
                  setModalState(() {
                    requests = [
                      {
                        'id': 'local',
                        'message': changeRequestMessage,
                        'created_at': changeRequestAt,
                      }
                    ];
                    isLoading = false;
                  });
                } else {
                  setModalState(() {
                    isLoading = false;
                  });
                }
              }
            }).catchError((e) {
              final changeRequestMessage = _projectData?['change_request_message'] as String?;
              final changeRequestAt = _projectData?['change_request_at'];
              if (changeRequestMessage != null && changeRequestMessage.isNotEmpty) {
                setModalState(() {
                  requests = [
                    {
                      'id': 'local',
                      'message': changeRequestMessage,
                      'created_at': changeRequestAt,
                    }
                  ];
                  isLoading = false;
                });
              } else {
                setModalState(() {
                  isLoading = false;
                });
              }
            });
          }

          return ChangeRequestsBottomSheet(
            requests: requests,
            isLoading: isLoading,
          );
        },
      ),
    );
  }
  
  // Open deliver modal (freelancer)
  Future<void> _openDeliverModal(BuildContext context) async {
    await showDialog(
      context: context,
      builder: (context) => DeliverModal(
        project: widget.project,
        onClose: () => Navigator.pop(context),
        onSubmit: (project, filePaths) async {
          final repository = ref.read(projectsRepositoryProvider);
          final response = await repository.deliverProject(project.id, filePaths);

          if (!response.success) {
            throw Exception(response.message ?? 'Failed to deliver project');
          }

          // Update local state immediately
          setState(() {
            _pendingLocal = true;
            _projectData = {
              ...?_projectData,
              'completion_status': 'pending_review',
              'status': 'pending_review',
            };
          });

          // Refresh deliveries
          await _fetchDeliveriesIfNeeded();

          // Refresh projects list
          ref.invalidate(myProjectsProvider);
          await ref.read(myProjectsProvider.future);

          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Delivery submitted successfully ✅'),
                backgroundColor: Colors.green,
              ),
            );
            Navigator.pop(context);
          }
        },
        isSubmitting: false,
      ),
    );
  }
  
  // Handle Approve Delivery (client)
  Future<void> _handleApproveDelivery(BuildContext context) async {
    if (_isLoading) return;
    
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.approveDelivery(widget.project.id);
      
      if (!response.success) {
        throw Exception(response.message ?? 'Failed to approve delivery');
      }
      
      // Update local state immediately
      setState(() {
        _projectData = {
          ...?_projectData,
          'completion_status': 'completed',
          'status': 'completed',
        };
        _isLoading = false;
      });
      
      // Refresh deliveries
      await _fetchDeliveriesIfNeeded();
      
      // Refresh projects list
      ref.invalidate(myProjectsProvider);
      await ref.read(myProjectsProvider.future);
      
      // Refresh raw project data
      await _fetchRawProjectData();
      
      if (context.mounted) {
        // Close the receive sheet if it's open
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
        
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Project approved and marked as completed ✅'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        
        // Force rebuild to show new buttons
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to approve: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  
  // Open Request Changes Modal (client)
  Future<void> _openRequestChangesModal(BuildContext context) async {
    final messageController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    
    await showModalBottomSheet(
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
                    'Request Changes',
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
                controller: messageController,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Message',
                  hintText: 'Describe what changes are needed...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Message is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : () async {
                          if (formKey.currentState!.validate()) {
                            Navigator.pop(context);
                            await _handleRequestChanges(context, messageController.text.trim());
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
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
                          'Send Request',
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
  
  // Handle Request Changes (client)
  Future<void> _handleRequestChanges(BuildContext context, String message) async {
    if (_isLoading) return;
    
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(projectsRepositoryProvider);
      final response = await repository.requestChanges(widget.project.id, message);
      
      if (!response.success) {
        throw Exception(response.message ?? 'Failed to send change request');
      }
      
      // Update local state
      setState(() {
        _projectData = {
          ...?_projectData,
          'status': 'in_progress',
          'completion_status': 'in_progress',
        };
        _isLoading = false;
      });
      
      // Refresh deliveries
      await _fetchDeliveriesIfNeeded();
      
      // Refresh projects list
      ref.invalidate(myProjectsProvider);
      await ref.read(myProjectsProvider.future);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Change request sent successfully ✅'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send request: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  
  // Open Files View (client) - read-only view of delivered files for completed projects
  Future<void> _openFilesView(BuildContext context) async {
    // Fetch deliveries first if not already loaded
    if (_deliveries.isEmpty) {
      await _fetchDeliveriesIfNeeded();
    }
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => _buildFilesSheet(context),
    );
  }
  
  // Build Files Sheet UI (read-only, no actions)
  Widget _buildFilesSheet(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppColors.border,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Project Files — ${widget.project.title}',
                    style: AppTextStyles.titleLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                  color: AppColors.textSecondary,
                ),
              ],
            ),
          ),
          
          // Content
          Expanded(
            child: _deliveries.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.folder_open_rounded,
                          size: 64,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No files available',
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _deliveries.length,
                    itemBuilder: (context, index) {
                      final delivery = _deliveries[index];
                      return _buildDeliveryFileCard(delivery, index);
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  // Build Delivery File Card
  Widget _buildDeliveryFileCard(Map<String, dynamic> delivery, int index) {
    final files = delivery['files'] as List<dynamic>? ?? [];
    final note = delivery['note'] as String? ?? '';
    final createdAt = delivery['created_at'];
    final status = delivery['status'] as String? ?? 'submitted';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Delivery #${index + 1}',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getHistoryColor(status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: _getHistoryColor(status),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (note.isNotEmpty) ...[
            Text(
              'Note:',
              style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              note,
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: 12),
          ],
          if (files.isNotEmpty) ...[
            Text(
              'Files (${files.length}):',
              style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            ...files.map((file) => _buildFileItem(file)),
          ],
          const SizedBox(height: 8),
          Text(
            'Submitted: ${_formatDeliveryDate(createdAt)}',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }
  
  // Open Receive Panel (client) - new UI for viewing/approving deliveries
  Future<void> _openReceivePanel(BuildContext context) async {
    // Fetch deliveries first if not already loaded
    if (_deliveries.isEmpty) {
      await _fetchDeliveriesIfNeeded();
    }
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => _buildReceiveSheet(context),
    );
  }
  
  // Build Receive Sheet UI
  Widget _buildReceiveSheet(BuildContext context) {
    final latestDelivery = _deliveries.isNotEmpty ? _deliveries.first : null;
    
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppColors.border,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Receive Project — ${widget.project.title}',
                    style: AppTextStyles.titleLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                  color: AppColors.textSecondary,
                ),
              ],
            ),
          ),
          
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Latest Delivery Card
                  _buildLatestDeliveryCard(latestDelivery),
                  
                  const SizedBox(height: 20),
                  
                  // Actions Card
                  _buildActionsCard(latestDelivery),
                  
                  const SizedBox(height: 20),
                  
                  // History Card
                  _buildHistoryCard(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  // Build Latest Delivery Card
  Widget _buildLatestDeliveryCard(Map<String, dynamic>? latestDelivery) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Latest delivery',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              OutlinedButton.icon(
                onPressed: _fetchDeliveriesIfNeeded,
                icon: const Icon(Icons.refresh_rounded, size: 16),
                label: const Text('Refresh'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.accentOrange,
                  side: BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  minimumSize: const Size(0, 32),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (latestDelivery == null)
            Text(
              'No deliveries yet.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            )
          else
            _buildDeliveryContent(latestDelivery),
        ],
      ),
    );
  }
  
  // Build Delivery Content
  Widget _buildDeliveryContent(Map<String, dynamic> delivery) {
    final files = delivery['files'] as List<dynamic>? ?? [];
    final note = delivery['note'] as String? ?? '';
    final createdAt = delivery['created_at'];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (note.isNotEmpty) ...[
          Text(
            'Note:',
            style: AppTextStyles.labelSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            note,
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 12),
        ],
        if (files.isNotEmpty) ...[
          Text(
            'Files:',
            style: AppTextStyles.labelSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          ...files.map((file) => _buildFileItem(file)),
        ],
        const SizedBox(height: 8),
        Text(
          'Submitted: ${_formatDeliveryDate(createdAt)}',
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }
  
  // Build File Item
  Widget _buildFileItem(dynamic file) {
    final fileName = file is Map ? (file['filename'] ?? file['name'] ?? 'File') : file.toString();
    final fileUrl = file is Map ? (file['url'] ?? file['file_url'] ?? file['path']) : null;
    final fileSize = file is Map ? (file['size'] ?? file['size_bytes']) : null;
    
    // Check if URL is valid
    final hasValidUrl = fileUrl != null && 
                       fileUrl.toString().isNotEmpty && 
                       fileUrl.toString() != 'null' && 
                       fileUrl.toString() != 'N/A';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(
            Icons.insert_drive_file_rounded,
            color: AppColors.accentOrange,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fileName,
                  style: AppTextStyles.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (fileSize != null)
                  Text(
                    _formatFileSize(fileSize),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                      fontSize: 11,
                    ),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              Icons.download_rounded,
              size: 20,
              color: hasValidUrl ? AppColors.accentOrange : AppColors.textTertiary,
            ),
            onPressed: hasValidUrl ? () => _downloadFile(fileUrl.toString(), fileName) : null,
            tooltip: hasValidUrl ? 'Download' : 'File not available',
          ),
        ],
      ),
    );
  }
  
  // Helper: Format file size
  String _formatFileSize(dynamic size) {
    try {
      final bytes = size is int ? size : int.tryParse(size.toString()) ?? 0;
      if (bytes < 1024) return '$bytes B';
      if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
      if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
      return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    } catch (e) {
      return '';
    }
  }
  
  // Build Actions Card
  Widget _buildActionsCard(Map<String, dynamic>? latestDelivery) {
    final hasDelivery = latestDelivery != null;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Actions',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    onPressed: hasDelivery ? () {
                      Navigator.pop(context);
                      _openRequestChangesModal(context);
                    } : null,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textPrimary,
                      side: BorderSide(color: hasDelivery ? AppColors.border : AppColors.borderLight),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Request changes'),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: PrimaryGradientButton(
                    onPressed: hasDelivery ? () async {
                      Navigator.pop(context);
                      await _handleApproveDelivery(context);
                    } : null,
                    label: 'Approve',
                    isEnabled: hasDelivery,
                    height: 48,
                    borderRadius: 12,
                    width: double.infinity,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  // Build History Card
  Widget _buildHistoryCard() {
    final history = _deliveries.skip(1).toList();
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'History',
            style: AppTextStyles.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          if (history.isEmpty)
            Text(
              'No history yet.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            )
          else
            ...history.map((delivery) => _buildHistoryItem(delivery)),
        ],
      ),
    );
  }
  
  // Build History Item
  Widget _buildHistoryItem(Map<String, dynamic> delivery) {
    final status = delivery['status'] as String? ?? 'submitted';
    final createdAt = delivery['created_at'];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(
            _getHistoryIcon(status),
            color: _getHistoryColor(status),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getHistoryTitle(status),
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  _formatDeliveryDate(createdAt),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  // Helper: Download file with authorization (no permissions needed)
  Future<void> _downloadFile(String url, String fileName) async {
    // Validate URL
    if (url.isEmpty || url == 'N/A' || url == 'null') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No downloadable file available'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    try {
      // Show downloading snackbar
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Downloading: $fileName'),
          backgroundColor: AppColors.accentOrange,
          duration: const Duration(seconds: 2),
        ),
      );
      
      // Get app documents directory (no permissions needed on any platform)
      final directory = await getApplicationDocumentsDirectory();
      
      // Create OrderzHouse folder inside app documents
      final orderzHouseDir = Directory('${directory.path}/OrderzHouse');
      if (!await orderzHouseDir.exists()) {
        await orderzHouseDir.create(recursive: true);
      }
      
      final savePath = '${orderzHouseDir.path}/$fileName';
      
      // Get auth token from secure storage
      final token = await SecureStorageService.getToken();
      
      // Create Dio instance with auth headers
      final dio = Dio();
      final options = Options(
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Accept': '*/*',
        },
        responseType: ResponseType.bytes,
        followRedirects: true,
        validateStatus: (status) => status != null && status < 500,
      );
      
      // Download file
      await dio.download(
        url,
        savePath,
        options: options,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            debugPrint('Download progress: $progress%');
          }
        },
      );
      
      // Verify file exists
      final file = File(savePath);
      if (!await file.exists()) {
        throw Exception('File download failed');
      }
      
      // Print saved path to console
      debugPrint('✅ File saved to: $savePath');
      
      if (mounted) {
        // Show success message with full path
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Downloaded: $fileName',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Saved: $savePath',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Colors.white70,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Open',
              textColor: Colors.white,
              onPressed: () async {
                try {
                  final result = await OpenFilex.open(savePath);
                  if (result.type != ResultType.done) {
                    debugPrint('Could not open file: ${result.message}');
                  }
                } catch (e) {
                  debugPrint('Error opening file: $e');
                }
              },
            ),
          ),
        );
      }
    } catch (e) {
      debugPrint('Download error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Download failed: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
  
  // Helper: Format delivery date
  String _formatDeliveryDate(dynamic date) {
    if (date == null) return 'Just now';
    try {
      DateTime dateTime;
      if (date is DateTime) {
        dateTime = date;
      } else if (date is String) {
        // Try multiple date formats
        try {
          dateTime = DateTime.parse(date);
        } catch (_) {
          // Try ISO format with timezone
          dateTime = DateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(date, true).toLocal();
        }
      } else {
        return 'Just now';
      }
      
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inSeconds < 60) {
        return 'Just now';
      } else if (difference.inMinutes < 60) {
        final minutes = difference.inMinutes;
        return '$minutes ${minutes == 1 ? "minute" : "minutes"} ago';
      } else if (difference.inHours < 24) {
        final hours = difference.inHours;
        return '$hours ${hours == 1 ? "hour" : "hours"} ago';
      } else if (difference.inDays < 7) {
        final days = difference.inDays;
        return '$days ${days == 1 ? "day" : "days"} ago';
      } else {
        return DateFormat('MMM dd, yyyy').format(dateTime);
      }
    } catch (e) {
      debugPrint('Date formatting error: $e for date: $date');
      return 'Recently';
    }
  }
  
  // Helper: Get history icon
  IconData _getHistoryIcon(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return Icons.check_circle_rounded;
      case 'changes_requested':
      case 'rejected':
        return Icons.edit_rounded;
      default:
        return Icons.upload_rounded;
    }
  }
  
  // Helper: Get history color
  Color _getHistoryColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return Colors.green;
      case 'changes_requested':
      case 'rejected':
        return Colors.orange;
      default:
        return AppColors.accentOrange;
    }
  }
  
  // Helper: Get history title
  String _getHistoryTitle(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'Delivery approved';
      case 'changes_requested':
      case 'rejected':
        return 'Changes requested';
      default:
        return 'Delivery submitted';
    }
  }
  
  // Open review delivery (client) - DEPRECATED: Use _openReceivePanel instead
  Future<void> _openReviewDelivery(BuildContext context) async {
    final repository = ref.read(projectsRepositoryProvider);
    List<Map<String, dynamic>> deliveries = [];
    bool isLoading = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          if (isLoading && deliveries.isEmpty) {
            repository.getProjectDeliveries(widget.project.id).then((response) {
              setModalState(() {
                if (response.success && response.data != null) {
                  deliveries = response.data!;
                }
                isLoading = false;
              });
            }).catchError((e) {
              setModalState(() {
                isLoading = false;
              });
            });
          }

          return ReviewDeliveryBottomSheet(
            project: widget.project,
            deliveries: deliveries,
            isLoading: isLoading,
            onClose: () => Navigator.pop(context),
            onApprove: (projectId) async {
              final repository = ref.read(projectsRepositoryProvider);
              final response = await repository.approveDelivery(projectId);
              if (!response.success) {
                throw Exception(response.message ?? 'Failed to approve delivery');
              }
              setState(() {
                _projectData = {
                  ...?_projectData,
                  'completion_status': 'completed',
                  'status': 'completed',
                };
              });
              
              // Refresh deliveries
              await _fetchDeliveriesIfNeeded();
              
              ref.invalidate(myProjectsProvider);
              await ref.read(myProjectsProvider.future);
            },
            onRequestChanges: (projectId, message) async {
              final repository = ref.read(projectsRepositoryProvider);
              final response = await repository.requestChanges(projectId, message);
              if (!response.success) {
                throw Exception(response.message ?? 'Failed to send change request');
              }
              setState(() {
                _projectData = {
                  ...?_projectData,
                  'status': 'in_progress',
                  'completion_status': 'in_progress',
                };
              });
              
              // Refresh deliveries
              await _fetchDeliveriesIfNeeded();
              
              ref.invalidate(myProjectsProvider);
              await ref.read(myProjectsProvider.future);
            },
            onRefresh: () {
              setModalState(() {
                isLoading = true;
                deliveries = [];
              });
              repository.getProjectDeliveries(widget.project.id).then((response) {
                setModalState(() {
                  if (response.success && response.data != null) {
                    deliveries = response.data!;
                  }
                  isLoading = false;
                });
              }).catchError((e) {
                setModalState(() {
                  isLoading = false;
                });
              });
            },
          );
        },
      ),
    );
  }
  
  // Open offers (client)
  Future<void> _openOffers(BuildContext context) async {
    if (_offers.isEmpty) {
      await _fetchOffers();
    }

    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return OffersBottomSheet(
            project: widget.project,
            offers: _offers,
            isLoading: false,
            isSubmitting: isSubmitting,
            onClose: () => Navigator.pop(context),
            onAction: (offerId, action) async {
              setModalState(() => isSubmitting = true);
              try {
                final repository = ref.read(projectsRepositoryProvider);
                final response = await repository.approveRejectOffer(offerId, action);
                if (!response.success) {
                  throw Exception(response.message ?? 'Failed to process offer');
                }
                setModalState(() {
                  isSubmitting = false;
                  final updatedOffers = _offers.map((offer) {
                    if ((offer['id'] ?? offer['offer_id']) == offerId) {
                      return {...offer, 'status': action == 'accept' ? 'accepted' : 'rejected'};
                    }
                    return offer;
                  }).toList();
                  setState(() {
                    _offers = updatedOffers;
                    int pending = 0, accepted = 0, rejected = 0;
                    for (var offer in updatedOffers) {
                      final status = (offer['status'] ?? 'pending').toString().toLowerCase();
                      if (status == 'pending' || status == 'pending_client_approval') {
                        pending++;
                      } else if (status == 'accepted' || status == 'approved') {
                        accepted++;
                      } else if (status == 'rejected' || status == 'declined') {
                        rejected++;
                      }
                    }
                    _offersStats = {
                      'pending': pending,
                      'accepted': accepted,
                      'rejected': rejected,
                      'total': updatedOffers.length,
                    };
                  });
                });
                ref.invalidate(myProjectsProvider);
                await ref.read(myProjectsProvider.future);
              } catch (e) {
                setModalState(() => isSubmitting = false);
                rethrow;
              }
            },
          );
        },
      ),
    );
  }
  
  // Open applications (client)
  Future<void> _openApplications(BuildContext context) async {
    if (_applications.isEmpty) {
      await _fetchApplications();
    }

    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return ApplicationsBottomSheet(
            project: widget.project,
            applications: _applications,
            isLoading: false,
            isSubmitting: isSubmitting,
            onClose: () => Navigator.pop(context),
            onAction: (assignmentId, projectId, action) async {
              setModalState(() => isSubmitting = true);
              try {
                final repository = ref.read(projectsRepositoryProvider);
                final response = await repository.acceptRejectApplication(assignmentId, projectId, action);
                if (!response.success) {
                  throw Exception(response.message ?? 'Failed to process application');
                }
                setModalState(() {
                  isSubmitting = false;
                  final updatedApplications = _applications.map((app) {
                    final appId = app['assignment_id'] ?? app['assignmentId'] ?? app['id'];
                    if (appId == assignmentId) {
                      return {...app, 'status': action == 'accept' ? 'active' : 'rejected'};
                    } else if (action == 'accept') {
                      return {...app, 'status': 'not_chosen'};
                    }
                    return app;
                  }).toList();
                  setState(() {
                    _applications = updatedApplications;
                  });
                });
                ref.invalidate(myProjectsProvider);
                await ref.read(myProjectsProvider.future);
              } catch (e) {
                setModalState(() => isSubmitting = false);
                rethrow;
              }
            },
          );
        },
      ),
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
            AppColors.primary.withValues(alpha: 0.8),
            AppColors.primary.withValues(alpha: 0.6),
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
          color: AppColors.primary.withValues(alpha: 0.2),
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
            color: AppColors.primary,
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
        return AppColors.primary; // Use primary color for active
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
          gradient: isDisabled ? null : AppGradients.primaryButton,
          color: isDisabled ? Colors.grey.shade300 : null,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isDisabled
              ? null
              : [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
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
