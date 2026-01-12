# Database Schema - OrderzHouse Backend

Complete database schema reference for PostgreSQL database used by OrderzHouse backend.

## Database: PostgreSQL

All tables use PostgreSQL data types and constraints. Timestamps are stored as `TIMESTAMP` with timezone support.

---

## Core Tables

### 1. `users`

Main user accounts table storing all user information.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique user ID |
| `role_id` | INTEGER | NOT NULL, FK → `roles.id` | User role (1=Admin, 2=Client, 3=Freelancer) |
| `username` | VARCHAR | UNIQUE, NOT NULL | Username |
| `email` | VARCHAR | UNIQUE, NOT NULL | Email address (lowercase) |
| `password` | VARCHAR | NOT NULL | Bcrypt hashed password |
| `first_name` | VARCHAR | | User's first name |
| `last_name` | VARCHAR | | User's last name |
| `phone_number` | VARCHAR | | Phone number |
| `country` | VARCHAR | | Country |
| `profile_pic_url` | TEXT | | URL to profile picture (Cloudinary) |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `email_otp` | VARCHAR | | Email verification OTP code |
| `email_otp_expires` | TIMESTAMP | | OTP expiration timestamp |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Account verification status (for freelancers) |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `deactivated_at` | TIMESTAMP | | Account deactivation timestamp |
| `reason_for_disruption` | TEXT | | Reason for account deactivation |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | Failed login attempt counter |
| `otp_code` | VARCHAR | | Login OTP code |
| `otp_expires` | TIMESTAMP | | Login OTP expiration |
| `two_factor_secret` | VARCHAR | | TOTP secret for 2FA |
| `is_two_factor_enabled` | BOOLEAN | DEFAULT FALSE | 2FA enabled status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `email` (unique)
- `username` (unique)
- `role_id`

**Relationships:**
- `role_id` → `roles.id`
- One-to-many with `projects` (as client)
- One-to-many with `project_assignments` (as freelancer)
- One-to-many with `subscriptions`
- One-to-many with `payments`
- One-to-many with `messages`
- One-to-many with `ratings` (as rated freelancer)

---

### 2. `roles`

User roles table.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Role ID |
| `name` | VARCHAR | UNIQUE, NOT NULL | Role name (admin, client, freelancer) |

**Default Roles:**
- `1` = Admin
- `2` = Client
- `3` = Freelancer

---

### 3. `categories`

Main project categories (level 0).

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Category ID |
| `name` | VARCHAR | NOT NULL | Category name |
| `description` | TEXT | | Category description |
| `level` | INTEGER | DEFAULT 0 | Category level (0 for main) |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- One-to-many with `sub_categories`
- One-to-many with `projects`
- Many-to-many with `users` via `freelancer_categories`

---

### 4. `sub_categories`

Sub-categories (level 1).

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Sub-category ID |
| `category_id` | INTEGER | NOT NULL, FK → `categories.id` | Parent category |
| `name` | VARCHAR | NOT NULL | Sub-category name |
| `description` | TEXT | | Description |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `category_id` → `categories.id`
- One-to-many with `sub_sub_categories`
- One-to-many with `projects`

---

### 5. `sub_sub_categories`

Sub-sub-categories (level 2).

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Sub-sub-category ID |
| `sub_category_id` | INTEGER | NOT NULL, FK → `sub_categories.id` | Parent sub-category |
| `name` | VARCHAR | NOT NULL | Sub-sub-category name |
| `description` | TEXT | | Description |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `sub_category_id` → `sub_categories.id`
- One-to-many with `projects`

---

### 6. `freelancer_categories`

Junction table linking freelancers to main categories.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Record ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer user ID |
| `category_id` | INTEGER | NOT NULL, FK → `categories.id` | Category ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE(`freelancer_id`, `category_id`)

**Relationships:**
- `freelancer_id` → `users.id` (CASCADE DELETE)
- `category_id` → `categories.id`

---

### 7. `freelancer_sub_categories`

Junction table linking freelancers to sub-categories.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Record ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer user ID |
| `sub_category_id` | INTEGER | NOT NULL, FK → `sub_categories.id` | Sub-category ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE(`freelancer_id`, `sub_category_id`)

**Relationships:**
- `freelancer_id` → `users.id` (CASCADE DELETE)
- `sub_category_id` → `sub_categories.id` (CASCADE DELETE)

---

## Projects & Assignments

### 8. `projects`

