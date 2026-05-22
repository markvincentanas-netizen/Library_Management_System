const db = require('../config/database');

const logActivity = async (activity, userId) => {
    try {
        await db.execute(
            'INSERT INTO activities (activity, user_id) VALUES (?, ?)',
            [activity, userId]
        );
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

module.exports = { logActivity };
