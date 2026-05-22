const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin', 'librarian']), categoryController.getCategories);
router.post('/add', authMiddleware, roleMiddleware(['admin', 'librarian']), categoryController.addCategory);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), categoryController.deleteCategory);

module.exports = router;
