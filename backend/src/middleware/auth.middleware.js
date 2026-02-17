const { verifyToken, extractToken } = require('../utils/tokenUtils');
const User = require('../models/User');

// Middleware pour vérifier le JWT
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant. Veuillez vous connecter.',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré',
      });
    }

    // Récupérer l'utilisateur depuis la BDD pour avoir les infos à jour
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable',
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('❌ Erreur lors de la vérification JWT:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du token',
    });
  }
};

// Middleware pour vérifier le rôle
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Rôle insuffisant',
      });
    }

    next();
  };
};

// Middleware pour exiger le rôle 'coach'
const requireCoach = requireRole(['coach']);

// Middleware pour exiger le rôle 'client'
const requireClient = requireRole(['client']);

module.exports = {
  verifyJWT,
  requireRole,
  requireCoach,
  requireClient,
};