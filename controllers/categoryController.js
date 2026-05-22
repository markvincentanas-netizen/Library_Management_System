const db = require('../config/database');

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM categories');
        res.render('admin/categories', { title: 'Categories', categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addCategory = async (req, res) => {
    const { name } = req.body;
    try {
        await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
        req.session.success_msg = 'Category added successfully';
        res.redirect('/categories');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error adding category';
        res.redirect('/categories');
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        req.session.success_msg = 'Category deleted successfully';
        res.redirect('/categories');
    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error deleting category';
        res.redirect('/categories');
    }
};
