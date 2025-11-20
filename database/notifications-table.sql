-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    type ENUM('order', 'review', 'system', 'alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    INDEX idx_restaurant_read (restaurant_id, is_read),
    INDEX idx_created_at (created_at)
);

-- Insert sample notifications for testing
INSERT INTO notifications (restaurant_id, type, title, message, reference_id, is_read) VALUES
(1, 'order', 'New Order Received', 'You have received a new order #12345', 1, 0),
(1, 'review', 'New Review', 'A customer left a 5-star review for your restaurant', 1, 0),
(1, 'system', 'Welcome!', 'Welcome to TasteNow! Start managing your orders and menu.', NULL, 1);
