module.exports = (err, req, res, _next) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
    res.status(err.status || 500).json({
        error: err.status ? err.message : 'Internal Server Error',
        message: err.message,
    });
};