Project listings created by clients.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Project ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | Client/owner ID |
| `category_id` | INTEGER | NOT NULL, FK → `categories.id` | Main category |
| `sub_category_id` | INTEGER | FK → `sub_categories.id` | Sub-category |
| `sub_sub_category_id` | INTEGER | NOT NULL, FK → `sub_sub_categories.id` | Sub-sub-category |
| `title` | VARCHAR | NOT NULL | Project title (10-100 chars) |
| `description` | TEXT | NOT NULL | Project description (100-2000 chars) |
| `budget` | DECIMAL | | Fixed project budget |
| `budget_min` | DECIMAL | | Minimum budget (bidding) |
| `budget_max` | DECIMAL | | Maximum budget (bidding) |
| `hourly_rate` | DECIMAL | | Hourly rate (hourly projects) |
| `duration_days` | INTEGER | | Duration in days |
| `duration_hours` | INTEGER | | Duration in hours |
| `project_type` | VARCHAR | NOT NULL | Type: 'fixed', 'hourly', 'bidding' |
| `preferred_skills` | TEXT | | Preferred skills |
| `cover_pic` | TEXT | | Cover picture URL (Cloudinary) |
| `status` | VARCHAR | DEFAULT 'active' | Status: 'active', 'bidding', 'in_progress', 'completed', 'cancelled' |
| `completion_status` | VARCHAR | DEFAULT 'not_started' | Completion: 'not_started', 'in_progress', 'completed' |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `user_id`
- `category_id`
- `sub_sub_category_id`
- `status`
- `project_type`

**Relationships:**
- `user_id` → `users.id` (client/owner)
- `category_id` → `categories.id`
- `sub_category_id` → `sub_categories.id`
- `sub_sub_category_id` → `sub_sub_categories.id`
- One-to-many with `project_assignments`
- One-to-many with `offers`
- One-to-many with `project_files`
- One-to-many with `project_deliveries`
- One-to-many with `messages` (via project_id)

---

### 9. `project_assignments`

Freelancer assignments to projects.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Assignment ID |
| `project_id` | INTEGER | NOT NULL, FK → `projects.id` | Project ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer ID |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'accepted', 'rejected', 'in_progress', 'completed' |
| `assignment_type` | VARCHAR | | Type: 'direct_assign', 'application', 'offer' |
| `user_invited` | INTEGER | FK → `users.id` | User who created assignment |
| `assigned_at` | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |
| `deadline` | TIMESTAMP | | Project deadline |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `project_id`
- `freelancer_id`
- `status`

**Relationships:**
- `project_id` → `projects.id`
- `freelancer_id` → `users.id`
- `user_invited` → `users.id`

---

### 10. `offers`

Bids/offers made by freelancers on bidding projects.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Offer ID |
| `project_id` | INTEGER | NOT NULL, FK → `projects.id` | Project ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer ID |
| `amount` | DECIMAL | NOT NULL | Offer amount |
| `message` | TEXT | | Offer message |
| `delivery_days` | INTEGER | NOT NULL | Estimated delivery days |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'accepted', 'rejected', 'cancelled', 'expired' |
| `expires_at` | TIMESTAMP | | Offer expiration (if applicable) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `project_id`
- `freelancer_id`
- `status`

**Relationships:**
- `project_id` → `projects.id`
- `freelancer_id` → `users.id`

---

### 11. `project_files`

Files attached to projects.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | File ID |
| `project_id` | INTEGER | NOT NULL, FK → `projects.id` | Project ID |
| `file_url` | TEXT | NOT NULL | File URL (Cloudinary) |
| `file_name` | VARCHAR | | Original file name |
| `file_type` | VARCHAR | | File MIME type |
| `file_size` | INTEGER | | File size in bytes |
| `uploaded_by` | INTEGER | FK → `users.id` | User who uploaded |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Relationships:**
- `project_id` → `projects.id`
- `uploaded_by` → `users.id`

---

### 12. `project_deliveries`

Project delivery submissions by freelancers.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Delivery ID |
| `project_id` | INTEGER | NOT NULL, FK → `projects.id` | Project ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer ID |
| `message` | TEXT | | Delivery message |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'approved', 'rejected', 'changes_requested' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Submission timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `project_id` → `projects.id`
- `freelancer_id` → `users.id`
- One-to-many with `delivery_files`

---

### 13. `delivery_files`

Files attached to project deliveries.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | File ID |
| `delivery_id` | INTEGER | NOT NULL, FK → `project_deliveries.id` | Delivery ID |
| `file_url` | TEXT | NOT NULL | File URL (Cloudinary) |
| `file_name` | VARCHAR | | Original file name |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Relationships:**
- `delivery_id` → `project_deliveries.id`

---

## Tasks

### 14. `tasks`

