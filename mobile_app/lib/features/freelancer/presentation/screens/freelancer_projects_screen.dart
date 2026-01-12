import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';

class FreelancerProjectsScreen extends StatefulWidget {
  const FreelancerProjectsScreen({super.key});

  @override
  State<FreelancerProjectsScreen> createState() => _FreelancerProjectsScreenState();
}

class _FreelancerProjectsScreenState extends State<FreelancerProjectsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Projects'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Pending'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ProjectsList(status: 'Active'),
          _ProjectsList(status: 'Pending'),
          _ProjectsList(status: 'Completed'),
        ],
      ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: 1,
        items: const [
          NavItem(icon: Icons.home, title: 'Home', route: '/freelancer'),
          NavItem(icon: Icons.work, title: 'My Projects', route: '/freelancer/projects'),
          NavItem(icon: Icons.explore, title: 'Explore', route: '/freelancer/explore'),
          NavItem(icon: Icons.payment, title: 'Payments', route: '/freelancer/payments'),
          NavItem(icon: Icons.person, title: 'Profile', route: '/freelancer/profile'),
        ],
      ),
    );
  }
}

class _ProjectsList extends StatelessWidget {
  final String status;

  const _ProjectsList({required this.status});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.work_outline,
      title: 'No $status projects',
      message: 'Your $status projects will appear here',
    );
  }
}
