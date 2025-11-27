# TasteNow - Food Delivery Platform

A full-stack food delivery application built with Node.js, Express, and MySQL.

## Features

- **Customer Portal**: Browse restaurants, view menus, place orders, track order history
- **Restaurant Dashboard**: Manage menu items, view and process orders, track reviews
- **Admin Panel**: Manage restaurants, users, and monitor platform activity
- **Real-time Notifications**: Order status updates and notifications
- **Review System**: Customers can rate and review restaurants
- **Cart Management**: Add items to cart and place orders

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

1. Open MySQL and create a new database:

```sql
CREATE DATABASE food_delivery;
```

2. Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=food_delivery
PORT=5000
JWT_SECRET=your_secret_key_here
```

### 3. Initialize Database

Run the database setup script to create tables and insert sample data:

```bash
node database/setup.js
```

This will create all necessary tables and populate them with:
- Sample restaurants
- Menu items and categories
- Admin user (email: admin@tastenow.com, password: admin123)
- Test customer accounts
- Test restaurant accounts

### 4. Start the Server

```bash
node server.js
```

The server will start on `http://localhost:5000`

## Default Login Credentials

### Admin Account
- Email: `admin@tastenow.com`
- Password: `admin123`
- Access: `http://localhost:5000/pages/admin/dashboard.html`

### Restaurant Account (Spice Palace)
- Email: `spicepalace@restaurant.com`
- Password: `restaurant123`
- Access: `http://localhost:5000/pages/restaurant/dashboard.html`

### Customer Account
- Email: `customer@example.com`
- Password: `customer123`
- Access: `http://localhost:5000/index.html`

## Project Structure

```
FoodDelivery/
├── api/
│   └── routes/          # API route handlers
├── assets/
│   └── css/             # Stylesheets
├── config/
│   └── database.js      # Database configuration
├── database/
│   └── setup.js         # Database initialization script
├── js/                  # Frontend JavaScript files
├── middleware/
│   └── auth.js          # Authentication middleware
├── pages/
│   ├── admin/           # Admin dashboard pages
│   ├── customer/        # Customer pages
│   └── restaurant/      # Restaurant dashboard pages
├── .env                 # Environment variables
├── server.js            # Main server file
└── package.json         # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Customer login
- `POST /api/restaurant/signup` - Register restaurant
- `POST /api/restaurant/login` - Restaurant login

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/menu` - Get restaurant menu

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/customer/:userId` - Get customer orders
- `GET /api/restaurant/orders` - Get restaurant orders
- `PUT /api/restaurant/orders/:id/status` - Update order status

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/restaurants` - Manage restaurants
- `GET /api/admin/users` - Manage users

## Usage

### For Customers

1. Visit `http://localhost:5000/index.html`
2. Browse restaurants and menu items
3. Add items to cart
4. Register/Login to place orders
5. Track order status in order history

### For Restaurant Owners

1. Visit `http://localhost:5000/pages/restaurant/dashboard.html`
2. Login with restaurant credentials
3. Manage menu items and categories
4. View and process incoming orders
5. Update order status (Accept/Reject/Complete)
6. View customer reviews

### For Admins

1. Visit `http://localhost:5000/pages/admin/dashboard.html`
2. Login with admin credentials
3. View platform statistics
4. Manage restaurants and users
5. Monitor orders and activity

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Verify MySQL is running
2. Check credentials in `.env` file match your MySQL setup
3. Ensure the database `food_delivery` exists

### Port Already in Use

If port 5000 is already in use:
1. Change the `PORT` value in `.env` file
2. Update API_BASE_URL in frontend files if needed

### Server Won't Start

1. Make sure all dependencies are installed: `npm install`
2. Check for any error messages in the console
3. Verify Node.js version: `node --version` (should be v14+)

## Development

To run in development mode with auto-restart:

```bash
npm install -g nodemon
nodemon server.js
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins, Inter)

## License

This project is for educational purposes.

## Support

For issues or questions, please check the troubleshooting section above.
