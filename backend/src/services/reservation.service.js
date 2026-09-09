const pool = require('../database');
const Availability = require('../models/Availability');
const { hasReservationConflict, hasClientDuplicate } = require('./conflict.service');
const { RESERVATION_STATUSES, canTransition, isValidStatus } = require('../utils/reservationStatus');
const { logBusinessEvent } = require('../utils/businessLogger');

const createReservation = async ({ clientId, availabilityId, scheduledAt }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [availabilityRows] = await connection.query(
      'SELECT * FROM availabilities WHERE id = ? FOR UPDATE',
      [availabilityId]
    );
    const availability = availabilityRows[0];

    if (!availability) {
      const error = new Error('Créneau non trouvé');
      error.status = 404;
      throw error;
    }

    if (await hasReservationConflict(availabilityId, scheduledAt, connection)) {
      const error = new Error('Ce créneau est déjà réservé');
      error.status = 409;
      throw error;
    }

    if (await hasClientDuplicate(clientId, availabilityId, scheduledAt, connection)) {
      const error = new Error('Vous avez déjà une réservation pour ce créneau');
      error.status = 409;
      throw error;
    }

    const [result] = await connection.query(
      'INSERT INTO reservations (client_id, coach_id, availability_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
      [clientId, availability.coach_id, availabilityId, scheduledAt, RESERVATION_STATUSES.PENDING]
    );

    await connection.commit();

    logBusinessEvent('reservation.created', {
      reservationId: result.insertId,
      clientId,
      coachId: availability.coach_id,
      availabilityId,
      scheduledAt,
    });

    return {
      id: result.insertId,
      availabilityId,
      scheduledAt,
      status: RESERVATION_STATUSES.PENDING,
      coachId: availability.coach_id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const cancelReservation = async (reservationId, clientId) => {
  const [rows] = await pool.query(
    'SELECT * FROM reservations WHERE id = ? AND client_id = ?',
    [reservationId, clientId]
  );
  const reservation = rows[0];

  if (!reservation) {
    const error = new Error('Réservation non trouvée');
    error.status = 404;
    throw error;
  }

  if (!canTransition(reservation.status, RESERVATION_STATUSES.CANCELLED)) {
    const error = new Error('Cette réservation ne peut plus être annulée');
    error.status = 400;
    throw error;
  }

  await pool.query(
    'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [RESERVATION_STATUSES.CANCELLED, reservationId]
  );

  logBusinessEvent('reservation.cancelled', {
    reservationId,
    clientId,
  });
};

const updateReservationStatus = async ({ reservationId, coachId, status, notes }) => {
  if (!isValidStatus(status)) {
    const error = new Error('Statut invalide');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    'SELECT * FROM reservations WHERE id = ? AND coach_id = ?',
    [reservationId, coachId]
  );
  const reservation = rows[0];

  if (!reservation) {
    const error = new Error('Réservation non trouvée');
    error.status = 404;
    throw error;
  }

  if (!canTransition(reservation.status, status) && reservation.status !== status) {
    const error = new Error(`Transition impossible : ${reservation.status} vers ${status}`);
    error.status = 400;
    throw error;
  }

  await pool.query(
    'UPDATE reservations SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, notes || null, reservationId]
  );

  logBusinessEvent('reservation.status_updated', {
    reservationId,
    coachId,
    previousStatus: reservation.status,
    status,
  });

  return { id: reservationId, status, notes: notes || null };
};

module.exports = {
  createReservation,
  cancelReservation,
  updateReservationStatus,
};
