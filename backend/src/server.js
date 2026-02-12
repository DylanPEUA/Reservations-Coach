const express = require ('express');
const cors = require ('cors');
require('dotenv').config;

const { errorHandler, logger } = require('./middleware');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(logger);

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

//Start server
app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`)
    console.log(`🫀 Health check: http://localhost:${port}/health`)
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;