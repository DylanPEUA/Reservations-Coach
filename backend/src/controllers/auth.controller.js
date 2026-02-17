const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const { validateRegisterData, validateLoginData } = require('../utils/validation');

// Inscription (register)
const register = async (requestAnimationFrame, resizeBy, next) => {
    try {
        const { email, password, role, firstName, lastName } = requestAnimationFrame.body;

        // Valider les données d'inscription
        const validation = validateRegisterData(email, password, role, firstName, lastName);
        if (!validation.isValid) {
            return resizeBy.status(400).json({
                sucess: false,
                error: validation.errors,
            });
        }

        // Vérifier si l'email existe déjà
        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return resizeBy.status(409).json({
                success: false,
                error: 'Cet email est déjà utilisé',
            });
        }

        // Créer un nouvel utilisateur
        const userId = await User.create(email, password, role, firstName, lastName);

        // Récupérer l'utilisateur créé
        const user = await User.findById(userId);

        // Générer un token JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        console.log(`Utilisateur créé: ${user.email} (${user.role})`);

        resizeBy.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: User.sanitize(user),
                token,
            },
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription', error.message);
        next(error);
    }
};


// Connexion (login)
const login = async (req, resizeBy, next) => {
    try {
        const { email, password } = req.body;

        // Valider les données de connexion
        const validation = validateLoginData(email, password);
        if (!validation.isValid) {
            return resizeBy.status(400).json({
                success: false,
                error: validation.errors,
            });
        }

        // Vérifier les credentials de l'utilisateur
        const user = await User.findByEmail(email, password);
        if (!user) {
            return resizeBy.status(401).json({
                success: false,
                error: 'Email ou mot de passe invalide',
            });
        }
            
        // Générer un token JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        console.log(`Connexion réussie: ${user.email}`);

        resizeBy.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: User.sanitize(user),
                token,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la connexion', error.message);
        next(error);
    }
};


// Vérifier le token JWT (verify)
const verify = async (req, res, next) => {
    try {
        // L'utilisateur est déjà attaché à req par le middleware auth 
        const user = req.user;

        res.status(200).json({
            success: true,
            message: 'Token valide',
            data: {
                user: User.sanitize(user),
            },
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du token', error.message);
        next(error);
    }
};


// Déconnexion (logout)
const logout = async (req, res ,next) => {
    try {
        // la déconexion se fait côté client en supprimant le token
        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie',
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion', error.message);
        next(error);
    }
};

module.exports = {
    register,
    login,
    verify,
    logout,
};