const errorHandler = require('./errorHandler');
const logger = require('./logger');
const { verifyJWT, requireRole, requireCoach, requireClient } = require('./auth.middleware');

module.exports = {
  errorHandler,
  logger,
  verifyJWT,
  requireRole,
  requireCoach,
  requireClient,
};