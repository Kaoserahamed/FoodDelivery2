import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;