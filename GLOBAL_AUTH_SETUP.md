# Global Authentication System Setup

## Overview
A unified authentication system has been implemented across all customer pages. Now you don't need to check authentication in every page - it's handled globally!

## How It Works

### Global Auth Script (`js/global-auth.js`)
- Automatically loads on every page
- Checks localStorage for authToken and user data
- Updates navbar dynamically:
  - If logged in: Shows "Hi, [Name]!" + Logout button
  - If logged out: Shows Login + Sign Up buttons
- Auto-redirects logout to homepage

### Updated Pages
All customer pages now include the global auth script:
- ✅ `pages/customer/restaurants.html`
- ✅ `pages/customer/menu.html`
- ✅ `pages/customer/foods.html`
- ✅ `pages/customer/cart.html`
- ✅ `pages/customer/order-history.html`
- ✅ `index.html` (homepage)

### What Changed

1. **Navbar Update** - All pages now have:
   ```html
   <div id="authLinks">
       <a href="login.html" class="btn btn-primary btn-sm">Login</a>
   </div>
   ```
   Instead of hardcoded login button

2. **Global Auth Script Added** - Each page now includes:
   ```html
   <script src="../../js/global-auth.js"></script>
   ```
   Before closing `</body>` tag

## User Experience

### Login Flow
1. User enters email/password
2. Clicks "Login"
3. Token & user data saved to localStorage
4. Redirected to homepage
5. **All pages automatically show user name** in navbar

### Logout Flow
1. User clicks "Logout" button
2. localStorage cleared
3. Redirected to homepage
4. **All pages automatically show Login/Sign Up buttons**

## Features

✅ **Persistent Login** - User stays logged in across all pages and page refreshes
✅ **Cross-Tab Sync** - Logout in one tab affects all tabs
✅ **No Manual Checks** - Auth status updates everywhere automatically
✅ **Clean Navbar** - Dynamic UI based on login status
✅ **Flexible Paths** - Works for pages at different directory levels

## Testing

1. **Login Test**
   - Register/Login with your account
   - Navigate to different pages
   - Your name should appear in navbar on ALL pages

2. **Logout Test**
   - Click "Logout" on any page
   - Navigate to other pages
   - Login/Sign Up buttons should appear on ALL pages

3. **Persistence Test**
   - Login
   - Refresh page (F5)
   - Your name should still be visible

## Files Modified
- `index.html` - Already had auth UI updater
- `pages/customer/restaurants.html` - Updated navbar + added script
- `pages/customer/menu.html` - Updated navbar + added script
- `pages/customer/foods.html` - Updated navbar + added script
- `pages/customer/cart.html` - Updated navbar + added script
- `pages/customer/order-history.html` - Updated navbar + added script

## Files Created
- `js/global-auth.js` - Global authentication handler

## What Remains

If you add more pages in the future, just:
1. Replace hardcoded login button with `<div id="authLinks">`
2. Add `<script src="../../js/global-auth.js"></script>` before `</body>`
3. Done! It will automatically sync with auth status

## Summary

**Before**: Each page showed "Login" button regardless of login status
**After**: All pages automatically show either user greeting OR login buttons based on actual login state

The system is now fully synchronized across all pages! 🎉
