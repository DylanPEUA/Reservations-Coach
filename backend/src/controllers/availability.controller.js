const Availability = require('../models/Availability');
const pool = require('../database');

// Créer une disponibilité
const createAvailability = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, durationMinutes } = req.body;

    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé pour cet utilisateur',
      });
    }

    const coachId = coachResult[0].id;

    // Valider les données
    if (dayOfWeek === undefined || !startTime || !endTime || !durationMinutes) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis (dayOfWeek, startTime, endTime, durationMinutes)',
      });
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        error: 'dayOfWeek doit être entre 0 (dimanche) et 6 (samedi)',
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime doit être avant endTime',
      });
    }

    if (durationMinutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'durationMinutes doit être positif',
      });
    }

    // Vérifier les chevauchements
    const hasOverlap = await Availability.checkOverlap(coachId, dayOfWeek, startTime, endTime);
    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        error: 'Il y a un chevauchement avec une autre disponibilité',
      });
    }

    // Créer la disponibilité
    const availabilityId = await Availability.create(coachId, dayOfWeek, startTime, endTime, durationMinutes);

    console.log(` Disponibilité créée: ID ${availabilityId} pour le coach ${coachId}`);

    res.status(201).json({
      success: true,
      message: 'Disponibilité créée avec succès',
      data: {
        id: availabilityId,
        coachId,
        dayOfWeek,
        startTime,
        endTime,
        durationMinutes,
      },
    });
  } catch (error) {
    console.error(' Erreur lors de la création de la disponibilité:', error.message);
    next(error);
  }
};

// Récupérer mes disponibilités (pour le coach)
const getMyAvailabilities = async (req, res, next) => {
  try {
    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé pour cet utilisateur',
      });
    }

    const coachId = coachResult[0].id;

    const availabilities = await Availability.findByCoachId(coachId);

    res.status(200).json({
      success: true,
      message: 'Disponibilités récupérées',
      data: {
        availabilities,
      },
    });
  } catch (error) {
    console.error(' Erreur lors de la récupération des disponibilités:', error.message);
    next(error);
  }
};

// Récupérer une disponibilité par ID
const getAvailabilityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé pour cet utilisateur',
      });
    }

    const coachId = coachResult[0].id;

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        error: 'Disponibilité non trouvée',
      });
    }

    // Vérifier que la disponibilité appartient au coach
    if (availability.coach_id !== coachId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Disponibilité récupérée',
      data: {
        availability,
      },
    });
  } catch (error) {
    console.error(' Erreur lors de la récupération de la disponibilité:', error.message);
    next(error);
  }
};

// Mettre à jour une disponibilité
const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, durationMinutes } = req.body;

    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé pour cet utilisateur',
      });
    }

    const coachId = coachResult[0].id;

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        error: 'Disponibilité non trouvée',
      });
    }

    // Vérifier que la disponibilité appartient au coach
    if (availability.coach_id !== coachId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    // Valider les données
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime doit être avant endTime',
      });
    }

    // Vérifier les chevauchements (en excluant cette disponibilité)
    const hasOverlap = await Availability.checkOverlap(coachId, dayOfWeek, startTime, endTime, id);
    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        error: 'Il y a un chevauchement avec une autre disponibilité',
      });
    }

    // Mettre à jour
    const success = await Availability.update(id, dayOfWeek, startTime, endTime, durationMinutes);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Erreur lors de la mise à jour',
      });
    }

    console.log(` Disponibilité mise à jour: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Disponibilité mise à jour',
      data: {
        id,
        dayOfWeek,
        startTime,
        endTime,
        durationMinutes,
      },
    });
  } catch (error) {
    console.error(' Erreur lors de la mise à jour de la disponibilité:', error.message);
    next(error);
  }
};

// Supprimer une disponibilité
const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le coach_id à partir du user_id
    const [coachResult] = await pool.query(
      'SELECT id FROM coaches WHERE user_id = ?',
      [req.user.id]
    );

    if (coachResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil coach non trouvé pour cet utilisateur',
      });
    }

    const coachId = coachResult[0].id;

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        error: 'Disponibilité non trouvée',
      });
    }

    // Vérifier que la disponibilité appartient au coach
    if (availability.coach_id !== coachId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
      });
    }

    // Supprimer
    const success = await Availability.delete(id);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Erreur lors de la suppression',
      });
    }

    console.log(` Disponibilité supprimée: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Disponibilité supprimée',
    });
  } catch (error) {
    console.error(' Erreur lors de la suppression de la disponibilité:', error.message);
    next(error);
  }
};

module.exports = {
  createAvailability,
  getMyAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
};