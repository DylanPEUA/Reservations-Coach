const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers');
const { verifyJWT, requireClient, requireCoach } = require('../middleware');

// Routes CLIENT (protégées avec requireClient)
// POST /api/client/reservations - Créer une réservation
router.post('/', verifyJWT, requireClient, reservationController.createReservation);

// GET /api/client/reservations - Récupérer mes réservations
router.get('/', verifyJWT, requireClient, reservationController.getMyReservations);

// GET /api/client/reservations/:id - Récupérer une réservation par ID
router.get('/:id', verifyJWT, requireClient, reservationController.getReservationById);

// DELETE /api/client/reservations/:id - Annuler une réservation
router.delete('/:id', verifyJWT, requireClient, reservationController.cancelReservation);

// Routes COACH (protégées avec requireCoach)
// GET /api/coach/reservations - Récupérer toutes les réservations du coach
router.get('/coach/my-reservations', verifyJWT, requireCoach, reservationController.getCoachReservations);

// PUT /api/coach/reservations/:id - Mettre à jour le statut d'une réservation
router.put('/:id/status', verifyJWT, requireCoach, reservationController.updateReservationStatus);

module.exports = router;