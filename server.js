const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import existing routes
const authRoutes = require('./api/routes/auth');
const restaurantRoutes = require('./api/routes/restaurants');
const menuRoutes = require('./api/routes/menu');
const orderRoutes = require('./api/routes/orders');
const reviewRoutes = require('./api/routes/reviews');
const userRoutes = require('./api/routes/users');
const adminRoutes = require('./api/routes/admin');
const notificationsRoutes = require('./api/routes/notifications');
const uploadRoutes = require('./api/routes/upload');

// Import new restaurant-specific routes
const restaurantAuthRoutes = require('./api/routes/restaurantAuth');
const restaurantMenuRoutes = require('./api/routes/restaurantMenu');
const restaurantOrdersRoutes = require('./api/routes/restaurantOrders');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// In server.js, add this line with other routes
const publicRestaurantRoutes = require('./api/routes/public');

// Add public routes BEFORE other restaurant routes
app.use('/api/public', publicRestaurantRoutes);

// Customer & General Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload', uploadRoutes);

// Restaurant-Specific Routes (for restaurant owners)
app.use('/api/restaurant', restaurantAuthRoutes);
app.use('/api/restaurant/menu', restaurantMenuRoutes);
app.use('/api/restaurant/orders', restaurantOrdersRoutes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 TasteNow Backend Server Started Successfully');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server: http://localhost:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 Customer & General Endpoints:');
  console.log('  /api/auth - Authentication');
  console.log('  /api/restaurants - Restaurant browsing');
  console.log('  /api/menu - Menu browsing');
  console.log('  /api/orders - Customer orders');
  console.log('  /api/reviews - Reviews');
  console.log('  /api/users - User management');
  console.log('  /api/admin - Admin operations');
  console.log('');
  console.log('🍽️  Restaurant Owner Endpoints:');
  console.log('─────────────────────────────────────────────────');
  console.log('  Authentication & Profile:');
  console.log('  POST   /api/restaurant/signup - Register restaurant');
  console.log('  POST   /api/restaurant/login - Restaurant login');
  console.log('  GET    /api/restaurant/profile - Get profile');
  console.log('  PUT    /api/restaurant/profile - Update profile');
  console.log('  PUT    /api/restaurant/status - Update open/closed status');
  console.log('');
  console.log('  Dashboard:');
  console.log('  GET    /api/restaurant/dashboard - Get dashboard data & stats');
  console.log('');
  console.log('  Menu Management:');
  console.log('  GET    /api/restaurant/menu/categories - Get categories');
  console.log('  POST   /api/restaurant/menu/categories - Create category');
  console.log('  PUT    /api/restaurant/menu/categories/:id - Update category');
  console.log('  DELETE /api/restaurant/menu/categories/:id - Delete category');
  console.log('  GET    /api/restaurant/menu/items - Get menu items');
  console.log('  POST   /api/restaurant/menu/items - Create menu item');
  console.log('  PUT    /api/restaurant/menu/items/:id - Update menu item');
  console.log('  DELETE /api/restaurant/menu/items/:id - Delete menu item');
  console.log('');
  console.log('  Order Management:');
  console.log('  GET    /api/restaurant/orders - Get all orders');
  console.log('  GET    /api/restaurant/orders/:id - Get order details');
  console.log('  PUT    /api/restaurant/orders/:id/status - Update order status');
  console.log('  GET    /api/restaurant/orders/stats/dashboard - Dashboard stats');
  console.log('═══════════════════════════════════════════════════');
  console.log('✨ All systems operational. Ready to serve!');
  console.log('═══════════════════════════════════════════════════');
});