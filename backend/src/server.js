require('dotenv').config();
const app = require('./app');
const mysql = require('mysql2/promise');
const { ensureSchema } = require('./database/schema');

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Gắn pool vào app để dùng trong controller
app.locals.db = pool;

async function start() {
    await ensureSchema(pool);
    app.listen(PORT, () => {
        console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error(`[${new Date().toISOString()}] Failed to start server`, err);
    process.exit(1);
});
