const authController = require('./auth.controller');
const availabilityController = require('./availability.controller');
const reservationController = require('./reservation.controller');
const publicController = require('./public.controller');

module.exports = {
  authController,
  availabilityController,
  reservationController,
  publicController,
};