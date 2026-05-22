const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/reports', authMiddleware, roleMiddleware(['admin']), reportController.getReports);
router.get('/fines', authMiddleware, reportController.getFines);

module.exports = router;
