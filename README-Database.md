# MySQL Database Setup for Muslim Community Donation Tracker

This application now uses MySQL database to store member and donation information in separate tables.

## Database Configuration

### 1. Update Database Credentials

Edit `src/config/database.ts` and update the database configuration:

```typescript
const dbConfig: DatabaseConfig = {
  host: 'localhost',        // Your MySQL host
  user: 'root',            // Your MySQL username
  password: 'your_password', // Your MySQL password
  database: 'muslim_donations',
  port: 3306               // Your MySQL port
};
```

### 2. Database Setup Options

#### Option A: Automatic Setup (Recommended)
The application will automatically create the database and tables when you first run it. Just make sure your MySQL server is running and the credentials are correct.

#### Option B: Manual Setup
Run the SQL commands in `database-setup.sql` in your MySQL client:

```bash
mysql -u root -p < database-setup.sql
```

## Database Schema

### Members Table
```sql
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Donations Table
```sql
CREATE TABLE donations (
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
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## Key Features

### 1. Separate Tables
- **Members table**: Stores member information
- **Donations table**: Stores donation records with foreign key reference to members

### 2. Data Integrity
- Foreign key constraints ensure data consistency
- Cascade delete removes all donations when a member is deleted
- Proper indexing for better query performance

### 3. Async Operations
- All database operations are now asynchronous
- Proper error handling with fallback to localStorage
- Loading states for better user experience

### 4. Database Views
The setup includes helpful views for reporting:
- `member_donation_summary`: Summary of donations by member
- `monthly_donation_stats`: Monthly donation statistics
- `event_donation_summary`: Event-based donation summary

## Sample Queries

### Get all donations for a specific member:
```sql
SELECT d.*, m.name as member_name 
FROM donations d 
JOIN members m ON d.member_id = m.id 
WHERE m.id = 1;
```

### Get monthly donation totals:
```sql
SELECT 
    DATE_FORMAT(donation_date, '%Y-%m') as month,
    SUM(amount) as total_amount,
    COUNT(*) as donation_count
FROM donations 
GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
ORDER BY month DESC;
```

### Get top donors:
```sql
SELECT 
    m.name,
    SUM(d.amount) as total_donated,
    COUNT(d.id) as donation_count
FROM members m
JOIN donations d ON m.id = d.member_id
GROUP BY m.id, m.name
ORDER BY total_donated DESC;
```

## Troubleshooting

### Connection Issues
1. Ensure MySQL server is running
2. Check database credentials in `src/config/database.ts`
3. Verify the database user has proper permissions
4. Check firewall settings if connecting to remote database

### Fallback Mode
If database connection fails, the application will fall back to localStorage mode with a warning message.

## Production Considerations

1. **Security**: Use environment variables for database credentials
2. **Connection Pooling**: The current setup uses connection pooling for better performance
3. **Backup**: Implement regular database backups
4. **SSL**: Enable SSL connections for production databases
5. **User Management**: Create dedicated database users with minimal required permissions