const pool = require('../database');

class Availability {
  // Créer une disponibilité
  static async create(coachId, dayOfWeek, startTime, endTime, durationMinutes) {
    const [result] = await pool.query(
      'INSERT INTO availabilities (coach_id, day_of_week, start_time, end_time, duration_minutes) VALUES (?, ?, ?, ?, ?)',
      [coachId, dayOfWeek, startTime, endTime, durationMinutes]
    );

    return result.insertId;
  }

  // Récupérer toutes les disponibilités d'un coach
  static async findByCoachId(coachId) {
    const [rows] = await pool.query(
      'SELECT * FROM availabilities WHERE coach_id = ? ORDER BY day_of_week, start_time',
      [coachId]
    );

    return rows;
  }

  // Récupérer une disponibilité par ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM availabilities WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // Mettre à jour une disponibilité
  static async update(id, dayOfWeek, startTime, endTime, durationMinutes) {
    const [result] = await pool.query(
      'UPDATE availabilities SET day_of_week = ?, start_time = ?, end_time = ?, duration_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [dayOfWeek, startTime, endTime, durationMinutes, id]
    );

    return result.affectedRows > 0;
  }

  // Supprimer une disponibilité
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM availabilities WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Vérifier les chevauchements de créneaux
  static async checkOverlap(coachId, dayOfWeek, startTime, endTime, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM availabilities WHERE coach_id = ? AND day_of_week = ? AND start_time < ? AND end_time > ?';
    let params = [coachId, dayOfWeek, endTime, startTime];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [result] = await pool.query(query, params);
    return result[0].count > 0;
  }

  // Récupérer les disponibilités d'un coach par jour de la semaine
  static async findByDayOfWeek(coachId, dayOfWeek) {
    const [rows] = await pool.query(
      'SELECT * FROM availabilities WHERE coach_id = ? AND day_of_week = ? ORDER BY start_time',
      [coachId, dayOfWeek]
    );

    return rows;
  }
}

module.exports = Availability;