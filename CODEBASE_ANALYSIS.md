# OrderzHouse Codebase - Comprehensive Analysis

## Executive Summary

OrderzHouse is a full-stack freelancing marketplace platform connecting clients with freelancers. The system consists of:
- **Backend**: Node.js/Express API with PostgreSQL (ES Modules)
- **Mobile App**: Flutter (Dart) with Riverpod state management
- **Frontend Web**: React with Redux (Vite + Tailwind CSS)

The platform supports project posting, bidding, assignments, real-time messaging, payments via Stripe, subscriptions, and comprehensive admin controls.

---

## 1. High-Level Architecture

### System Components

```
┌─────────────────┐
│  Flutter Mobile  │  ← Riverpod State Management
│   (Dart/Flutter) │  ← GoRouter Navigation
└────────┬─────────┘
         │ HTTP/REST + Socket.io
         │
┌────────▼─────────────────────────┐
│   Express.js Backend (Node.js)   │
│   - REST API                     │
│   - Socket.io (Real-time)        │
│   - JWT Authentication           │
│   - Stripe Integration           │
└────────┬─────────────────────────┘
         │
┌────────▼─────────┐
│  PostgreSQL DB   │
│  - 26+ Tables   │
│  - Soft Deletes │
└─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js with ES Modules
- Express.js 5.x
- PostgreSQL (pg library)
- Socket.io 4.x
- JWT (jsonwebtoken)
- Stripe SDK
- Cloudinary (file storage)
- Nodemailer (email)
- Bcrypt (password hashing)
- Speakeasy (2FA/TOTP)

**Mobile (Flutter):**
- Flutter SDK 3.10+
- Riverpod 2.5 (state management)
- GoRouter 13.2 (navigation)
- Dio 5.4 (HTTP client)
- Freezed + JSON Serializable (models)
- Flutter Secure Storage (tokens)
- Socket.io Client (real-time)

**Frontend Web:**
- React 18
- Redux Toolkit
- Vite
- Tailwind CSS
- Socket.io Client

---

## 2. Application Flow

### Launch → Authentication → Core Features

```
1. App Launch
   └─> SplashScreen
       └─> Check stored JWT token
           ├─> Token exists → Fetch user data
           │   ├─> Terms not accepted? → AcceptTermsScreen
           │   └─> Terms accepted → Role-based home
           └─> No token → OnboardingScreen

2. Onboarding
   └─> LoginScreen / RegisterScreen

3. Registration Flow
   └─> RegisterScreen
       └─> POST /users/register
           └─> VerifyEmailScreen
               └─> POST /users/verify-email
                   └─> LoginScreen

4. Login Flow
   └─> LoginScreen
       └─> POST /users/login
           ├─> Direct login (no OTP/2FA) → Home
           ├─> OTP required → VerifyOtpScreen
           │   └─> POST /users/verify-otp → Home
           └─> 2FA enabled → 2FA Screen
               └─> POST /auth/2fa/verify-login → Home

5. Terms Acceptance (NEW)
   └─> AcceptTermsScreen (forced if not accepted)
       └─> POST /auth/accept-terms
           └─> Continue to home

6. Home Screen (Role-based)
   ├─> FreelancerHomeScreen (role_id = 3)
   │   ├─> Browse Projects
   │   ├─> My Projects
   │   ├─> Offers/Bids
   │   └─> Profile/Settings
   └─> ClientHomeScreen (role_id = 2)
       ├─> Create Project
       ├─> My Projects
       ├─> Manage Applications/Offers
       └─> Profile/Settings
```

### Project Lifecycle Flow

**Client Side:**
```
Create Project → Project Status: 'active'
    ↓
Freelancers Apply/Submit Offers
    ↓
Client Reviews → Assign/Accept Offer
    ↓
Project Status: 'in_progress'
    ↓
Freelancer Submits Delivery
    ↓
Client Reviews → Approve/Request Changes
    ↓
Project Status: 'completed'
    ↓
Client Rates Freelancer
```

**Freelancer Side:**
```
Browse Projects → Apply/Submit Offer
    ↓
