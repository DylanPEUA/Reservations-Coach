const Reservation = require('../models/Reservation');
const Availability = require('../models/Availability');
const pool = require('../database');

// Créer une réservation (CLIENT)
const createReservation = async (req, res, next) => {
  try {
    const { availabilityId, scheduledAt } = req.body;
    const clientId = req.user.id;

    // Valider les données
    if (!availabilityId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'availabilityId et scheduledAt sont requis',
      });
    }

    // Vérifier que la disponibilité existe
    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({
        success: false,
        error: 'Créneau non trouvé',
      });
    }

    // Vérifier qu'il n'y a pas de conflit de réservation
    const hasConflict = await Reservation.checkConflict(availabilityId, scheduledAt);
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        error: 'Ce créneau est déjà réservé',
      });
    }

    // Vérifier qu'il n'y a pas de double réservation du client
    const hasDuplicate = await Reservation.checkDuplicateReservation(clientId, availabilityId, scheduledAt);
    if (hasDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'Vous avez déjà une réservation pour ce créneau',
      });
    }

    // Créer la réservation
    const reservationId = await Reservation.create(
      clientId,
      availability.coach_id,
      availabilityId,
      scheduledAt,
      'pending'
    );

    console.log(`✅ Réservation créée: ID ${reservationId} pour le client ${clientId}`);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        id: reservationId,
        availabilityId,
        scheduledAt,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la réservation:', error.message);
    next(error);
  }
};

// Récupérer mes réservations (CLIENT)
const getMyReservations = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    const reservations = await Reservation.findByClientId(clientId);

    res.status(200).json({
      success: true,
      message: 'Réservations récupérées',
      data: {
        reservations,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des réservations:', error.message);
    next(error);
  }
};

// Récupérer une réservation par ID (CLIENT - sa propre réservation)
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée',
      });
    }

    // Vérifier que la réservation appartient au client
    if (reservation.client_id !== clientId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Réservation récupérée',
      data: {
        reservation,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la réservation:', error.message);
    next(error);
  }
};

// Annuler une réservation (CLIENT)
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée',
      });
    }

    // Vérifier que la réservation appartient au client
    if (reservation.client_id !== clientId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cette réservation est déjà annulée',
      });
    }

    // Vérifier que la réservation n'est pas déjà complétée
    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Impossible d\'annuler une réservation complétée',
      });
    }

    // Annuler la réservation
    const success = await Reservation.update(id, 'cancelled');

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Erreur lors de l\'annulation',
      });
    }

    console.log(`✅ Réservation annulée: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Réservation annulée',
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation de la réservation:', error.message);
    next(error);
  }
};

// Récupérer toutes les réservations du coach
const getCoachReservations = async (req, res, next) => {
  try {
    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé',
      });
    }

    const coachId = coachResult[0].id;

    const reservations = await Reservation.findByCoachId(coachId);

    res.status(200).json({
      success: true,
      message: 'Réservations du coach récupérées',
      data: {
        reservations,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des réservations du coach:', error.message);
    next(error);
  }
};

// Mettre à jour le statut d'une réservation (COACH)
const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé',
      });
    }

    const coachId = coachResult[0].id;

    // Vérifier que la réservation existe et appartient au coach
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée',
      });
    }

    if (reservation.coach_id !== coachId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    // Valider le statut
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`,
      });
    }

    // Mettre à jour
    const success = await Reservation.update(id, status, notes || null);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Erreur lors de la mise à jour',
      });
    }

    console.log(`✅ Réservation mise à jour: ID ${id}, Status: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour',
      data: {
        id,
        status,
        notes: notes || null,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la réservation:', error.message);
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getCoachReservations,
  updateReservationStatus,
};