Tasks created by freelancers.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Task ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer creator ID |
| `category_id` | INTEGER | FK → `categories.id` | Task category |
| `title` | VARCHAR | NOT NULL | Task title |
| `description` | TEXT | NOT NULL | Task description |
| `budget` | DECIMAL | NOT NULL | Task budget |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'approved', 'active', 'completed', 'cancelled' |
| `kanban_status` | VARCHAR | | Kanban board status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `freelancer_id` → `users.id`
- `category_id` → `categories.id`
- One-to-many with `task_requests`
- One-to-many with `task_files`

---

### 15. `task_requests`

Client requests for tasks.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Request ID |
| `task_id` | INTEGER | NOT NULL, FK → `tasks.id` | Task ID |
| `client_id` | INTEGER | NOT NULL, FK → `users.id` | Client ID |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'accepted', 'rejected', 'in_progress', 'completed' |
| `payment_proof_url` | TEXT | | Payment proof file URL |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Request timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `task_id` → `tasks.id`
- `client_id` → `users.id`
- One-to-many with `task_request_files`

---

## Payments & Subscriptions

### 16. `plans`

Subscription plans.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Plan ID |
| `name` | VARCHAR | NOT NULL | Plan name |
| `description` | TEXT | | Plan description |
| `price` | DECIMAL | NOT NULL | Plan price (JOD) |
| `duration` | INTEGER | NOT NULL | Duration in days |
| `plan_type` | VARCHAR | NOT NULL | Type: 'monthly', 'yearly' |
| `features` | JSONB | | Plan features (JSON) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- One-to-many with `subscriptions`
- One-to-many with `payments` (via plan_id)

---

### 17. `subscriptions`

User subscriptions to plans.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Subscription ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | User ID |
| `plan_id` | INTEGER | NOT NULL, FK → `plans.id` | Plan ID |
| `status` | VARCHAR | DEFAULT 'active' | Status: 'active', 'cancelled', 'expired' |
| `start_date` | TIMESTAMP | NOT NULL | Subscription start date |
| `end_date` | TIMESTAMP | NOT NULL | Subscription end date |
| `cancelled_at` | TIMESTAMP | | Cancellation timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `user_id`
- `status`
- `end_date`

**Relationships:**
- `user_id` → `users.id`
- `plan_id` → `plans.id`

---

### 18. `payments`

Payment records.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Payment ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | User ID |
| `plan_id` | INTEGER | FK → `plans.id` | Plan ID (if purpose='plan') |
| `amount` | DECIMAL | NOT NULL | Payment amount (JOD) |
| `currency` | VARCHAR | DEFAULT 'JOD' | Currency code |
| `purpose` | VARCHAR | NOT NULL | Purpose: 'plan', 'project' |
| `reference_id` | INTEGER | | Reference ID (plan_id or project_id) |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'paid', 'failed', 'refunded' |
| `stripe_session_id` | VARCHAR | UNIQUE | Stripe checkout session ID |
| `stripe_payment_intent` | VARCHAR | | Stripe payment intent ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Payment timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `user_id`
- `stripe_session_id` (unique)
- `status`
- `purpose`

**Relationships:**
- `user_id` → `users.id`
- `plan_id` → `plans.id` (if purpose='plan')
- `reference_id` → `projects.id` (if purpose='project')

---

## Messaging & Communication

### 19. `messages`

Chat messages between users.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Message ID |
| `sender_id` | INTEGER | NOT NULL, FK → `users.id` | Sender user ID |
| `receiver_id` | INTEGER | FK → `users.id` | Receiver user ID (if direct message) |
| `project_id` | INTEGER | FK → `projects.id` | Project ID (if project chat) |
| `task_id` | INTEGER | FK → `tasks.id` | Task ID (if task chat) |
| `content` | TEXT | NOT NULL | Message content |
| `file_urls` | TEXT[] | | Array of file URLs |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Message timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `sender_id`
- `receiver_id`
- `project_id`
- `task_id`
- `created_at`

**Relationships:**
- `sender_id` → `users.id`
- `receiver_id` → `users.id`
- `project_id` → `projects.id`
- `task_id` → `tasks.id`

---

### 20. `notifications`

User notifications.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Notification ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | User ID |
| `type` | VARCHAR | NOT NULL | Notification type |
| `title` | VARCHAR | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification message |
| `related_entity_type` | VARCHAR | | Entity type: 'project', 'offer', 'message', etc. |
| `related_entity_id` | INTEGER | | Related entity ID |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Notification timestamp |

**Indexes:**
- `user_id`
- `is_read`
- `created_at`

**Relationships:**
- `user_id` → `users.id`

---

## Ratings & Reviews

### 21. `ratings`

