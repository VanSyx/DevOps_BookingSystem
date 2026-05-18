const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bookingRoutes = require('./routes/bookings');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

morgan.token('timestamp', () => new Date().toISOString());
app.use(morgan('[:timestamp] :method :url :status :response-time ms'));

app.get('/api/health', (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/bookings', bookingRoutes);
app.use(errorHandler);

module.exports = app;
