const db = require('./config/database');

async function checkUsers() {
    try {
        const [users] = await db.execute('SELECT id, name, email, role FROM users');
        console.log('--- Users in Database ---');
        if (users.length === 0) {
            console.log('No users found. You need to run "node db_init.js" to seed default users.');
        } else {
            users.forEach(u => {
                console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
            });
        }
        process.exit();
    } catch (err) {
        console.error('Error checking users:', err.message);
        process.exit(1);
    }
}

checkUsers();
