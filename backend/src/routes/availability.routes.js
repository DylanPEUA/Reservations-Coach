const express = require ('express');
const router = express.Router();
const { availabilityController } = require('../controllers');
const { verifyJWT, requireCoach } = require('../middleware');

// Toutes les routes de disponibilité nécessitent l'authentification et le rôle coach

// POST /api/coach/availabilities - Créer une disponibilité
router.post('/', verifyJWT, requireCoach, availabilityController.createAvailability);

// GET /api/coach/availabilities - Récupérer toutes mes disponibilités
router.get('/', verifyJWT, requireCoach, availabilityController.getMyAvailabilities);

// GET /api/coach/availabilities/:id - Récupérer une disponibilité par ID
router.get('/:id', verifyJWT, requireCoach, availabilityController.getAvailabilityById);

// PUT /api/coach/availabilities/:id - Mettre à jour une disponibilité
router.put('/:id', verifyJWT, requireCoach, availabilityController.updateAvailability);

// DELETE /api/coach/availabilities/:id - Supprimer une disponibilité
router.delete('/:id', verifyJWT, requireCoach, availabilityController.deleteAvailability);

module.exports = router;