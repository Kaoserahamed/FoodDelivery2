import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Foods from './pages/Foods';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';

// Restaurant Pages
import RestaurantLogin from './pages/restaurant/RestaurantLogin';
import RestaurantRegister from './pages/restaurant/RestaurantRegister';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantProfile from './pages/restaurant/RestaurantProfile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Customer Routes */}
          <Route path="/*" element={
            <>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/restaurants" element={<Restaurants />} />
                  <Route path="/foods" element={<Foods />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />

          {/* Restaurant Routes */}
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/register" element={<RestaurantRegister />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/menu" element={<RestaurantMenu />} />
          <Route path="/restaurant/orders" element={<RestaurantOrders />} />
          <Route path="/restaurant/profile" element={<RestaurantProfile />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/restaurants" element={<AdminRestaurants />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;