Ratings/reviews given by clients to freelancers.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Rating ID |
| `freelancer_id` | INTEGER | NOT NULL, FK → `users.id` | Freelancer ID |
| `client_id` | INTEGER | NOT NULL, FK → `users.id` | Client ID |
| `project_id` | INTEGER | FK → `projects.id` | Project ID (if related) |
| `rating` | INTEGER | NOT NULL | Rating (1-5) |
| `comment` | TEXT | | Review comment |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Rating timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `freelancer_id`
- `client_id`
- `project_id`

**Relationships:**
- `freelancer_id` → `users.id`
- `client_id` → `users.id`
- `project_id` → `projects.id`

---

## Blogs

### 22. `blogs`

Blog posts.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Blog ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | Author ID |
| `title` | VARCHAR | NOT NULL | Blog title |
| `content` | TEXT | NOT NULL | Blog content |
| `cover_url` | TEXT | | Cover image URL |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'approved', 'rejected' |
| `likes_count` | INTEGER | DEFAULT 0 | Number of likes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `user_id` → `users.id`
- One-to-many with `blog_attachments`
- One-to-many with `blog_likes`

---

## Verification

### 23. `verifications`

Freelancer verification requests.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Verification ID |
| `user_id` | INTEGER | NOT NULL, FK → `users.id` | User ID |
| `document_url` | TEXT | NOT NULL | Verification document URL |
| `status` | VARCHAR | DEFAULT 'pending' | Status: 'pending', 'approved', 'rejected' |
| `rejection_reason` | TEXT | | Rejection reason (if rejected) |
| `reviewed_by` | INTEGER | FK → `users.id` | Admin reviewer ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Request timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Relationships:**
- `user_id` → `users.id`
- `reviewed_by` → `users.id` (admin)

---

## System Tables

### 24. `logs`

System activity logs.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Log ID |
| `level` | VARCHAR | NOT NULL | Log level: 'info', 'warn', 'error', 'critical' |
| `message` | TEXT | NOT NULL | Log message |
| `entity_type` | VARCHAR | | Entity type |
| `entity_id` | INTEGER | | Entity ID |
| `user_id` | INTEGER | FK → `users.id` | User ID (if applicable) |
| `metadata` | JSONB | | Additional metadata (JSON) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Log timestamp |

**Indexes:**
- `level`
- `entity_type`, `entity_id`
- `user_id`
- `created_at`

---

### 25. `permissions`

System permissions.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Permission ID |
| `permission` | VARCHAR | UNIQUE, NOT NULL | Permission name |
| `description` | TEXT | | Permission description |

---

### 26. `role_permission`

Junction table for role permissions.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Record ID |
| `role_id` | INTEGER | NOT NULL, FK → `roles.id` | Role ID |
| `permission_id` | INTEGER | NOT NULL, FK → `permissions.id` | Permission ID |

**Constraints:**
- UNIQUE(`role_id`, `permission_id`)

---

## Key Relationships Summary

### User Relationships
- **Users** → **Projects** (one-to-many, as client)
- **Users** → **Project Assignments** (one-to-many, as freelancer)
- **Users** → **Subscriptions** (one-to-many)
- **Users** → **Payments** (one-to-many)
- **Users** → **Messages** (one-to-many, as sender/receiver)
- **Users** → **Ratings** (one-to-many, as client/freelancer)

### Project Relationships
- **Projects** → **Project Assignments** (one-to-many)
- **Projects** → **Offers** (one-to-many)
- **Projects** → **Project Files** (one-to-many)
- **Projects** → **Project Deliveries** (one-to-many)
- **Projects** → **Messages** (one-to-many)

### Category Hierarchy
- **Categories** (level 0) → **Sub Categories** (level 1) → **Sub Sub Categories** (level 2)
- **Categories** → **Projects** (many-to-one)
- **Categories** → **Freelancer Categories** (many-to-many via junction)

---

## Important Notes

1. **Soft Deletes**: Many tables use `is_deleted` flag instead of hard deletes
2. **Timestamps**: All tables have `created_at` and `updated_at` timestamps
3. **Foreign Keys**: Most relationships use CASCADE DELETE for data integrity
4. **Indexes**: Key columns are indexed for performance
5. **Currency**: Payments use JOD (Jordanian Dinar) as default currency
6. **File Storage**: Files are stored in Cloudinary, URLs stored in database
7. **JSON Fields**: Some tables use JSONB for flexible data storage

---

## Database Connection

**Connection Pool**: Uses `pg` (node-postgres) Pool
**Connection String**: `DB_URL` environment variable or individual connection params
**SSL**: Configurable via `DB_SSL` environment variable

---

## Migration Files

Located in `backendEsModule/migrations/`:
- `001_create_freelancer_sub_categories_table.js`
- `create_freelancer_sub_categories_table.sql`
- `add_admin_category_to_projects.sql`
- `add_offer_expiration_check.sql`
