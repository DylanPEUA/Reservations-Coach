const pool = require('../database');

class Reservation {
    // Créer une réservation
    static async create (clientId, coachId, avilabilityId, scheduleAt, status = 'pending') {
        const [result] = await pool.query(
            'INSERT INTO reservations (client_id, coach_id, availability_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
            [clientId, coachId, avilabilityId, scheduleAt, status]
        );

        return result.insertId;
    }
    
    // Récupérer une réservation par ID
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM reservations Where id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    // Récupérer touts les réservations d'un client
    static async findByClientId(clientId) {
        const [rows] = await pool.query(
            'SELECT r.*, u.first_name, u.last_name, c.bio, c.specialization FROM reservations r JOIN coaches c ON r.coach_id = c.id JOIN users u ON c.user_id = u.id WHERE r.client_id = ? ORDER BY r.scheduled_at DESC',
            [clientId]
        );

        return rows;
    }

    // Récupérer toutes les réservations d'un coach
    static async findByCoachId(coachId) {
        const [rows] = await pool.query(
            'SELECT r.*, u.first_name, u.last_name, u.email FROM reservations r JOIN users u ON r.client_id = u.id WHERE r.coach_id = ? ORDER BY r.scheduled_at DESC',
            [coachId]
        );

        return rows;
    }

    // Mettre à jour une réservation
    static async update(id, status, notes = null) {
        const [result] = await pool.query(
            'UPDATE reservations SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, notes, id]
        );

        return result.affectedRows > 0;
    }

    // Supprimer une réservation
    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM reservations WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }

    // Vérifier s'il y a un conflit de réservation
    static async checkConflict(availabilityId, scheduleAt) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM reservations WHERE availability_id = ? AND scheduled_at = ? AND status != "cancelled"',
            [availabilityId, scheduleAt]
        );

        return rows[0].count > 0;
    }

    // Vérifier qu'une réservation n'existe pas déjà pour ce créneau
    static async checkDuplicateReservation(clientId, availabilityId, scheduleAt) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM reservations WHERE client_id = ? AND availability_id = ? AND scheduled_at = ? AND status != "cancelled"',
            [clientId, availabilityId, scheduleAt]
        );

        return rows[0].count > 0;
    }

    // Récupérer les réservations d'un coach pour une date donnée
    static async findByCoachAndDate(coachId, date) {
        const [rows] = await pool.query(
            'SELECT r.*, u.first_name, u.last_name, u.email FROM reservations r JOIN users u ON r.client_id = u.id WHERE r.coach_id = ? AND DATE(r.scheduled_at) = DATE(?) AND r.status != "cancelled" ORDER BY r.scheduled_at',
            [coachId, date]
        );

        return rows;
    }

    // Compter les réservations confirmées d'un coach
    static async countConfirmedReservations(coachId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM reservations WHERE coach_id = ? AND status = "confirmed"',
            [coachId]
        );

        return rows[0].count;
    }
}

module.exports = Reservation;