# TasteNow Backend Setup Guide

This guide will help you get the Node.js backend API running.

## 📋 Prerequisites

- **Node.js** v14+ (download from https://nodejs.org/)
- **MySQL** 5.7+ (should already be set up from database folder)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd FoodDelivery
npm install
```

This will install all required packages listed in `package.json`:
- `express` - Web framework
- `mysql` - Database driver
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `body-parser` - Request body parsing
- `nodemon` - Auto-restart on file changes (dev)

### Step 2: Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# PowerShell
Copy-Item .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=tastenow

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
```

### Step 3: Set Up Database

Make sure your MySQL server is running and the database is initialized:

```bash
# In another terminal, navigate to database folder
cd database

# Connect to MySQL and run schema
mysql -u root -p tastenow < schema.sql

# Add procedures and triggers
mysql -u root -p tastenow < procedures.sql
mysql -u root -p tastenow < triggers.sql

# (Optional) Add seed data for testing
mysql -u root -p tastenow < seed-data.sql
```

### Step 4: Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000` (or the PORT in your .env)

You should see:
```
🚀 TasteNow Backend Server running on port 5000
📍 Environment: development
🔗 API Health: http://localhost:5000/api/health
✅ MySQL Database Connected Successfully
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `GET /api/restaurants/search/:query` - Search restaurants
- `POST /api/restaurants` - Create restaurant (admin only)
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant (admin only)

### Menu
- `GET /api/menu/restaurant/:restaurantId` - Get restaurant menu
- `GET /api/menu/categories/:restaurantId` - Get menu categories
- `GET /api/menu/search/:query` - Search menu items
- `GET /api/menu/item/:itemId` - Get single menu item
- `POST /api/menu` - Create menu item (restaurant only)
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `POST /api/orders` - Create order (customer only)
- `GET /api/orders/customer/list` - Get customer's orders
- `GET /api/orders/restaurant/list` - Get restaurant's orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/status` - Update order status
- `PUT /api/orders/:orderId/cancel` - Cancel order

### Reviews
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
- `GET /api/reviews/restaurant/:restaurantId/rating` - Get rating stats
- `POST /api/reviews` - Create review (customer only)
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile/update` - Update profile
- `POST /api/users/change-password` - Change password

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/restaurants` - Get all restaurants
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/logs` - Get admin activity logs
- `PUT /api/admin/restaurants/:restaurantId/toggle` - Toggle restaurant status
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user

## 🔐 Authentication

All protected endpoints require an Authorization header:

```javascript
// Example: Send JWT token in request
fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
  }
});
```

### User Roles
- `customer` - Can order, review, manage own profile
- `restaurant` - Can manage menu, view orders
- `admin` - Can manage users, restaurants, view logs

## 📝 Example API Usage

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "user_type": "customer",
    "phone": "555-1234",
    "city": "New York"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response includes JWT token to use in subsequent requests.

### 3. Get Restaurants
```bash
curl http://localhost:5000/api/restaurants
```

### 4. Create Order (with token)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurant_id": 1,
    "items": [
      {"itemId": 1, "quantity": 2, "price": 9.99},
      {"itemId": 2, "quantity": 1, "price": 5.99}
    ],
    "subtotal": 25.97,
    "delivery_fee": 2.99,
    "tax": 2.15,
    "special_instructions": "No onions"
  }'
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
Solution: Run `npm install`

### "Error connecting to database"
Solution: 
- Check MySQL is running
- Verify DB credentials in `.env`
- Ensure database `tastenow` exists

### "EADDRINUSE :::5000"
Solution: Another app is using port 5000
```bash
# Change PORT in .env or
# Kill process using port 5000
```

### "Invalid token" error
Solution:
- Make sure JWT_SECRET in `.env` is set
- Check token format in Authorization header: `Bearer TOKEN`

## 📁 Project Structure

```
FoodDelivery/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Example configuration
├── config/
│   └── database.js         # MySQL connection setup
├── middleware/
│   └── auth.js             # JWT verification & role checking
├── api/
│   └── routes/
│       ├── auth.js         # Authentication endpoints
│       ├── restaurants.js  # Restaurant management
│       ├── menu.js         # Menu management
│       ├── orders.js       # Order management
│       ├── reviews.js      # Review system
│       ├── users.js        # User profile
│       └── admin.js        # Admin endpoints
└── database/
    ├── schema.sql          # Database tables
    ├── procedures.sql      # Stored procedures
    ├── triggers.sql        # Database triggers
    └── README.md           # Database documentation
```

## 🔄 Next Steps

1. **Frontend Integration:** Update frontend `js/` files to make API calls to `http://localhost:5000/api/`
2. **Authentication Flow:** Implement login/logout in frontend
3. **Payment Integration:** Add Stripe/PayPal for checkout
4. **Real-time Updates:** Consider WebSockets for order tracking
5. **Deployment:** Deploy to cloud (Heroku, AWS, Azure, etc.)

## 📞 Testing Endpoints

Use Postman, Thunder Client, or curl to test endpoints. Test credentials:

```
Admin:
- Email: admin@tastenow.com
- Password: admin123

Customer:
- Email: john@example.com
- Password: password123

Restaurant:
- Email: spicepalace@restaurant.com
- Password: restaurant123
```

## 🚨 Security Notes

⚠️ **Before Production:**
- Change `JWT_SECRET` to a strong random string
- Use environment-specific `.env` files
- Enable HTTPS
- Add rate limiting
- Add input validation/sanitization
- Keep dependencies updated: `npm audit fix`
- Use stronger password requirements
- Add 2FA for admin accounts
