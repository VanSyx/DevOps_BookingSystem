require('dotenv').config();
const app = require('./app');
const { ensureSchema } = require('./database/schema');

const PORT = process.env.PORT || 3000;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

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
