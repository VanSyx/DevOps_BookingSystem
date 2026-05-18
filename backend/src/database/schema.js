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

    await db.query(`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS email VARCHAR(160),
        ADD COLUMN IF NOT EXISTS service VARCHAR(100),
        ADD COLUMN IF NOT EXISTS book_date DATE,
        ADD COLUMN IF NOT EXISTS book_time TIME,
        ADD COLUMN IF NOT EXISTS status booking_status DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS note TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await db.query(`
        UPDATE bookings
        SET
            name = COALESCE(name, 'Unknown Customer'),
            phone = COALESCE(phone, 'N/A'),
            service = COALESCE(service, 'General Service'),
            book_date = COALESCE(book_date, CURRENT_DATE),
            book_time = COALESCE(book_time, TIME '09:00'),
            status = COALESCE(status, 'pending'),
            created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
            updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    `);

    await db.query(`
        ALTER TABLE bookings
        ALTER COLUMN name SET NOT NULL,
        ALTER COLUMN phone SET NOT NULL,
        ALTER COLUMN service SET NOT NULL,
        ALTER COLUMN book_date SET NOT NULL,
        ALTER COLUMN book_time SET NOT NULL,
        ALTER COLUMN status SET DEFAULT 'pending',
        ALTER COLUMN status SET NOT NULL,
        ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
        ALTER COLUMN created_at SET NOT NULL,
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
        ALTER COLUMN updated_at SET NOT NULL
    `);

    await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_slot
        ON bookings (service, book_date, book_time)
        WHERE status IN ('pending', 'confirmed', 'completed')
    `);
}

module.exports = { ensureSchema };
