-- ============================================
-- TASTENOW DATABASE STORED PROCEDURES
-- ============================================

USE tastenow;

-- ============================================
-- PROCEDURE: Get Restaurant Details with Stats
-- ============================================
DELIMITER //
CREATE PROCEDURE GetRestaurantDetails(IN p_restaurant_id INT)
BEGIN
    SELECT 
        r.restaurant_id,
        r.name,
        r.description,
        r.cuisine_type,
        r.address,
        r.phone,
        r.email,
        r.opening_time,
        r.closing_time,
        r.delivery_time,
        r.price_range,
        r.rating,
        r.total_reviews,
        r.is_open,
        COUNT(DISTINCT m.item_id) as total_menu_items,
        COUNT(DISTINCT o.order_id) as total_orders
    FROM restaurants r
    LEFT JOIN menu_items m ON r.restaurant_id = m.restaurant_id AND m.is_available = TRUE
    LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
    WHERE r.restaurant_id = p_restaurant_id
    GROUP BY r.restaurant_id;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Create New Order
-- ============================================
DELIMITER //
CREATE PROCEDURE CreateOrder(
    IN p_user_id INT,
    IN p_restaurant_id INT,
    IN p_delivery_address TEXT,
    IN p_subtotal DECIMAL(10,2),
    IN p_delivery_fee DECIMAL(10,2),
    IN p_tax DECIMAL(10,2),
    OUT p_order_id INT
)
BEGIN
    DECLARE v_order_number VARCHAR(20);
    
    -- Generate unique order number
    SET v_order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
    
    -- Insert order
    INSERT INTO orders (user_id, restaurant_id, order_number, delivery_address, subtotal, delivery_fee, tax, total_amount, status)
    VALUES (p_user_id, p_restaurant_id, v_order_number, p_delivery_address, p_subtotal, p_delivery_fee, p_tax, (p_subtotal + p_delivery_fee + p_tax));
    
    SET p_order_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Add Item to Order
-- ============================================
DELIMITER //
CREATE PROCEDURE AddOrderItem(
    IN p_order_id INT,
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_item_price DECIMAL(10,2);
    DECLARE v_item_name VARCHAR(100);
    
    -- Get item details
    SELECT price, name INTO v_item_price, v_item_name FROM menu_items WHERE item_id = p_item_id;
    
    -- Insert order item
    INSERT INTO order_items (order_id, item_id, item_name, item_price, quantity, subtotal)
    VALUES (p_order_id, p_item_id, v_item_name, v_item_price, p_quantity, v_item_price * p_quantity);
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Update Order Status
-- ============================================
DELIMITER //
CREATE PROCEDURE UpdateOrderStatus(
    IN p_order_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    UPDATE orders
    SET status = p_new_status
    WHERE order_id = p_order_id;
    
    -- If delivered, set actual delivery time
    IF p_new_status = 'delivered' THEN
        UPDATE orders
        SET actual_delivery_time = NOW()
        WHERE order_id = p_order_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Get Customer Orders
-- ============================================
DELIMITER //
CREATE PROCEDURE GetCustomerOrders(IN p_user_id INT)
BEGIN
    SELECT 
        o.order_id,
        o.order_number,
        r.name as restaurant_name,
        o.total_amount,
        o.status,
        o.order_date,
        COUNT(oi.order_item_id) as item_count
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.restaurant_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = p_user_id
    GROUP BY o.order_id
    ORDER BY o.order_date DESC;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Get Restaurant Orders
-- ============================================
DELIMITER //
CREATE PROCEDURE GetRestaurantOrders(IN p_restaurant_id INT, IN p_status VARCHAR(20) DEFAULT NULL)
BEGIN
    SELECT 
        o.order_id,
        o.order_number,
        u.name as customer_name,
        u.phone as customer_phone,
        o.total_amount,
        o.status,
        o.order_date,
        o.delivery_address,
        COUNT(oi.order_item_id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.restaurant_id = p_restaurant_id
    AND (p_status IS NULL OR o.status = p_status)
    GROUP BY o.order_id
    ORDER BY o.order_date DESC;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Get Menu Items by Category
-- ============================================
DELIMITER //
CREATE PROCEDURE GetMenuByCategory(IN p_restaurant_id INT, IN p_category_id INT DEFAULT NULL)
BEGIN
    SELECT 
        mi.item_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.is_vegetarian,
        mi.is_available,
        mi.preparation_time,
        mc.name as category_name
    FROM menu_items mi
    JOIN menu_categories mc ON mi.category_id = mc.category_id
    WHERE mi.restaurant_id = p_restaurant_id
    AND (p_category_id IS NULL OR mi.category_id = p_category_id)
    AND mi.is_available = TRUE
    ORDER BY mc.display_order, mi.name;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Get Restaurant Reviews
-- ============================================
DELIMITER //
CREATE PROCEDURE GetRestaurantReviews(IN p_restaurant_id INT)
BEGIN
    SELECT 
        r.review_id,
        u.name as customer_name,
        r.rating,
        r.comment,
        r.created_at
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.restaurant_id = p_restaurant_id
    ORDER BY r.created_at DESC;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Add Restaurant Review
-- ============================================
DELIMITER //
CREATE PROCEDURE AddRestaurantReview(
    IN p_user_id INT,
    IN p_restaurant_id INT,
    IN p_order_id INT,
    IN p_rating INT,
    IN p_comment TEXT
)
BEGIN
    -- Insert review
    INSERT INTO reviews (user_id, restaurant_id, order_id, rating, comment)
    VALUES (p_user_id, p_restaurant_id, p_order_id, p_rating, p_comment);
    
    -- Update restaurant rating (average of all reviews)
    UPDATE restaurants
    SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = p_restaurant_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = p_restaurant_id)
    WHERE restaurant_id = p_restaurant_id;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Get Dashboard Statistics
-- ============================================
DELIMITER //
CREATE PROCEDURE GetDashboardStats(IN p_restaurant_id INT)
BEGIN
    SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
        SUM(CASE WHEN DATE(o.order_date) = CURDATE() THEN o.total_amount ELSE 0 END) as today_revenue,
        SUM(o.total_amount) as total_revenue
    FROM orders o
    WHERE o.restaurant_id = p_restaurant_id;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Search Restaurants
-- ============================================
DELIMITER //
CREATE PROCEDURE SearchRestaurants(IN p_search_term VARCHAR(100))
BEGIN
    SELECT 
        restaurant_id,
        name,
        description,
        cuisine_type,
        delivery_time,
        price_range,
        rating,
        total_reviews,
        is_open
    FROM restaurants
    WHERE (name LIKE CONCAT('%', p_search_term, '%')
           OR description LIKE CONCAT('%', p_search_term, '%')
           OR cuisine_type LIKE CONCAT('%', p_search_term, '%'))
    AND is_open = TRUE
    ORDER BY rating DESC, total_reviews DESC;
END //
DELIMITER ;

-- ============================================
-- PROCEDURE: Search Menu Items
-- ============================================
DELIMITER //
CREATE PROCEDURE SearchMenuItems(IN p_search_term VARCHAR(100))
BEGIN
    SELECT 
        mi.item_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.is_vegetarian,
        mi.preparation_time,
        r.restaurant_id,
        r.name as restaurant_name,
        r.rating
    FROM menu_items mi
    JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
    WHERE (mi.name LIKE CONCAT('%', p_search_term, '%')
           OR mi.description LIKE CONCAT('%', p_search_term, '%'))
    AND mi.is_available = TRUE
    AND r.is_open = TRUE
    ORDER BY r.rating DESC, mi.name;
END //
DELIMITER ;
