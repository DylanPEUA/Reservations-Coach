const Availability = require('../models/Availability');
const pool = require('../database');

// Récupérer les disponibilités d'un coach (PUBLIC)
const getCoachAvailabilities = async (req, res, next) => {
    try {
        const { coachId } = req.params;

        // Vérifier que le coach existe
        const [coachResult] = await pool.query(
            'SELECT id, user_id FROM coaches WHERE id = ?',
            [coachId]
        );

        if (coachResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coach non trouvé',
            });
        }

        // Récupérer les disponibilités du coach
        const availabilities = await Availability.findByCoachId(coachId);

        res.status(200).json({
            success: true,
            message: 'Disponibilités du coach récupérées',
            data: {
                coachId,
                availabilities,
            },
        });
    } catch (error) {
        console.error(' Erreur lors de la récupération des disponibilités du coach :', error.message);
        next(error);
    }
};    

// Récupérer les disponibilités par jour de la semaine (PUBLIC)
const getCoachAvailabilitiesByDay = async (req, res, next) => {
    try {
        const { coachId, dayOfWeek } = req.params;

        // Vérifier que le coach existe
        const [coachResult] = await pool.query(
            'SELECT id FROM coaches WHERE id = ?',
            [coachId]
        );

        if (coachResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coach non trouvé',
            });
        }

        // Valider dayOfWeek
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({
                success: false,
                error: 'dayOfWeek doit être entre 0 (dimanche) et 6 (samedi)',
            });
        }

        // Récupérer les disponibilités du coach pour ce jour
        const availabilities = await Availability.findByDayOfWeek(coachId, dayOfWeek);

        res.status(200).json({
            success: true,
            message: 'Disponibilités du coach pour ce jour récupérées',
            data: {
                coachId,
                dayOfWeek,
                availabilities,
            },
        });
    } catch (error) {
        console.error(' Erreur lors de la récupération des disponibilités du coach :', error.message);
        next(error);
    }
};

module.exports = {
    getCoachAvailabilities,
    getCoachAvailabilitiesByDay,
};