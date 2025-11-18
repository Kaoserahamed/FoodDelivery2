# 🧪 Admin Dashboard Quick Test Guide

## Prerequisites
✅ Server is running on port 5000
✅ Database is connected
✅ Test data exists in database

## Test Steps

### 1. Test Dashboard
1. Open: `http://localhost:5000/pages/admin/dashboard.html`
2. **Expected Results**:
   - Statistics show real numbers from database
   - Recent orders table populated with actual orders
   - Top restaurants widget shows real data
   - No console errors

**Check Console For**:
```
📊 Admin Dashboard loading...
📊 Stats loaded: {total_orders: X, total_revenue: X, ...}
📦 Loaded X orders
🏆 Loaded X top restaurants
✅ Dashboard data loaded successfully
```

### 2. Test Users Page
1. Open: `http://localhost:5000/pages/admin/users.html`
2. **Expected Results**:
   - All registered users displayed
   - Statistics updated with real counts
   - Search box works
   - Filter dropdown works

**Test Actions**:
- Type in search box → users filter in real-time
- Change filter dropdown → users filter by type
- Click view/edit/delete buttons → shows alerts

**Check Console For**:
```
👥 Users page loading...
✅ Loaded X users
```

### 3. Test Restaurants Page
1. Open: `http://localhost:5000/pages/admin/restaurants.html`
2. **Expected Results**:
   - All restaurants displayed
   - Statistics updated with real counts
   - Search box works
   - Filter dropdown works
   - Toggle status button works

**Test Actions**:
- Type in search box → restaurants filter in real-time
- Change filter dropdown → restaurants filter by status
- Click suspend/activate button → status changes

**Check Console For**:
```
🏪 Restaurants page loading...
✅ Loaded X restaurants
```

### 4. Test API Endpoints Directly

**Dashboard Stats**:
```bash
curl http://localhost:5000/api/admin/dashboard/stats
```
Expected: JSON with total_orders, total_revenue, etc.

**Users List**:
```bash
curl http://localhost:5000/api/admin/users
```
Expected: Array of user objects

**Restaurants List**:
```bash
curl http://localhost:5000/api/admin/restaurants
```
Expected: Array of restaurant objects

**Top Restaurants**:
```bash
curl http://localhost:5000/api/admin/top-restaurants
```
Expected: Array of top 5 restaurants

## ✅ Success Criteria

### Dashboard
- [x] Shows real statistics from database
- [x] Recent orders table populated
- [x] Top restaurants widget populated
- [x] No "undefined" or "NaN" values
- [x] No console errors

### Users Page
- [x] All users from database displayed
- [x] Search functionality works
- [x] Filter functionality works
- [x] Statistics are accurate
- [x] No console errors

### Restaurants Page
- [x] All restaurants from database displayed
- [x] Search functionality works
- [x] Filter functionality works
- [x] Toggle status works
- [x] Statistics are accurate
- [x] No console errors

## 🐛 Common Issues & Solutions

### Issue: "Error loading data"
**Solution**: Check if server is running and database is connected

### Issue: Empty tables
**Solution**: Ensure database has data. Run sample data insertion scripts if needed

### Issue: Console errors about CORS
**Solution**: Server already has CORS enabled, but check if it's running on correct port

### Issue: Statistics show 0
**Solution**: Database might be empty. Add some test data

## 📊 Sample Data Check

Run this to check if you have data:
```sql
-- Check users
SELECT COUNT(*) as user_count FROM users;

-- Check restaurants
SELECT COUNT(*) as restaurant_count FROM restaurants;

-- Check orders
SELECT COUNT(*) as order_count FROM orders;
```

If counts are 0, you need to add sample data.

## 🎯 What Changed from Before

### Before
- ❌ Hardcoded static data
- ❌ Duplicate entries
- ❌ Inconsistent numbers
- ❌ No real database connection

### After
- ✅ Real data from database
- ✅ No duplicates
- ✅ Consistent across pages
- ✅ Live updates on page load

## 🚀 Next Steps

After confirming everything works:
1. Add authentication to admin routes
2. Implement pagination for large datasets
3. Add data export functionality
4. Implement charts for analytics
5. Add real-time updates with WebSockets
