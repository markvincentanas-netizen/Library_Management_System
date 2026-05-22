const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Global variables for views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.session.success_msg || null;
    res.locals.error_msg = req.session.error_msg || null;
    delete req.session.success_msg;
    delete req.session.error_msg;
    next();
});

// Root route
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// User Routes (Profile & Settings)
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);
app.use('/', userRoutes);

// Dashboard Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/', dashboardRoutes);

// Book Routes
const bookRoutes = require('./routes/bookRoutes');
app.use('/books', bookRoutes);
app.use('/member', bookRoutes);

// Category Routes
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

// Borrow Routes
const borrowRoutes = require('./routes/borrowRoutes');
app.use('/borrow', borrowRoutes);

// Report & Fine Routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Detailed Server Error:', err);
    res.status(500).render('common/error', { 
        title: 'Error', 
        message: err.message || 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
