const db = require('./config/database');
const bcrypt = require('bcryptjs');

const createTables = async () => {
    try {
        // Users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'librarian', 'member') NOT NULL DEFAULT 'member',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Categories table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            )
        `);

        // Books table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS books (
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

        // Borrow Records table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS borrow_records (
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

        // Fines table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS fines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                borrow_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
                FOREIGN KEY (borrow_id) REFERENCES borrow_records(id) ON DELETE CASCADE
            )
        `);

        // Insert default users
        const adminPassword = await bcrypt.hash('admin123', 10);
        const librarianPassword = await bcrypt.hash('lib123', 10);
        const memberPassword = await bcrypt.hash('member123', 10);

        await db.execute(`
            INSERT IGNORE INTO users (name, email, password, role) 
            VALUES 
            ('System Admin', 'admin@example.com', ?, 'admin'),
            ('Head Librarian', 'librarian@example.com', ?, 'librarian'),
            ('Library Member', 'member@example.com', ?, 'member')
        `, [adminPassword, librarianPassword, memberPassword]);

        console.log('Tables created and default users seeded successfully');
        process.exit();
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

createTables();
