const db = require('./config/database');

async function checkTableStructure() {
    try {
        console.log('--- Checking BOOKS table structure ---');
        const [columns] = await db.execute('DESCRIBE books');
        columns.forEach(col => {
            console.log(`Field: ${col.Field} | Type: ${col.Type}`);
        });
        
        console.log('\n--- Checking CATEGORIES table structure ---');
        const [catColumns] = await db.execute('DESCRIBE categories');
        catColumns.forEach(col => {
            console.log(`Field: ${col.Field} | Type: ${col.Type}`);
        });
        
        process.exit();
    } catch (err) {
        console.error('Error checking structure:', err.message);
        process.exit(1);
    }
}

checkTableStructure();
