const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin', 'librarian']), bookController.getBooks);
router.post('/add', authMiddleware, roleMiddleware(['admin', 'librarian']), bookController.addBook);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), bookController.updateBook);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), bookController.deleteBook);

// Member routes
router.get('/browse', authMiddleware, roleMiddleware(['member']), bookController.browseBooks);

module.exports = router;
