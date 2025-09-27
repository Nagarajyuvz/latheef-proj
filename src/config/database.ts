import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Database configuration - update these values for your MySQL setup
const dbConfig: DatabaseConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password', // Update with your MySQL password
  database: 'muslim_donations',
  port: 3306
};

// Create connection pool for better performance
export const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Initialize database and create tables
export const initializeDatabase = async () => {
  const connection = await createConnection();
  
  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.execute(`USE ${dbConfig.database}`);
    
    // Create members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        address TEXT,
        join_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create donations table
    await connection.execute(`
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
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        INDEX idx_member_id (member_id),
        INDEX idx_donation_date (donation_date),
        INDEX idx_type (type)
      )
    `);
    
    // Insert sample data if tables are empty
    const [memberRows] = await connection.execute('SELECT COUNT(*) as count FROM members');
    const memberCount = (memberRows as any)[0].count;
    
    if (memberCount === 0) {
      // Insert sample members
      await connection.execute(`
        INSERT INTO members (name, email, phone, address, join_date, is_active) VALUES
        ('Ahmed Hassan', 'ahmed.hassan@email.com', '+1-555-0101', '123 Main St, City, State', '2023-01-15', TRUE),
        ('Fatima Al-Zahra', 'fatima.zahra@email.com', '+1-555-0102', '456 Oak Ave, City, State', '2023-02-20', TRUE),
        ('Muhammad Omar', 'muhammad.omar@email.com', '+1-555-0103', '789 Pine Rd, City, State', '2023-03-10', TRUE),
        ('Aisha Rahman', 'aisha.rahman@email.com', '+1-555-0104', '321 Elm St, City, State', '2023-04-05', TRUE),
        ('Ali Mahmoud', 'ali.mahmoud@email.com', '+1-555-0105', '654 Cedar Ave, City, State', '2023-05-12', TRUE)
      `);
      
      // Insert sample donations
      const currentMonth = new Date().toISOString().slice(0, 7);
      await connection.execute(`
        INSERT INTO donations (member_id, amount, donation_date, type, payment_method, notes) VALUES
        (1, 100.00, '${currentMonth}-01', 'monthly', 'cash', 'Monthly donation'),
        (2, 150.00, '${currentMonth}-02', 'monthly', 'card', 'Monthly donation'),
        (3, 200.00, '${currentMonth}-03', 'event', 'bank_transfer', 'Ramadan donation'),
        (1, 75.00, '${currentMonth}-05', 'event', 'cash', 'Eid donation'),
        (4, 120.00, '${currentMonth}-08', 'monthly', 'card', 'Monthly donation')
      `);
      
      // Update event donations with event names
      await connection.execute(`
        UPDATE donations SET event_name = 'Ramadan Charity' WHERE type = 'event' AND amount = 200.00
      `);
      await connection.execute(`
        UPDATE donations SET event_name = 'Eid al-Fitr' WHERE type = 'event' AND amount = 75.00
      `);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
};