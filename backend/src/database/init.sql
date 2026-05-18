CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  service VARCHAR(100) NOT NULL,
  book_date DATE NOT NULL,
  book_time TIME NOT NULL,

  status booking_status NOT NULL DEFAULT 'pending',

  note TEXT,

  active_slot_key VARCHAR(320)
    GENERATED ALWAYS AS (
      CASE
        WHEN status = 'cancelled' THEN NULL
        ELSE service || '|' || book_date || '|' || book_time
      END
    ) STORED,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_active_booking_slot
ON bookings(active_slot_key);