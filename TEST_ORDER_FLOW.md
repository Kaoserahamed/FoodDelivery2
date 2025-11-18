# 🧪 Test Order Flow - Quick Guide

## Prerequisites
✅ Server running on port 5000
✅ Database connected
✅ Test user exists (test@example.com / password123)
✅ Restaurant exists in database
✅ Menu items exist

## 🚀 Quick Test (5 Minutes)

### Step 1: Login as Customer (1 min)
```
1. Open: http://localhost:5000/pages/customer/login.html
2. Login: test@example.com / password123
3. Should redirect to home page
```

### Step 2: Add Items to Cart (1 min)
```
1. Click "Restaurants" in navbar
2. Click on any restaurant
3. Click on a food item
4. Click "Add to Cart"
5. See cart badge update (top right)
```

### Step 3: Place Order (2 min)
```
1. Click cart icon (top right)
2. Should see your items
3. Enter delivery address: "123 Test Street"
4. Click "Place Order"
5. Should see: "Order placed successfully! Order ID: X"
6. Should redirect to order history
```

### Step 4: View as Restaurant (1 min)
```
1. Logout from customer account
2. Login as restaurant owner
3. Go to: http://localhost:5000/pages/restaurant/orders.html
4. Should see the new order with status "pending"
5. Click "Confirm Order" to update status
```

## ✅ Expected Results

### After Placing Order:
- ✅ Cart is cleared
- ✅ Order appears in customer's order history
- ✅ Order appears in restaurant's orders page
- ✅ Order appears in admin dashboard
- ✅ Order has status "pending"

### After Restaurant Confirms:
- ✅ Status changes to "confirmed"
- ✅ Customer can see updated status
- ✅ Admin can see updated status

## 🐛 Troubleshooting

### "Please login to place an order"
- You're not logged in
- Login at: http://localhost:5000/pages/customer/login.html

### "Your cart is empty"
- Add items to cart first
- Go to Restaurants → Select restaurant → Add items

### "Please enter delivery address"
- Fill in the delivery address field in cart page

### Order not showing in restaurant page
- Make sure you're logged in as the restaurant owner
- Check if the order is for your restaurant
- Refresh the page

## 📊 Check Database

To verify order was created:
```sql
-- Check orders table
SELECT * FROM orders ORDER BY order_date DESC LIMIT 5;

-- Check order items
SELECT * FROM order_items WHERE order_id = [YOUR_ORDER_ID];
```

## 🎯 Success Criteria

Order flow is working if:
- [x] Customer can place order
- [x] Order saved to database
- [x] Restaurant sees order
- [x] Status can be updated
- [x] Customer sees status updates
- [x] Admin sees order in dashboard

## 💡 Quick Tips

1. **Always login first** - Orders require authentication
2. **Use real addresses** - Makes testing more realistic
3. **Check console** - Browser console shows detailed logs
4. **Refresh pages** - To see latest status updates
5. **Test different statuses** - Try the full flow: pending → confirmed → preparing → ready → delivered

## 🎉 That's It!

Your order flow is complete and working. Customers can order, restaurants can manage, and admins can monitor!
