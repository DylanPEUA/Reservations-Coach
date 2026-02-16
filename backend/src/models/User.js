const pool = require('../database');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');

class User {
    // Créer un nouvel utilisateur
    static async create(email, password, role ,firstName, lastName) {
        const hashedPassword = await hashPassword(password);

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role, firstName, lastName]
        );

        return result.insertId;
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    // Vérifier le mot de passe d'un utilisateur
    static async verifyCredentials(email, password) {
        const user = await this.findByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await verifyPassword(password, user.password_hash);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    // Vérifier si l'email existe déjà
    static async emailExists(email) {
        const user = await this.findByEmail(email);
        return user !== null;
    }

    // Retourner l'utilisateur sans le mot de passe (pour les réponses API)
    static sanitize(user) {
        const { password_hash, ...sanitized } = user;
        return sanitized;
    }
}

module.exports = User;