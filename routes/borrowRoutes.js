const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, borrowController.getBorrowRecords);
router.get('/pending', authMiddleware, roleMiddleware(['admin', 'librarian']), borrowController.getPendingBorrows);
router.post('/request', authMiddleware, roleMiddleware(['member']), borrowController.requestBorrow);
router.post('/approve/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), borrowController.approveBorrow);
router.post('/return/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), borrowController.returnBook);
router.post('/update-due-date/:id', authMiddleware, roleMiddleware(['admin']), borrowController.updateDueDate);

module.exports = router;
