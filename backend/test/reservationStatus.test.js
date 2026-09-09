const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RESERVATION_STATUSES,
  canTransition,
  isValidStatus,
} = require('../src/utils/reservationStatus');

test('autorise les transitions métier valides', () => {
  assert.equal(canTransition(RESERVATION_STATUSES.PENDING, RESERVATION_STATUSES.CONFIRMED), true);
  assert.equal(canTransition(RESERVATION_STATUSES.CONFIRMED, RESERVATION_STATUSES.COMPLETED), true);
  assert.equal(canTransition(RESERVATION_STATUSES.PENDING, RESERVATION_STATUSES.CANCELLED), true);
});

test('refuse les transitions métier invalides', () => {
  assert.equal(canTransition(RESERVATION_STATUSES.CANCELLED, RESERVATION_STATUSES.CONFIRMED), false);
  assert.equal(canTransition(RESERVATION_STATUSES.COMPLETED, RESERVATION_STATUSES.CANCELLED), false);
  assert.equal(isValidStatus('unknown'), false);
});
