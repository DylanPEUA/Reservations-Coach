const RESERVATION_STATUSES = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const STATUS_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
});

const isValidStatus = (status) => Object.values(RESERVATION_STATUSES).includes(status);

const canTransition = (currentStatus, nextStatus) => (
  isValidStatus(currentStatus)
  && isValidStatus(nextStatus)
  && STATUS_TRANSITIONS[currentStatus].includes(nextStatus)
);

module.exports = {
  RESERVATION_STATUSES,
  STATUS_TRANSITIONS,
  isValidStatus,
  canTransition,
};
