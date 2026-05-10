exports.getAll = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const [rows] = await db.query(
            'SELECT * FROM bookings ORDER BY book_date, book_time'
        );
        res.json(rows);
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, phone, service, book_date, book_time, note } = req.body;
        if (!name || !phone || !service || !book_date || !book_time) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }
        const [result] = await db.query(
            'INSERT INTO bookings (name,phone,service,book_date,book_time,note) VALUES (?,?,?,?,?,?)',
            [name, phone, service, book_date, book_time, note || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Đặt lịch thành công' });
    } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        await db.query(
            "UPDATE bookings SET status='cancelled' WHERE id=?", [id]
        );
        res.json({ message: 'Huỷ lịch thành công' });
    } catch (err) { next(err); }
};