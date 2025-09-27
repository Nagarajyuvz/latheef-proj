-- MySQL Database Setup for Muslim Community Donation Tracker
-- Run these commands in your MySQL server to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS muslim_donations;
USE muslim_donations;

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_join_date (join_date)
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    donation_date DATE NOT NULL,
    type ENUM('monthly', 'event') NOT NULL,
    event_name VARCHAR(255),
    notes TEXT,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'other') DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_member_id (member_id),
    INDEX idx_donation_date (donation_date),
    INDEX idx_type (type),
    INDEX idx_event_name (event_name),
    INDEX idx_amount (amount)
);

-- Insert sample members
INSERT INTO members (name, email, phone, address, join_date, is_active) VALUES
('Ahmed Hassan', 'ahmed.hassan@email.com', '+1-555-0101', '123 Main St, City, State', '2023-01-15', TRUE),
('Fatima Al-Zahra', 'fatima.zahra@email.com', '+1-555-0102', '456 Oak Ave, City, State', '2023-02-20', TRUE),
('Muhammad Omar', 'muhammad.omar@email.com', '+1-555-0103', '789 Pine Rd, City, State', '2023-03-10', TRUE),
('Aisha Rahman', 'aisha.rahman@email.com', '+1-555-0104', '321 Elm St, City, State', '2023-04-05', TRUE),
('Ali Mahmoud', 'ali.mahmoud@email.com', '+1-555-0105', '654 Cedar Ave, City, State', '2023-05-12', TRUE);

-- Insert sample donations
INSERT INTO donations (member_id, amount, donation_date, type, event_name, payment_method, notes) VALUES
(1, 100.00, '2024-01-01', 'monthly', NULL, 'cash', 'Monthly donation'),
(2, 150.00, '2024-01-02', 'monthly', NULL, 'card', 'Monthly donation'),
(3, 200.00, '2024-01-03', 'event', 'Ramadan Charity', 'bank_transfer', 'Ramadan donation'),
(1, 75.00, '2024-01-05', 'event', 'Eid al-Fitr', 'cash', 'Eid donation'),
(4, 120.00, '2024-01-08', 'monthly', NULL, 'card', 'Monthly donation'),
(5, 90.00, '2024-01-10', 'monthly', NULL, 'cash', 'Monthly donation'),
(2, 300.00, '2024-01-15', 'event', 'Mosque Construction', 'bank_transfer', 'Building fund donation'),
(3, 80.00, '2024-01-20', 'monthly', NULL, 'card', 'Monthly donation');

-- Create a view for donation summary by member
CREATE OR REPLACE VIEW member_donation_summary AS
SELECT 
    m.id,
    m.name,
    m.email,
    m.is_active,
    COUNT(d.id) as total_donations,
    COALESCE(SUM(d.amount), 0) as total_amount,
    COALESCE(MAX(d.donation_date), m.join_date) as last_donation_date
FROM members m
LEFT JOIN donations d ON m.id = d.member_id
GROUP BY m.id, m.name, m.email, m.is_active;

-- Create a view for monthly donation statistics
CREATE OR REPLACE VIEW monthly_donation_stats AS
SELECT 
    DATE_FORMAT(donation_date, '%Y-%m') as month_year,
    COUNT(*) as total_donations,
    COUNT(DISTINCT member_id) as unique_donors,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    SUM(CASE WHEN type = 'monthly' THEN amount ELSE 0 END) as monthly_amount,
    SUM(CASE WHEN type = 'event' THEN amount ELSE 0 END) as event_amount
FROM donations
GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
ORDER BY month_year DESC;

-- Create a view for event donation summary
CREATE OR REPLACE VIEW event_donation_summary AS
SELECT 
    event_name,
    COUNT(*) as donation_count,
    COUNT(DISTINCT member_id) as unique_donors,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    MIN(donation_date) as first_donation,
    MAX(donation_date) as last_donation
FROM donations
WHERE type = 'event' AND event_name IS NOT NULL
GROUP BY event_name
ORDER BY total_amount DESC;