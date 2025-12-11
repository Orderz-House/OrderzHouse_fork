# Freelancer Category Selection Feature

## Overview
This feature implements a new category selection system for freelancers during registration that follows these requirements:

1. Freelancers must select exactly ONE main category from the existing database categories
2. Freelancers may select 1-3 sub-categories that belong to their chosen main category
3. The system validates that sub-categories belong to the selected main category
4. The system prevents selection of more than 3 sub-categories
5. All categories and sub-categories must exist in the database (no new categories can be created)

## Implementation Details

### Frontend Component
- Created `FreelancerCategorySelector.jsx` component
- Handles UI for selecting exactly one main category
- Handles UI for selecting up to three sub-categories from the selected main category
- Shows validation messages when trying to select more than 3 sub-categories
- Automatically resets sub-category selection when main category changes

### Backend Changes
- Modified `register` function in `user.js` controller
- Added support for new `category_id` and `sub_category_ids` fields
- Added validation to ensure:
  - Maximum of 3 sub-categories can be selected
  - All sub-categories belong to the selected main category
- Maintained backward compatibility with existing `categories` and `sub_sub_categories` fields

### Database Changes
- Created `freelancer_sub_categories` table to link freelancers to their sub-categories
- Table structure:
  ```
  id SERIAL PRIMARY KEY,
  freelancer_id INTEGER NOT NULL,
  sub_category_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(freelancer_id, sub_category_id),
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE
  ```

## API Endpoints

### Registration
- **Endpoint**: POST `/users/register`
- **New Fields**:
  - `category_id` (integer): ID of the selected main category
  - `sub_category_ids` (array of integers): IDs of selected sub-categories (max 3)

### Example Request Body
```json
{
  "role_id": 3,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phone_number": "+1234567890",
  "country": "USA",
  "username": "johndoe",
  "category_id": 1,
  "sub_category_ids": [2, 3]
}
```

## Validation Rules

1. **Main Category Selection**: Exactly one main category must be selected
2. **Sub-Category Limit**: Maximum of 3 sub-categories can be selected
3. **Category Ownership**: All selected sub-categories must belong to the selected main category
4. **Existence**: All categories and sub-categories must exist in the database

## Error Messages

- "You can select a maximum of 3 sub-categories" - When trying to select more than 3 sub-categories
- "Some sub-categories do not belong to the selected main category" - When sub-categories don't match the main category

## Migration

To set up the required database table, run the migration:

```bash
node backendEsModule/migrations/run_migration.js
```

Or execute the SQL script directly:

```sql
CREATE TABLE IF NOT EXISTS freelancer_sub_categories (
  id SERIAL PRIMARY KEY,
  freelancer_id INTEGER NOT NULL,
  sub_category_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(freelancer_id, sub_category_id),
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE
);
```