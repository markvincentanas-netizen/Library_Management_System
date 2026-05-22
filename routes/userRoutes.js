const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin']), userController.getUsers);
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/profile', authMiddleware, userController.updateProfile);
router.get('/settings', authMiddleware, userController.getSettings);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

module.exports = router;
