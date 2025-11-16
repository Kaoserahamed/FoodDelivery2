# TasteNow Database Setup Guide

This directory contains all the database configuration and setup files for the TasteNow Food Delivery Platform.

## Files Overview

### 1. **schema.sql**
- Complete database schema with all tables
- Foreign key relationships
- Indexes for performance optimization
- Sample data for testing

### 2. **setup.sql**
- Quick setup script to initialize the database
- Can be run after schema.sql to ensure clean state

### 3. **procedures.sql**
- Stored procedures for common operations
- Business logic encapsulation

### 4. **triggers.sql**
- Database triggers for automated operations
- Maintains data integrity

### 5. **seed-data.sql**
- Extended sample data for development and testing
- Realistic test scenarios

## Database Setup Instructions

### Prerequisites
- MySQL Server 5.7 or higher
- MySQL Command Line Client or MySQL Workbench

### Step 1: Create Database
```sql
mysql -u root -p < schema.sql
```

### Step 2: (Optional) Add Procedures and Triggers
```sql
mysql -u root -p tastenow < procedures.sql
mysql -u root -p tastenow < triggers.sql
```

### Step 3: (Optional) Load Extended Sample Data
```sql
mysql -u root -p tastenow < seed-data.sql
```

## Database Connection

### Connection String (Node.js)
```javascript
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'tastenow'
});
```

### Connection String (PHP)
```php
$conn = new mysqli('localhost', 'root', 'your_password', 'tastenow');
```

## Database Tables

| Table | Purpose |
|-------|---------|
| users | Stores customer, restaurant owner, and admin information |
| restaurants | Restaurant details and metadata |
| menu_categories | Food categories within restaurants |
| menu_items | Individual food items with prices and details |
| orders | Order records and status tracking |
| order_items | Items within each order |
| reviews | Customer reviews and ratings |
| admin_logs | Administrative action history |

## Key Features

✅ User role-based access (customer, restaurant, admin)
✅ Complete order lifecycle management
✅ Restaurant and menu management
✅ Review and rating system
✅ Audit logging for admin actions
✅ Optimized indexes for fast queries
✅ Data integrity with foreign keys
✅ Timestamps for created/updated tracking

## Default Credentials (Testing)

**Admin Account:**
- Email: `admin@tastenow.com`
- Password: `admin123`

**Test Customer:**
- Email: `john@example.com`
- Password: `password123`

**Test Restaurant:**
- Email: `spicepalace@restaurant.com`
- Password: `restaurant123`

## Notes

- All passwords in sample data are hashed with MD5 (use bcrypt/SHA-256 in production)
- Update credentials immediately after setup
- Create additional users as needed
- Regularly backup the database
