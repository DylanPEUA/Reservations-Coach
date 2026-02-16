const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (payload) => {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    return token;
};

// Vérifier et décoder un token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

// Extraire le token du header Authorization
const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7); //Enlever "Bearer "
};

module.exports = {
    generateToken,
    verifyToken,
    extractToken,
};