const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_HOST);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });
        console.log('Successfully connected to the database!');
        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code === 'ENOTFOUND') {
            console.error('The hostname could not be resolved. Please check your DB_HOST in .env');
        } else if (err.code === 'ETIMEDOUT') {
            console.error('The connection timed out. Check your firewall or IP whitelisting settings.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Check your DB_USER and DB_PASSWORD.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Check your DB_NAME.');
        }
    }
}

testConnection();
