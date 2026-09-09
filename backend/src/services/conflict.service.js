const pool = require('../database');

const getExecutor = (executor) => executor || pool;

const hasReservationConflict = async (availabilityId, scheduledAt, executor) => {
  const db = getExecutor(executor);
  const [rows] = await db.query(
    'SELECT COUNT(*) AS count FROM reservations WHERE availability_id = ? AND scheduled_at = ? AND status <> ?',
    [availabilityId, scheduledAt, 'cancelled']
  );

  return rows[0].count > 0;
};

const hasClientDuplicate = async (clientId, availabilityId, scheduledAt, executor) => {
  const db = getExecutor(executor);
  const [rows] = await db.query(
    'SELECT COUNT(*) AS count FROM reservations WHERE client_id = ? AND availability_id = ? AND scheduled_at = ? AND status <> ?',
    [clientId, availabilityId, scheduledAt, 'cancelled']
  );

  return rows[0].count > 0;
};

module.exports = {
  hasReservationConflict,
  hasClientDuplicate,
};
