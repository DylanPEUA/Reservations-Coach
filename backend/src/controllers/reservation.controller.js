const Reservation = require('../models/Reservation');
const pool = require('../database');
const reservationService = require('../services/reservation.service');

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

    const reservation = await reservationService.createReservation({
      clientId,
      availabilityId,
      scheduledAt,
    });

    console.log(`✅ Réservation créée: ID ${reservation.id} pour le client ${clientId}`);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        ...reservation,
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

    await reservationService.cancelReservation(id, clientId);

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

    const updatedReservation = await reservationService.updateReservationStatus({
      reservationId: id,
      coachId,
      status,
      notes,
    });

    console.log(`✅ Réservation mise à jour: ID ${id}, Status: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour',
      data: updatedReservation,
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