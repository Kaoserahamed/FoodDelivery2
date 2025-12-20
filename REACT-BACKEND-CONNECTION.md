# React Frontend - Backend Connection Guide

## Current Setup

### Backend API Endpoints (Existing)
- **Restaurants**: `GET /api/restaurants` - Returns array of restaurants
- **Menu Items**: `GET /api/menu/items/public` - Returns `{ success: true, items: [...] }`
- **Single Restaurant**: `GET /api/restaurants/:id`
- **Restaurant Menu**: `GET /api/restaurants/:id/menu`

### React Frontend Configuration
- **API Base URL**: `http://localhost:5000/api` (configured in `.env`)
- **Proxy**: Configured in `package.json` to proxy API requests

## Fixed Issues

### 1. API Response Format Mismatch
**Problem**: React was expecting `response.data.restaurants` but backend returns direct array

**Solution**: Updated React components to handle direct array responses:
```javascript
// Before
setRestaurants(response.data.restaurants || []);

// After
const restaurantsData = Array.isArray(response.data) ? response.data : [];
setRestaurants(restaurantsData);
```

### 2. Database Field Names
**Problem**: React used `id`, `image` but database uses `restaurant_id`, `image_url`

**Solution**: Updated all React components to use correct field names:
- `restaurant.id` → `restaurant.restaurant_id`
- `restaurant.image` → `restaurant.image_url`
- `food.id` → `food.item_id`
- `food.image` → `food.image_url`

### 3. Menu Items Endpoint
**Problem**: React was calling `/api/menu/popular` which doesn't exist

**Solution**: Changed to use `/api/menu/items/public` which returns all items

## Testing the Connection

### 1. Start Backend Server
```bash
node server.js
```
Backend should be running on `http://localhost:5000`

### 2. Start React Frontend
```bash
cd client
npm start
```
Frontend should open on `http://localhost:3000`

### 3. Test API Endpoints Directly

Open browser console and test:

```javascript
// Test restaurants endpoint
fetch('http://localhost:5000/api/restaurants')
  .then(r => r.json())
  .then(data => console.log('Restaurants:', data));

// Test menu items endpoint
fetch('http://localhost:5000/api/menu/items/public')
  .then(r => r.json())
  .then(data => console.log('Menu Items:', data));
```

### 4. Check Browser Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for API calls to `/api/restaurants` and `/api/menu/items/public`
5. Check if they return 200 status and have data

## Common Issues & Solutions

### Issue: CORS Error
**Symptom**: Console shows "CORS policy" error

**Solution**: Ensure backend has CORS enabled in `server.js`:
```javascript
const cors = require('cors');
app.use(cors());
```

### Issue: 404 Not Found
**Symptom**: API calls return 404

**Solution**: 
1. Check backend is running on port 5000
2. Verify routes are registered in `server.js`
3. Check the exact endpoint path

### Issue: Empty Data
**Symptom**: API returns 200 but empty array

**Solution**: 
1. Check database has data
2. Run SQL queries directly to verify:
```sql
SELECT * FROM restaurants;
SELECT * FROM menu_items;
```

### Issue: Authentication Required
**Symptom**: API returns 401 Unauthorized

**Solution**: Some endpoints require authentication. For public endpoints, ensure they don't have `verifyToken` middleware.

## Database Field Mapping

### Restaurants Table
```
restaurant_id → Used as key in React
name → Restaurant name
description → Restaurant description
cuisine_type → Type of cuisine
image_url → Restaurant image
is_open → Open/closed status
rating → Restaurant rating
delivery_time → Estimated delivery time
```

### Menu Items Table
```
item_id → Used as key in React
name → Item name
description → Item description
price → Item price
image_url → Item image
category_name → Category (from join)
restaurant_name → Restaurant name (from join)
is_available → Availability status
```

## Updated Files

### Frontend Files Modified:
1. `client/src/utils/api.js` - Fixed API endpoints
2. `client/src/pages/Home.js` - Fixed data handling
3. `client/src/pages/Restaurants.js` - Fixed field names
4. `client/src/pages/Foods.js` - Fixed field names and cart logic
5. `client/.env` - Added SKIP_PREFLIGHT_CHECK=true

### Backend Files (No changes needed):
- All existing backend routes work as-is
- Public routes in `api/routes/public.js` provide data
- Restaurant routes in `api/routes/restaurants.js`
- Menu routes in `api/routes/menu.js`

## Verification Checklist

- [ ] Backend server running on port 5000
- [ ] React dev server running on port 3000
- [ ] No CORS errors in browser console
- [ ] API calls visible in Network tab
- [ ] Restaurants showing on home page
- [ ] Menu items showing on foods page
- [ ] No 404 errors for API endpoints
- [ ] Database has sample data

## Quick Debug Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check restaurants endpoint
curl http://localhost:5000/api/restaurants

# Check menu items endpoint
curl http://localhost:5000/api/menu/items/public

# Check React is proxying correctly
# (From React app in browser console)
fetch('/api/restaurants').then(r => r.json()).then(console.log)
```

## Next Steps

If data still not showing:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify database has data
4. Check backend console for errors
5. Ensure all npm packages are installed in client folder