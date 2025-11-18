# 🔐 Three Separate Login Systems - Properly Configured

## Overview

There are **THREE COMPLETELY SEPARATE** login systems:

1. **Customer Login** - For regular users ordering food
2. **Restaurant Login** - For restaurant owners managing their business
3. **Admin Login** - For platform administrators

Each has its own:
- Login page
- API endpoint
- Token storage
- Dashboard/Home page
- User validation

## 1. Customer Login System

### Login Page
```
http://localhost:5000/pages/customer/login.html
```

### API Endpoint
```
POST /api/auth/login
```

### User Type Check
```javascript
if (data.user.userType !== 'customer') {
    throw new Error('This login is for customers only...');
}
```

### Token Storage
```javascript
localStorage.setItem('authToken', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Redirect After Login
```
../../index.html (Home page)
```

### Test Credentials
```
Email: test@example.com
Password: password123
```

### Features Access
- Browse restaurants
- Add items to cart
- Place orders
- View order history
- Track orders

---

## 2. Restaurant Login System

### Login Page
```
http://localhost:5000/pages/restaurant/login.html
```

### API Endpoint
```
POST /api/restaurant/login
```

### User Type Check
```javascript
// Backend checks user_type = 'restaurant'
// Returns restaurant data along with user data
```

### Token Storage
```javascript
localStorage.setItem('restaurantAuthToken', data.token);
localStorage.setItem('restaurantUser', JSON.stringify(data.user));
localStorage.setItem('restaurantData', JSON.stringify(data.restaurant));
```

### Redirect After Login
```
dashboard.html (Restaurant Dashboard)
```

### Test Credentials
```
Use your restaurant owner credentials
(Created during restaurant signup)
```

### Features Access
- View incoming orders
- Update order status
- Manage menu items
- View restaurant analytics
- Update restaurant profile

---

## 3. Admin Login System

### Login Page
```
http://localhost:5000/pages/admin/login.html
```

### API Endpoint
```
POST /api/auth/login
```

### User Type Check
```javascript
if (data.user.userType !== 'admin') {
    throw new Error('Access denied. Admin credentials required.');
}
```

### Token Storage
```javascript
localStorage.setItem('adminToken', data.token);
localStorage.setItem('adminUser', JSON.stringify(data.user));
```

### Redirect After Login
```
dashboard.html (Admin Dashboard)
```

### Test Credentials
```
Email: admin@tastenow.com
Password: admin123
```

### Features Access
- View all users
- View all restaurants
- View all orders
- Platform statistics
- Manage users/restaurants

---

## Key Differences

| Feature | Customer | Restaurant | Admin |
|---------|----------|------------|-------|
| **Login Page** | `/pages/customer/login.html` | `/pages/restaurant/login.html` | `/pages/admin/login.html` |
| **API Endpoint** | `/api/auth/login` | `/api/restaurant/login` | `/api/auth/login` |
| **Token Key** | `authToken` | `restaurantAuthToken` | `adminToken` |
| **User Key** | `user` | `restaurantUser` | `adminUser` |
| **User Type** | `customer` | `restaurant` | `admin` |
| **Redirect** | `index.html` | `dashboard.html` | `dashboard.html` |
| **Dashboard** | Home page | Restaurant dashboard | Admin dashboard |

---

## JWT Token Structure

### Customer Token
```json
{
  "userId": 4,
  "userRole": "customer",
  "email": "test@example.com",
  "iat": 1700318400,
  "exp": 1700404800
}
```

### Restaurant Token
```json
{
  "userId": 5,
  "userRole": "restaurant",
  "email": "restaurant@example.com",
  "iat": 1700318400,
  "exp": 1701528000
}
```

### Admin Token
```json
{
  "userId": 1,
  "userRole": "admin",
  "email": "admin@tastenow.com",
  "iat": 1700318400,
  "exp": 1700404800
}
```

---

## Validation Flow

### Customer Login
```
1. User enters credentials
2. POST /api/auth/login
3. Backend returns user with userType
4. Frontend checks: userType === 'customer'
5. If YES: Store token, redirect to home
6. If NO: Show error "This login is for customers only"
```

### Restaurant Login
```
1. User enters credentials
2. POST /api/restaurant/login
3. Backend checks user_type === 'restaurant'
4. Backend returns user + restaurant data
5. Frontend stores token, redirect to dashboard
6. If not restaurant: Backend returns error
```

### Admin Login
```
1. User enters credentials
2. POST /api/auth/login
3. Backend returns user with userType
4. Frontend checks: userType === 'admin'
5. If YES: Store token, redirect to admin dashboard
6. If NO: Show error "Admin credentials required"
```

---

## Error Messages

### Customer Login
```
❌ "This login is for customers only. Please use the correct login page for your account type."
```

### Restaurant Login
```
❌ "Invalid login credentials" (if not a restaurant account)
```

### Admin Login
```
❌ "Access denied. Admin credentials required."
```

---

## Testing Each System

### Test Customer Login
1. Go to: `http://localhost:5000/pages/customer/login.html`
2. Login: test@example.com / password123
3. Should redirect to home page
4. Should be able to place orders

### Test Restaurant Login
1. Go to: `http://localhost:5000/pages/restaurant/login.html`
2. Login with restaurant credentials
3. Should redirect to restaurant dashboard
4. Should see orders page

### Test Admin Login
1. Go to: `http://localhost:5000/pages/admin/login.html`
2. Login: admin@tastenow.com / admin123
3. Should redirect to admin dashboard
4. Should see all users/restaurants

---

## What Was Fixed

### Before (WRONG):
- ❌ Admin could login as customer
- ❌ Customer could login as admin
- ❌ No user type validation
- ❌ All used same token storage

### After (CORRECT):
- ✅ Customer login only accepts customers
- ✅ Restaurant login only accepts restaurants
- ✅ Admin login only accepts admins
- ✅ Each uses separate token storage
- ✅ Each redirects to correct dashboard

---

## Files Modified

1. ✅ `pages/customer/login.html` - Added customer type check
2. ✅ `pages/restaurant/login.html` - Already correct (uses separate API)
3. ✅ `pages/admin/login.html` - Already correct (checks admin type)
4. ✅ `middleware/auth.js` - Fixed token property name
5. ✅ `api/routes/restaurantAuth.js` - Fixed JWT creation

---

## Summary

✅ **Three separate login systems properly configured**
✅ **Each validates user type correctly**
✅ **Each uses separate token storage**
✅ **Each redirects to correct page**
✅ **No cross-contamination between user types**

The authentication system is now properly separated!
