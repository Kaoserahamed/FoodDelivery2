# TasteNow React Client

This is the complete React frontend for the TasteNow food delivery platform, featuring customer, restaurant, and admin interfaces.

## Features

### Customer Interface
- **Modern React App**: Built with React 18 and React Router
- **Responsive Design**: Mobile-first responsive design
- **User Authentication**: Login and registration
- **Restaurant Browsing**: View all restaurants with filtering and sorting
- **Food Menu**: Browse all dishes with category filtering
- **Shopping Cart**: Add items to cart and manage quantities
- **Order Management**: Place orders and view order history

### Restaurant Interface
- **Restaurant Dashboard**: Overview of orders, revenue, and statistics
- **Menu Management**: Add, edit, and manage menu items and categories
- **Order Management**: View and update order status in real-time
- **Profile Management**: Update restaurant information and settings
- **Status Control**: Open/close restaurant for orders

### Admin Interface
- **Admin Dashboard**: Platform-wide statistics and analytics
- **Restaurant Management**: Approve, suspend, or manage restaurant accounts
- **User Management**: View and manage customer accounts
- **System Overview**: Monitor platform health and activity

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the client directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── admin/
│   │   │   └── AdminHeader.js
│   │   └── restaurant/
│   │       └── RestaurantHeader.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Restaurants.js
│   │   ├── Foods.js
│   │   ├── Cart.js
│   │   ├── Orders.js
│   │   ├── admin/
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminRestaurants.js
│   │   │   └── AdminUsers.js
│   │   └── restaurant/
│   │       ├── RestaurantLogin.js
│   │       ├── RestaurantRegister.js
│   │       ├── RestaurantDashboard.js
│   │       ├── RestaurantMenu.js
│   │       ├── RestaurantOrders.js
│   │       └── RestaurantProfile.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Access Points

### Customer Interface
- **Home**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login`
- **Register**: `http://localhost:3000/register`
- **Restaurants**: `http://localhost:3000/restaurants`
- **Foods**: `http://localhost:3000/foods`
- **Cart**: `http://localhost:3000/cart`
- **Orders**: `http://localhost:3000/orders`

### Restaurant Interface
- **Login**: `http://localhost:3000/restaurant/login`
- **Register**: `http://localhost:3000/restaurant/register`
- **Dashboard**: `http://localhost:3000/restaurant/dashboard`
- **Menu Management**: `http://localhost:3000/restaurant/menu`
- **Orders**: `http://localhost:3000/restaurant/orders`
- **Profile**: `http://localhost:3000/restaurant/profile`

### Admin Interface
- **Login**: `http://localhost:3000/admin/login`
- **Dashboard**: `http://localhost:3000/admin/dashboard`
- **Restaurants**: `http://localhost:3000/admin/restaurants`
- **Users**: `http://localhost:3000/admin/users`

## API Integration

The app connects to the backend API running on port 5000. All API calls are handled through the `utils/api.js` file which includes:

### Customer APIs
- Authentication endpoints
- Restaurant data
- Menu items
- Order management
- User profile

### Restaurant APIs
- Restaurant authentication
- Dashboard statistics
- Menu management
- Order management
- Profile management

### Admin APIs
- Admin authentication
- Platform statistics
- Restaurant management
- User management

## Styling

The app uses custom CSS with CSS variables for consistent theming. The design system includes:

- Color palette with primary/secondary colors
- Typography scale
- Spacing system
- Component styles
- Responsive breakpoints
- Consistent UI across all interfaces

## Authentication Flow

### Customer Authentication
- JWT token stored in `localStorage` as `token`
- User data stored as `user`
- Automatic redirect to login if token expires

### Restaurant Authentication
- JWT token stored in `localStorage` as `restaurantToken`
- Restaurant data stored as `restaurant`
- Separate authentication flow from customers

### Admin Authentication
- JWT token stored in `localStorage` as `adminToken`
- Admin data stored as `admin`
- Highest level access with platform management capabilities

## Backend Integration

This React app works with the existing Node.js/Express backend. Make sure the backend server is running on port 5000 before starting the React development server.

The backend should have CORS enabled to allow requests from `http://localhost:3000`.

## Development Notes

- All interfaces share the same design system for consistency
- Responsive design works across desktop, tablet, and mobile
- Real-time updates for order status changes
- Form validation and error handling
- Loading states and user feedback
- Modular component architecture for maintainability