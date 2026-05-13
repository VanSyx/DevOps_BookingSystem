const VALID_STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed']);

function formatDate(value) {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

function formatTime(value) {
    if (!value) return '';
    return String(value).slice(0, 5);
}

function toBooking(row) {
    return {
        id: String(row.id),
        customerName: row.name,
        name: row.name,
        phone: row.phone,
        email: row.email || '',
        service: row.service,
        date: formatDate(row.book_date),
        book_date: formatDate(row.book_date),
        time: formatTime(row.book_time),
        book_time: formatTime(row.book_time),
        status: row.status,
        notes: row.note || '',
        note: row.note || '',
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    };
}

function normalizePayload(body) {
    return {
        name: body.name ?? body.customerName,
        phone: body.phone,
        email: body.email ?? null,
        service: body.service,
        book_date: body.book_date ?? body.date,
        book_time: body.book_time ?? body.time,
        note: body.note ?? body.notes ?? null,
        status: body.status,
    };
}

function requireFields(data, fields) {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
        const err = new Error(`Missing required fields: ${missing.join(', ')}`);
        err.status = 400;
        throw err;
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [rows] = await db.query('SELECT * FROM bookings ORDER BY book_date, book_time, id');
        res.json(rows.map(toBooking));
    } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json(toBooking(rows[0]));
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const data = normalizePayload(req.body);
        requireFields(data, ['name', 'phone', 'service', 'book_date', 'book_time']);

        if (data.status && !VALID_STATUSES.has(data.status)) {
            return res.status(400).json({ error: 'Invalid booking status' });
        }

        const [result] = await db.query(
            `INSERT INTO bookings (name, phone, email, service, book_date, book_time, note, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.phone,
                data.email,
                data.service,
                data.book_date,
                data.book_time,
                data.note,
                data.status || 'pending',
            ]
        );
        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [result.insertId]);
        res.status(201).json(toBooking(rows[0]));
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const data = normalizePayload(req.body);
        const fields = [];
        const values = [];

        const fieldMap = {
            name: 'name',
            phone: 'phone',
            email: 'email',
            service: 'service',
            book_date: 'book_date',
            book_time: 'book_time',
            note: 'note',
            status: 'status',
        };

        if (data.status && !VALID_STATUSES.has(data.status)) {
            return res.status(400).json({ error: 'Invalid booking status' });
        }

        for (const [key, column] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                fields.push(`${column}=?`);
                values.push(data[key]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.params.id);
        const [result] = await db.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id=?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });

        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [req.params.id]);
        res.json(toBooking(rows[0]));
    } catch (err) { next(err); }
};

exports.setStatus = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { status } = req.body;
        if (!VALID_STATUSES.has(status)) {
            return res.status(400).json({ error: 'Invalid booking status' });
        }
        const [result] = await db.query('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });

        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [req.params.id]);
        res.json(toBooking(rows[0]));
    } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
    req.body.status = 'cancelled';
    return exports.setStatus(req, res, next);
};

exports.remove = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [result] = await db.query('DELETE FROM bookings WHERE id=?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
        res.status(204).send();
    } catch (err) { next(err); }
};

exports.stats = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [statusRows] = await db.query(`
            SELECT status, COUNT(*) AS total
            FROM bookings
            GROUP BY status
        `);
        const [todayRows] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings
            WHERE book_date = CURDATE()
        `);
        const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
        for (const row of statusRows) byStatus[row.status] = Number(row.total);

        res.json({
            total: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
            today: Number(todayRows[0]?.total || 0),
            byStatus,
        });
    } catch (err) { next(err); }
};

exports.customers = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [rows] = await db.query(`
            SELECT
                COALESCE(NULLIF(email, ''), CONCAT('phone:', phone)) AS customer_key,
                MAX(name) AS name,
                MAX(phone) AS phone,
                MAX(email) AS email,
                COUNT(*) AS total,
                MAX(book_date) AS lastBooking
            FROM bookings
            GROUP BY customer_key
            ORDER BY lastBooking DESC
        `);

        res.json(rows.map((row) => ({
            name: row.name,
            phone: row.phone,
            email: row.email || '',
            total: Number(row.total),
            lastBooking: formatDate(row.lastBooking),
        })));
    } catch (err) { next(err); }
};
