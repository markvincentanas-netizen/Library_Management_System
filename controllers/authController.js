const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

exports.getRegister = (req, res) => {
    res.render('auth/register', { title: 'Register', layout: 'layouts/auth' });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            req.session.error_msg = 'Email already exists';
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'member']
        );

        await logActivity(`New Member Registered: ${name}`, result.insertId);

        req.session.success_msg = 'Registration successful! Please login.';
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            req.session.error_msg = 'Database connection failed. Please check your DB configuration.';
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
            req.session.error_msg = 'Database tables not found. Please run "node db_init.js" first.';
        } else {
            req.session.error_msg = 'Server error during registration';
        }
        res.redirect('/auth/register');
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { title: 'Login', layout: 'layouts/auth' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            req.session.error_msg = 'Invalid credentials';
            return res.redirect('/auth/login');
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.error_msg = 'Invalid credentials';
            return res.redirect('/auth/login');
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        req.session.user = { id: user.id, name: user.name, role: user.role };

        // Redirect based on role
        if (user.role === 'admin') res.redirect('/admin/dashboard');
        else if (user.role === 'librarian') res.redirect('/librarian/dashboard');
        else res.redirect('/member/dashboard');
    } catch (err) {
        console.error('Login Error:', err);
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            req.session.error_msg = 'Database connection failed. Please check your DB configuration.';
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
            req.session.error_msg = 'Database tables not found. Please run "node db_init.js" first.';
        } else {
            req.session.error_msg = 'Server error during login';
        }
        res.redirect('/auth/login');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    req.session.destroy();
    res.redirect('/auth/login');
};
