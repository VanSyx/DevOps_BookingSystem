module.exports = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
    });
};