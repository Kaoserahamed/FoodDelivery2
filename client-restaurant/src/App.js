import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import RestaurantLogin from './pages/RestaurantLogin';
import RestaurantRegister from './pages/RestaurantRegister';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import RestaurantOrders from './pages/RestaurantOrders';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RestaurantProvider>
        <div className="App">
          <Routes>
            {/* Primary routes */}
            <Route path="/" element={<RestaurantLogin />} />
            <Route path="/login" element={<RestaurantLogin />} />
            <Route path="/register" element={<RestaurantRegister />} />
            <Route path="/dashboard" element={<RestaurantDashboard />} />
            <Route path="/menu" element={<RestaurantMenu />} />
            <Route path="/orders" element={<RestaurantOrders />} />

            {/* Support legacy /restaurant/* paths */}
            <Route path="/restaurant" element={<RestaurantLogin />} />
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route path="/restaurant/register" element={<RestaurantRegister />} />
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurant/menu" element={<RestaurantMenu />} />
            <Route path="/restaurant/orders" element={<RestaurantOrders />} />
          </Routes>
        </div>
      </RestaurantProvider>
    </Router>
  );
}

export default App;