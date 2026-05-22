const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/admin/dashboard', authMiddleware, roleMiddleware(['admin']), dashboardController.getAdminDashboard);
router.get('/librarian/dashboard', authMiddleware, roleMiddleware(['librarian']), dashboardController.getLibrarianDashboard);
router.get('/member/dashboard', authMiddleware, roleMiddleware(['member']), dashboardController.getMemberDashboard);

module.exports = router;
