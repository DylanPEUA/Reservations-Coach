const test = require('node:test');
const assert = require('node:assert/strict');
const { toMinutes, formatTime } = require('../src/services/availability.service');

test('convertit une heure en minutes', () => {
  assert.equal(toMinutes('09:30:00'), 570);
});

test('formate des minutes en heure SQL', () => {
  assert.equal(formatTime(570), '09:30:00');
  assert.equal(formatTime(0), '00:00:00');
});
