const pool = require('../database');
const Availability = require('../models/Availability');

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number);
  return (hours * 60) + minutes;
};

const formatTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const remainder = String(minutes % 60).padStart(2, '0');
  return `${hours}:${remainder}:00`;
};

const getAvailableSlots = async (availabilityId, date) => {
  const availability = await Availability.findById(availabilityId);
  if (!availability) {
    const error = new Error('Disponibilité non trouvée');
    error.status = 404;
    throw error;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const error = new Error('La date doit respecter le format YYYY-MM-DD');
    error.status = 400;
    throw error;
  }

  const [reservations] = await pool.query(
    'SELECT scheduled_at, status FROM reservations WHERE availability_id = ? AND DATE(scheduled_at) = ? AND status <> ?',
    [availabilityId, date, 'cancelled']
  );
  const reservedTimes = new Set(
    reservations.map((reservation) => new Date(reservation.scheduled_at).toISOString().slice(11, 19))
  );

  const slots = [];
  const start = toMinutes(availability.start_time);
  const end = toMinutes(availability.end_time);
  const duration = Number(availability.duration_minutes);

  for (let time = start; time + duration <= end; time += duration) {
    const startTime = formatTime(time);
    slots.push({
      availabilityId: Number(availabilityId),
      date,
      startTime,
      endTime: formatTime(time + duration),
      scheduledAt: `${date} ${startTime}`,
      available: !reservedTimes.has(startTime),
    });
  }

  return slots;
};

module.exports = {
  toMinutes,
  formatTime,
  getAvailableSlots,
};
