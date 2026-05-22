const db = require('./config/database');

async function repairDatabase() {
    try {
        console.log('--- Repairing Database Schema ---');
        
        // Disable foreign key checks to allow dropping tables
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log('Dropping old tables...');
        await db.execute('DROP TABLE IF EXISTS fines');
        await db.execute('DROP TABLE IF EXISTS borrow_records');
        await db.execute('DROP TABLE IF EXISTS books');
        await db.execute('DROP TABLE IF EXISTS categories');
        await db.execute('DROP TABLE IF EXISTS users');

        console.log('Recreating tables with correct schema...');
        
        // 1. Users
        await db.execute(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'librarian', 'member') NOT NULL DEFAULT 'member',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Categories
        await db.execute(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            )
        `);

        // 3. Books
        await db.execute(`
            CREATE TABLE books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                category_id INT,
                isbn VARCHAR(50) UNIQUE,
                quantity INT NOT NULL DEFAULT 0,
                shelf VARCHAR(50),
                status ENUM('available', 'not_available') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);

        // 4. Borrow Records
        await db.execute(`
            CREATE TABLE borrow_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                book_id INT NOT NULL,
                borrow_date DATE NOT NULL,
                due_date DATE NOT NULL,
                return_date DATE,
                status ENUM('pending', 'approved', 'returned', 'rejected', 'overdue') DEFAULT 'pending',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `);

        // 5. Fines
        await db.execute(`
            CREATE TABLE fines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                borrow_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
                FOREIGN KEY (borrow_id) REFERENCES borrow_records(id) ON DELETE CASCADE
            )
        `);

        // Re-enable foreign key checks
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database repair complete!');
        process.exit();
    } catch (err) {
        console.error('Repair failed:', err.message);
        process.exit(1);
    }
}

repairDatabase();