Client Accepts → Assignment Created
    ↓
Accept Assignment → Project Status: 'in_progress'
    ↓
Work on Project → Submit Delivery
    ↓
Client Approves → Project Status: 'completed'
    ↓
Receive Rating
```

---

## 3. Folder Structure & Responsibilities

### Backend (`backendEsModule/`)

```
backendEsModule/
├── config/
│   └── terms.js                    # Terms version constant
├── controller/                     # Business logic handlers
│   ├── auth.js                     # 2FA, password change
│   ├── user.js                     # User CRUD, login, registration
│   ├── projectsManagment/
│   │   ├── projects.js             # Project CRUD, assignments, deliveries
│   │   └── assignments.js         # Assignment queries
│   ├── offers.js                   # Bidding system
│   ├── tasks.js                    # Task system (freelancer-created)
│   ├── chats.js                    # Chat endpoints
│   ├── messages.js                 # Socket.io message handler
│   ├── notifications.js            # Notification CRUD
│   ├── payments.js                 # Payment queries
│   ├── plans-subscriptions/        # Subscription management
│   ├── Stripe/                     # Stripe integration
│   │   ├── stripe.js               # Checkout session creation
│   │   ├── stripeWebhook.js        # Webhook handler
│   │   └── confirmCheckoutSession.js
│   └── ...
├── middleware/
│   ├── authentication.js           # JWT verification + terms check
│   ├── adminOnly.js                # Admin role check
│   ├── requireVerifiedWithSubscription.js  # Freelancer verification+subscription
│   └── ...
├── router/                         # Express route definitions
├── services/
│   ├── notificationService.js      # Notification creation/emission
│   ├── loggingService.js           # Activity logging
│   └── ...
├── sockets/
│   └── socket.js                   # Socket.io setup & handlers
├── cron/                           # Scheduled jobs
│   ├── expireSubscriptions.js
│   ├── autoExpireOldOffers.js
│   ├── realTimeDeadlineWatcher.js
│   └── cleanupDeactivatedUsers.js
├── migrations/                     # Database migrations
├── models/
│   └── db.js                       # PostgreSQL connection pool
└── index.js                        # Server entry point
```

### Mobile App (`mobile_app/lib/`)

```
mobile_app/lib/
├── main.dart                       # App entry point
├── core/
│   ├── config/
│   │   └── app_config.dart        # API base URL, env vars
│   ├── models/                     # Shared data models
│   │   ├── user.dart              # User model (Freezed)
│   │   ├── project.dart           # Project model
│   │   ├── api_response.dart      # Generic API response wrapper
│   │   └── ...
│   ├── network/
│   │   ├── dio_client.dart        # Dio singleton
│   │   ├── dio_interceptors.dart  # Auth, logging, error, retry
│   │   └── health_check_service.dart
│   ├── routing/
│   │   └── app_router.dart        # GoRouter configuration
│   ├── storage/
│   │   └── secure_storage_service.dart  # JWT token storage
│   ├── theme/                      # App theming
│   └── widgets/                    # Reusable widgets
├── features/                       # Feature-based modules
│   ├── auth/
│   │   ├── data/
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart  # Riverpod StateNotifier
│   │       └── screens/
│   │           ├── login_screen.dart
│   │           ├── register_screen.dart
│   │           ├── accept_terms_screen.dart
│   │           └── ...
│   ├── projects/
│   │   ├── data/
│   │   │   └── repositories/
│   │   │       └── projects_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       └── pages/
│   ├── client/                     # Client-specific screens
│   ├── freelancer/                 # Freelancer-specific screens
│   ├── common/                     # Shared screens (profile, settings, etc.)
│   ├── notifications/
│   ├── offers/
│   ├── payments/
│   ├── subscriptions/
│   └── ...
└── providers/                       # Legacy providers (being migrated)
```

### Frontend Web (`frontend/src/`)

```
frontend/src/
├── components/                     # React components
├── adminDash/                      # Admin panel
├── slice/                         # Redux slices
├── store/                         # Redux store
└── services/                       # API clients
```

---

## 4. Key Business Entities

### Users & Roles
- **Roles**: Admin (1), Client (2), Freelancer (3)
- **User Fields**: email, password (bcrypt), profile_pic_url, email_verified, is_verified, is_deleted, terms_accepted_at, terms_version
- **Freelancer Requirements**: Must be verified (`is_verified = true`) AND have active subscription for certain actions

### Projects
- **Types**: `fixed`, `hourly`, `bidding`
- **Status Flow**: `active` → `bidding` → `in_progress` → `completed` / `cancelled`
- **Completion Status**: `not_started`, `in_progress`, `completed`
- **Relationships**: 
  - One project → Many assignments
  - One project → Many offers (if bidding)
  - One project → Many deliveries
  - One project → Many messages

### Project Assignments
- **Types**: `by_client` (direct invite), `application` (freelancer applied), `offer` (from bidding)
- **Status**: `pending_acceptance` → `active` / `rejected` → `in_progress` → `completed`
- Links freelancer to project

### Offers (Bidding System)
- **Status**: `pending` → `accepted` / `rejected` / `cancelled` / `expired`
- Only one offer can be accepted per project
- Budget validation against project's `budget_min` and `budget_max`
- Auto-expiration via cron job

### Tasks
- **Freelancer-created tasks** (reverse model)
- Clients browse task pool and request tasks
- Payment proof required from client
- Freelancer approves/rejects requests

### Payments & Subscriptions
- **Payment Purposes**: `plan` (subscription), `project` (project payment)
- **Currency**: JOD (Jordanian Dinar)
- **Stripe Integration**: Checkout sessions, webhooks
- **Subscription Status**: `active`, `cancelled`, `expired`
- **Verification Fee**: Optional 25 JOD when subscribing (if not verified)

### Messages & Chats
- **Types**: Project-based, Task-based, Direct (future)
- **Real-time**: Socket.io for live messaging
- **Storage**: PostgreSQL `messages` table
- **File Attachments**: Array of file URLs

### Notifications
- **Types**: 50+ notification types (project, offer, delivery, payment, etc.)
- **Delivery**: Socket.io real-time + database persistence
- **Role-based**: Different notification types per role
- **Read Status**: Tracked in database

### Categories
- **3-Level Hierarchy**: Categories → Sub-categories → Sub-sub-categories
- **Freelancer Categories**: Junction table linking freelancers to main categories
- **Project Categorization**: Projects linked to all 3 levels

---

## 5. State Management & Data Handling

### Mobile App (Flutter + Riverpod)

**Pattern**: Feature-based providers with Riverpod StateNotifier

**Key Providers:**
- `authStateProvider`: Global auth state (user, token, loading, error)
- `categoriesProvider`: Category hierarchy
- `projectsProvider`: Project list/state
- `notificationsProvider`: Notification list/count
- `subscriptionsProvider`: Subscription status

**State Flow:**
```
Repository (API calls)
    ↓
