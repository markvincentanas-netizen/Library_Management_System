const db = require('./config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Starting database seeding...');

        // 1. Seed Categories
        const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology'];
        for (const cat of categories) {
            await db.execute('INSERT IGNORE INTO categories (name) VALUES (?)', [cat]);
        }
        console.log('Categories seeded.');

        // 2. Get Category IDs
        const [catRows] = await db.execute('SELECT id, name FROM categories');
        const catMap = catRows.reduce((acc, row) => {
            acc[row.name] = row.id;
            return acc;
        }, {});

        // 3. Seed Books
        const books = [
            ['The Great Gatsby', 'F. Scott Fitzgerald', catMap['Fiction'], '9780743273565', 5, 'A1'],
            ['A Brief History of Time', 'Stephen Hawking', catMap['Science'], '9780553380163', 3, 'B2'],
            ['Clean Code', 'Robert C. Martin', catMap['Technology'], '9780132350884', 10, 'C3'],
            ['Sapiens', 'Yuval Noah Harari', catMap['History'], '9780062316097', 7, 'D4']
        ];

        for (const book of books) {
            await db.execute(
                'INSERT IGNORE INTO books (title, author, category_id, isbn, quantity, shelf) VALUES (?, ?, ?, ?, ?, ?)',
                book
            );
        }
        console.log('Books seeded.');

        // 4. Seed Activities
        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        if (users.length > 0) {
            const userId = users[0].id;
            await db.execute('INSERT INTO activities (activity, user_id) VALUES (?, ?)', ['Database seeded with mock data', userId]);
            await db.execute('INSERT INTO activities (activity, user_id) VALUES (?, ?)', ['New Book Added: The Great Gatsby', userId]);
        }
        console.log('Activities seeded.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
