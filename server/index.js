const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const roadmapRoutes = require('./routes/roadmapRoutes');

const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Middleware
// Performance: Compress all responses
app.use(compression());

// Security: Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', roadmapRoutes);
app.get('/', (req, res) => {
    res.send('Roadmap Generator API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
