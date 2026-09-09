const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers');
const { verifyJWT, requireCoach } = require('../middleware');

router.get('/', verifyJWT, requireCoach, reservationController.getCoachReservations);
router.put('/:id/status', verifyJWT, requireCoach, reservationController.updateReservationStatus);

module.exports = router;
