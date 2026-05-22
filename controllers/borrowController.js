const db = require('../config/database');

exports.requestBorrow = async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;
    const borrow_date = new Date();
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14); // 14 days borrow period

    try {
        // Check if book is available
        const [books] = await db.execute('SELECT quantity FROM books WHERE id = ?', [book_id]);
        if (books.length === 0 || books[0].quantity <= 0) {
            req.session.error_msg = 'Book not available';
            return res.redirect('/member/browse');
        }

        await db.execute(
            'INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, book_id, borrow_date, due_date, 'pending']
        );

        req.session.success_msg = 'Borrow request submitted! Waiting for approval.';
        res.redirect('/member/dashboard');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error requesting borrow';
        res.redirect('/member/browse');
    }
};

exports.getBorrowRecords = async (req, res) => {
    try {
        let query = `
            SELECT br.*, u.name as user_name, b.title as book_title 
            FROM borrow_records br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
        `;
        let params = [];
        
        if (req.user.role === 'member') {
            query += ' WHERE br.user_id = ?';
            params.push(req.user.id);
        }

        const [records] = await db.execute(query, params);
        res.render('borrow/list', { title: 'Borrow Records', records });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getPendingBorrows = async (req, res) => {
    try {
        const [records] = await db.execute(`
            SELECT br.*, u.name as user_name, b.title as book_title 
            FROM borrow_records br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            WHERE br.status = 'pending'
        `);
        res.render('borrow/list', { title: 'Pending Borrow Requests', records });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.approveBorrow = async (req, res) => {
    const { id } = req.params;
    const { due_date } = req.body;
    try {
        const [records] = await db.execute('SELECT book_id FROM borrow_records WHERE id = ?', [id]);
        if (records.length === 0) return res.status(404).send('Record not found');

        const bookId = records[0].book_id;
        
        // Update book quantity
        await db.execute('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [bookId]);
        
        // Update record status and due date if provided
        let query = "UPDATE borrow_records SET status = 'approved'";
        let params = [];
        
        if (due_date) {
            query += ", due_date = ?";
            params.push(due_date);
        }
        
        query += " WHERE id = ?";
        params.push(id);
        
        await db.execute(query, params);

        req.session.success_msg = 'Borrow request approved' + (due_date ? ' with due date: ' + due_date : '');
        res.redirect('/borrow');
    } catch (err) {
        console.error('Approve Borrow Error:', err);
        req.session.error_msg = 'Error approving borrow: ' + err.message;
        res.redirect('/borrow');
    }
};

exports.returnBook = async (req, res) => {
    const { id } = req.params;
    const return_date = new Date();
    try {
        const [records] = await db.execute('SELECT * FROM borrow_records WHERE id = ?', [id]);
        if (records.length === 0) return res.status(404).send('Record not found');

        const record = records[0];
        const bookId = record.book_id;

        // Update book quantity
        await db.execute('UPDATE books SET quantity = quantity + 1 WHERE id = ?', [bookId]);
        
        // Update record status
        await db.execute("UPDATE borrow_records SET status = 'returned', return_date = ? WHERE id = ?", [return_date, id]);

        // Check for fine (if return_date > due_date)
        const dueDate = new Date(record.due_date);
        if (return_date > dueDate) {
            const diffTime = Math.abs(return_date - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const fineAmount = diffDays * 5.00; // $5 per day

            await db.execute('INSERT INTO fines (borrow_id, amount) VALUES (?, ?)', [id, fineAmount]);
            req.session.success_msg = `Book returned. A fine of $${fineAmount} has been applied for ${diffDays} days delay.`;
        } else {
            req.session.success_msg = 'Book returned successfully';
        }

        res.redirect('/borrow');
    } catch (err) {
        console.error('Return Book Error:', err);
        req.session.error_msg = 'Error returning book: ' + err.message;
        res.redirect('/borrow');
    }
};

exports.updateDueDate = async (req, res) => {
    const { id } = req.params;
    const { due_date } = req.body;
    try {
        await db.execute('UPDATE borrow_records SET due_date = ? WHERE id = ?', [due_date, id]);
        req.session.success_msg = 'Due date updated successfully to ' + due_date;
        res.redirect('/borrow');
    } catch (err) {
        console.error('Update Due Date Error:', err);
        req.session.error_msg = 'Error updating due date: ' + err.message;
        res.redirect('/borrow');
    }
};
