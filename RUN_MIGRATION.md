# How to Run the Freelancer Sub-Categories Migration

## Option 1: Using Node.js Script (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd backendEsModule
   ```

2. Run the migration script:
   ```bash
   node migrations/run_migration.js
   ```

## Option 2: Using SQL Directly

1. Connect to your PostgreSQL database

2. Execute the SQL script:
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

## Verification

After running the migration, you can verify the table was created by running:
```sql
\d freelancer_sub_categories
```

Or in SQL:
```sql
SELECT * FROM freelancer_sub_categories LIMIT 5;
```

This should show the structure of the newly created table.