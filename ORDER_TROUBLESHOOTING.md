# 🔍 Order Placement Troubleshooting Guide

## Current Status

❌ **No orders in database**
❌ **No order placement attempts in server logs**
❌ **Restaurant dashboard shows 0 orders**

## Step-by-Step Testing Process

### Step 1: Login as Customer

1. **Clear all localStorage** (important!)
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   ```

2. **Go to customer login**
   ```
   http://localhost:5000/pages/customer/login.html
   ```

3. **Login with**
   ```
   Email: test@example.com
   Password: password123
   ```

4. **Verify login successful**
   - Should redirect to home page
   - Check browser console for: "✅ Customer login successful"
   - Check localStorage has: `authToken` and `user`

### Step 2: Add Items to Cart

1. **Go to home page**
   ```
   http://localhost:5000/index.html
   ```

2. **Click on a food item** (from Popular Dishes section)

3. **In the modal, click "Add to Cart"**

4. **Verify cart updated**
   - Cart badge (top right) should show number > 0
   - Check browser console for: "added to cart"
   - Check localStorage: `cart` should have items

5. **Check cart data structure**
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('cart'))
   ```
   
   Should show:
   ```json
   [
     {
       "id": 1,
       "name": "Food Name",
       "price": 12.50,
       "quantity": 1,
       "restaurant": "Restaurant Name",
       "restaurantId": 2,  // ← IMPORTANT: Must be a valid restaurant ID
       "image": "..."
     }
   ]
   ```

### Step 3: Go to Cart

1. **Click cart icon** (top right)

2. **Verify items displayed**
   - Should see your items
   - Should see subtotal, tax, delivery fee, total

3. **Enter delivery address**
   ```
   123 Test Street, Test City, 12345
   ```

4. **Add special instructions** (optional)
   ```
   Please ring the doorbell
   ```

### Step 4: Place Order

1. **Click "Place Order" button**

2. **Watch browser console** (F12)
   Should see:
   ```
   Sending order data: {...}
   Response status: 201
   Response data: {success: true, orderId: X, ...}
   ```

3. **Watch server logs**
   Should see:
   ```
   📦 Creating order for user: 4
   Order data: { restaurant_id: 2, total_amount: 30.99, items: 1 }
   ✅ Order created with ID: 1
   ✅ Inserted 1 order items
   ✅ Order placed successfully: 1
   ```

4. **If successful**
   - Alert: "✅ Order placed successfully!"
   - Cart cleared
   - Redirect to order history

### Step 5: Check Restaurant Dashboard

1. **Logout from customer account**

2. **Login as restaurant owner**
   ```
   http://localhost:5000/pages/restaurant/login.html
   ```

3. **Go to orders page**
   ```
   http://localhost:5000/pages/restaurant/orders.html
   ```

4. **Should see the order**
   - Order number
   - Customer name
   - Items
   - Total amount
   - Status: pending

## Common Issues & Solutions

### Issue 1: "Please login to place an order"
**Cause**: No authToken in localStorage
**Solution**: 
1. Clear localStorage
2. Login again as customer
3. Verify token exists: `localStorage.getItem('authToken')`

### Issue 2: "Your cart is empty"
**Cause**: No items in cart
**Solution**:
1. Add items to cart first
2. Verify cart: `JSON.parse(localStorage.getItem('cart'))`

### Issue 3: "Please enter delivery address"
**Cause**: Address field is empty
**Solution**: Fill in the delivery address field

### Issue 4: Order button does nothing
**Cause**: JavaScript error
**Solution**:
1. Open browser console (F12)
2. Look for red error messages
3. Check if jQuery or other dependencies are loaded

### Issue 5: "Error creating order"
**Possible causes**:
1. **Missing order_number**: Fixed (we generate it now)
2. **Invalid restaurant_id**: Check cart items have valid restaurantId
3. **Token expired**: Re-login
4. **Database error**: Check server logs

### Issue 6: restaurantId is undefined or wrong
**Cause**: Food items don't have restaurant_id
**Solution**:
1. Check API response: `/api/menu/popular`
2. Should include `restaurant_id` field
3. Check how items are mapped in index.html

## Debugging Checklist

Before placing order, verify:

- [ ] Logged in as customer (not admin/restaurant)
- [ ] authToken exists in localStorage
- [ ] Cart has items
- [ ] Cart items have valid restaurantId
- [ ] Delivery address is filled
- [ ] Browser console is open (F12)
- [ ] Server is running
- [ ] Database is connected

## Manual Test with Browser Console

```javascript
// 1. Check if logged in
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// 2. Check cart
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('Cart items:', cart.length);
console.log('Cart data:', cart);

// 3. Check restaurant IDs
cart.forEach((item, i) => {
    console.log(`Item ${i}: ${item.name} - Restaurant ID: ${item.restaurantId}`);
});

// 4. Manually place order
const orderData = {
    restaurant_id: 2,
    delivery_address: '123 Test St',
    special_instructions: 'Test order',
    subtotal: 25.00,
    delivery_fee: 3.99,
    tax: 2.00,
    total_amount: 30.99,
    items: [{
        item_id: 1,
        item_name: 'Test Item',
        item_price: 25.00,
        quantity: 1,
        subtotal: 25.00
    }]
};

fetch('http://localhost:5000/api/orders/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(orderData)
})
.then(r => r.json())
.then(d => console.log('Order result:', d))
.catch(e => console.error('Order error:', e));
```

## Expected Server Logs

### Successful Order:
```
2025-11-18T15:10:00.000Z - POST /api/orders/create
✅ Token verified - userId: 4 role: customer
📦 Creating order for user: 4
Order data: { restaurant_id: 2, total_amount: 30.99, items: 1 }
✅ Order created with ID: 1
✅ Inserted 1 order items
✅ Order placed successfully: 1
```

### Failed Order:
```
2025-11-18T15:10:00.000Z - POST /api/orders/create
✅ Token verified - userId: 4 role: customer
📦 Creating order for user: 4
❌ Error creating order: [error message]
```

## Next Steps

1. **Follow Step 1-5 above**
2. **Note where it fails**
3. **Check browser console for errors**
4. **Check server logs for errors**
5. **Report the specific error message**

## Quick Test Command

Run this in browser console after logging in:
```javascript
// Quick order test
fetch('http://localhost:5000/api/orders/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
        restaurant_id: 2,
        delivery_address: '123 Test Street',
        special_instructions: '',
        subtotal: 25.00,
        delivery_fee: 3.99,
        tax: 2.00,
        total_amount: 30.99,
        items: [{
            item_id: 1,
            item_name: 'Test Pizza',
            item_price: 25.00,
            quantity: 1,
            subtotal: 25.00
        }]
    })
}).then(r => r.json()).then(console.log).catch(console.error);
```

This will show exactly what error occurs!
