# Terms & Conditions Acceptance Implementation

## Summary
Added Terms & Conditions acceptance gate that forces users to accept terms before accessing the app. Implementation includes database changes, backend API updates, and Flutter UI with navigation guards.

## Files Changed

### Backend

1. **`backendEsModule/migrations/add_terms_acceptance_fields.sql`** (NEW)
   - Adds `terms_accepted_at` and `terms_version` columns to users table

2. **`backendEsModule/config/terms.js`** (NEW)
   - Defines `CURRENT_TERMS_VERSION = "v1"`

3. **`backendEsModule/controller/user.js`**
   - Updated `login()` to include `must_accept_terms` and `terms_version_required` in response
   - Updated `verifyOTP()` to include terms fields in response
   - Updated `getUserdata()` to include terms fields and check acceptance status

4. **`backendEsModule/controller/auth.js`**
   - Added `acceptTerms()` function to handle terms acceptance
   - Updated `verifyTwoFactorLogin()` to include terms fields

5. **`backendEsModule/router/auth.js`**
   - Added `POST /auth/accept-terms` route (before terms check middleware)

6. **`backendEsModule/middleware/authentication.js`**
   - Added terms acceptance check for all protected routes
   - Returns 403 with code "TERMS_NOT_ACCEPTED" if terms not accepted
   - Excludes `/auth/accept-terms` endpoint from check

### Flutter

1. **`mobile_app/lib/core/models/user.dart`**
   - Added `mustAcceptTerms` and `termsVersionRequired` fields to User model

2. **`mobile_app/lib/features/auth/data/repositories/auth_repository.dart`**
   - Updated `login()` to parse terms fields from response
   - Updated `verifyOtp()` to parse terms fields from response
   - Updated `getUserData()` to parse terms fields from response
   - Added `acceptTerms()` method

3. **`mobile_app/lib/features/auth/presentation/providers/auth_provider.dart`**
   - Added `acceptTerms()` method

4. **`mobile_app/lib/features/auth/presentation/screens/login_screen.dart`**
   - Added check for `mustAcceptTerms` after login success
   - Redirects to `/accept-terms` if terms not accepted

5. **`mobile_app/lib/features/auth/presentation/screens/verify_otp_screen.dart`**
   - Added check for `mustAcceptTerms` after OTP verification success
   - Redirects to `/accept-terms` if terms not accepted

6. **`mobile_app/lib/features/auth/presentation/screens/accept_terms_screen.dart`** (NEW)
   - Full-screen terms acceptance UI
   - Displays Terms & Conditions and Refund Policy
   - Checkbox for agreement
   - Accept button that calls API
   - Blocks back navigation until accepted

7. **`mobile_app/lib/core/routing/app_router.dart`**
   - Added route for `/accept-terms`

## Database Migration

Run the SQL migration:
```sql
-- File: backendEsModule/migrations/add_terms_acceptance_fields.sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20) NULL;

CREATE INDEX IF NOT EXISTS idx_users_terms_accepted_at ON users(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_users_terms_version ON users(terms_version);
```

## API Endpoints

### POST `/auth/accept-terms`
- **Auth Required**: Yes
- **Request Body**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Terms & Conditions accepted successfully"
  }
  ```

### Updated Responses

All login/auth endpoints now include:
```json
{
  "must_accept_terms": true/false,
  "terms_version_required": "v1"
}
```

Protected endpoints return 403 if terms not accepted:
```json
{
  "success": false,
  "code": "TERMS_NOT_ACCEPTED",
  "message": "Terms & Conditions must be accepted before accessing this resource"
}
```

## Flow

1. **Registration**: User registers → navigates to login (no change)
2. **Login**: User logs in → backend checks terms → if not accepted, `must_accept_terms: true` in response
3. **Terms Check**: Flutter checks `mustAcceptTerms` → if true, navigates to `/accept-terms`
4. **Acceptance**: User reads terms, checks agreement, clicks Accept → calls `/auth/accept-terms`
5. **Continue**: After acceptance, user proceeds to main app (freelancer/client home)

## Manual Test Checklist

### Backend Tests
- [ ] Run database migration successfully
- [ ] New user registers → `terms_accepted_at` is NULL
- [ ] User logs in → response includes `must_accept_terms: true`
- [ ] User calls protected API without accepting terms → receives 403 with code "TERMS_NOT_ACCEPTED"
- [ ] User calls `/auth/accept-terms` → `terms_accepted_at` and `terms_version` are updated
- [ ] User logs in after acceptance → `must_accept_terms: false`
- [ ] User can access protected APIs after acceptance

### Flutter Tests
- [ ] New user registers → navigates to login
- [ ] User logs in → redirected to `/accept-terms` screen
- [ ] Terms screen displays Terms & Conditions and Refund Policy correctly
- [ ] Back button is disabled on terms screen
- [ ] Accept button is disabled until checkbox is checked
- [ ] User accepts terms → navigates to appropriate home screen (freelancer/client)
- [ ] User logs in again → goes directly to home (no terms screen)
- [ ] User verifies OTP → if terms not accepted, redirected to terms screen
- [ ] Terms version mismatch → user must re-accept terms

### Edge Cases
- [ ] User force-closes app during terms screen → on reopen, still forced to accept
- [ ] Network error during acceptance → error message shown, user can retry
- [ ] User navigates directly to protected route → backend blocks with 403
- [ ] Terms version updated → existing users must re-accept

## Notes

- Terms acceptance is enforced at backend level (source of truth)
- Frontend navigation guards provide UX but backend is authoritative
- Terms version allows forcing re-acceptance when terms change
- All protected routes are blocked until terms accepted
- `/auth/accept-terms` endpoint is excluded from terms check to allow acceptance
