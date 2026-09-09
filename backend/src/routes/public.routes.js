const express = require('express');
const router = express.Router();
const { publicController } = require('../controllers');

// GET /api/public/coaches/:coachId/availabilities - Récupérer toutes les disponibilités d'un coach
router.get('/coaches/:coachId/availabilities', publicController.getCoachAvailabilities);

// GET /api/public/coaches/:coachId/availabilities/:dayOfWeek - Récupérer les disponibilités par jour
router.get('/coaches/:coachId/availabilities/:dayOfWeek', publicController.getCoachAvailabilitiesByDay);

// GET /api/public/availabilities/:availabilityId/slots?date=YYYY-MM-DD
router.get('/availabilities/:availabilityId/slots', publicController.getAvailableSlotsForDate);

module.exports = router;