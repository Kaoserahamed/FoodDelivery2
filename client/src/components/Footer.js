import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TasteNow</h3>
            <p>Your local food ordering platform. Supporting local restaurants and connecting hungry customers.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/restaurants">Restaurants</Link>
            <Link to="/foods">Foods</Link>
          </div>

          <div className="footer-section">
            <h3>For Restaurants</h3>
            <a href="#">Partner With Us</a>
            <a href="#">Restaurant Dashboard</a>
            <a href="#">Terms & Conditions</a>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <p><i className="fas fa-envelope"></i> info@tastenow.com</p>
            <p><i className="fas fa-phone"></i> +1 234 567 8900</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Food Street, City</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 TasteNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;