const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { verifyJWT } = require('../middleware');

// POST /api/auth/register - Inscription
router.post('/register', authController.register);

// POST /api/auth/login - Connexion
router.post('/login', authController.login);

// GET /api/auth/verify - Vérifier le token (protégé)
router.get('/verify', verifyJWT, authController.verify);

// POST /api/auth/logout - Déconnexion (optionnel, protégé)
router.post('/logout', verifyJWT, authController.logout);

module.exports = router;