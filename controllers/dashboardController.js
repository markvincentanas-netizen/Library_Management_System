const db = require('../config/database');

exports.getAdminDashboard = async (req, res) => {
    try {
        const [[bookCount]] = await db.execute('SELECT COUNT(*) as count FROM books');
        const [[userCount]] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [[borrowCount]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'approved'");
        const [[overdueCount]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE due_date < CURDATE() AND status != 'returned'");

        const [activities] = await db.execute(`
            SELECT activities.*, users.name as user_name 
            FROM activities 
            LEFT JOIN users ON activities.user_id = users.id 
            ORDER BY activities.created_at DESC 
            LIMIT 10
        `);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: {
                books: bookCount.count,
                users: userCount.count,
                borrows: borrowCount.count,
                overdue: overdueCount.count
            },
            activities
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).render('common/error', { 
            title: 'Error', 
            message: 'Failed to load Admin Dashboard statistics.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};

exports.getLibrarianDashboard = async (req, res) => {
    try {
        const [[bookCount]] = await db.execute('SELECT COUNT(*) as count FROM books');
        const [[pendingCount]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'pending'");
        const [[borrowCount]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'approved'");

        res.render('librarian/dashboard', {
            title: 'Librarian Dashboard',
            stats: {
                books: bookCount.count,
                pending: pendingCount.count,
                borrows: borrowCount.count
            }
        });
    } catch (err) {
        console.error('Librarian Dashboard Error:', err);
        res.status(500).render('common/error', { 
            title: 'Error', 
            message: 'Failed to load Librarian Dashboard statistics.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};

exports.getMemberDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const [[myBorrows]] = await db.execute('SELECT COUNT(*) as count FROM borrow_records WHERE user_id = ?', [userId]);
        const [[myPending]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE user_id = ? AND status = 'pending'", [userId]);
        const [[myOverdue]] = await db.execute("SELECT COUNT(*) as count FROM borrow_records WHERE user_id = ? AND due_date < CURDATE() AND status != 'returned'", [userId]);

        res.render('member/dashboard', {
            title: 'Member Dashboard',
            stats: {
                borrows: myBorrows.count,
                pending: myPending.count,
                overdue: myOverdue.count
            }
        });
    } catch (err) {
        console.error('Member Dashboard Error:', err);
        res.status(500).render('common/error', { 
            title: 'Error', 
            message: 'Failed to load Member Dashboard statistics.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};
