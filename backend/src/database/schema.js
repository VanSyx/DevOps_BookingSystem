async function columnExists(db, tableName, columnName) {
    const [rows] = await db.query(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return rows.length > 0;
}

async function indexExists(db, tableName, indexName) {
    const [rows] = await db.query(
        `SELECT INDEX_NAME
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND INDEX_NAME = ?`,
        [tableName, indexName]
    );
    return rows.length > 0;
}

async function ensureSchema(db) {
    await db.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(160),
            service VARCHAR(100) NOT NULL,
            book_date DATE NOT NULL,
            book_time TIME NOT NULL,
            status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
            note TEXT,
            active_slot_key VARCHAR(320)
                GENERATED ALWAYS AS (
                    CASE
                        WHEN status = 'cancelled' THEN NULL
                        ELSE CONCAT(service, '|', book_date, '|', book_time)
                    END
                ) STORED,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_active_booking_slot (active_slot_key)
        )
    `);

    if (!(await columnExists(db, 'bookings', 'email'))) {
        await db.query('ALTER TABLE bookings ADD COLUMN email VARCHAR(160) NULL AFTER phone');
    }

    await db.query(`
        ALTER TABLE bookings
        MODIFY status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending'
    `);

    if (!(await columnExists(db, 'bookings', 'active_slot_key'))) {
        await db.query(`
            ALTER TABLE bookings
            ADD COLUMN active_slot_key VARCHAR(320)
            GENERATED ALWAYS AS (
                CASE
                    WHEN status = 'cancelled' THEN NULL
                    ELSE CONCAT(service, '|', book_date, '|', book_time)
                END
            ) STORED
        `);
    }

    if (!(await indexExists(db, 'bookings', 'uq_active_booking_slot'))) {
        await db.query('ALTER TABLE bookings ADD UNIQUE KEY uq_active_booking_slot (active_slot_key)');
    }
}

module.exports = { ensureSchema };
