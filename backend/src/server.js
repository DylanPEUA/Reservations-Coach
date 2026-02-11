const express = require ('express');
const cors = require ('cors');
require('dotenv').config;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal Server Error'
    });
});

//Start server
app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`)
    console.log(`🫀 Health check: http://localhost:${port}/health`)
})

module.exports = app;