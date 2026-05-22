const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, created_at FROM users');
        res.render('admin/users', { title: 'User Management', users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    try {
        await db.execute(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, id]
        );
        req.session.success_msg = 'User updated successfully';
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error updating user';
        res.redirect('/users');
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.redirect('/auth/login');
        res.render('common/profile', { title: 'Profile', userProfile: users[0] });
    } catch (err) {
        console.error(err);
        res.status(500).render('common/error', { title: 'Error', message: 'Failed to load profile' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let query = 'UPDATE users SET name = ?, email = ?';
        let params = [name, email];
        
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }
        
        query += ' WHERE id = ?';
        params.push(req.user.id);
        
        await db.execute(query, params);
        req.session.user.name = name; // Update session name
        req.session.success_msg = 'Profile updated successfully';
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error updating profile';
        res.redirect('/profile');
    }
};

exports.getSettings = (req, res) => {
    res.render('common/settings', { title: 'Settings' });
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        req.session.success_msg = 'User deleted successfully';
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error deleting user';
        res.redirect('/users');
    }
};
