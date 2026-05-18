const VALID_STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed']);
const ACTIVE_SLOT_STATUSES = ['pending', 'confirmed', 'completed'];
const ALLOWED_TRANSITIONS = {
    pending: new Set(['confirmed', 'cancelled']),
    confirmed: new Set(['completed', 'cancelled']),
    cancelled: new Set(),
    completed: new Set(),
};
const EDITABLE_FIELDS = new Set(['name', 'phone', 'email', 'service', 'book_date', 'book_time', 'note']);

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

function badRequest(message) {
    const err = new Error(message);
    err.status = 400;
    return err;
}

function conflict(message) {
    const err = new Error(message);
    err.status = 409;
    return err;
}

function notFound(message) {
    const err = new Error(message);
    err.status = 404;
    return err;
}

function validatePayload(data, { partial = false } = {}) {
    if (!partial) requireFields(data, ['name', 'phone', 'service', 'book_date', 'book_time']);

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw badRequest('Invalid email address');
    }

    if (data.book_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.book_date)) {
        throw badRequest('Invalid booking date. Use YYYY-MM-DD');
    }

    if (data.book_time && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.book_time)) {
        throw badRequest('Invalid booking time. Use HH:mm');
    }

    if (data.status && !VALID_STATUSES.has(data.status)) {
        throw badRequest('Invalid booking status');
    }
}

async function getRawBooking(db, id) {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [id]);
    return rows[0] || null;
}

async function assertNoDuplicateSlot(db, data, excludeId) {
    if (!data.service || !data.book_date || !data.book_time) return;

    const params = [data.service, data.book_date, data.book_time, ...ACTIVE_SLOT_STATUSES];
    let sql = `
        SELECT id, name
        FROM bookings
        WHERE service=?
          AND book_date=?
          AND book_time=?
          AND status IN (?, ?, ?)
    `;

    if (excludeId) {
        sql += ' AND id<>?';
        params.push(excludeId);
    }

    const [rows] = await db.query(sql, params);
    if (rows.length > 0) {
        throw conflict('This booking slot is already taken');
    }
}

function assertValidTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) return;
    if (!ALLOWED_TRANSITIONS[currentStatus]?.has(nextStatus)) {
        throw conflict(`Cannot change booking status from ${currentStatus} to ${nextStatus}`);
    }
}

function isDuplicateKeyError(err) {
    return err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
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
        validatePayload(data);
        await assertNoDuplicateSlot(db, data);

        if (data.status && data.status !== 'pending') {
            throw badRequest('New bookings must start as pending');
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
                'pending',
            ]
        );
        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [result.insertId]);
        res.status(201).json(toBooking(rows[0]));
    } catch (err) {
        if (isDuplicateKeyError(err)) return next(conflict('This booking slot is already taken'));
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const data = normalizePayload(req.body);
        validatePayload(data, { partial: true });

        const existing = await getRawBooking(db, req.params.id);
        if (!existing) throw notFound('Booking not found');
        if (existing.status === 'cancelled' || existing.status === 'completed') {
            throw conflict(`Cannot edit a ${existing.status} booking`);
        }

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

        for (const [key, column] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                if (key === 'status') {
                    assertValidTransition(existing.status, data.status);
                }
                fields.push(`${column}=?`);
                values.push(data[key]);
            }
        }

        if (fields.length === 0) {
            throw badRequest('No fields to update');
        }

        const nextSlot = {
            service: data.service ?? existing.service,
            book_date: data.book_date ?? formatDate(existing.book_date),
            book_time: data.book_time ?? formatTime(existing.book_time),
        };
        if ([...EDITABLE_FIELDS].some((field) => data[field] !== undefined)) {
            await assertNoDuplicateSlot(db, nextSlot, req.params.id);
        }

        values.push(req.params.id);
        const [result] = await db.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id=?`, values);
        if (result.affectedRows === 0) throw notFound('Booking not found');

        const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [req.params.id]);
        res.json(toBooking(rows[0]));
    } catch (err) {
        if (isDuplicateKeyError(err)) return next(conflict('This booking slot is already taken'));
        next(err);
    }
};

exports.setStatus = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { status } = req.body;
        if (!VALID_STATUSES.has(status)) {
            throw badRequest('Invalid booking status');
        }

        const existing = await getRawBooking(db, req.params.id);
        if (!existing) throw notFound('Booking not found');
        assertValidTransition(existing.status, status);

        const [result] = await db.query('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
        if (result.affectedRows === 0) throw notFound('Booking not found');

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