Provider (StateNotifier)
    ↓
Screen (ConsumerWidget/ConsumerStatefulWidget)
    ↓
UI Updates
```

**Data Models:**
- Freezed classes for immutability
- JSON serialization via `json_serializable`
- Type-safe with null safety

**Storage:**
- JWT tokens: `flutter_secure_storage`
- User preferences: `shared_preferences` (if needed)

### Backend State

**No server-side state management** - Stateless API
- All state in PostgreSQL
- JWT tokens are stateless (no server-side session)
- Socket.io rooms for real-time state

---

## 6. API / Backend Interaction

### API Architecture

**Base URL**: `https://orderzhouse-backend.onrender.com` (production)

**Authentication**: JWT Bearer token in `Authorization` header
```
Authorization: Bearer <jwt-token>
```

**Response Format:**
```json
{
  "success": true/false,
  "message": "string",
  "data": {...}  // Optional
}
```

**Error Format:**
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"  // Optional (e.g., "TERMS_NOT_ACCEPTED")
}
```

### Key Endpoints by Feature

**Authentication:**
- `POST /users/register` - Register
- `POST /users/login` - Login
- `POST /users/verify-otp` - Verify OTP
- `POST /auth/accept-terms` - Accept terms (NEW)
- `POST /auth/2fa/*` - 2FA management

**Projects:**
- `POST /projects` - Create project
- `GET /projects/myprojects` - Get user's projects
- `POST /projects/:id/apply` - Apply for project
- `POST /projects/:id/assign` - Assign freelancer
- `POST /projects/:id/deliver` - Submit delivery
- `PUT /projects/:id/approve` - Approve delivery

**Offers:**
- `GET /offers/projects/open` - Get open bidding projects
- `POST /offers/:projectId/offers` - Send offer
- `POST /offers/offers/approve-reject` - Approve/reject offer

**Payments:**
- `POST /stripe/create-checkout-session` - Create Stripe session
- `GET /stripe/confirm` - Confirm payment
- `GET /payments/user/:userId` - Get payment history

**Real-time (Socket.io):**
- `join_room` - Join project/task chat room
- `message` - Send message
- `notification:new` - Receive notification

### Middleware Chain

```
Request → CORS → JSON Parser → Authentication → Authorization → Handler
```

**Authentication Middleware:**
- Validates JWT token
- Checks user deletion status
- **NEW**: Checks terms acceptance (blocks if not accepted, except `/auth/accept-terms`)

**Authorization Middleware:**
- `adminOnly`: Role ID must be 1
- `requireVerifiedWithSubscription`: Freelancers must be verified + subscribed

---

## 7. Authentication & Authorization Logic

### Authentication Flow

1. **Registration:**
   - User registers → Email OTP sent → Verify email → Can login

2. **Login:**
   - Email + Password → JWT token returned
   - If 3+ failed attempts → OTP required
   - If 2FA enabled → Temp token → 2FA verification → Full token

3. **Token Structure:**
   ```json
   {
     "userId": number,
     "role": number,
     "is_verified": boolean,
     "username": string,
     "is_deleted": boolean,
     "is_two_factor_enabled": boolean
   }
   ```

4. **Token Expiration**: 1 day (24 hours)

5. **Terms Acceptance (NEW):**
   - After login, check `must_accept_terms` flag
   - If true → Force navigation to `/accept-terms`
   - Backend blocks all protected routes until accepted
   - Terms version tracked (`CURRENT_TERMS_VERSION = "v1"`)

### Authorization Rules

**Role-Based Access:**
- **Admin (1)**: Full access to all endpoints
- **Client (2)**: Can create projects, manage applications, approve deliveries
- **Freelancer (3)**: 
  - Public: Browse projects, view categories
  - Verified + Subscribed: Apply, submit offers, accept assignments, deliver work

**Freelancer Restrictions:**
- Must be `is_verified = true` (via subscription with verification fee OR admin approval)
- Must have active subscription in `subscriptions` table
- Enforced by `requireVerifiedWithSubscription` middleware

**Account Deactivation:**
- Soft delete: `is_deleted = true`
- 30-day grace period (can reactivate by logging in)
- Permanent deletion after 30 days (cron job)

---

## 8. Payment & Escrow Flow

### Subscription Payment Flow

```
1. User selects plan → POST /stripe/create-checkout-session
   ├─> Plan price
   └─> Optional: +25 JOD verification fee (if not verified)

2. Stripe Checkout Session created
   └─> Metadata: user_id, plan_id, includes_verification_fee

3. User completes payment on Stripe
   └─> Stripe webhook: checkout.session.completed

4. Webhook Handler:
   ├─> Insert payment record
   ├─> Mark user as verified (if fee included)
   └─> Create subscription (start_date, end_date calculated)

5. User redirected to success URL
   └─> GET /stripe/confirm?session_id=...
       └─> Verify payment status
           └─> Update subscription if needed
```

### Project Payment Flow (Future/Planned)

- Similar flow but `purpose = 'project'`
- Project ID in metadata
- Payment held in escrow (conceptual, not fully implemented)

### Refund Policy (NEW)

- Refunds credited to ORDERZHOUSE Wallet (in-platform credit)
- Not processed as cash-out unless exceptional cases
- 21-day dispute review timeline
- Partial refunds supported

---

## 9. Real-time Features (Socket.io)

### Connection Setup

**Backend:**
- Socket.io server attached to HTTP server
- Authentication via `authSocket` middleware (JWT token in handshake)
- User joins personal room: `user:${userId}`

**Mobile/Web:**
- Connect with JWT token in `auth` object
- Join project/task rooms for chat
- Listen for notifications in personal room

### Events

**Message Events:**
- `join_room` - Join project/task chat room
- `message` - Send/receive message
- `message_error` - Error sending message
- `message_blocked` - Message filtered (inappropriate content)

**Notification Events:**
- `notification:new` - New notification received
- Emitted to user's personal room: `user:${userId}`

**Online Status:**
- `is_online` field updated on connect/disconnect

---

## 10. Error Handling & Edge Cases

### Backend Error Handling

**Standard Error Responses:**
- `400 Bad Request`: Validation errors, missing fields
- `401 Unauthorized`: Invalid/missing token, deleted account
- `403 Forbidden`: 
  - No token
  - Terms not accepted (NEW)
  - Not verified/subscribed (freelancers)
  - Not admin (admin-only endpoints)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

**Error Logging:**
- System logs stored in `logs` table
- Log levels: `info`, `warn`, `error`, `critical`
- Activity logs for user actions (via `loggingService`)

### Mobile App Error Handling

**Dio Interceptors:**
- `AuthInterceptor`: Adds JWT token to requests
- `ErrorInterceptor`: Handles 401/403 → Redirect to login
- `RetryInterceptor`: Retries failed requests
- `LoggingInterceptor`: Logs requests/responses (dev mode)

**Error States:**
- Provider states include `error` field
- UI shows error messages via SnackBar
- Network errors handled gracefully

### Edge Cases Handled

1. **Token Expiration**: Redirect to login
2. **Account Deletion**: Checked on every auth middleware call
3. **Terms Acceptance**: Backend blocks all routes until accepted
4. **Subscription Expiration**: Checked via `hasActiveSubscription` utility
5. **Offer Expiration**: Cron job auto-expires old offers
6. **Project Status Transitions**: Validated in controllers
7. **Duplicate Offers**: Prevented (one pending/accepted per freelancer per project)
8. **Assignment Conflicts**: Freelancer can't have multiple active assignments
9. **File Upload Limits**: Max 10 files for projects, 5 for tasks
10. **OTP Expiration**: 2-5 minutes expiry

---

## 11. Technical Debt, Risks & Limitations

### Technical Debt

1. **Legacy Code Structure:**
   - Some providers in `lib/providers/` (should be in features)
   - Duplicate models in `lib/models/` and `lib/core/models/`
   - Mixed patterns (some screens use old structure)

2. **Database:**
   - No explicit foreign key constraints in some relationships
   - Some queries could be optimized (N+1 potential)
   - Missing indexes on some frequently queried columns

3. **Error Handling:**
   - Inconsistent error response formats
   - Some endpoints don't return proper error codes
   - Limited error logging in some controllers

4. **Testing:**
   - Minimal test coverage (only 1 test file found)
   - No integration tests
   - No E2E tests

5. **Documentation:**
   - API documentation exists but may be outdated
   - Code comments are minimal
   - Some complex business logic lacks documentation

### Risks

1. **Security:**
   - JWT tokens stored client-side (mitigated by secure storage)
   - No rate limiting on most endpoints (commented out)
   - File upload validation could be stricter
   - SQL injection risk mitigated by parameterized queries, but should audit all queries

2. **Scalability:**
   - Single database instance (no read replicas)
   - Socket.io on single server (no Redis adapter for scaling)
   - No caching layer (Redis/Memcached)
   - File storage on Cloudinary (external dependency)

3. **Data Integrity:**
   - Soft deletes used but some hard deletes exist
   - No database transactions in some multi-step operations
   - Race conditions possible in offer/assignment logic

4. **Payment:**
   - Stripe webhook idempotency handled but could be improved
   - No escrow system fully implemented (conceptual only)
   - Refund policy new, not fully tested

5. **Real-time:**
   - Socket.io rooms not cleaned up on disconnect (potential memory leak)
   - No reconnection strategy documented
   - Message delivery not guaranteed (no acknowledgment)

### Limitations

1. **Features:**
   - No video/voice chat
   - No file versioning for deliveries
   - No project templates
   - No escrow system (payments not held)
   - No dispute resolution workflow (manual admin intervention)

2. **Mobile App:**
   - No offline support
   - No push notifications (only in-app)
   - No background sync
   - Limited file preview capabilities

3. **Performance:**
   - No pagination on some list endpoints
   - Large payloads (projects with all relations)
   - No CDN for static assets
   - No image optimization/compression

4. **Internationalization:**
   - English only (no i18n)
   - Hardcoded currency (JOD)
   - No timezone handling

---

## 12. Key Patterns & Conventions

### Backend Patterns

1. **Controller Pattern**: Business logic in controllers, not routes
2. **Middleware Chain**: Authentication → Authorization → Handler
3. **Event-Driven**: EventBus for notifications (decoupled)
4. **Service Layer**: Separate services for notifications, logging
5. **Repository Pattern**: Not used (direct DB queries in controllers)

### Mobile Patterns

1. **Feature-Based Architecture**: Features organized by domain
2. **Repository Pattern**: Data layer abstracts API calls
3. **Provider Pattern**: Riverpod StateNotifier for state management
4. **Freezed Models**: Immutable data models
5. **Dependency Injection**: Via Riverpod providers

### Naming Conventions

**Backend:**
- Controllers: `camelCase` (e.g., `assignFreelancer`)
- Routes: `kebab-case` (e.g., `/projects/:id/assign`)
- Tables: `snake_case` (e.g., `project_assignments`)

**Mobile:**
- Files: `snake_case` (e.g., `auth_provider.dart`)
- Classes: `PascalCase` (e.g., `AuthNotifier`)
- Variables: `camelCase` (e.g., `authState`)

---

## 13. Database Schema Highlights

### Key Tables

- `users`: Core user data, authentication fields, terms acceptance
- `projects`: Project listings with budgets, types, status
- `project_assignments`: Links freelancers to projects
- `offers`: Bidding offers on projects
- `messages`: Chat messages (project/task-based)
- `notifications`: User notifications
- `payments`: Payment records (Stripe integration)
- `subscriptions`: User subscription plans
- `plans`: Available subscription plans
- `ratings`: Client ratings of freelancers
- `tasks`: Freelancer-created tasks
- `categories`: 3-level category hierarchy

### Relationships

- Users → Projects (one-to-many, as client)
- Users → Assignments (one-to-many, as freelancer)
- Projects → Assignments (one-to-many)
- Projects → Offers (one-to-many)
- Projects → Deliveries (one-to-many)
- Users → Subscriptions (one-to-many)

---

## 14. Cron Jobs & Scheduled Tasks

1. **expireSubscriptions**: Expires subscriptions past `end_date`
2. **autoExpireOldOffers**: Expires offers past `expires_at`
3. **realTimeDeadlineWatcher**: Watches project deadlines (real-time)
4. **cleanupDeactivatedUsers**: Permanently deletes users deactivated >30 days

---

## 15. File Upload & Storage

**Backend:**
- Multer for multipart/form-data
- Cloudinary for file storage
- Files stored with URLs in database

**Supported:**
- Profile pictures
- Project cover images
- Project files (max 10)
- Task files
- Delivery files
- Message attachments

---

## Summary

OrderzHouse is a well-structured freelancing platform with:
- ✅ Clean separation of concerns (backend/mobile/frontend)
- ✅ Comprehensive feature set (projects, offers, tasks, messaging, payments)
- ✅ Real-time capabilities (Socket.io)
- ✅ Payment integration (Stripe)
- ✅ Role-based access control
- ✅ Terms acceptance gating (NEW)
- ⚠️ Some technical debt (testing, documentation, scalability)
- ⚠️ Security improvements needed (rate limiting, input validation)
- ⚠️ Performance optimizations possible (caching, pagination)

The codebase follows modern patterns and is production-ready with room for improvements in testing, scalability, and feature completeness.
