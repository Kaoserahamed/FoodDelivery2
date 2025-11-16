-- ============================================
-- TASTENOW DATABASE TRIGGERS
-- ============================================

USE tastenow;

-- ============================================
-- TRIGGER: Update restaurant updated_at on edit
-- ============================================
DELIMITER //
CREATE TRIGGER trg_restaurant_updated
BEFORE UPDATE ON restaurants
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Update menu_items updated_at on edit
-- ============================================
DELIMITER //
CREATE TRIGGER trg_menu_item_updated
BEFORE UPDATE ON menu_items
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Log admin actions
-- ============================================
DELIMITER //
CREATE TRIGGER trg_log_restaurant_update
AFTER UPDATE ON restaurants
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs (admin_id, action, table_affected, record_id, details)
    VALUES (1, 'UPDATE', 'restaurants', NEW.restaurant_id, 
            CONCAT('Updated restaurant: ', NEW.name));
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Log restaurant creation
-- ============================================
DELIMITER //
CREATE TRIGGER trg_log_restaurant_insert
AFTER INSERT ON restaurants
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs (admin_id, action, table_affected, record_id, details)
    VALUES (1, 'INSERT', 'restaurants', NEW.restaurant_id, 
            CONCAT('Created restaurant: ', NEW.name));
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Log order creation
-- ============================================
DELIMITER //
CREATE TRIGGER trg_log_order_created
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs (admin_id, action, table_affected, record_id, details)
    VALUES (NEW.user_id, 'INSERT', 'orders', NEW.order_id, 
            CONCAT('Order created: ', NEW.order_number));
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Validate order total before insert
-- ============================================
DELIMITER //
CREATE TRIGGER trg_validate_order_total
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.total_amount != (NEW.subtotal + NEW.delivery_fee + NEW.tax) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Order total calculation error';
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Prevent duplicate order items
-- ============================================
DELIMITER //
CREATE TRIGGER trg_prevent_duplicate_items
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count 
    FROM order_items 
    WHERE order_id = NEW.order_id AND item_id = NEW.item_id;
    
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Item already exists in this order';
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Update restaurant rating on review
-- ============================================
DELIMITER //
CREATE TRIGGER trg_update_rating_on_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id)
    WHERE restaurant_id = NEW.restaurant_id;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Prevent rating out of range
-- ============================================
DELIMITER //
CREATE TRIGGER trg_validate_rating
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Prevent inactive item ordering
-- ============================================
DELIMITER //
CREATE TRIGGER trg_check_item_available
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_is_available BOOLEAN;
    SELECT is_available INTO v_is_available 
    FROM menu_items 
    WHERE item_id = NEW.item_id;
    
    IF v_is_available = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Item is not available for order';
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Calculate order item subtotal
-- ============================================
DELIMITER //
CREATE TRIGGER trg_calculate_order_item_subtotal
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.item_price * NEW.quantity;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Set estimated delivery time
-- ============================================
DELIMITER //
CREATE TRIGGER trg_set_estimated_delivery
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_prep_time INT;
    SELECT MAX(preparation_time) INTO v_prep_time 
    FROM menu_items 
    WHERE restaurant_id = NEW.restaurant_id;
    
    UPDATE orders
    SET estimated_delivery_time = DATE_ADD(NOW(), INTERVAL (COALESCE(v_prep_time, 15) + 20) MINUTE)
    WHERE order_id = NEW.order_id;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Log order status changes
-- ============================================
DELIMITER //
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO admin_logs (admin_id, action, table_affected, record_id, details)
        VALUES (1, 'UPDATE', 'orders', NEW.order_id, 
                CONCAT('Order status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGER: Prevent editing completed orders
-- ============================================
DELIMITER //
CREATE TRIGGER trg_prevent_edit_completed_order
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status IN ('delivered', 'cancelled') AND OLD.status != NEW.status THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot modify completed or cancelled orders';
    END IF;
END //
DELIMITER ;
