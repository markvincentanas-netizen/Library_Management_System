const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

exports.getBooks = async (req, res) => {
    try {
        const [books] = await db.execute(`
            SELECT books.*, categories.name as category_name 
            FROM books 
            LEFT JOIN categories ON books.category_id = categories.id
        `);
        const [categories] = await db.execute('SELECT * FROM categories');
        res.render('admin/books', { title: 'Books', books, categories });
    } catch (err) {
        console.error('Get Books Error:', err);
        res.status(500).render('common/error', { 
            title: 'Error', 
            message: 'Failed to load books collection.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};

exports.addBook = async (req, res) => {
    const { title, author, category_id, isbn, quantity, shelf } = req.body;
    try {
        await db.execute(
            'INSERT INTO books (title, author, category_id, isbn, quantity, shelf) VALUES (?, ?, ?, ?, ?, ?)',
            [title, author, category_id, isbn || null, quantity || 0, shelf || null]
        );
        await logActivity(`New Book Added: ${title}`, req.user.id);
        req.session.success_msg = 'Book added successfully';
        res.redirect('/books');
    } catch (err) {
        console.error('Add Book Error:', err);
        req.session.error_msg = 'Error adding book: ' + err.message;
        res.redirect('/books');
    }
};

exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, category_id, isbn, quantity, shelf, status } = req.body;
    try {
        await db.execute(
            'UPDATE books SET title = ?, author = ?, category_id = ?, isbn = ?, quantity = ?, shelf = ?, status = ? WHERE id = ?',
            [title, author, category_id, isbn || null, quantity || 0, shelf || null, status, id]
        );
        req.session.success_msg = 'Book updated successfully';
        res.redirect('/books');
    } catch (err) {
        console.error('Update Book Error:', err);
        req.session.error_msg = 'Error updating book: ' + err.message;
        res.redirect('/books');
    }
};

exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM books WHERE id = ?', [id]);
        req.session.success_msg = 'Book deleted successfully';
        res.redirect('/books');
    } catch (err) {
        console.error('Delete Book Error:', err);
        req.session.error_msg = 'Error deleting book: ' + err.message;
        res.redirect('/books');
    }
};

// Member specific
exports.browseBooks = async (req, res) => {
    const { search } = req.query;
    try {
        let query = `
            SELECT books.*, categories.name as category_name 
            FROM books 
            LEFT JOIN categories ON books.category_id = categories.id 
            WHERE books.status = 'available'
        `;
        let params = [];
        if (search) {
            query += ' AND (books.title LIKE ? OR books.author LIKE ? OR books.isbn LIKE ?)';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }
        const [books] = await db.execute(query, params);
        res.render('member/browse', { title: 'Browse Books', books, search });
    } catch (err) {
        console.error('Browse Books Error:', err);
        res.status(500).render('common/error', { 
            title: 'Error', 
            message: 'Failed to search books.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};
