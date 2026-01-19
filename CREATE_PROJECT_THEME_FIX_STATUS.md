# Create Project Theme & Validation Fix - Implementation Status

## Overview
Updating Create Project wizard to match new orange theme and fix validation UX (no red borders until Continue is pressed).

---

## ✅ COMPLETED

### 1. Main Wizard Page (`create_project_wizard_page.dart`)
**Changes Applied:**
- ✅ Added `import app_colors.dart`
- ✅ Header back button: Removed white circle container, changed to orange icon
- ✅ Header title: Changed to `AppColors.textPrimary`
- ✅ Progress indicator: Purple → Orange (`AppColors.accentOrange`)
- ✅ Progress inactive: Gray → `AppColors.borderLight`
- ✅ Back button border: Purple → `AppColors.border`
- ✅ Back button text: Purple → `AppColors.textPrimary`
- ✅ Continue button: Purple background → Gradient container (`gradientStart` → `gradientEnd`)
- ✅ Error snackbars: `Colors.red` → `AppColors.error`
- ✅ Warning snackbar: `Colors.orange` → `AppColors.accentOrange`

---

## 🚧 IN PROGRESS / PENDING

### 2. Project Details Step (`project_details_step_view.dart`)
**Required Changes:**

**Theme Colors:**
- Replace hardcoded `Color(0xFF111827)` → `AppColors.textPrimary`
- Update all `TextFormField` decorations to use `AppColors`:
  - Default border: `AppColors.border`
  - Focus border: `AppColors.accentOrange`
  - Error border: `AppColors.error` (only when validation active)
  - Labels: `AppColors.textSecondary`
  - Hints: `AppColors.textTertiary`

**Validation Gating:**
- **CRITICAL**: Currently line 138 calls `draft.validateStep1()` unconditionally, showing all errors immediately
- **Solution**: Add `bool _submitted = false;` state flag
- Wrap in `Form` widget with `GlobalKey<FormState> _formKey`
- Set `autovalidateMode: _submitted ? AutovalidateMode.onUserInteraction : AutovalidateMode.disabled`
- Remove direct `errors['field']` pattern
- Add validators to each `TextFormField`/`DropdownButtonFormField`
- On Continue (from parent): set `_submitted = true`, call `_formKey.currentState!.validate()`

**Structure:**
```dart
// Add at top of class
final _formKey = GlobalKey<FormState>();
bool _submitted = false;

// Wrap content in Form
Form(
  key: _formKey,
  autovalidateMode: _submitted 
      ? AutovalidateMode.onUserInteraction 
      : AutovalidateMode.disabled,
  child: SingleChildScrollView(...),
)

// Each field needs validator instead of errorText
TextFormField(
  validator: (value) {
    if (_submitted && (value == null || value.trim().length < 10)) {
      return 'Title must be at least 10 characters';
    }
    return null;
  },
  // Remove: errorText: errors['title'],
)
```

**File Size**: 506 lines - requires careful refactoring

---

### 3. Project Cover Step (`project_cover_step_view.dart`)
**Required Changes:**
- Apply same Form + validation gating pattern
- Update hardcoded colors to `AppColors`
- Loading spinner: Change to `AppColors.accentOrange`
- Upload button: Apply gradient styling
- File size: Unknown (needs reading)

---

### 4. Project Files Step (`project_files_step_view.dart`)
**Required Changes:**
- Apply same Form + validation gating pattern (if has required fields)
- Update hardcoded colors to `AppColors`
- Loading spinner: Change to `AppColors.accentOrange`
- Upload button: Apply gradient styling
- File size: Unknown (needs reading)

---

### 5. Payment Step (`payment_step_view.dart`)
**Required Changes:**
- Update hardcoded colors to `AppColors`
- Stripe UI elements: Use orange accent
- Payment buttons: Apply gradient styling
- File size: Unknown (needs reading)

---

## Implementation Strategy

Due to the size and complexity of the remaining files (esp. `project_details_step_view.dart` at 506 lines), the approach will be:

1. **Read each step file completely**
2. **Apply theme colors** (straightforward replacements)
3. **Implement Form validation gating** (structural changes)
4. **Test each step** before moving to next

---

## Key Validation Pattern

**OLD (Always shows errors):**
```dart
final errors = draft.validateStep1();

TextFormField(
  decoration: InputDecoration(
    errorText: errors['title'], // ❌ Shows immediately
  ),
)
```

**NEW (Shows only after submit attempt):**
```dart
bool _submitted = false;
final _formKey = GlobalKey<FormState>();

Form(
  key: _formKey,
  autovalidateMode: _submitted ? AutovalidateMode.onUserInteraction : AutovalidateMode.disabled,
  child: TextFormField(
    validator: (value) { // ✅ Only shows when _submitted = true
      if (value == null || value.trim().length < 10) {
        return 'Title must be at least 10 characters';
      }
      return null;
    },
  ),
)

// In onNext handler (from parent wizard):
void _validateAndProceed() {
  setState(() => _submitted = true);
  if (_formKey.currentState!.validate()) {
    widget.onNext();
  }
}
```

---

## Color Replacement Map

| Old | New |
|-----|-----|
| `Color(0xFF6D5FFD)` (purple) | `AppColors.accentOrange` |
| `Color(0xFF111827)` (hardcoded black) | `AppColors.textPrimary` |
| `Colors.grey.shade300` | `AppColors.borderLight` |
| `Colors.red` | `AppColors.error` |
| `Colors.orange` | `AppColors.accentOrange` |

---

## Testing Checklist (After All Changes)

- [ ] Open Create Project wizard
- [ ] Step 1: Fields have NO red borders initially
- [ ] Step 1: Press Continue with empty fields → Red borders + error messages appear
- [ ] Step 1: Fill one field correctly → Its error disappears immediately
- [ ] Step 2: Same validation behavior
- [ ] Step 3: Same validation behavior
- [ ] All buttons use orange/gradient styling
- [ ] Progress bar is orange
- [ ] No purple colors remaining

---

## Current Status Summary

**Completed:** 1/6 tasks (Main wizard page)
**Remaining:** 4 step view files + testing

**Estimated Complexity:**
- Details step: HIGH (large file, many fields, complex validation)
- Cover step: MEDIUM
- Files step: MEDIUM
- Payment step: LOW
- Testing: LOW

**Next Action:** Read and update `project_cover_step_view.dart`, `project_files_step_view.dart`, and `payment_step_view.dart` (simpler files first), then tackle the complex `project_details_step_view.dart`.
