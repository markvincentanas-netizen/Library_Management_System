const db = require('../config/database');

exports.getReports = async (req, res) => {
    try {
        const [mostBorrowed] = await db.execute(`
            SELECT b.title, COUNT(br.id) as borrow_count 
            FROM books b 
            JOIN borrow_records br ON b.id = br.book_id 
            GROUP BY b.id 
            ORDER BY borrow_count DESC 
            LIMIT 5
        `);

        const [fineStats] = await db.execute(`
            SELECT status, SUM(amount) as total 
            FROM fines 
            GROUP BY status
        `);

        res.render('admin/reports', { title: 'Reports & Analytics', mostBorrowed, fineStats });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getFines = async (req, res) => {
    try {
        let query = `
            SELECT f.*, u.name as user_name, b.title as book_title 
            FROM fines f
            JOIN borrow_records br ON f.borrow_id = br.id
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
        `;
        let params = [];
        if (req.user.role === 'member') {
            query += ' WHERE br.user_id = ?';
            params.push(req.user.id);
        }
        const [fines] = await db.execute(query, params);
        res.render('common/fines', { title: 'Fines & Penalties', fines });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
