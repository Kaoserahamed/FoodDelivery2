# FoodDelivery2 Authentication Module

## Overview
Authentication system for customer/restaurant/delivery partner/admin roles with OAuth2 and JWT.

## Files
- `services/customer/auth.py` - Authentication logic
- `services/customer/models.py` - User and role models
- `services/customer/middleware.py` - Auth middleware and RBAC
- `services/customer/routes/auth.py` - Auth API routes

## Features
- Customer, restaurant, delivery partner, and admin account registration/login
- JWT-based session management
- OAuth2 provider integration
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Session timeout handling

## Tech Stack
- Node.js/Express
- MySQL
- JWT
- OAuth2
- bcrypt for password hashing

## Day 5 Outcome
Authentication module implemented. 1 PR created targeting development.