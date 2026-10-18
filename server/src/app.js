const express = require('express');
const cors = require('cors');
const { clientUrl } = require('./config');
const { notFound, errorHandler } = require('./middleware');

const app = express();

app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api', require('./routes/stats'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
