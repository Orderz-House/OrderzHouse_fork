import 'package:flutter/material.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/app_text_field.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          children: [
            AppTextField(label: 'First Name'),
            const SizedBox(height: AppSpacing.md),
            AppTextField(label: 'Last Name'),
            const SizedBox(height: AppSpacing.md),
            AppTextField(label: 'Phone Number', keyboardType: TextInputType.phone),
            const SizedBox(height: AppSpacing.md),
            AppTextField(label: 'Country'),
            const SizedBox(height: AppSpacing.lg),
            PrimaryButton(
              label: 'Save Changes',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile updated')),
                );
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
