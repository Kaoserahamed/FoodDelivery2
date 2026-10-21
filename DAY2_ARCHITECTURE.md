# Day 2 Architecture: Service Boundaries, Database Schema, API Contracts

## Repository
`FoodDelivery2` — TasteNow Food Delivery Platform (Node.js, Express, MySQL)

## Proposed Concept
FreshDrop: Hyperlocal food delivery ecosystem with ghost kitchen management, subscription meal plans, dietary restriction filtering, group ordering, and delivery route optimization.

## Service Boundaries
| Service | Responsibility | Technology |
|---------|---------------|------------|
| Customer Service | Customer profiles, addresses, payment methods, order history | Node.js/Express, MySQL |
| Restaurant Service | Restaurant profiles, menus, hours, location, cuisine, ratings | Node.js/Express, MySQL |
| Order Service | Order lifecycle, cart, checkout, payment, fulfillment | Node.js/Express, MySQL |
| Delivery Service | Partner management, order offers, route optimization, tracking | Node.js/Express, MySQL, Map API |
| Payment Service | Stripe/PayPal, wallet, refunds | Node.js/Express, Stripe API |
| Notification Service | Push, SMS, email for order updates | Node.js, Twilio/Firebase |
| Ghost Kitchen Service | Virtual brands, shared kitchen dashboard, equipment scheduling | Node.js/Express, MySQL |
| Subscription Service | Meal plans, auto-renewal, plan switching | Node.js/Express, MySQL |
| Dietary Service | Restriction filtering, allergen tags, nutritional info | Node.js/Express, MySQL |
| Group Order Service | Shared cart, split payments, deadline reminders | Node.js/Express, MySQL |
| Frontend | Customer web/app, restaurant dashboard, partner app | HTML/CSS/Vanilla JS → React migration planned |

## Database Schema (MySQL)
- `users` — id, email, password_hash, role (customer/restaurant/partner/admin), created_at
- `customers` — id, user_id, addresses, payment_methods, dietary_preferences, order_history, created_at
- `restaurants` — id, name, cuisine_type, address, hours, rating, created_at
- `menu_items` — id, restaurant_id, name, description, price, category, modifiers, available, images, dietary_tags, nutritional_info, created_at
- `orders` — id, customer_id, restaurant_id, partner_id, state, total, payment_status, address, created_at, updated_at
- `order_items` — id, order_id, menu_item_id, quantity, modifiers, price
- `delivery_partners` — id, user_id, vehicle_type, availability, ratings, earnings, created_at
- `delivery_zones` — id, polygon, delivery_fee, minimum_order, created_at
- `subscriptions` — id, customer_id, plan_type, auto_renew, created_at
- `loyalty` — id, customer_id, points, tier, created_at
- `promo_codes` — id, code, discount_type, min_order, expiration, created_at
- `group_orders` — id, coordinator_id, deadline, status, split_payment, created_at
- `group_order_items` — id, group_order_id, customer_id, items, payment_status
- `ratings_reviews` — id, order_id, restaurant_rating, delivery_rating, review, created_at

## API Contracts
### Customer
- `GET /api/restaurants` → list (filters: cuisine, rating, delivery time)
- `GET /api/restaurants/:id/menu` → {items}
- `POST /api/orders` — {restaurantId, items, address, payment} → {order}
- `GET /api/orders/:id` → {order, tracking}
- `GET /api/orders/customer/:userId` → list

### Restaurant
- `POST /api/restaurants/signup` → {restaurant}
- `POST /api/restaurants/login` → {token}
- `GET /api/restaurant/orders` → list (incoming)
- `PUT /api/restaurant/orders/:id/status` → {order}
- `GET /api/restaurant/orders/:id/menu` → manage items

### Delivery Partner
- `POST /api/restaurant/login` (partner) → {token}
- `GET /api/partners/offers` → list
- `POST /api/offers/:id/accept` → 204
- `GET /api/partners/earnings` → {summary}

### Admin
- `GET /api/admin/dashboard/stats` → {GMV, orders, users}
- `GET /api/admin/restaurants` → list
- `GET /api/admin/users` → list

### Group Orders
- `POST /api/group-orders` — {coordinatorId, deadline} → {groupOrder}
- `POST /api/group-orders/{id}/items` — {customerId, items} → {item}
- `POST /api/group-orders/{id}/split-payment` → 204

### Dietary
- `GET /api/restaurants?dietary=vegan&keto&gluten-free` → filtered list

## Technical Notes
- Currently Vanilla JS frontend; migration to React planned
- No real-time tracking; WebSocket/SSE planned
- No delivery partner app; mobile app planned
- No route optimization; Map API integration planned
- No subscription/loyalty/dietary/group ordering yet
- MySQL database with setup script for sample data

## Day 2 Outcome
Architecture design documented. No code changes. 0 PRs. Ready for Day 3 (CI/CD pipeline).