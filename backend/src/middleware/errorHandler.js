// Middleware de gestion des erreurs globales
const errorHandler = (err, req, res, next ) => {
    console.error('Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success : false,
        error: {
            message,
            status,
            timestampe: new Date()
        },
    });
};

module.exports = errorHandler;