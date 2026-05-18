async function ensureSchema(db) {
    await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
                CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
            END IF;
        END
        $$;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(160),
            service VARCHAR(100) NOT NULL,
            book_date DATE NOT NULL,
            book_time TIME NOT NULL,
            status booking_status NOT NULL DEFAULT 'pending',
            note TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email VARCHAR(160)');
    await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS note TEXT');
    await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

    await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_slot
        ON bookings (service, book_date, book_time)
        WHERE status IN ('pending', 'confirmed', 'completed')
    `);
}

module.exports = { ensureSchema };
